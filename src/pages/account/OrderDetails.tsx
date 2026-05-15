import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MainLayout } from '../../layouts/MainLayout';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Order } from '../../types';
import { formatCurrency, safeDate } from '../../lib/utils';
import { ArrowLeft, Clock, Package, MessageCircle, AlertCircle, ShieldCheck, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { InfoBadgeRow, NoticeSection } from '../../components/ui/InfoSection';
import { handleFirestoreError, OperationType } from '../../lib/firestoreErrors';

export default function OrderDetails() {
  const { id } = useParams<{ id: string }>();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !id) return;

    const fetchOrder = async () => {
      try {
        const orderRef = doc(db, 'orders', id);
        const snapshot = await getDoc(orderRef);

        if (snapshot.exists()) {
          const data = snapshot.data();
          // Verify ownership and soft-delete state
          if (data.user_id === user.uid && data.is_deleted !== true) {
            setOrder({ id: snapshot.id, ...data } as Order);
          }
        }
      } catch (err: any) {
        handleFirestoreError(err, OperationType.GET, `orders/${id}`);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [user, id]);

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'entregue': return 'success';
      case 'cancelado': return 'error';
      case 'aguardando pagamento': return 'warning';
      case 'em análise': return 'info';
      case 'pagamento confirmado': return 'neon';
      default: return 'default';
    }
  };

  if (loading) return null;
  if (!order) return <MainLayout>Pedido não encontrado.</MainLayout>;

  return (
    <MainLayout>
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Link to="/account/orders" className="flex items-center text-zinc-500 hover:text-white mb-8 transition-colors text-sm uppercase font-black italic">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar aos pedidos
          </Link>

          <Card className="p-0 overflow-hidden mb-8 border-zinc-800 bg-zinc-950">
             <div className="bg-black/40 p-8 border-b border-zinc-900 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                   <div className="h-14 w-14 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
                      {profile?.avatar_url || user?.photoURL ? (
                         <img src={profile?.avatar_url || user?.photoURL || ''} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                         <div className="text-xl font-black text-neon-green italic">{user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}</div>
                      )}
                   </div>
                   <div>
                      <div className="flex items-center flex-wrap gap-3 mb-2">
                         <h1 className="text-2xl font-black text-white italic uppercase tracking-tighter">Pedido #{order.order_code}</h1>
                         <Badge variant={getStatusColor(order.status)} className="italic font-black py-1 px-3 text-[10px] uppercase">
                            {order.status}
                         </Badge>
                      </div>
                      <p className="text-xs text-zinc-600 font-mono font-bold">Solicitado em {safeDate(order.created_at).toLocaleString('pt-BR')}</p>
                   </div>
                </div>
                <div className="text-left md:text-right">
                   <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-1">Total da Injeção</p>
                   <p className="text-3xl font-black text-neon-green italic">{formatCurrency(order.total_price)}</p>
                </div>
             </div>

             <div className="p-8 grid grid-cols-1 md:grid-cols-5 gap-12">
                <div className="md:col-span-3 space-y-10">
                   <div>
                      <h4 className="text-[10px] font-black text-zinc-600 uppercase mb-5 tracking-[0.2em]">Detalhes do Pacote</h4>
                      <div className="flex items-center gap-5 p-5 rounded-3xl bg-zinc-900/30 border border-zinc-800/50 backdrop-blur-sm shadow-xl">
                         <div className="h-16 w-16 rounded-2xl flex items-center justify-center bg-black border border-zinc-800 text-neon-green font-black shadow-inner">
                            {order.amount_k ? `${order.amount_k}K` : <Package size={24} />}
                         </div>
                         <div>
                            <p className="text-white font-black text-lg italic uppercase">{order.product_name}</p>
                            <p className="text-[10px] text-neon-purple uppercase font-black tracking-widest mt-1">{order.product_category}</p>
                         </div>
                      </div>
                   </div>

                   <div>
                      <h4 className="text-[10px] font-black text-zinc-600 uppercase mb-5 tracking-[0.2em]">Fluxo de Entrega</h4>
                      <div className="space-y-4 text-xs font-bold bg-zinc-900/20 p-6 rounded-3xl border border-zinc-800">
                         {order.imvu_nick && (
                           <div className="flex justify-between items-center py-2 border-b border-zinc-800/50">
                              <span className="text-zinc-500 uppercase">Nick IMVU:</span>
                              <span className="text-white bg-zinc-900 px-3 py-1 rounded-full border border-zinc-700 italic tracking-wide">@{order.imvu_nick.replace('@', '')}</span>
                           </div>
                         )}
                         {order.player_id && (
                           <div className="flex justify-between items-center py-2 border-b border-zinc-800/50">
                              <span className="text-zinc-500 uppercase">ID Player FF:</span>
                              <span className="text-orange-500 bg-orange-500/10 px-3 py-1 rounded-lg border border-orange-500/20">{order.player_id}</span>
                           </div>
                         )}
                         {order.instagram_handle && (
                           <div className="flex justify-between items-center py-2 border-b border-zinc-800/50">
                              <span className="text-zinc-500 uppercase">Instagram:</span>
                              <span className="text-blue-400 bg-blue-500/10 px-3 py-1 rounded-lg border border-blue-500/20">@{order.instagram_handle.replace('@', '')}</span>
                           </div>
                         )}
                         {order.access_email && (
                           <div className="flex justify-between items-center py-2">
                              <span className="text-zinc-500 uppercase">Email de Acesso:</span>
                              <span className="text-white bg-zinc-900 px-3 py-1 rounded-full border border-zinc-700 italic tracking-wide">{order.access_email}</span>
                           </div>
                         )}
                      </div>
                   </div>

                   {order.admin_note && (
                     <div className="p-6 rounded-3xl bg-neon-purple/5 border border-neon-purple/20 shadow-[0_0_20px_-10px_rgba(151,71,255,0.2)]">
                        <h4 className="text-xs font-black text-neon-purple uppercase mb-2 flex items-center gap-2 italic">
                           <AlertCircle size={16} /> Nota de Análise
                        </h4>
                        <p className="text-sm text-zinc-300 italic leading-relaxed">{order.admin_note}</p>
                     </div>
                   )}
                </div>

                <div className="md:col-span-2 space-y-10">
                   <div>
                     <div>
                        <h4 className="text-[10px] font-black text-zinc-600 uppercase mb-5 tracking-[0.2em]">Confirmação Manual</h4>
                        <div className="space-y-4">
                          {order.proof_image_url ? (
                            <div className="rounded-3xl overflow-hidden border border-zinc-800 group relative bg-black shadow-2xl">
                               {order.proof_image_url.toLowerCase().endsWith('.pdf') ? (
                                  <div className="aspect-video flex flex-col items-center justify-center gap-3">
                                     <FileText size={48} className="text-neon-green" />
                                     <span className="text-[10px] text-zinc-500 uppercase font-bold">Arquivo PDF</span>
                                  </div>
                               ) : (
                                  <img src={order.proof_image_url} alt="Comprovante" className="w-full aspect-video object-contain" />
                               )}
                               <a href={order.proof_image_url} target="_blank" rel="noreferrer" className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all text-xs font-black text-neon-green uppercase italic tracking-widest gap-2">
                                  Visualizar Completo <ShieldCheck size={16} />
                               </a>
                            </div>
                          ) : (
                            <div className="p-8 rounded-3xl bg-zinc-950 border border-zinc-900 border-dashed text-center space-y-4">
                               <p className="text-xs text-zinc-400 italic font-bold">Aguardando confirmação manual.</p>
                               <div className="flex flex-col gap-2">
                                 <Button variant="neon" size="sm" className="bg-[#E1306C] hover:bg-[#C13584] border-none text-[9px]" onClick={() => window.open('https://www.instagram.com/havertz.dxt/', '_blank')}>Enviar no Instagram</Button>
                               </div>
                            </div>
                          )}
                          <p className="text-[10px] text-zinc-600 italic font-medium leading-relaxed">
                             {order.proof_image_url ? "Comprovante enviado pelo site." : "O comprovante deve ser enviado externamente via Instagram oficial."}
                          </p>
                        </div>
                     </div>
                   </div>

                   <hr className="border-zinc-900" />

                   <div className="bg-zinc-900/30 p-8 rounded-3xl border border-zinc-800/80 backdrop-blur-sm">
                      <p className="text-xs text-zinc-400 text-center mb-6 italic leading-relaxed font-medium">Equipe de suporte disponível para dúvidas sobre este pedido.</p>
                      <Button variant="neon" className="w-full h-14 font-black uppercase italic tracking-widest shadow-[0_10px_20px_-5px_rgba(57,255,20,0.2)]" onClick={() => navigate('/account/support')}>
                         Suporte Online Site <MessageCircle className="ml-2 h-5 w-5" />
                      </Button>
                      <div className="flex items-center justify-center gap-2 mt-6">
                         <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                         <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Equipe Online</span>
                      </div>
                   </div>
                </div>
             </div>
          </Card>

          <NoticeSection title="Protocolos de Verificação" />
        </div>
      </div>
    </MainLayout>
  );
}
