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
  const { user } = useAuth();
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
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <div>
              <h1 className="text-3xl font-black text-white italic uppercase">
                Meus Pedidos 🧪
              </h1>
              <p className="text-zinc-500 text-sm italic mt-1">Histórico de injeções de créditos.</p>
            </div>
            <Link to="/loja">
              <Button variant="neon" size="sm">Novo Pedido</Button>
            </Link>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 w-full bg-zinc-900/50 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="h-16 w-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6 text-zinc-600">
                <Package size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Nenhum pedido encontrado</h3>
              <p className="text-zinc-500 mb-8 max-w-xs mx-auto">Você ainda não realizou nenhuma compra de créditos.</p>
              <Link to="/loja">
                <Button variant="outline">Ir para a Loja</Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-4">
              {orders.map((order, i) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="hover:border-zinc-700 transition-all p-0 overflow-hidden">
                    <div className="flex flex-col sm:flex-row">
                       <div className="p-6 flex-1">
                          <div className="flex flex-wrap items-center gap-3 mb-4">
                            <Badge variant="default" className="text-[10px]">
                               <Hash className="h-3 w-3 mr-1" /> {order.order_code}
                            </Badge>
                            <Badge variant={getStatusColor(order.status)}>
                               {order.status}
                            </Badge>
                            <span className="text-xs text-zinc-600 font-mono">
                               {safeDate(order.created_at).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-4">
                             <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${order.product_type === 'DIRETO' ? 'bg-neon-green/10 text-neon-green' : 'bg-neon-purple/10 text-neon-purple'}`}>
                                {order.product_type === 'DIRETO' ? <Package size={20} /> : <Clock size={20} />}
                             </div>
                             <div>
                                <h4 className="text-white font-bold text-lg">
                                   {order.product_name}
                                </h4>
                                <div className="flex flex-col gap-1">
                                   <p className="text-xs text-zinc-500 italic uppercase">
                                      {order.product_category === 'credits' ? `Via ${order.product_type}` : order.product_category}
                                   </p>
                                   {/* Identification Details */}
                                   {(order.imvu_nick || order.player_id || order.player_nick || order.instagram_handle || order.access_email) && (
                                     <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                                        {order.imvu_nick && (
                                          <p className="text-[10px] text-zinc-400 capitalize">
                                            <span className="font-bold text-zinc-500 uppercase mr-1">IMVU:</span> {order.imvu_nick}
                                          </p>
                                        )}
                                        {order.player_id && (
                                          <p className="text-[10px] text-zinc-400">
                                            <span className="font-bold text-zinc-500 uppercase mr-1">ID:</span> {order.player_id}
                                          </p>
                                        )}
                                        {order.player_nick && (
                                          <p className="text-[10px] text-zinc-400">
                                            <span className="font-bold text-zinc-500 uppercase mr-1">Nick:</span> {order.player_nick}
                                          </p>
                                        )}
                                        {order.instagram_handle && (
                                          <p className="text-[10px] text-zinc-400">
                                            <span className="font-bold text-zinc-500 uppercase mr-1">IG:</span> @{order.instagram_handle.replace('@', '')}
                                          </p>
                                        )}
                                        {order.access_email && (
                                          <p className="text-[10px] text-zinc-400">
                                            <span className="font-bold text-zinc-500 uppercase mr-1">Acesso:</span> {order.access_email}
                                          </p>
                                        )}
                                     </div>
                                   )}
                                   {order.notes && (
                                     <p className="text-[10px] text-zinc-500 italic mt-1 line-clamp-1 max-w-md">
                                        <span className="font-bold uppercase mr-1">Obs:</span> {order.notes}
                                     </p>
                                   )}
                                </div>
                             </div>
                          </div>
                       </div>

                       <div className="bg-zinc-950 p-6 flex flex-col justify-between items-end w-full sm:w-64 border-t sm:border-t-0 sm:border-l border-zinc-900 gap-4">
                          <div className="flex flex-col items-end w-full">
                             <span className="text-2xl font-black text-white italic">{formatCurrency(order.total_price)}</span>
                             <div className="flex items-center gap-4">
                                <Link to={`/account/orders/${order.id}`}>
                                   <Button variant="ghost" size="sm" className="text-[10px] h-8 hover:text-neon-green uppercase font-black px-0">
                                      Ver Detalhes <ChevronRight size={12} className="ml-1" />
                                   </Button>
                                </Link>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-[10px] h-8 text-zinc-600 hover:text-red-500 uppercase font-black px-0"
                                  onClick={() => setDeletingOrder(order)}
                                >
                                   <Trash2 size={12} className="mr-1" /> Excluir
                                </Button>
                             </div>
                          </div>

                          {order.status === 'aguardando comprovante' && (
                            <div className="flex flex-col gap-2 w-full">
                              <Button 
                                className="w-full bg-[#E1306C] hover:bg-[#C13584] text-white font-black italic uppercase text-[8px] h-8 border-none"
                                onClick={() => window.open('https://www.instagram.com/havertz.dxt/', '_blank')}
                              >
                                Enviar no Instagram
                              </Button>
                            </div>
                          )}
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
               variant="error" 
               className="w-full font-black italic uppercase"
               onClick={handleDeleteOrder}
               loading={isDeleting}
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
