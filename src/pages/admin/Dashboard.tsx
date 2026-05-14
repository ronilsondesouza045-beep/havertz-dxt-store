import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../../layouts/MainLayout';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/ui/Card';
import { supabase } from '../../lib/supabase';
import { Order } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { 
  TrendingUp, 
  Package, 
  Clock, 
  CheckCircle2, 
  DollarSign, 
  Users,
  Zap,
  Gift,
  Eye
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
    totalK: 0
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const { data: orders, error } = await supabase
          .from('orders')
          .select('*');

        if (error) throw error;
        
        if (orders) {
          // Sort by date for recent orders
          const sortedOrders = [...orders].sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          ).slice(0, 10);
          
          setRecentOrders(sortedOrders as Order[]);
          const totalSales = orders.reduce((acc, order) => acc + (order.status !== 'cancelado' ? Number(order.total_price) : 0), 0);
          const totalK = orders.reduce((acc, order) => acc + (order.status !== 'cancelado' ? (order.amount_k || 0) : 0), 0);
          const pending = orders.filter(o => {
            const s = (o.status || '').toLowerCase().replace(/_/g, ' ');
            return s === 'aguardando pagamento' || s === 'em análise' || s === 'aguardando comprovante';
          }).length;
          const delivered = orders.filter(o => (o.status || '').toLowerCase().replace(/_/g, ' ') === 'entregue').length;
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
            totalK
          });
        }
      } catch (err: any) {
        console.error('Error fetching admin stats:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
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
  ];

  return (
    <MainLayout>
      <div className="container mx-auto py-12 px-4">
        <div className="mb-10">
          <h1 className="text-3xl font-black text-white italic uppercase">
             Painel de Controle 🧪
          </h1>
          <p className="text-zinc-500 text-sm italic mt-1">Visão geral do império HAVERTZ.DXT.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {cardData.map((card, i) => (
            <div key={i}>
              <Card className="p-6 bg-zinc-950 border-zinc-900 group hover:border-zinc-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 rounded-xl bg-zinc-900 flex items-center justify-center border border-zinc-800 group-hover:scale-110 transition-transform">
                    {card.icon}
                  </div>
                </div>
                <p className="text-xs text-zinc-500 uppercase font-black tracking-widest">{card.title}</p>
                <h3 className="text-2xl font-black text-white mt-1 italic">{card.value}</h3>
              </Card>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <Card className="lg:col-span-2 p-8">
              <h4 className="text-lg font-bold text-white mb-6 uppercase italic">Desempenho Comercial</h4>
              
              {(!loading && stats.totalOrders > 0) ? (
                <div className="w-full min-w-0 h-[320px] min-h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={[
                       { name: 'DIRETO', value: stats.diretoSales },
                       { name: 'PRESENTE', value: stats.presenteSales }
                     ]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                        <XAxis dataKey="name" stroke="#71717a" />
                        <YAxis stroke="#71717a" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', color: '#fff' }}
                          itemStyle={{ color: '#39FF14' }}
                        />
                        <Bar dataKey="value" fill="#39FF14" radius={[4, 4, 0, 0]} />
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

           <Card className="p-8">
              <h4 className="text-lg font-bold text-white mb-6 uppercase italic">Status da Operação</h4>
              <div className="space-y-6">
                 <div className="flex justify-between items-center pb-4 border-b border-zinc-900">
                    <span className="text-sm text-zinc-500 uppercase font-bold">Loja Online</span>
                    <div className="flex items-center gap-2">
                       <div className="h-2 w-2 rounded-full bg-neon-green animate-pulse" />
                       <span className="text-xs font-black text-neon-green uppercase italic">Ativo Full</span>
                    </div>
                 </div>
                 <div className="flex justify-between items-center pb-4 border-b border-zinc-900">
                    <span className="text-sm text-zinc-500 uppercase font-bold">Entrega Manual</span>
                    <span className="text-xs font-black text-zinc-300 uppercase italic underline">Operando</span>
                 </div>
                 <div className="flex justify-between items-center pb-4 border-b border-zinc-900">
                    <span className="text-sm text-zinc-500 uppercase font-bold">Segurança</span>
                    <span className="text-xs font-black text-blue-500 uppercase italic">Anti-Ban OK</span>
                 </div>
                 
                 <div className="mt-10 p-6 rounded-2xl bg-neon-green/5 border border-neon-green/10 text-center">
                    <TrendingUp className="h-8 w-8 text-neon-green mx-auto mb-4" />
                    <p className="text-xs text-zinc-500 mb-2 italic">Volume de vendas estável.</p>
                    <p className="text-sm font-bold text-white uppercase italic">Mantenha a execução precisa.</p>
                 </div>
              </div>
           </Card>
        </div>

        {/* Recent Orders Section */}
        <div className="mt-12">
           <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-white italic uppercase flex items-center gap-2">
                 <Clock className="text-yellow-500" /> Últimos Pedidos
              </h2>
              <button 
                onClick={() => navigate('/admin/pedidos')}
                className="text-[10px] font-black uppercase text-neon-green hover:underline italic tracking-widest"
              >
                Ver Todos os Pedidos
              </button>
           </div>

           <Card className="overflow-hidden border-zinc-900 bg-zinc-950/50">
              <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                    <thead>
                       <tr className="border-b border-zinc-900 bg-zinc-900/30">
                          <th className="px-6 py-4 text-[10px] font-black uppercase text-zinc-500 tracking-wider">Pedido</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase text-zinc-500 tracking-wider">Cliente</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase text-zinc-500 tracking-wider">Valor</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase text-zinc-500 tracking-wider">Status</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase text-zinc-500 tracking-wider text-right">Ações</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900">
                       {recentOrders.map((order) => (
                          <tr key={order.id} className="hover:bg-zinc-900/20 transition-colors group">
                             <td className="px-6 py-4">
                                <p className="text-xs font-bold text-white uppercase italic">#{order.order_code}</p>
                                <p className="text-[10px] text-zinc-600 font-mono">{new Date(order.created_at).toLocaleDateString()}</p>
                             </td>
                             <td className="px-6 py-4">
                                <p className="text-xs text-white font-medium">{order.customer_name || 'Cliente'}</p>
                                <p className="text-[10px] text-zinc-500">{order.customer_email}</p>
                             </td>
                             <td className="px-6 py-4">
                                <p className="text-xs font-black text-neon-green">{formatCurrency(order.total_price)}</p>
                             </td>
                             <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                   <div className={`h-1.5 w-1.5 rounded-full ${
                                      order.status === 'entregue' ? 'bg-neon-green' : 
                                      order.status === 'cancelado' ? 'bg-red-500' : 'bg-yellow-500'
                                   }`} />
                                   <span className="text-[10px] font-black uppercase text-zinc-400">{order.status}</span>
                                </div>
                             </td>
                             <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                   <button 
                                     onClick={() => navigate(`/admin/pedidos?id=${order.id}`)}
                                     className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
                                     title="Ver Detalhes"
                                   >
                                      <Eye size={14} />
                                   </button>
                                </div>
                             </td>
                          </tr>
                       ))}
                       {recentOrders.length === 0 && !loading && (
                          <tr>
                             <td colSpan={5} className="px-6 py-12 text-center text-zinc-600 italic text-sm">
                                Nenhum pedido recente.
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
