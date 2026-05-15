import React, { useEffect, useState, useRef } from 'react';
import { MainLayout } from '../../layouts/MainLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc, 
  addDoc, 
  serverTimestamp,
  deleteDoc,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { safeDate } from '../../lib/utils';
import { 
  Search, 
  MessageCircle, 
  Send, 
  Check, 
  CheckCheck, 
  Trash2, 
  MoreVertical,
  User,
  Clock,
  Filter,
  Loader2,
  ExternalLink,
  Eye,
  FileText,
  Bot,
  UserCheck,
  Headphones,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { handleFirestoreError, OperationType } from '../../lib/firestoreErrors';
import { isAdminEmail } from '../../constants/admins';

interface Conversation {
  id: string;
  user_id?: string;
  order_id?: string;
  order_code?: string;
  customer_name: string;
  customer_email: string;
  customer_avatar?: string;
  status: 'aberta' | 'respondida' | 'resolvida' | 'fechada';
  last_message: string;
  bot_active?: boolean;
  updated_at: any;
  created_at: any;
  typing_client?: boolean;
  typing_admin?: boolean;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_type: 'client' | 'admin' | 'bot';
  sender_id: string;
  sender_avatar?: string;
  message: string;
  image_url?: string;
  file_url?: string;
  read: boolean;
  created_at: any;
  file_name?: string;
  file_type?: string;
}

export default function AdminSupportChat() {
  const { user, profile } = useAuth();
  const isAdminUser = isAdminEmail(user?.email);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('todas');
  const [isLoading, setIsLoading] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!isAdminUser) return;

    const convsRef = collection(db, 'support_conversations');
    const q = query(convsRef, orderBy('updated_at', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const convsData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          updated_at: safeDate(data.updated_at).toISOString(),
          created_at: safeDate(data.created_at).toISOString(),
        };
      }) as Conversation[];
      setConversations(convsData);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'support_conversations');
    });

    return () => unsubscribe();
  }, [isAdminUser]);

  if (!isAdminUser && user) {
    return (
      <MainLayout>
        <div className="container mx-auto py-24 px-4 text-center">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-red-500/10 border border-red-500/20 mb-6 text-red-500">
             <Headphones size={40} />
          </div>
          <h1 className="text-3xl font-black text-white italic uppercase mb-4">ACESSO NEGADO</h1>
          <p className="text-zinc-500 max-w-md mx-auto mb-8 font-medium">Você não tem permissões de administrador para gerenciar o suporte.</p>
          <Button variant="neon" onClick={() => window.location.href = '/'}>VOLTAR AO INÍCIO</Button>
        </div>
      </MainLayout>
    );
  }

  useEffect(() => {
    if (selectedConv) {
      const msgsRef = collection(db, 'support_conversations', selectedConv.id, 'messages');
      const q = query(msgsRef, orderBy('created_at', 'asc'));

      const unsubscribe = onSnapshot(q, async (snapshot) => {
        const msgsData = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            created_at: safeDate(data.created_at).toISOString(),
          };
        }) as Message[];
        setMessages(msgsData);
        scrollToBottom();

        // Mark as read (Admin side marks client messages as read)
        const unreadDocs = snapshot.docs.filter(doc => doc.data().sender_type === 'client' && !doc.data().read);
        for (const doc of unreadDocs) {
          await updateDoc(doc.ref, { read: true });
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, `support_conversations/${selectedConv.id}/messages`);
      });

      return () => unsubscribe();
    }
  }, [selectedConv]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const handleTyping = () => {
    // Optional: Implement typing indicator with Firestore if needed
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConv || !user) return;

    const msgText = newMessage;
    setNewMessage('');
    setIsLoading(true);

    try {
      const msgsRef = collection(db, 'support_conversations', selectedConv.id, 'messages');
      await addDoc(msgsRef, {
        conversation_id: selectedConv.id,
        sender_type: 'admin',
        sender_id: user.uid,
        sender_avatar: profile?.avatar_url || user.photoURL || null,
        message: msgText,
        read: false,
        created_at: serverTimestamp()
      });
      
      const convRef = doc(db, 'support_conversations', selectedConv.id);
      await updateDoc(convRef, {
        last_message: msgText,
        updated_at: serverTimestamp(),
        status: 'respondida',
        bot_active: false // Disable bot when admin responds
      });
        
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `support_conversations/${selectedConv.id}/messages`);
    } finally {
      setIsLoading(false);
    }
  };

  const takeOverConversation = async () => {
    if (!selectedConv) return;
    try {
      const convRef = doc(db, 'support_conversations', selectedConv.id);
      await updateDoc(convRef, {
        bot_active: false,
        updated_at: serverTimestamp()
      });
      toast.success('Você assumiu o atendimento.');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `support_conversations/${selectedConv.id}`);
    }
  };

  const deleteConversation = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta conversa?')) return;
    try {
      // Note: In Firestore deletions aren't recursive by default, but here we just delete the shell/head.
      // Ideally you'd delete messages too.
      await deleteDoc(doc(db, 'support_conversations', id));
      
      setConversations(prev => prev.filter(c => c.id !== id));
      if (selectedConv?.id === id) setSelectedConv(null);
      toast.success('Conversa excluída com sucesso.');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `support_conversations/${id}`);
    }
  };

  const updateStatus = async (status: 'aberta' | 'respondida' | 'resolvida' | 'fechada') => {
    if (!selectedConv) return;
    try {
      const convRef = doc(db, 'support_conversations', selectedConv.id);
      await updateDoc(convRef, { 
        status, 
        updated_at: serverTimestamp() 
      });
      setSelectedConv({ ...selectedConv, status });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `support_conversations/${selectedConv.id}`);
    }
  };

  const filteredConvs = conversations.filter(c => {
    const matchesSearch = c.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         c.customer_email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'todas' || c.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <MainLayout>
      <div className="container mx-auto py-4 md:py-12 px-0 md:px-4 h-[calc(100vh-64px)] md:h-[calc(100vh-120px)] flex flex-col">
        <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3" />

        <div className={`flex flex-col md:flex-row md:items-center justify-between mb-4 md:mb-8 gap-4 px-4 md:px-0 ${selectedConv ? 'hidden md:flex' : 'flex'}`}>
          <div>
            <h1 className="text-3xl font-black text-white italic uppercase flex items-center gap-3">
              CENTRAL DE SUPORTE 🧪
              <Badge variant="outline" className="text-neon-purple border-neon-purple/30">REALTIME</Badge>
            </h1>
            <p className="text-zinc-500 text-sm italic mt-1">Gerencie o atendimento aos súditos em tempo real.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 h-4 w-4" />
              <input
                type="text"
                placeholder="Pesquisar cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-white text-sm focus:outline-none focus:border-neon-green/30"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-white text-sm focus:outline-none appearance-none cursor-pointer"
            >
              <option value="todas">Todas</option>
              <option value="aberta">Abertas</option>
              <option value="respondida">Respondidas</option>
              <option value="resolvida">Resolvidas</option>
            </select>
          </div>
        </div>

        <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden min-h-0">
          {/* Conversation List */}
          <Card className={`w-full md:w-80 lg:w-96 bg-zinc-950 border-zinc-900 overflow-hidden flex flex-col ${selectedConv ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-4 border-b border-zinc-900 bg-zinc-900/50">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Conversas</span>
                <Badge variant="outline" className="text-neon-green">{filteredConvs.length}</Badge>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              {filteredConvs.length > 0 ? (
                filteredConvs.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConv(conv)}
                    className={`w-full p-6 md:p-4 border-b border-zinc-900/50 flex flex-col gap-2 text-left transition-all ${
                      selectedConv?.id === conv.id ? 'bg-zinc-900 border-l-2 border-l-neon-green' : 'hover:bg-zinc-900/30'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col">
                        <h4 className="font-bold text-white text-sm md:text-sm uppercase truncate max-w-[200px] md:max-w-[150px]">{conv.customer_name}</h4>
                        {conv.bot_active !== false && (
                          <div className="flex items-center gap-1 text-[8px] text-neon-green font-black uppercase italic mt-0.5">
                            <Bot size={8} /> Bot Ativo
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] md:text-[9px] text-zinc-600 font-bold italic">
                        {conv.updated_at && format(safeDate(conv.updated_at), 'HH:mm')}
                      </span>
                    </div>
                    <p className="text-sm md:text-xs text-zinc-500 line-clamp-2 md:line-clamp-1 italic">{conv.last_message}</p>
                    <div className="flex items-center justify-between mt-2">
                      <Badge 
                        variant={
                          conv.status === 'aberta' ? 'red' : 
                          conv.status === 'respondida' ? 'blue' : 
                          conv.status === 'resolvida' ? 'green' : 'gray'
                        }
                        size="xs"
                        className="text-[9px] md:text-[8px]"
                      >
                        {conv.status.toUpperCase()}
                      </Badge>
                      {conv.status === 'aberta' && (
                        <div className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
                      )}
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-12 text-center">
                  <p className="text-zinc-600 text-xs uppercase font-black tracking-widest">Nenhuma conversa</p>
                </div>
              )}
            </div>
          </Card>

          {/* Chat Window */}
          <Card className={`flex-1 bg-zinc-950 border-zinc-900 flex flex-col overflow-hidden relative ${!selectedConv ? 'hidden md:flex' : 'flex'}`}>
            {!selectedConv ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                <div className="h-20 w-20 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6">
                  <MessageCircle className="text-zinc-700 h-10 w-10" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 italic uppercase">Selecione um cliente</h3>
                <p className="text-zinc-600 text-sm max-w-sm">Escolha uma conversa ao lado para iniciar o atendimento VIP.</p>
                <div className="mt-8 flex gap-3">
                   <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-600/10 border border-red-600/20">
                      <div className="h-1.5 w-1.5 rounded-full bg-red-600" />
                      <span className="text-[10px] text-red-500 font-black uppercase">Pendentes</span>
                   </div>
                   <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neon-green/10 border border-neon-green/20">
                      <div className="h-1.5 w-1.5 rounded-full bg-neon-green" />
                      <span className="text-[10px] text-neon-green font-black uppercase">Ativos</span>
                   </div>
                </div>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div className="p-4 bg-zinc-900/50 border-b border-zinc-900 flex items-center justify-between">
                  <div className="flex items-center gap-2 md:gap-3">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setSelectedConv(null)}
                      className="md:hidden p-1 min-w-0 h-10 w-10 text-zinc-500"
                    >
                      <ArrowLeft size={20} />
                    </Button>
                    <div className="h-10 w-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center hidden sm:flex overflow-hidden">
                      {selectedConv.customer_avatar ? (
                        <img src={selectedConv.customer_avatar} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <User className="text-zinc-400 h-5 w-5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xs md:text-sm font-bold text-white uppercase truncate">{selectedConv.customer_name}</h3>
                      <div className="flex items-center gap-2">
                        <p className="text-[10px] text-zinc-500 font-medium truncate">{selectedConv.customer_email}</p>
                        {selectedConv.bot_active !== false && (
                          <Badge variant="outline" className="text-[7px] border-neon-green/30 text-neon-green h-4 hidden xs:inline-flex">BOT ATIVO</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 md:gap-2">
                    {selectedConv.bot_active !== false && (
                      <Button 
                        variant="neon" 
                        size="sm" 
                        onClick={takeOverConversation}
                        className="h-8 md:h-8 py-0 text-[8px] md:text-[9px] font-black italic uppercase px-2 md:px-3 shadow-none"
                      >
                        ASSUMIR <span className="hidden md:inline ml-1">CHAT</span> <UserCheck className="ml-1 md:ml-1.5 h-3 w-3" />
                      </Button>
                    )}
                    <select
                      value={selectedConv.status}
                      onChange={(e) => updateStatus(e.target.value as any)}
                      className="bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-[10px] font-black text-white uppercase italic focus:outline-none max-w-[80px] md:max-w-none"
                    >
                      <option value="aberta">Abert.</option>
                      <option value="respondida">Resp.</option>
                      <option value="resolvida">Resolv.</option>
                      <option value="fechada">Fech.</option>
                    </select>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => deleteConversation(selectedConv.id)}
                      className="h-8 w-8 p-0 text-red-500 border-red-500/20 hover:bg-red-500/10"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>

                {/* Messages Panel */}
                <div 
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto p-6 pb-24 md:pb-6 space-y-6 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"
                >
                  {messages.map((msg) => (
                    <div 
                      key={msg.id}
                      className={`flex gap-3 ${msg.sender_type === 'admin' ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      <div className={`h-8 w-8 rounded-xl shrink-0 border flex items-center justify-center overflow-hidden ${
                        msg.sender_type === 'admin' ? 'bg-neon-green/10 border-neon-green/30 text-neon-green' : msg.sender_type === 'bot' ? 'bg-zinc-900 border-neon-green/10 text-neon-green' : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                      }`}>
                         {msg.sender_type === 'admin' ? (
                            msg.sender_avatar ? <img src={msg.sender_avatar} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" /> : <Headphones size={14} />
                         ) : msg.sender_type === 'bot' ? (
                            <Bot size={14} />
                         ) : (
                            msg.sender_avatar ? <img src={msg.sender_avatar} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" /> : <User size={14} />
                         )}
                      </div>
                      <div className={`flex flex-col gap-1 max-w-[70%] ${msg.sender_type === 'admin' ? 'items-end' : 'items-start'}`}>
                        <div className={`p-4 rounded-2xl text-sm ${
                          msg.sender_type === 'admin' 
                            ? 'bg-neon-green text-black font-medium rounded-tr-none shadow-[0_0_15px_rgba(57,255,20,0.2)]' 
                            : msg.sender_type === 'bot'
                              ? 'bg-zinc-900 border border-neon-green/10 text-white rounded-tl-none ring-1 ring-neon-green/5'
                              : 'bg-zinc-900 border border-zinc-800 text-white rounded-tl-none'
                        }`}>
                          {msg.sender_type === 'bot' && (
                            <div className="flex items-center gap-1.5 text-[8px] font-black text-neon-green uppercase mb-2">
                              <Bot size={10} /> DXT ASSISTENTE
                            </div>
                          )}
                          {msg.image_url && (
                            <div className="mb-3 rounded-lg overflow-hidden border border-black/20 bg-black/40">
                              {msg.image_url.toLowerCase().includes('.pdf') ? (
                                <div className="p-4 flex items-center justify-center flex-col gap-2">
                                  <FileText className="text-zinc-500 h-10 w-10" />
                                  <span className="text-[9px] font-black uppercase text-zinc-500">Documento PDF</span>
                                  {msg.file_name && <span className="text-[8px] text-zinc-600 truncate max-w-full px-2 italic">{msg.file_name}</span>}
                                  <Button 
                                    variant="outline" 
                                    size="xs" 
                                    className="mt-2 h-7 text-[8px] border-zinc-700"
                                    onClick={() => window.open(msg.image_url, '_blank')}
                                  >
                                    <ExternalLink size={10} className="mr-1" /> ABRIR DOCUMENTO
                                  </Button>
                                </div>
                              ) : (
                                <div className="relative group">
                                  <img src={msg.image_url} alt="Attachment" className="w-full max-h-60 object-cover cursor-pointer" onClick={() => window.open(msg.image_url, '_blank')} />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                                     <Eye className="text-white h-5 w-5" />
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                          <p className="leading-relaxed">{msg.message}</p>
                        </div>
                        <div className={`flex items-center gap-2 text-[9px] font-black italic uppercase ${
                          msg.sender_type === 'admin' ? 'justify-end text-zinc-500' : 'text-zinc-600'
                        }`}>
                          {msg.created_at && format(safeDate(msg.created_at), "HH:mm", { locale: ptBR })}
                          {msg.sender_type === 'admin' && (
                            msg.read ? <CheckCheck size={10} className="text-neon-green" /> : <Check size={10} />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {selectedConv.typing_client && (
                    <div className="flex justify-start">
                      <div className="bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-full text-[10px] text-zinc-500 font-bold italic animate-pulse">
                         Cliente digitando...
                      </div>
                    </div>
                  )}
                </div>

                {/* Input Panel */}
                <div className="p-4 bg-zinc-900 border-t border-zinc-900 fixed md:relative bottom-0 md:bottom-0 left-0 right-0 z-20 md:z-auto">
                  <form onSubmit={handleSendMessage} className="flex gap-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => { setNewMessage(e.target.value); handleTyping(); }}
                      placeholder="Resposta..."
                      className="flex-1 bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-4 md:py-3 text-white text-sm focus:outline-none focus:border-neon-green/30 font-medium"
                    />
                    <Button 
                      type="submit" 
                      disabled={!newMessage.trim() || isLoading}
                      className="bg-neon-green text-black hover:bg-neon-green/90 font-black italic px-4 md:px-6 rounded-2xl h-12 md:h-auto"
                    >
                      {isLoading ? <Loader2 className="animate-spin" /> : <><Send className="md:mr-2 h-4 w-4" /> <span className="hidden md:inline">ENVIAR</span></>}
                    </Button>
                  </form>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
