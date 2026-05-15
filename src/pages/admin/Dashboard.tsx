import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MainLayout } from '../../layouts/MainLayout';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { collection, query, where, orderBy, limit, onSnapshot, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Order } from '../../types';
import { formatCurrency, safeDate } from '../../lib/utils';
import { 
  TrendingUp, 
  Package, 
  Clock, 
  CheckCircle2, 
  DollarSign, 
  Users,
  Zap,
  Gift,
  Eye,
  Trash2,
  Star,
  User
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { handleFirestoreError, OperationType } from '../../lib/firestoreErrors';
import { toast } from 'react-hot-toast';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    diretoSales: 0,
    presenteSales: 0,
    serviceSales: 0,
    mnSales: 0,
    ffSales: 0,
    followerSales: 0,
    totalK: 0,
    totalReviews: 0
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState<string | null>(null);

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este pedido?')) return;
    
    setUpdateLoading(orderId);
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        is_deleted: true,
        deleted_by: 'admin',
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      toast.success('Pedido removido com sucesso.');
    } catch (err: any) {
      handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
    } finally {
      setUpdateLoading(null);
    }
  };

  useEffect(() => {
    const ordersRef = collection(db, 'orders');
    const reviewsRef = collection(db, 'reviews');
    
    // Recent orders only
    const recentQuery = query(
      ordersRef, 
      orderBy('created_at', 'desc'), 
      limit(20) // Get more to account for filtered deleted items
    );
    const unsubscribeRecent = onSnapshot(recentQuery, (snapshot) => {
      const ordersData = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Order))
        .filter(order => order.is_deleted !== true)
        .slice(0, 10); // Keep only the latest 10 non-deleted
        
      setRecentOrders(ordersData);
    });

    // Statistics 
    const fetchAllStats = async () => {
      try {
        const snapshot = await getDocs(ordersRef);
        const reviewSnapshot = await getDocs(reviewsRef);
        const orders = snapshot.docs
          .map(doc => doc.data() as Order)
          .filter(order => order.is_deleted !== true);
        
        const totalSales = orders.reduce((acc, order) => acc + (order.status !== 'cancelado' ? Number(order.total_price) : 0), 0);
        const totalK = orders.reduce((acc, order) => acc + (order.status !== 'cancelado' ? (order.amount_k || 0) : 0), 0);
        const pending = orders.filter(o => {
          const s = (o.status || '').toLowerCase().replace(/_/g, ' ');
          return s === 'aguardando pagamento' || s === 'em análise' || s === 'aguardando comprovante';
        }).length;
        const delivered = orders.filter(o => (o.status || '').toLowerCase().replace(/_/g, ' ') === 'entregue' || (o.status || '').toLowerCase().replace(/_/g, ' ') === 'concluido').length;
        const cancelled = orders.filter(o => (o.status || '').toLowerCase().replace(/_/g, ' ') === 'cancelado').length;
        
        setStats({
          totalSales,
          totalOrders: orders.length,
          pendingOrders: pending,
          deliveredOrders: delivered,
          cancelledOrders: cancelled,
          diretoSales: orders.filter(o => o.product_type === 'DIRETO' && o.status !== 'cancelado').length,
          presenteSales: orders.filter(o => o.product_type === 'PRESENTE' && o.status !== 'cancelado').length,
          serviceSales: orders.filter(o => o.product_category === 'service' && o.status !== 'cancelado').length,
          mnSales: orders.filter(o => o.product_category === 'produto_mn' && o.status !== 'cancelado').length,
          ffSales: orders.filter(o => o.product_category === 'free_fire' && o.status !== 'cancelado').length,
          followerSales: orders.filter(o => o.product_category === 'seguidores' && o.status !== 'cancelado').length,
          totalK,
          totalReviews: reviewSnapshot.size
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, 'orders');
      } finally {
        setLoading(false);
      }
    };

    fetchAllStats();

    return () => {
      unsubscribeRecent();
    };
  }, []);

  const cardData = [
    { title: 'Vendas Totais', value: formatCurrency(stats.totalSales), icon: <TrendingUp className="text-neon-green" /> },
    { title: 'Pendentes', value: stats.pendingOrders, icon: <Clock className="text-yellow-500" /> },
    { title: 'Entregues', value: stats.deliveredOrders, icon: <CheckCircle2 className="text-green-500" /> },
    { title: 'Cancelados', value: stats.cancelledOrders, icon: <Package className="text-red-500" /> },
    { title: 'Vendas Serviços', value: stats.serviceSales, icon: <Zap className="text-neon-green" /> },
    { title: 'Produtos MN', value: stats.mnSales, icon: <Package className="text-neon-purple" /> },
    { title: 'Vendas Free Fire', value: stats.ffSales, icon: <Package className="text-orange-500" /> },
    { title: 'Vendas Seguidores', value: stats.followerSales, icon: <Users className="text-blue-500" /> },
    { title: 'Avaliações Reais', value: stats.totalReviews, icon: <Star className="text-yellow-400" /> },
  ];

  return (
    <MainLayout>
      <div className="container mx-auto py-6 md:py-12 px-4">
        <div className="mb-8 md:mb-10 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-black text-white italic uppercase tracking-tighter">
             Painel de Controle 🧪
          </h1>
          <p className="text-zinc-500 text-base italic mt-1 font-medium">Visão geral do império HAVERTZ.DXT.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10 md:mb-12">
          {cardData.map((card, i) => (
            <div key={i}>
              <Card className="p-6 md:p-8 bg-zinc-950 border-zinc-900 group hover:border-zinc-800 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 rounded-2xl bg-zinc-900 flex items-center justify-center border border-zinc-800 group-hover:scale-110 transition-transform shadow-lg shadow-black">
                    {card.icon}
                  </div>
                </div>
                <p className="text-xs text-zinc-500 uppercase font-black tracking-widest mb-1 underline underline-offset-4 decoration-zinc-800">{card.title}</p>
                <h3 className="text-3xl font-black text-white mt-1 italic tracking-tight">{card.value}</h3>
              </Card>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
           <Card className="lg:col-span-2 p-6 md:p-8">
              <h4 className="text-lg font-bold text-white mb-6 uppercase italic flex items-center gap-2">
                <TrendingUp size={18} className="text-neon-green" /> Desempenho Comercial
              </h4>
              
              {(!loading && stats.totalOrders > 0) ? (
                <div className="w-full min-w-0 h-[320px] min-h-[320px] mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={[
                       { name: 'DIRETO', value: stats.diretoSales },
                       { name: 'PRESENTE', value: stats.presenteSales }
                     ]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                        <XAxis dataKey="name" stroke="#71717a" fontSize={12} fontWeight={700} />
                        <YAxis stroke="#71717a" fontSize={12} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px', border: '1px solid #3f3f46' }}
                          itemStyle={{ color: '#39FF14', fontWeight: 900, textTransform: 'uppercase' }}
                        />
                        <Bar dataKey="value" fill="#39FF14" radius={[6, 6, 0, 0]} />
                     </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[320px] flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-xl bg-zinc-900/20">
                   <TrendingUp className="h-8 w-8 text-zinc-800 mb-2" />
                   <p className="text-sm text-zinc-600 italic">Nenhum dado disponível ainda.</p>
                </div>
              )}
           </Card>

           <Card className="p-6 md:p-8">
              <h4 className="text-lg font-bold text-white mb-6 uppercase italic flex items-center gap-2">
                <Zap size={18} className="text-neon-purple" /> Status da Operação
              </h4>
              <div className="space-y-6">
                 <div className="flex justify-between items-center pb-4 border-b border-zinc-900">
                    <span className="text-sm text-zinc-500 uppercase font-black tracking-tighter">Loja Online</span>
                    <div className="flex items-center gap-2">
                       <div className="h-3 w-3 rounded-full bg-neon-green animate-pulse shadow-[0_0_10px_#39FF14]" />
                       <span className="text-xs font-black text-neon-green uppercase italic tracking-wider">Ativo Full</span>
                    </div>
                 </div>
                 <div className="flex justify-between items-center pb-4 border-b border-zinc-900">
                    <span className="text-sm text-zinc-500 uppercase font-black tracking-tighter">Entrega Manual</span>
                    <span className="text-xs font-black text-zinc-300 uppercase italic underline decoration-zinc-700">Operando</span>
                 </div>
                 <div className="flex justify-between items-center pb-4 border-b border-zinc-900">
                    <span className="text-sm text-zinc-500 uppercase font-black tracking-tighter">Segurança</span>
                    <span className="text-xs font-black text-blue-500 uppercase italic">Anti-Ban OK</span>
                 </div>
                 <div className="flex justify-between items-center pb-4 border-b border-zinc-900">
                    <span className="text-sm text-zinc-500 uppercase font-black tracking-tighter">Avaliações</span>
                    <Link to="/admin/avaliacoes" className="text-xs font-black text-neon-green uppercase italic hover:underline hover:text-white transition-colors">Moderador</Link>
                 </div>
                 
                 <div className="mt-10 p-8 rounded-3xl bg-neon-green/5 border border-neon-green/10 text-center relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-neon-green/5 rounded-full blur-3xl -mr-10 -mt-10" />
                    <TrendingUp className="h-10 w-10 text-neon-green mx-auto mb-4 group-hover:scale-110 transition-transform" />
                    <p className="text-xs text-zinc-500 mb-2 italic font-medium tracking-tight">Volume de vendas estável.</p>
                    <p className="text-base font-black text-white uppercase italic tracking-tighter">Mantenha a precisão.</p>
                 </div>
              </div>
           </Card>
        </div>

        {/* Recent Orders Section */}
        <div className="mt-10 md:mt-16">
           <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 px-1">
              <h2 className="text-2xl font-black text-white italic uppercase flex items-center gap-3 tracking-tighter">
                 <Clock className="text-yellow-500 h-6 w-6" /> Últimos Pedidos
              </h2>
              <button 
                onClick={() => navigate('/admin/pedidos')}
                className="w-full md:w-auto px-6 py-3 bg-zinc-900 rounded-xl text-xs font-black uppercase text-neon-green hover:bg-zinc-800 transition-colors italic tracking-widest border border-zinc-800 text-center"
              >
                Ver Todos os Pedidos
              </button>
           </div>

           {/* Mobile View: Cards */}
           <div className="grid grid-cols-1 gap-4 md:hidden">
              {recentOrders.map((order) => (
                 <Card className="p-5 space-y-4 border-zinc-800 bg-zinc-950">
                    <div className="flex justify-between items-start">
                       <div>
                          <p className="text-sm font-black text-white uppercase italic tracking-tighter">#{order.order_code}</p>
                          <p className="text-xs text-zinc-500 font-bold">{safeDate(order.created_at).toLocaleDateString()}</p>
                       </div>
                       <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-full">
                          <div className={`h-2 w-2 rounded-full ${
                             order.status === 'entregue' ? 'bg-neon-green shadow-[0_0_8px_#39FF14]' : 
                             order.status === 'cancelado' ? 'bg-red-500' : 'bg-yellow-500 shadow-[0_0_8px_#EAB308]'
                          }`} />
                          <span className="text-[10px] font-black uppercase text-zinc-300 italic">{order.status}</span>
                       </div>
                    </div>
                    
                    <div className="flex justify-between items-center py-2 border-y border-zinc-900">
                       <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 overflow-hidden shrink-0">
                            {order.customer_avatar ? (
                              <img src={order.customer_avatar} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              <User className="h-5 w-5" />
                            )}
                          </div>
                          <div>
                             <p className="text-xs text-zinc-500 uppercase font-black tracking-widest mb-1">Cliente</p>
                             <p className="text-sm text-white font-bold italic">{order.customer_name || 'Cliente'}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-xs text-zinc-500 uppercase font-black tracking-widest mb-1">Preço</p>
                          <p className="text-lg font-black text-neon-green italic">{formatCurrency(order.total_price)}</p>
                       </div>
                    </div>

                    <div className="flex gap-2">
                       <Button 
                         variant="outline" 
                         size="sm" 
                         className="flex-1 h-12 text-sm font-bold italic"
                         onClick={() => navigate(`/admin/pedidos?id=${order.id}`)}
                       >
                         <Eye size={18} className="mr-2" /> DETALHES
                       </Button>
                       <Button 
                         variant="outline" 
                         size="sm" 
                         className="h-12 w-12 p-0 text-red-500 border-red-500/20 hover:bg-red-500 hover:text-white"
                         onClick={() => handleDeleteOrder(order.id)}
                         isLoading={updateLoading === order.id}
                       >
                         <Trash2 size={18} />
                       </Button>
                    </div>
                 </Card>
              ))}
           </div>

           {/* Desktop View: Table */}
           <Card className="hidden md:block overflow-hidden border-zinc-900 bg-zinc-950/50 shadow-2xl">
              <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                    <thead>
                       <tr className="border-b border-zinc-900 bg-zinc-900/40">
                          <th className="px-6 py-5 text-[10px] font-black uppercase text-zinc-500 tracking-widest italic">Pedido</th>
                          <th className="px-6 py-5 text-[10px] font-black uppercase text-zinc-500 tracking-widest italic">Cliente</th>
                          <th className="px-6 py-5 text-[10px] font-black uppercase text-zinc-500 tracking-widest italic">Valor Final</th>
                          <th className="px-6 py-5 text-[10px] font-black uppercase text-zinc-500 tracking-widest italic">Status Atual</th>
                          <th className="px-6 py-5 text-[10px] font-black uppercase text-zinc-500 tracking-widest italic text-right">Ações Rápidas</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900">
                       {recentOrders.map((order) => (
                          <tr key={order.id} className="hover:bg-zinc-900/30 transition-all group cursor-default">
                             <td className="px-6 py-5">
                                <p className="text-sm font-black text-white uppercase italic tracking-tighter">#{order.order_code}</p>
                                <p className="text-[10px] text-zinc-500 font-bold mt-0.5 uppercase">{safeDate(order.created_at).toLocaleDateString()}</p>
                             </td>
                             <td className="px-6 py-5">
                                <div className="flex items-center gap-3">
                                   <div className="h-9 w-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 overflow-hidden shrink-0">
                                     {order.customer_avatar ? (
                                       <img src={order.customer_avatar} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                                     ) : (
                                       <User size={16} className="h-4 w-4" />
                                     )}
                                   </div>
                                   <div>
                                      <p className="text-sm text-white font-bold italic tracking-tight">{order.customer_name || 'Cliente'}</p>
                                      <p className="text-[10px] text-zinc-500 font-medium">{order.customer_email}</p>
                                   </div>
                                </div>
                             </td>
                             <td className="px-6 py-5">
                                <p className="text-base font-black text-neon-green italic tracking-tighter">{formatCurrency(order.total_price)}</p>
                             </td>
                             <td className="px-6 py-5">
                                <div className="flex items-center gap-2 bg-zinc-900/50 border border-zinc-800/50 w-fit px-3 py-1 rounded-lg">
                                   <div className={`h-2 w-2 rounded-full ${
                                      order.status === 'entregue' ? 'bg-neon-green shadow-neon-glow-green' : 
                                      order.status === 'cancelado' ? 'bg-red-500' : 'bg-yellow-500'
                                   }`} />
                                   <span className="text-[10px] font-black uppercase text-zinc-400 italic tracking-widest">{order.status}</span>
                                </div>
                             </td>
                             <td className="px-6 py-5 text-right">
                                <div className="flex items-center justify-end gap-2 md:opacity-40 group-hover:opacity-100 transition-all">
                                   <button 
                                     onClick={() => navigate(`/admin/pedidos?id=${order.id}`)}
                                     className="p-2.5 bg-zinc-900 hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-all border border-zinc-800"
                                     title="Ver Detalhes"
                                   >
                                      <Eye size={16} />
                                   </button>
                                   <button 
                                     onClick={() => handleDeleteOrder(order.id)}
                                     className="p-2.5 bg-zinc-900 hover:bg-red-600 rounded-xl text-zinc-500 hover:text-white transition-all border border-zinc-800"
                                     title="Excluir"
                                     disabled={updateLoading === order.id}
                                   >
                                      <Trash2 size={16} />
                                   </button>
                                </div>
                             </td>
                          </tr>
                       ))}
                       {recentOrders.length === 0 && !loading && (
                          <tr>
                             <td colSpan={5} className="px-6 py-20 text-center text-zinc-500 italic text-base font-medium">
                                Nenhum pedido encontrado no sistema.
                             </td>
                          </tr>
                       )}
                    </tbody>
                 </table>
              </div>
           </Card>
        </div>
      </div>
    </MainLayout>
  );
}
