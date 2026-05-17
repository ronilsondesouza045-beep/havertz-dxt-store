import { useEffect, useState } from 'react';
import { MainLayout } from '../../layouts/MainLayout';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, or, and } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Order } from '../../types';
import { formatCurrency, safeDate } from '../../lib/utils';
import { Package, Clock, Hash, ChevronRight, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { handleFirestoreError, OperationType } from '../../lib/firestoreErrors';
import { Modal } from '../../components/ui/Modal';

export default function UserOrders() {
  const { user, profile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingOrder, setDeletingOrder] = useState<Order | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!user) {
      // If user state is explicitly null (not just undefined/loading), stop loading
      if (user === null) setLoading(false);
      return;
    }

    const ordersRef = collection(db, 'orders');
    
    // Create a query that finds orders by user_id OR customer_email
    const q = query(
      ordersRef,
      or(
        where('user_id', '==', user.uid),
        where('customer_email', '==', user.email)
      ),
      orderBy('created_at', 'desc')
    );

    setLoading(true);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Order))
        .filter(order => order.is_deleted !== true); // Handles cases where field is missing
      
      setOrders(ordersData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching orders:', error);
      handleFirestoreError(error, OperationType.GET, 'orders');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

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

  const handleDeleteOrder = async () => {
    if (!deletingOrder) return;
    
    setIsDeleting(true);
    try {
      const orderRef = doc(db, 'orders', deletingOrder.id);
      await updateDoc(orderRef, {
        is_deleted: true,
        deleted_by: 'client',
        deleted_at: new Date().toISOString(),
        status: 'removido pelo cliente',
        payment_status: 'cancelado pelo cliente',
        updated_at: new Date().toISOString()
      });
      setDeletingOrder(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `orders/${deletingOrder.id}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-8 md:py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6 text-center md:text-left">
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-white italic uppercase tracking-tighter">
                Meus Pedidos 🧪
              </h1>
              <p className="text-zinc-500 text-base italic mt-1 font-medium">Histórico de injeções de créditos.</p>
            </div>
            <Link to="/loja" className="w-full md:w-auto">
              <Button variant="neon" size="lg" className="w-full md:w-auto h-14 md:h-12 font-black italic tracking-widest px-8">
                FAZER NOVO PEDIDO
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="space-y-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-40 w-full bg-zinc-900/50 animate-pulse rounded-2xl border border-zinc-800" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <Card className="p-12 md:p-20 text-center border-dashed border-zinc-800 bg-zinc-900/10">
              <div className="h-20 w-20 bg-zinc-900 rounded-3xl flex items-center justify-center mx-auto mb-8 text-zinc-600 border border-zinc-800 shadow-xl shadow-black ring-4 ring-zinc-900/50">
                <Package size={40} />
              </div>
              <h3 className="text-2xl font-black text-white mb-3 italic tracking-tighter">NENHUM PEDIDO AINDA</h3>
              <p className="text-zinc-500 mb-10 max-w-sm mx-auto text-base italic">Você ainda não realizou nenhuma compra de créditos em nosso sistema premium.</p>
              <Link to="/loja">
                <Button variant="outline" size="lg" className="px-10 h-14 font-black italic">IR PARA A LOJA 🧪</Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-6">
              {orders.map((order, i) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, type: 'spring', damping: 20 }}
                >
                  <Card className="hover:border-zinc-500 transition-all p-0 overflow-hidden bg-zinc-950/80 backdrop-blur-sm shadow-xl shadow-black/50 group border-zinc-800">
                    <div className="flex flex-col">
                       {/* Header of the Card */}
                       <div className="p-5 md:p-6 flex flex-wrap items-center justify-between gap-4 border-b border-zinc-900 bg-zinc-900/20">
                          <div className="flex items-center gap-3">
                             <div className="h-8 w-8 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
                                {profile?.avatar_url || user?.photoURL ? (
                                   <img src={profile?.avatar_url || user?.photoURL || ''} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                                ) : (
                                   <div className="text-[10px] font-black text-neon-green">{user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}</div>
                                )}
                             </div>
                             <div className="flex items-center gap-2 bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-800 shadow-inner">
                                <Hash className="h-3 w-3 text-neon-green" />
                                <span className="text-xs font-black text-zinc-300 font-mono tracking-tighter">{order.order_code}</span>
                             </div>
                             <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest italic">
                                {safeDate(order.created_at).toLocaleDateString('pt-BR')}
                             </span>
                          </div>
                          <Badge variant={getStatusColor(order.status)} className="px-3 py-1 text-xs font-black italic uppercase tracking-wider">
                             {order.status}
                          </Badge>
                       </div>

                       <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-zinc-900">
                          <div className="p-6 md:p-8 flex-1 space-y-6">
                             <div className="flex items-start gap-5">
                                <div className={`h-16 w-16 md:h-14 md:w-14 shrink-0 rounded-2xl flex items-center justify-center border-2 shadow-lg transition-transform group-hover:scale-105 ${
                                  order.product_type === 'DIRETO' 
                                    ? 'bg-neon-green/10 text-neon-green border-neon-green/20 shadow-neon-green/5' 
                                    : 'bg-neon-purple/10 text-neon-purple border-neon-purple/20 shadow-neon-purple/5'
                                }`}>
                                   {order.product_type === 'DIRETO' ? <Package size={32} /> : <Clock size={32} />}
                                </div>
                                <div className="space-y-1">
                                   <h4 className="text-white font-black text-xl md:text-2xl italic tracking-tighter group-hover:text-neon-green transition-colors leading-tight">
                                      {order.product_name}
                                   </h4>
                                   <p className="text-xs md:text-sm text-zinc-500 italic uppercase font-black tracking-widest opacity-80">
                                      {order.product_category === 'credits' ? `Via ${order.product_type}` : order.product_category.replace('_', ' ')}
                                   </p>
                                </div>
                             </div>
                             
                             {/* Identification Details */}
                             {(order.imvu_nick || order.player_id || order.player_nick || order.instagram_handle || order.access_email) && (
                               <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/50">
                                  {order.imvu_nick && (
                                    <div className="flex flex-col">
                                       <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">IMVU Avatar</span>
                                       <span className="text-sm text-zinc-300 font-bold italic tracking-tight">{order.imvu_nick}</span>
                                    </div>
                                  )}
                                  {order.player_id && (
                                    <div className="flex flex-col">
                                       <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">Player ID</span>
                                       <span className="text-sm text-zinc-300 font-bold italic tracking-tight">{order.player_id}</span>
                                    </div>
                                  )}
                                  {order.player_nick && (
                                    <div className="flex flex-col">
                                       <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">Nick Jogo</span>
                                       <span className="text-sm text-zinc-300 font-bold italic tracking-tight">{order.player_nick}</span>
                                    </div>
                                  )}
                                  {order.instagram_handle && (
                                    <div className="flex flex-col">
                                       <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">Instagram</span>
                                       <span className="text-sm text-zinc-300 font-bold italic tracking-tight underline">@{order.instagram_handle.replace('@', '')}</span>
                                    </div>
                                  )}
                                  {order.access_email && (
                                    <div className="flex flex-col">
                                       <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">Conta Acesso</span>
                                       <span className="text-sm text-zinc-300 font-bold italic tracking-tight truncate">{order.access_email}</span>
                                    </div>
                                  )}
                               </div>
                             )}

                             {order.notes && (
                               <div className="p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-xl italic">
                                  <p className="text-xs text-yellow-500/80 font-black uppercase mb-1 tracking-widest">Observação</p>
                                  <p className="text-sm text-zinc-400 font-medium tracking-tight leading-relaxed line-clamp-2">"{order.notes}"</p>
                               </div>
                             )}
                          </div>

                          <div className="bg-zinc-950/50 p-6 md:p-8 flex flex-col justify-between items-center md:items-end w-full md:w-72 space-y-6">
                             <div className="text-center md:text-right w-full space-y-1">
                                <span className="text-xs text-zinc-600 uppercase font-black tracking-widest">Valor do Investimento</span>
                                <h3 className="text-3xl md:text-4xl font-black text-neon-green italic tracking-tighter drop-shadow-[0_0_15px_rgba(57,255,20,0.1)]">
                                   {formatCurrency(order.total_price)}
                                </h3>
                             </div>

                             <div className="flex flex-col gap-3 w-full">
                                <Link to={`/account/orders/${order.id}`} className="w-full">
                                   <Button variant="neon" size="lg" className="w-full h-14 text-sm font-black italic uppercase tracking-widest shadow-lg shadow-black">
                                      VER DETALHES <ChevronRight size={18} className="ml-2" />
                                   </Button>
                                </Link>

                                {order.status === 'aguardando comprovante' && (
                                  <Button 
                                    className="w-full bg-zinc-100 hover:bg-white text-black font-black italic uppercase text-xs h-14 border-none shadow-xl transition-all active:scale-95"
                                    onClick={() => window.open('https://www.instagram.com/havertz.dxt/', '_blank')}
                                  >
                                    🚀 ENVIAR COMPROVANTE
                                  </Button>
                                )}

                                <Button 
                                  variant="ghost" 
                                  size="md" 
                                  className="w-full h-12 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 text-xs font-black uppercase tracking-tighter italic border border-transparent hover:border-red-500/20"
                                  onClick={() => setDeletingOrder(order)}
                                >
                                   <Trash2 size={16} className="mr-2" /> Excluir Pedido
                                </Button>
                             </div>
                          </div>
                       </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={!!deletingOrder}
        onClose={() => setDeletingOrder(null)}
        title="Excluir Pedido 🗑️"
      >
        <div className="space-y-6">
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
             <p className="text-red-400 text-sm font-medium">
                Tem certeza que deseja excluir este pedido? Ele será removido do seu histórico e não aparecerá mais para o administrador.
             </p>
          </div>
          <div className="space-y-3">
             <div className="flex justify-between text-xs">
                <span className="text-zinc-500 uppercase font-bold tracking-widest">Código</span>
                <span className="text-white font-mono">{deletingOrder?.order_code}</span>
             </div>
             <div className="flex justify-between text-xs">
                <span className="text-zinc-500 uppercase font-bold tracking-widest">Valor</span>
                <span className="text-white font-mono">{formatCurrency(deletingOrder?.total_price || 0)}</span>
             </div>
          </div>
          <div className="flex flex-col gap-3 pt-4">
             <Button 
               variant="secondary" 
               className="w-full font-black italic uppercase bg-red-400/10 text-red-400 border border-red-400/20 hover:bg-red-400/20"
               onClick={handleDeleteOrder}
               isLoading={isDeleting}
             >
                Sim, excluir permanentemente
             </Button>
             <Button 
               variant="ghost" 
               className="w-full font-black italic uppercase"
               onClick={() => setDeletingOrder(null)}
               disabled={isDeleting}
             >
                Cancelar
             </Button>
          </div>
        </div>
      </Modal>
    </MainLayout>
  );
}
