import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  Bot,
  User as UserIcon,
  ChevronRight,
  Headphones
} from 'lucide-react';
import { doc, addDoc, collection, query, orderBy, onSnapshot, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { format } from 'date-fns';
import { handleFirestoreError, OperationType } from '../../lib/firestoreErrors';
import { safeDate } from '../../lib/utils';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { BOT_OPTIONS, BOT_MESSAGES, BotOption, NETFLIX_CONFIG, getNetflixResponse, getPrimeVideoResponse } from '../../lib/botLogic';

interface Message {
  id: string;
  conversation_id: string;
  sender_type: 'client' | 'admin' | 'bot';
  sender_id: string;
  sender_avatar?: string;
  message: string;
  image_url?: string;
  read: boolean;
  created_at: string;
}

interface Conversation {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_avatar?: string;
  status: 'aberta' | 'respondida' | 'resolvida' | 'fechada';
  last_message: string;
  bot_active?: boolean;
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
    subject: ''
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const conversationIdRef = useRef<string | null>(null);

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

  // Listen to messages
  useEffect(() => {
    if (!conversation?.id || !isOpen) return;

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

    return () => unsubscribe();
  }, [conversation?.id, isOpen]);

  // Listen to conversation changes separately to avoid message re-subscriptions
  useEffect(() => {
    if (!conversation?.id || !isOpen) return;

    const convRef = doc(db, 'support_conversations', conversation.id);
    const unsubscribe = onSnapshot(convRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Update local state BUT don't use this as a dependency elsewhere to avoid loops
        setConversation(prev => {
          if (!prev) return { id: docSnap.id, ...data } as Conversation;
          // Only update if something changed
          if (prev.bot_active !== data.bot_active || prev.status !== data.status || prev.typing_admin !== data.typing_admin) {
             return { id: docSnap.id, ...data } as Conversation;
          }
          return prev;
        });
      }
    });

    return () => unsubscribe();
  }, [conversation?.id, isOpen]);

  const loadConversation = async (id: string) => {
    try {
      const convRef = doc(db, 'support_conversations', id);
      const docSnap = await getDoc(convRef);
      if (docSnap.exists()) {
        setConversation({ id: docSnap.id, ...docSnap.data() } as Conversation);
        conversationIdRef.current = id;
        localStorage.setItem('havertz_chat_conv_id', id);
      } else {
        localStorage.removeItem('havertz_chat_conv_id');
      }
    } catch (err: any) {
      if (err.message?.includes('permission') || err.code === 'permission-denied') {
        localStorage.removeItem('havertz_chat_conv_id');
        setConversation(null);
      }
    }
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  const handleStartConversation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsStarting(true);
    try {
      const newConvData = {
        user_id: user?.uid || null,
        customer_name: formData.name || user?.displayName || 'Cliente',
        customer_email: user?.email || profile?.email || '',
        customer_avatar: profile?.avatar_url || user?.photoURL || null,
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
      conversationIdRef.current = newConv.id;
      localStorage.setItem('havertz_chat_conv_id', newConv.id);

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
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      const lowerText = text.toLowerCase().trim();
      let response = '';

      if (lowerText.includes('atendente') || lowerText.includes('humano')) {
        response = BOT_MESSAGES.switching_to_human;
        await updateDoc(doc(db, 'support_conversations', convId), {
          bot_active: false,
          updated_at: serverTimestamp()
        });
      } else {
        const option = BOT_OPTIONS.find(opt => 
          opt.keywords.some(kw => lowerText.includes(kw))
        );
        
        if (option) {
          if (option.id === 'netflix_free') {
            response = getNetflixResponse(null);
          } else if (option.id === 'prime_video_free') {
            response = getPrimeVideoResponse();
          } else if (option.id === 'check_netflix_code') {
            // Show a temporary message to let the user know we are working
            toast.loading("Buscando código no Gmail...", { id: 'searching-code' });
            
            try {
               const codeRes = await axios.get('/api/netflix-code', { 
                 timeout: 25000,
                 headers: { 'Accept': 'application/json' }
               });
               
               if (codeRes.data && codeRes.data.code) {
                 toast.success("Código localizado!", { id: 'searching-code' });
                 response = getNetflixResponse(codeRes.data.code, codeRes.data.receivedAt);
               } else {
                 throw new Error("Resposta inválida do servidor");
               }
            } catch (err: any) {
               toast.dismiss('searching-code');
               
               if (axios.isAxiosError(err) && err.response) {
                 const status = err.response.status;
                 if (status === 404) {
                   // No logging for 404 as it's a valid "not found" state
                   response = "❌ Nenhum código novo da Netflix foi encontrado nos últimos 15 minutos.\n\nCertifique-se de:\n1. Clicar em 'Enviar Código' na Netflix.\n2. Aguardar 10-15 segundos.\n3. Clicar novamente em 'BUSCAR CÓDIGO AGORA'.\n\n*Nota: Se o código demorar mais de 15 minutos, ele expira e você precisará gerar um novo.*";
                 } else {
                   console.error("Chat API Error:", err);
                   if (status === 401) {
                     response = "🔑 **Erro de Configuração:**\nO bot não conseguiu entrar no seu e-mail.\n\nVerifique se a 'Senha de App' no Vercel está correta e sem espaços.";
                   } else if (status === 503 || status === 504) {
                     response = "🌐 **Erro de Conexão/Timeout:**\nO servidor demorou muito para responder ou o Gmail bloqueou o acesso. Tente clicar novamente em alguns segundos.";
                   } else {
                     response = "⚠️ Ocorreu um erro técnico (" + status + "). Tente novamente.";
                   }
                 }
               } else {
                 console.error("Chat Error:", err);
                 if (err.code === 'ECONNABORTED') {
                   response = "⏳ O servidor demorou muito para responder. Tente novamente em alguns instantes.";
                 } else {
                   response = "⚠️ Ocorreu um erro inesperado ao buscar o código. Tente novamente.";
                 }
               }
            }
          } else {
            // Pick a random variation
            const randomIndex = Math.floor(Math.random() * option.responses.length);
            response = option.responses[randomIndex];
          }
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
      console.error(err);
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
        sender_avatar: profile?.avatar_url || user?.photoURL || null,
        message: msgText,
        read: false,
        created_at: serverTimestamp()
      });
      
      await updateDoc(doc(db, 'support_conversations', conversation.id), {
        last_message: msgText,
        updated_at: serverTimestamp(),
        status: 'aberta'
      });
      
      if (conversation.bot_active !== false) {
        processBotResponse(conversation.id, msgText);
      }
    } catch (err) { 
      console.error(err);
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
        sender_avatar: profile?.avatar_url || user?.photoURL || null,
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
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-8 md:right-12 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-full sm:w-[400px] h-full sm:h-[600px] fixed sm:static inset-0 sm:inset-auto bg-zinc-950 border-0 sm:border sm:border-zinc-800 rounded-0 sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col ring-1 ring-white/5 z-50"
          >
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-zinc-900 to-black border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="h-12 w-12 rounded-2xl bg-zinc-900 border border-neon-green/30 flex items-center justify-center shadow-[0_0_20px_rgba(57,255,20,0.1)]">
                    {conversation?.bot_active !== false ? <Bot className="text-neon-green h-6 w-6" /> : <Headphones className="text-neon-green h-6 w-6" />}
                  </div>
                  <div className="absolute -bottom-1 -right-1 h-3.5 w-3.5 bg-zinc-950 rounded-lg flex items-center justify-center border border-zinc-800">
                    <div className="h-2 w-2 rounded-full bg-neon-green animate-pulse shadow-[0_0_8px_#39FF14]" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-black text-white italic uppercase tracking-[0.2em] leading-none mb-1">
                    {conversation?.bot_active !== false ? 'DXT Assistente' : 'Suporte Elite'}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[9px] text-zinc-500 uppercase font-black tracking-widest italic leading-none">Protocolo Ativado</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setIsMinimized(true)} className="p-2 hover:bg-zinc-800/50 rounded-xl text-zinc-500 transition-all hidden sm:block"><Minimize2 size={18} /></button>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-zinc-800/50 rounded-xl text-zinc-500 transition-all hover:text-red-500"><X size={20} /></button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col bg-zinc-950 relative">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none" />
              
              {!conversation ? (
                <div className="p-8 h-full flex flex-col justify-center relative z-10">
                  <div className="mb-10 text-center space-y-3">
                    <div className="inline-flex p-4 bg-zinc-900 border border-zinc-800 rounded-3xl mb-4 shadow-2xl">
                      <Bot className="text-neon-green h-10 w-10 animate-bounce" />
                    </div>
                    <p className="text-zinc-500 text-[10px] italic font-black uppercase tracking-[0.3em]">Protocolo v2.0</p>
                    <h2 className="text-white text-3xl font-black italic uppercase tracking-tighter leading-tight">
                      SUPORTE <span className="text-neon-green">ELITE</span>
                    </h2>
                  </div>
                  <form onSubmit={handleStartConversation} className="space-y-4">
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-zinc-900/40 border-2 border-zinc-900 rounded-2xl px-6 py-4 text-white text-sm focus:outline-none focus:border-neon-green/30 transition-all placeholder:text-zinc-700 italic font-bold"
                      placeholder="SEU NOME"
                    />
                    <input
                      required
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full bg-zinc-900/40 border-2 border-zinc-900 rounded-2xl px-6 py-4 text-white text-sm focus:outline-none focus:border-neon-green/30 transition-all placeholder:text-zinc-700 italic font-bold"
                      placeholder="ASSUNTO"
                    />
                    <Button type="submit" variant="neon" className="w-full py-8 font-black italic uppercase tracking-[0.3em] mt-4 rounded-2xl group" disabled={isStarting}>
                      {isStarting ? <Loader2 className="animate-spin" /> : (
                        <span className="flex items-center gap-2">
                          INICIAR CHAT <ChevronRight size={18} className="transition-transform group-hover:translate-x-1" />
                        </span>
                      )}
                    </Button>
                  </form>
                </div>
              ) : (
                <>
                  <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide relative z-10">
                    <div className="flex flex-col items-center gap-2 mb-4">
                      <Badge variant="outline" className="text-[8px] border-zinc-900 text-zinc-600 tracking-[0.4em] font-black uppercase bg-zinc-950/80 px-4 py-1.5 rounded-full">
                        Criptografia Elite
                      </Badge>
                    </div>

                    {messages.map((msg) => (
                      <div key={msg.id} className={`flex gap-3 ${msg.sender_type === 'client' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`h-8 w-8 rounded-xl shrink-0 flex items-center justify-center border overflow-hidden ${
                          msg.sender_type === 'client' ? 'bg-zinc-900 border-zinc-800' : msg.sender_type === 'bot' ? 'bg-neon-green/10 border-neon-green/30 text-neon-green' : 'bg-neon-purple/10 border-neon-purple/30 text-neon-purple'
                        }`}>
                          {msg.sender_type === 'client' ? (
                            msg.sender_avatar ? <img src={msg.sender_avatar} alt="Avatar" className="h-full w-full object-cover" referrerPolicy="no-referrer" /> : <UserIcon size={14} />
                          ) : msg.sender_type === 'bot' ? (
                            <Bot size={14} />
                          ) : (
                            <Headphones size={14} />
                          )}
                        </div>
                        <div className={`max-w-[80%] space-y-1 ${msg.sender_type === 'client' ? 'items-end' : 'items-start'}`}>
                          <div className={`rounded-2xl p-4 text-sm shadow-xl ${
                            msg.sender_type === 'client' ? 'bg-zinc-900 border border-zinc-800 text-white rounded-tr-none' : msg.sender_type === 'bot' ? 'bg-zinc-900/80 border border-neon-green/20 text-zinc-100 rounded-tl-none' : 'bg-zinc-900/80 border border-neon-purple/20 text-zinc-100 rounded-tl-none'
                          }`}>
                            {msg.image_url && <img src={msg.image_url} alt="Upload" className="w-full max-h-64 object-cover rounded-xl mb-3 border border-zinc-800" />}
                            <p className="leading-relaxed font-medium italic whitespace-pre-wrap">{msg.message}</p>
                          </div>
                          <div className="flex items-center gap-1.5 opacity-30 text-[8px] font-black italic tracking-widest uppercase px-1">
                            {msg.created_at && format(new Date(msg.created_at), 'HH:mm')}
                            {msg.sender_type === 'client' && (msg.read ? <CheckCheck size={10} className="text-neon-green" /> : <Check size={10} />)}
                          </div>
                        </div>
                      </div>
                    ))}

                    {(botTyping || conversation.typing_admin) && (
                      <div className="flex gap-3">
                        <div className="h-8 w-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600">
                          {botTyping ? <Bot size={14} className="animate-pulse" /> : <Headphones size={14} className="animate-pulse" />}
                        </div>
                        <div className="bg-zinc-900/50 border border-zinc-800/50 px-4 py-3 rounded-2xl rounded-tl-none">
                           <div className="flex gap-1.5">
                             <div className="h-1.5 w-1.5 bg-neon-green rounded-full animate-bounce [animation-delay:-0.3s]" />
                             <div className="h-1.5 w-1.5 bg-neon-green rounded-full animate-bounce [animation-delay:-0.15s]" />
                             <div className="h-1.5 w-1.5 bg-neon-green rounded-full animate-bounce" />
                           </div>
                        </div>
                      </div>
                    )}

                    {conversation.bot_active !== false && !botTyping && !isLoading && (
                      <div className="flex flex-col gap-3 pt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between px-1">
                          <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.3em]">Menu de Ajuda</p>
                          {new Date().getDate() <= NETFLIX_CONFIG.expireDay && (
                             <Badge variant="neon" className="text-[7px] animate-pulse">NOVO</Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {BOT_OPTIONS.map(opt => (
                            <button 
                              key={opt.id} 
                              onClick={() => handleSendMessage(undefined, opt.label)} 
                              className={`px-4 py-4 md:py-3 bg-zinc-900 border border-zinc-800 rounded-2xl text-[10px] md:text-[11px] font-black italic uppercase transition-all active:scale-95 text-zinc-400 hover:border-neon-green/40 hover:text-white ${
                                opt.id === 'netflix_free' ? 'border-amber-500/30 text-amber-500/70 hover:border-amber-500' : ''
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                          <button 
                            onClick={() => handleSendMessage(undefined, 'Falar com atendente')} 
                            className="col-span-2 px-4 py-4 md:py-3 bg-zinc-900 border border-neon-purple/20 rounded-2xl text-[10px] md:text-[11px] text-neon-purple font-black italic uppercase hover:bg-neon-purple/10 transition-all active:scale-95"
                          >
                            <span className="flex items-center justify-center gap-2">
                              Falar com atendente <Headphones size={12} />
                            </span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-5 bg-gradient-to-t from-black to-zinc-900/80 backdrop-blur-xl border-t border-zinc-800 relative z-10">
                    <form onSubmit={handleSendMessage} className="flex gap-3">
                       <label className={`p-4 rounded-2xl transition-all ${uploading ? 'bg-zinc-800 border-zinc-700 pointer-events-none' : 'bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-500 cursor-pointer hover:text-neon-green'}`}>
                          {uploading ? <Loader2 className="animate-spin" size={20} /> : <ImageIcon size={20} />}
                          <input type="file" className="hidden" accept="image/*,application/pdf" onChange={handleImageUpload} disabled={uploading} />
                       </label>
                       <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={conversation.bot_active !== false ? "Escolha acima ou digite..." : "Sua dúvida..."}
                        className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl px-6 text-white text-sm focus:outline-none focus:border-neon-green/30 transition-all font-bold italic placeholder:text-zinc-700"
                       />
                       <button type="submit" disabled={!newMessage.trim() || isLoading || botTyping} className="p-4 bg-neon-green text-black rounded-2xl hover:bg-neon-green/90 transition-all shadow-[0_10px_20px_rgba(57,255,20,0.15)] active:scale-95 disabled:grayscale disabled:opacity-30 flex items-center justify-center min-w-[56px]">
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

      <button
        onClick={() => { setIsOpen(!isOpen); setIsMinimized(false); }}
        className={`flex items-center gap-3 h-14 md:h-16 px-5 md:px-7 rounded-2xl md:rounded-3xl font-black italic uppercase tracking-wider shadow-2xl transition-all duration-500 ${
          isOpen && !isMinimized ? 'bg-zinc-900 text-white border border-zinc-800 w-14 md:w-16 !p-0 justify-center rounded-full' : 'bg-black text-[#00ff66] border border-[#00ff66]/30 hover:border-[#00ff66] hover:shadow-[0_0_30px_rgba(0,255,102,0.3)]'
        }`}
      >
        {isOpen && !isMinimized ? <X size={24} /> : (
          <>
            <MessageCircle className="h-6 w-6 md:h-7 md:w-7" />
            <div className="flex flex-col items-start leading-none pointer-events-none">
              <span className="text-[10px] md:text-[11px] text-white font-black tracking-[0.2em]">SUPORTE</span>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="h-1 w-1 rounded-full bg-[#00ff66] shadow-[0_0_5px_#00ff66]" />
                <span className="text-[8px] md:text-[9px] text-[#00ff66] font-black tracking-widest">ONLINE</span>
              </div>
            </div>
          </>
        )}
      </button>
    </div>
  );
}
