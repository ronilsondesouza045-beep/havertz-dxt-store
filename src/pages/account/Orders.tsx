import { useEffect, useState } from 'react';
import { MainLayout } from '../../layouts/MainLayout';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Order } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { Package, Clock, Hash, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { handleFirestoreError, OperationType } from '../../lib/firestoreErrors';

export default function UserOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const ordersRef = collection(db, 'orders');
    const q = query(
      ordersRef,
      where('user_id', '==', user.uid),
      orderBy('created_at', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      setOrders(ordersData);
      setLoading(false);
    }, (error) => {
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
                               {new Date(order.created_at).toLocaleDateString('pt-BR')}
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
                                <p className="text-xs text-zinc-500 italic uppercase">
                                   {order.product_category === 'credits' ? `Via ${order.product_type}` : order.product_category}
                                </p>
                             </div>
                          </div>
                       </div>

                       <div className="bg-zinc-950 p-6 flex flex-col justify-between items-end w-full sm:w-64 border-t sm:border-t-0 sm:border-l border-zinc-900 gap-4">
                          <div className="flex flex-col items-end w-full">
                             <span className="text-2xl font-black text-white italic">{formatCurrency(order.total_price)}</span>
                             <Link to={`/account/orders/${order.id}`}>
                                <Button variant="ghost" size="sm" className="text-[10px] h-8 hover:text-neon-green uppercase font-black px-0">
                                   Ver Detalhes <ChevronRight size={12} className="ml-1" />
                                </Button>
                             </Link>
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
    </MainLayout>
  );
}
