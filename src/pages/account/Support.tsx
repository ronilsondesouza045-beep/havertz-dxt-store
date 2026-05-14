import React, { useEffect, useState } from 'react';
import { MainLayout } from '../../layouts/MainLayout';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { MessageCircle, Clock, CheckCircle2, ChevronRight, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { handleFirestoreError, OperationType } from '../../lib/firestoreErrors';
import { safeDate } from '../../lib/utils';

interface Conversation {
  id: string;
  customer_name: string;
  subject: string;
  status: 'aberta' | 'respondida' | 'fechada' | 'resolvida';
  last_message: string;
  updated_at: any;
  created_at: any;
}

export default function AccountSupport() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const convsRef = collection(db, 'support_conversations');
    const q = query(
      convsRef, 
      where('user_id', '==', user.uid),
      orderBy('updated_at', 'desc')
    );

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
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'support_conversations');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const getStatusColor = (status: Conversation['status']) => {
    switch (status) {
      case 'aberta': return 'red';
      case 'respondida': return 'neon';
      case 'resolvida': return 'green';
      default: return 'gray';
    }
  };

  const handleTyping = () => {
    // Optional: Implement typing indicator with Firestore if needed
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-12 px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <div>
            <h1 className="text-3xl font-black text-white italic uppercase">
               Meus Atendimentos 🧪
            </h1>
            <p className="text-zinc-500 text-sm italic mt-1">Histórico de suporte e tickets abertos.</p>
          </div>
          
          <Button 
            variant="neon" 
            className="font-black italic uppercase"
            onClick={() => {
              // Trigger the floating chat start
              const btn = document.querySelector('button[class*="SupportOnline"]') as HTMLButtonElement;
              if (btn) btn.click();
            }}
          >
            ABRIR NOVO TICKET <MessageCircle className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
             {loading ? (
               [1, 2, 3].map(i => <div key={i} className="h-24 w-full bg-zinc-900/50 animate-pulse rounded-2xl" />)
             ) : conversations.length === 0 ? (
               <Card className="p-16 text-center bg-zinc-950 border-dashed border-zinc-800">
                  <div className="h-16 w-16 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <HelpCircle className="text-zinc-700 h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 italic uppercase">Sem chamados ativos</h3>
                  <p className="text-zinc-600 text-sm max-w-sm mx-auto">Você ainda não abriu nenhum ticket de suporte. Se precisar de ajuda, clique no botão para iniciar um chat.</p>
               </Card>
             ) : (
               conversations.map((conv) => (
                 <div 
                   key={conv.id} 
                   className="cursor-pointer group"
                   onClick={() => {
                      localStorage.setItem('havertz_chat_conv_id', conv.id);
                      window.dispatchEvent(new CustomEvent('openChat', { detail: { id: conv.id } }));
                   }}
                 >
                   <Card className="p-6 bg-zinc-950 border-zinc-900 hover:border-zinc-800 transition-all">
                     <div className="flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <div className={`h-12 w-12 rounded-xl flex items-center justify-center border ${
                            conv.status === 'aberta' ? 'bg-red-600/10 border-red-600/20 text-red-500' : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                          }`}>
                             <MessageCircle size={20} />
                          </div>
                          <div>
                            <h4 className="text-white font-bold uppercase italic text-sm">{conv.subject || 'Suporte Geral'}</h4>
                            <p className="text-[10px] text-zinc-500 mt-0.5 line-clamp-1 italic">{conv.last_message}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-4">
                          <div className="text-right hidden sm:block">
                             <Badge variant={getStatusColor(conv.status) as any} className="text-[9px] uppercase">
                                {conv.status}
                             </Badge>
                             <p className="text-[10px] text-zinc-600 mt-1 italic font-bold">
                                {conv.updated_at && format(safeDate(conv.updated_at), 'dd/MM HH:mm')}
                             </p>
                          </div>
                          <ChevronRight className="text-zinc-800 group-hover:text-neon-green transition-colors" />
                       </div>
                     </div>
                   </Card>
                 </div>
               ))
             )}
          </div>

          <div className="lg:col-span-1">
             <Card className="p-8 bg-zinc-950 border-zinc-900 lg:sticky lg:top-24">
                <h4 className="text-lg font-black text-white italic uppercase mb-6 flex items-center gap-2">
                   <Clock className="text-neon-purple h-5 w-5" /> Status do Sistema
                </h4>
                <div className="space-y-6">
                   <div className="flex justify-between items-center pb-4 border-b border-zinc-900">
                      <span className="text-xs text-zinc-500 uppercase font-black">Suporte Online</span>
                      <div className="flex items-center gap-2 text-neon-green">
                         <div className="h-1.5 w-1.5 rounded-full bg-neon-green animate-pulse" />
                         <span className="text-[10px] font-black uppercase italic">Operante</span>
                      </div>
                   </div>
                   <div className="flex justify-between items-center pb-4 border-b border-zinc-900">
                      <span className="text-xs text-zinc-500 uppercase font-black">Canais Extras</span>
                      <span className="text-[10px] font-black text-zinc-400 uppercase italic">WhatsApp / Instagram</span>
                   </div>
                   
                   <div className="bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800">
                      <p className="text-xs text-zinc-500 italic mb-4">Prazo médio de resposta:</p>
                      <div className="flex items-center gap-3">
                         <div className="h-10 w-10 rounded-xl bg-neon-green/10 flex items-center justify-center border border-neon-green/20">
                            <span className="text-neon-green font-black italic">15m</span>
                         </div>
                         <p className="text-[10px] text-zinc-400 font-bold uppercase leading-tight">
                            Atendimento manual e organizado por ordem de chegada.
                         </p>
                      </div>
                   </div>
                </div>
             </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
