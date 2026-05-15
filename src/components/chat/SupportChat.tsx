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
  ExternalLink,
  Bot,
  User as UserIcon,
  Search,
  ArrowLeft,
  ChevronRight,
  Headphones
} from 'lucide-react';
import { doc, setDoc, addDoc, collection, query, orderBy, onSnapshot, updateDoc, getDoc, serverTimestamp, getDocs, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { format } from 'date-fns';
import { handleFirestoreError, OperationType } from '../../lib/firestoreErrors';
import { safeDate } from '../../lib/utils';
import { BOT_OPTIONS, BOT_MESSAGES, BotOption } from '../../lib/botLogic';

interface Message {
  id: string;
  conversation_id: string;
  sender_type: 'client' | 'admin' | 'bot';
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
  bot_active?: boolean;
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
  const [botTyping, setBotTyping] = useState(false);
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
      } else {
        localStorage.removeItem('havertz_chat_conv_id');
      }
    } catch (err: any) {
      if (err.message?.includes('permission') || err.code === 'permission-denied') {
        localStorage.removeItem('havertz_chat_conv_id');
        setConversation(null);
      } else {
        console.error('Error loading conversation:', err);
      }
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
        customer_name: formData.name || user?.displayName || 'Cliente',
        customer_email: formData.email || user?.email || '',
        subject: formData.subject || 'Atendimento via Site',
        status: 'aberta',
        last_message: 'Atendimento iniciado',
        bot_active: true,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      };

      const newConvRef = await addDoc(collection(db, 'support_conversations'), newConvData);
      
      const newConv = { id: newConvRef.id, ...newConvData } as any as Conversation;
      setConversation(newConv);
      localStorage.setItem('havertz_chat_conv_id', newConv.id);

      // Bot welcome message
      await addDoc(collection(db, 'support_conversations', newConv.id, 'messages'), {
        conversation_id: newConv.id,
        sender_type: 'bot',
        sender_id: 'dxt_bot',
        message: BOT_MESSAGES.welcome,
        read: false,
        created_at: serverTimestamp()
      });
      
    } catch (err) { 
      console.error(err); 
    } finally { 
      setIsStarting(false); 
    }
  };

  const processBotResponse = async (convId: string, text: string) => {
    setBotTyping(true);
    
    // Simulate thinking
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      const lowerText = text.toLowerCase().trim();
      let response = '';

      // Check for human handover
      if (lowerText.includes('atendente') || lowerText.includes('humano') || lowerText.includes('pessoa')) {
        response = BOT_MESSAGES.switching_to_human;
        await updateDoc(doc(db, 'support_conversations', convId), {
          bot_active: false,
          status: 'aberta',
          updated_at: serverTimestamp()
        });
      }
      // Check for order code
      else if (lowerText.includes('#hvz-')) {
        const code = lowerText.match(/#hvz-\d+/)?.[0]?.toUpperCase();
        if (code) {
          const ordersRef = collection(db, 'orders');
          const q = query(ordersRef, where('order_code', '==', code.replace('#', '')));
          const snap = await getDocs(q);
          
          if (!snap.empty) {
            const order = snap.docs[0].data();
            response = BOT_MESSAGES.order_info(code, order.status);
          } else {
            response = BOT_MESSAGES.order_not_found;
          }
        }
      }
      // Check keywords
      else {
        const option = BOT_OPTIONS.find(opt => 
          opt.keywords.some(kw => lowerText.includes(kw))
        );
        
        if (option) {
          response = option.response;
        } else {
          response = BOT_MESSAGES.not_found;
        }
      }

      await addDoc(collection(db, 'support_conversations', convId, 'messages'), {
        conversation_id: convId,
        sender_type: 'bot',
        sender_id: 'dxt_bot',
        message: response,
        read: false,
        created_at: serverTimestamp()
      });

      await updateDoc(doc(db, 'support_conversations', convId), {
        last_message: response,
        updated_at: serverTimestamp()
      });

    } catch (err) {
      console.error("Bot processing error:", err);
    } finally {
      setBotTyping(false);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent, directMessage?: string) => {
    if (e) e.preventDefault();
    const msgText = directMessage || newMessage;
    
    if (!msgText.trim() || !conversation) return;

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

      // Trigger bot if active
      if (conversation.bot_active !== false) {
        processBotResponse(conversation.id, msgText);
      }
    } catch (err) { 
      console.error("Erro ao enviar mensagem:", err);
    } finally { 
      setIsLoading(false); 
    }
  };

  const handleOptionClick = (option: BotOption) => {
    handleSendMessage(undefined, option.label);
  };

  const handleRequestAttendant = () => {
    handleSendMessage(undefined, 'Falar com atendente');
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
            className="mb-4 w-full sm:w-[400px] h-full sm:h-[600px] fixed sm:static inset-0 sm:inset-auto bg-zinc-950 border-0 sm:border sm:border-zinc-800 rounded-0 sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col ring-1 ring-white/5 z-50"
          >
            {/* Header Redesigned */}
            <div className="p-5 bg-gradient-to-r from-zinc-900 to-black border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="h-12 w-12 rounded-2xl bg-zinc-900 border border-neon-green/30 flex items-center justify-center shadow-[0_0_20px_rgba(57,255,20,0.1)] group-hover:border-neon-green transition-all overflow-hidden">
                    {conversation?.bot_active !== false ? (
                      <Bot className="text-neon-green h-6 w-6" />
                    ) : (
                      <Headphones className="text-neon-green h-6 w-6" />
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-zinc-950 rounded-lg flex items-center justify-center border border-zinc-800">
                    <div className="h-2 w-2 rounded-full bg-neon-green animate-pulse shadow-[0_0_8px_#39FF14]" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-black text-white italic uppercase tracking-[0.2em] leading-none mb-1">
                    {conversation?.bot_active !== false ? 'DXT Assistente' : 'Suporte Elite'}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="text-[9px] text-zinc-500 uppercase font-black tracking-widest italic leading-none">Status: <span className="text-neon-green">Operante</span></span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setIsMinimized(true)} className="p-2.5 hover:bg-zinc-800/50 rounded-xl text-zinc-500 transition-all hover:text-white hidden sm:block"><Minimize2 size={18} /></button>
                <button onClick={() => setIsOpen(false)} className="p-2.5 hover:bg-zinc-800/50 rounded-xl text-zinc-500 transition-all hover:text-red-500"><X size={20} /></button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col bg-zinc-950 relative">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
              
              {!conversation ? (
                /* Starting Form Redesigned */
                <div className="p-8 h-full flex flex-col justify-center relative z-10">
                  <div className="mb-10 text-center space-y-3">
                    <div className="inline-flex p-4 bg-zinc-900 border border-zinc-800 rounded-3xl mb-4 shadow-2xl">
                      <Bot className="text-neon-green h-10 w-10 animate-bounce" />
                    </div>
                    <p className="text-zinc-500 text-[10px] italic font-black uppercase tracking-[0.3em]">Protocolo v2.0</p>
                    <h2 className="text-white text-3xl font-black italic uppercase tracking-tighter leading-tight">
                      INICIE SUA <span className="text-neon-green font-outline-2">INJEÇÃO</span>
                    </h2>
                    <p className="text-zinc-600 text-xs italic font-medium max-w-[250px] mx-auto">
                      Atendimento inteligente para acelerar seu processamento.
                    </p>
                  </div>
                  <form onSubmit={handleStartConversation} className="space-y-4">
                    <div className="space-y-2">
                      <input
                        required
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-zinc-900/40 border-2 border-zinc-900 rounded-2xl px-6 py-4 text-white text-sm focus:outline-none focus:border-neon-green/30 transition-all placeholder:text-zinc-700 italic font-bold"
                        placeholder="IDENTIFICADOR (NOME)"
                      />
                    </div>
                    <div className="space-y-2">
                      <input
                        required
                        type="text"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full bg-zinc-900/40 border-2 border-zinc-900 rounded-2xl px-6 py-4 text-white text-sm focus:outline-none focus:border-neon-green/30 transition-all placeholder:text-zinc-700 italic font-bold"
                        placeholder="ASSUNTO DO CHAMADO"
                      />
                    </div>
                    <Button type="submit" variant="neon" className="w-full py-8 font-black italic uppercase tracking-[0.3em] mt-4 shadow-[0_20px_40px_rgba(57,255,20,0.15)] rounded-2xl group" disabled={isStarting}>
                      {isStarting ? <Loader2 className="animate-spin" /> : (
                        <span className="flex items-center gap-2">
                          ENTRAR NO CHAT <ChevronRight size={18} className="transition-transform group-hover:translate-x-1" />
                        </span>
                      )}
                    </Button>
                  </form>
                </div>
              ) : (
                <>
                  {/* Message List Redesigned */}
                  <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide relative z-10">
                    <div className="flex flex-col items-center gap-2 mb-8">
                      <Badge variant="outline" className="text-[8px] border-zinc-900 text-zinc-600 tracking-[0.4em] font-black uppercase bg-zinc-950/80 px-4 py-1.5 rounded-full">
                        Criptografia Elite ponta-a-ponta
                      </Badge>
                    </div>

                    {messages.map((msg, i) => (
                      <motion.div 
                        initial={{ opacity: 0, x: msg.sender_type === 'client' ? 10 : -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={msg.id} 
                        className={`flex gap-3 ${msg.sender_type === 'client' ? 'flex-row-reverse' : 'flex-row'}`}
                      >
                        <div className={`h-8 w-8 rounded-xl shrink-0 flex items-center justify-center border ${
                          msg.sender_type === 'client' 
                            ? 'bg-zinc-900 border-zinc-800' 
                            : msg.sender_type === 'bot' 
                              ? 'bg-neon-green/10 border-neon-green/30 text-neon-green' 
                              : 'bg-neon-purple/10 border-neon-purple/30 text-neon-purple'
                        }`}>
                          {msg.sender_type === 'client' ? <UserIcon size={14} /> : msg.sender_type === 'bot' ? <Bot size={14} /> : <Headphones size={14} />}
                        </div>

                        <div className={`max-w-[80%] space-y-1 ${msg.sender_type === 'client' ? 'items-end' : 'items-start'}`}>
                          <div className={`rounded-2xl p-4 text-sm shadow-xl transition-all ${
                            msg.sender_type === 'client' 
                              ? 'bg-zinc-900 border border-zinc-800 text-white rounded-tr-none' 
                              : msg.sender_type === 'bot'
                                ? 'bg-zinc-900/80 border border-neon-green/20 text-zinc-100 rounded-tl-none ring-1 ring-neon-green/5'
                                : 'bg-zinc-900/80 border border-neon-purple/20 text-zinc-100 rounded-tl-none'
                          }`}>
                            {msg.image_url && (
                               <div 
                                 className="rounded-xl mb-3 overflow-hidden border border-zinc-800 bg-black cursor-pointer group relative"
                                 onClick={() => window.open(msg.image_url, '_blank')}
                               >
                                 <img src={msg.image_url} alt="Upload" className="w-full max-h-64 object-cover group-hover:scale-105 transition-transform duration-500" />
                                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                                    <Eye className="text-neon-green h-6 w-6" />
                                 </div>
                               </div>
                            )}
                            <p className="leading-relaxed font-medium italic">{msg.message}</p>
                          </div>
                          <div className="flex items-center gap-1.5 opacity-30 text-[8px] font-black italic tracking-widest uppercase px-1">
                            {msg.created_at && format(safeDate(msg.created_at), 'HH:mm')}
                            {msg.sender_type === 'client' && (msg.read ? <CheckCheck size={10} className="text-neon-green" /> : <Check size={10} />)}
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    {/* Bot Typing Indicator */}
                    {(botTyping || conversation.typing_admin) && (
                      <div className="flex gap-3">
                        <div className="h-8 w-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600">
                          {botTyping ? <Bot size={14} className="animate-pulse" /> : <Headphones size={14} className="animate-pulse" />}
                        </div>
                        <div className="bg-zinc-900/50 border border-zinc-800/50 px-4 py-3 rounded-2xl rounded-tl-none">
                           <div className="flex gap-1">
                             <div className="h-1.5 w-1.5 bg-neon-green rounded-full animate-bounce [animation-delay:-0.3s]" />
                             <div className="h-1.5 w-1.5 bg-neon-green rounded-full animate-bounce [animation-delay:-0.15s]" />
                             <div className="h-1.5 w-1.5 bg-neon-green rounded-full animate-bounce" />
                           </div>
                        </div>
                      </div>
                    )}

                    {/* Bot Quick Options */}
                    {conversation.bot_active !== false && !botTyping && !isLoading && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col gap-2 pt-4"
                      >
                        <p className="text-[9px] text-zinc-600 font-black uppercase tracking-[0.3em] mb-1 px-1">Ações Recomendadas</p>
                        <div className="flex flex-wrap gap-2">
                          {BOT_OPTIONS.map(opt => (
                            <button
                              key={opt.id}
                              onClick={() => handleOptionClick(opt)}
                              className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-[10px] text-zinc-400 font-bold italic uppercase hover:border-neon-green/40 hover:text-white transition-all hover:bg-neon-green/5"
                            >
                              {opt.label}
                            </button>
                          ))}
                          <button
                            onClick={handleRequestAttendant}
                            className="px-4 py-2.5 bg-zinc-900 border border-neon-purple/20 rounded-xl text-[10px] text-neon-purple font-black italic uppercase hover:bg-neon-purple/10 transition-all flex items-center gap-2"
                          >
                            <UserIcon size={12} /> Falar com atendente
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Input area Redesigned */}
                  <div className="p-5 bg-gradient-to-t from-black to-zinc-900/80 backdrop-blur-xl border-t border-zinc-800 relative z-10">
                    <form onSubmit={handleSendMessage} className="flex gap-3">
                       <label className={`p-4 rounded-2xl transition-all ${uploading ? 'bg-zinc-800 border-zinc-700 pointer-events-none' : 'bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-500 cursor-pointer hover:text-neon-green'}`}>
                          {uploading ? <Loader2 className="animate-spin" size={20} /> : <ImageIcon size={20} />}
                          <input type="file" className="hidden" accept="image/*,application/pdf" onChange={handleImageUpload} disabled={uploading} />
                       </label>
                       <div className="relative flex-1">
                         <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => { setNewMessage(e.target.value); handleTyping(); }}
                          placeholder={conversation.bot_active !== false ? "Digite ou escolha abaixo..." : "Sua dúvida mestre..."}
                          className="w-full h-full bg-zinc-900 border border-zinc-800 rounded-2xl px-6 text-white text-sm focus:outline-none focus:border-neon-green/30 transition-all font-bold italic placeholder:text-zinc-700"
                         />
                         {newMessage.trim() && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                               <div className="h-1.5 w-1.5 bg-neon-green rounded-full animate-ping" />
                            </div>
                         )}
                       </div>
                       <button 
                        type="submit" 
                        disabled={!newMessage.trim() || isLoading || botTyping} 
                        className="p-4 bg-neon-green text-black rounded-2xl hover:bg-neon-green/90 transition-all shadow-[0_10px_20px_rgba(57,255,20,0.15)] active:scale-95 disabled:grayscale disabled:opacity-30 flex items-center justify-center min-w-[56px]"
                       >
                         {isLoading || botTyping ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
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
