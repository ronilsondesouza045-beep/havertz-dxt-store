import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Send, 
  X, 
  Image as ImageIcon, 
  Loader2, 
  Check, 
  CheckCheck,
  Minimize2,
  FileText,
  Eye,
  ExternalLink
} from 'lucide-react';
import { doc, setDoc, addDoc, collection, query, orderBy, onSnapshot, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { format } from 'date-fns';
import { handleFirestoreError, OperationType } from '../../lib/firestoreErrors';
import { safeDate } from '../../lib/utils';

interface Message {
  id: string;
  conversation_id: string;
  sender_type: 'client' | 'admin';
  sender_id: string;
  message: string;
  image_url?: string;
  file_url?: string;
  read: boolean;
  created_at: string;
  file_name?: string;
  file_type?: string;
}

interface Conversation {
  id: string;
  user_id?: string;
  order_id?: string;
  order_code?: string;
  customer_name: string;
  customer_email: string;
  status: 'aberta' | 'respondida' | 'finalizada';
  last_message: string;
  typing_client?: boolean;
  typing_admin?: boolean;
  created_at: string;
  updated_at: string;
}

export function SupportChat() {
  const { user, profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    email: profile?.email || '',
    subject: ''
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const savedConvId = localStorage.getItem('havertz_chat_conv_id');
    if (savedConvId) {
      loadConversation(savedConvId);
    }

    const handleOpenChat = (e: any) => {
      if (e.detail?.id) {
         loadConversation(e.detail.id);
      }
      setIsOpen(true);
      setIsMinimized(false);
    };

    window.addEventListener('openChat', handleOpenChat);
    return () => window.removeEventListener('openChat', handleOpenChat);
  }, []);

  useEffect(() => {
    if (conversation && isOpen) {
      const messagesRef = collection(db, 'support_conversations', conversation.id, 'messages');
      const q = query(messagesRef, orderBy('created_at', 'asc'));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const msgs = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            created_at: safeDate(data.created_at).toISOString()
          };
        }) as Message[];
        setMessages(msgs);
        scrollToBottom();
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, `support_conversations/${conversation.id}/messages`);
      });

      // Also listen for conversation updates (typing, status)
      const convRef = doc(db, 'support_conversations', conversation.id);
      const unsubscribeConv = onSnapshot(convRef, (docSnap) => {
        if (docSnap.exists()) {
          setConversation({ id: docSnap.id, ...docSnap.data() } as Conversation);
        }
      });

      return () => {
        unsubscribe();
        unsubscribeConv();
      };
    }
  }, [conversation?.id, isOpen]);

  const loadConversation = async (id: string) => {
    try {
      const convRef = doc(db, 'support_conversations', id);
      const docSnap = await getDoc(convRef);
      if (docSnap.exists()) {
        setConversation({ id: docSnap.id, ...docSnap.data() } as Conversation);
        localStorage.setItem('havertz_chat_conv_id', id);
      }
    } catch (err) {
      console.error('Error loading conversation:', err);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 100);
  };

  const handleStartConversation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsStarting(true);
    try {
      const newConvData = {
        user_id: user?.uid || null,
        customer_name: formData.name,
        customer_email: formData.email,
        subject: formData.subject || 'Atendimento via Site',
        status: 'aberta',
        last_message: 'Atendimento iniciado',
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      };

      const newConvRef = await addDoc(collection(db, 'support_conversations'), newConvData);
      
      const newConv = { id: newConvRef.id, ...newConvData } as Conversation;
      setConversation(newConv);
      localStorage.setItem('havertz_chat_conv_id', newConv.id);

      await addDoc(collection(db, 'support_conversations', newConv.id, 'messages'), {
        conversation_id: newConv.id,
        sender_type: 'client',
        sender_id: user?.uid || 'anonymous',
        message: formData.subject || 'Preciso de ajuda',
        read: false,
        created_at: serverTimestamp()
      });
      
    } catch (err) { 
      console.error(err); 
    } finally { 
      setIsStarting(false); 
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversation) return;

    const msgText = newMessage;
    setNewMessage('');
    setIsLoading(true);

    try {
      await addDoc(collection(db, 'support_conversations', conversation.id, 'messages'), {
        conversation_id: conversation.id,
        sender_type: 'client',
        sender_id: user?.uid || 'anonymous',
        message: msgText,
        read: false,
        created_at: serverTimestamp()
      });
      
      await updateDoc(doc(db, 'support_conversations', conversation.id), {
        last_message: msgText,
        updated_at: serverTimestamp(),
        status: 'aberta'
      });
      
      scrollToBottom();
    } catch (err) { 
      console.error("Erro ao enviar mensagem:", err);
    } finally { 
      setIsLoading(false); 
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !conversation) return;

    setUploading(true);
    try {
      const storageRef = ref(storage, `support/${conversation.id}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      await addDoc(collection(db, 'support_conversations', conversation.id, 'messages'), {
        conversation_id: conversation.id,
        sender_type: 'client',
        sender_id: user?.uid || 'anonymous',
        message: 'Anexo enviado',
        image_url: url,
        read: false,
        created_at: serverTimestamp()
      });

      await updateDoc(doc(db, 'support_conversations', conversation.id), {
        last_message: 'Anexo enviado',
        updated_at: serverTimestamp()
      });

    } catch (err) {
      console.error("Erro ao enviar imagem:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleTyping = () => {
    // Implement typing indicator logic if needed
  };

  return (
    <div className="fixed bottom-6 right-8 md:right-12 z-50 flex flex-col items-end">
      <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3" />
      
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-[340px] md:w-[380px] h-[520px] md:h-[580px] bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col ring-1 ring-white/5"
          >
            <div className="p-5 bg-zinc-900/80 backdrop-blur-md border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-black border border-[#00ff66]/30 flex items-center justify-center shadow-[0_0_15px_rgba(0,255,102,0.15)]">
                  <MessageCircle className="text-[#00ff66] h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-white italic uppercase tracking-[0.15em]">HAVERTZ.DXT <span className="text-[#00ff66]">SUPORTE</span></h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#00ff66] shadow-[0_0_8px_#00ff66] animate-pulse" />
                    <span className="text-[9px] text-zinc-400 uppercase font-black tracking-widest italic">Online agora</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setIsMinimized(true)} className="p-2 hover:bg-zinc-800 rounded-xl text-zinc-500 transition-all hover:text-white"><Minimize2 size={18} /></button>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-zinc-800 rounded-xl text-zinc-500 transition-all hover:text-red-500"><X size={18} /></button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col bg-zinc-950 relative">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none" />
              {!conversation ? (
                <div className="p-8 h-full flex flex-col justify-center relative z-10">
                  <div className="mb-8 text-center">
                    <div className="h-16 w-16 bg-zinc-900 border border-zinc-800 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                      <MessageCircle className="text-[#00ff66] h-8 w-8" />
                    </div>
                    <p className="text-zinc-400 text-xs italic font-black uppercase tracking-widest mb-1">Central de Atendimento</p>
                    <h2 className="text-white text-lg font-black italic uppercase">Inicie seu <span className="text-[#00ff66]">Ticket</span></h2>
                  </div>
                  <form onSubmit={handleStartConversation} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[9px] text-zinc-600 uppercase font-black ml-1 tracking-widest">Identificação</label>
                      <input
                        required
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:border-[#00ff66]/50 transition-all"
                        placeholder="Como podemos te chamar?"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] text-zinc-600 uppercase font-black ml-1 tracking-widest">Assunto</label>
                      <input
                        required
                        type="text"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:border-[#00ff66]/50 transition-all"
                        placeholder="Ex: Entrega de pedido"
                      />
                    </div>
                    <Button type="submit" variant="neon" className="w-full py-7 font-black italic uppercase tracking-[0.2em] mt-2 shadow-[0_0_20px_rgba(57,255,20,0.2)]" disabled={isStarting}>
                      {isStarting ? <Loader2 className="animate-spin" /> : 'CONECTAR AGORA'}
                    </Button>
                  </form>
                </div>
              ) : (
                <>
                  <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-hide relative z-10">
                    <div className="p-4 bg-zinc-900/30 border border-zinc-800/50 rounded-2xl mb-2">
                       <p className="text-[10px] text-zinc-500 uppercase font-black text-center tracking-[0.2em]">Protocolo de Atendimento Gerado</p>
                    </div>
                    {messages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.sender_type === 'client' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl p-4 text-sm shadow-xl ${msg.sender_type === 'client' ? 'bg-[#00ff66]/5 border border-[#00ff66]/20 text-white rounded-tr-none' : 'bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-tl-none'}`}>
                          {msg.image_url && (
                             <div 
                               className="rounded-xl mb-3 overflow-hidden border border-zinc-700/50 bg-black/40 cursor-pointer group relative"
                               onClick={() => window.open(msg.image_url, '_blank')}
                             >
                               {msg.image_url.toLowerCase().includes('.pdf') ? (
                                 <div className="p-6 flex flex-col items-center justify-center gap-2">
                                    <FileText size={40} className="text-[#00ff66]/50" />
                                    <span className="text-[10px] font-black uppercase text-[#00ff66]/60">Ver Documento PDF</span>
                                 </div>
                               ) : (
                                 <>
                                   <img src={msg.image_url} alt="Upload" className="w-full max-h-56 object-cover" />
                                   <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                                      <Eye className="text-[#00ff66] h-6 w-6" />
                                   </div>
                                 </>
                               )}
                             </div>
                          )}
                          <p className="leading-relaxed font-medium">{msg.message}</p>
                          <div className="flex items-center gap-1.5 mt-2 justify-end opacity-40 text-[9px] font-black italic">
                            {msg.created_at && format(safeDate(msg.created_at), 'HH:mm')}
                            {msg.sender_type === 'client' && (msg.read ? <CheckCheck size={11} className="text-[#00ff66]" /> : <Check size={11} />)}
                          </div>
                        </div>
                      </div>
                    ))}
                    {conversation.typing_admin && (
                      <div className="flex justify-start">
                        <div className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-full text-[10px] text-[#00ff66] font-black uppercase italic animate-pulse shadow-[0_0_10px_rgba(0,255,102,0.1)]">
                           Digitando...
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-4 bg-zinc-900/80 backdrop-blur-md border-t border-zinc-800 relative z-10">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                       <label className={`p-3.5 rounded-2xl transition-all ${uploading ? 'bg-zinc-800 text-zinc-600 grayscale animate-pulse cursor-not-allowed' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400 cursor-pointer hover:text-[#00ff66]'}`}>
                          {uploading ? <Loader2 className="animate-spin" size={20} /> : <ImageIcon size={20} />}
                          <input type="file" className="hidden" accept="image/*,application/pdf" onChange={handleImageUpload} disabled={uploading} />
                       </label>
                       <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => { setNewMessage(e.target.value); handleTyping(); }}
                        placeholder="Sua dúvida mestre..."
                        className="flex-1 bg-zinc-800 border border-zinc-700 rounded-2xl px-5 py-2 text-white text-sm focus:outline-none focus:border-[#00ff66]/30 transition-all"
                       />
                       <button type="submit" disabled={!newMessage.trim() || isLoading} className="p-3.5 bg-[#00ff66] text-black rounded-2xl hover:bg-[#00ff66]/90 transition-all shadow-[0_0_20px_rgba(0,255,102,0.3)] active:scale-95 disabled:grayscale disabled:opacity-50">
                         <Send size={20} />
                       </button>
                    </form>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-3">
        <button
          onClick={() => { setIsOpen(!isOpen); setIsMinimized(false); }}
          className={`group flex items-center gap-3 h-14 md:h-16 px-5 md:px-7 rounded-2xl md:rounded-3xl font-black italic uppercase tracking-wider shadow-2xl transition-all duration-500 overflow-hidden ${
            isOpen && !isMinimized 
              ? 'bg-zinc-900 text-white border border-zinc-800 w-14 md:w-16 !p-0 justify-center rounded-full' 
              : 'bg-black text-[#00ff66] border border-[#00ff66]/30 hover:border-[#00ff66] hover:shadow-[0_0_30px_rgba(0,255,102,0.3)]'
          }`}
        >
          <div className="relative flex items-center justify-center">
            {isOpen && !isMinimized ? (
              <X className="h-6 w-6 text-white" />
            ) : (
              <>
                <div className="absolute -left-1.5 -top-1.5 h-3 w-3 bg-[#00ff66] rounded-full blur-sm animate-pulse opacity-50" />
                <MessageCircle className="h-6 w-6 md:h-7 md:w-7 transition-transform group-hover:scale-110" />
              </>
            )}
            {!isOpen && messages.some(m => !m.read && m.sender_type === 'admin') && (
              <span className="absolute -top-3 -right-3 h-5 w-5 bg-red-600 rounded-full border-2 border-black flex items-center justify-center text-[10px] text-white font-black">
                !
              </span>
            )}
          </div>
          
          {(!isOpen || isMinimized) && (
            <div className="flex flex-col items-start leading-none pointer-events-none">
              <span className="text-[10px] md:text-[11px] text-white font-black tracking-[0.2em]">SUPORTE</span>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="h-1 w-1 rounded-full bg-[#00ff66] shadow-[0_0_5px_#00ff66]" />
                <span className="text-[8px] md:text-[9px] text-[#00ff66] font-black tracking-widest">ONLINE</span>
              </div>
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
