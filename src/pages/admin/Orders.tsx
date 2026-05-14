import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MainLayout } from '../../layouts/MainLayout';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Order } from '../../types';
import { formatCurrency, safeDate } from '../../lib/utils';
import { Trash2, Eye, CheckCircle2, XCircle, Search, Filter, X, Copy, Package, Clock, User, Mail, Hash, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { handleFirestoreError, OperationType } from '../../lib/firestoreErrors';

export default function AdminOrders() {
  const { user, isAdmin: authIsAdmin } = useAuth();
  const [searchParams] = useSearchParams();
  const orderIdFromUrl = searchParams.get('id');
  
  const isAdmin = authIsAdmin;
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'pagamento confirmado' | 'cancelado' | 'entregue'>('all');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [updateLoading, setUpdateLoading] = useState<string | null>(null);

  useEffect(() => {
    if (orderIdFromUrl) {
      setSelectedOrderId(orderIdFromUrl);
    }
  }, [orderIdFromUrl]);

  useEffect(() => {
    const ordersRef = collection(db, 'orders');
    // Soft delete filter: clients can remove orders from their view and admin view
    const q = query(
      ordersRef, 
      where('is_deleted', '==', false),
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
  }, []);

  const handleUpdateStatus = async (orderId: string, updates: Partial<Order>) => {
    setUpdateLoading(orderId);
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        ...updates,
        updated_at: new Date().toISOString()
      });
      toast.success('Pedido atualizado');
    } catch (err: any) {
      handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
    } finally {
      setUpdateLoading(null);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este pedido?')) return;
    
    setUpdateLoading(orderId);
    try {
      await deleteDoc(doc(db, 'orders', orderId));
      if (selectedOrderId === orderId) setSelectedOrderId(null);
      toast.success('Pedido excluído com sucesso.');
    } catch (err: any) {
      handleFirestoreError(err, OperationType.DELETE, `orders/${orderId}`);
    } finally {
      setUpdateLoading(null);
    }
  };

  const filteredOrders = orders.filter(o => {
    const searchTermLower = searchTerm.toLowerCase();
    
    const code = (o.order_code || '').toLowerCase();
    const email = (o.customer_email || '').toLowerCase();
    const mainField = (o.main_field_value || o.imvu_nick || '').toLowerCase();
    const name = (o.customer_name || '').toLowerCase();

    const matchesSearch = 
      code.includes(searchTermLower) ||
      email.includes(searchTermLower) ||
      mainField.includes(searchTermLower) ||
      name.includes(searchTermLower);
    
    // Normalize status for filtering (handles 'aguardando_comprovante' vs 'aguardando comprovante')
    const normalizedStatus = (o.status || '').toLowerCase().replace(/_/g, ' ');
    const normalizedFilter = activeFilter.toLowerCase().replace(/_/g, ' ');
    
    // Specific business logic: 'aguardando comprovante' is a initial state
    const matchesStatus = activeFilter === 'all' || normalizedStatus === normalizedFilter;

    return matchesSearch && matchesStatus;
  });

  const selectedOrder = orders.find(o => o.id === selectedOrderId);

  const getStatusColor = (status: Order['status']) => {
    // Basic normalization for color selection
    const s = (status || '').toLowerCase().replace(/_/g, ' ');
    switch (s) {
      case 'entregue': return 'neon';
      case 'cancelado': return 'error';
      case 'pagamento confirmado': return 'success';
      case 'aguardando pagamento':
      case 'aguardando comprovante': return 'warning';
      case 'em análise': return 'info';
      default: return 'default';
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-12 px-4">
        {/* Header Section */}
        <div className="mb-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">
                Gerenciar Pedidos 🔋
              </h1>
              <p className="text-zinc-500 text-sm italic mt-2">Controle simples e estável da operação HAVERTZ.DXT.</p>
            </div>
          </div>

          <div className="mt-8 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'all', label: 'Todos' },
                { id: 'aguardando comprovante', label: 'Aguard. Compro' },
                { id: 'pagamento confirmado', label: 'Confirmados' },
                { id: 'cancelado', label: 'Cancelados' },
                { id: 'entregue', label: 'Entregues' }
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id as any)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    activeFilter === filter.id 
                      ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]' 
                      : 'bg-zinc-900 text-zinc-500 hover:text-zinc-300 border border-zinc-800'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input 
                placeholder="Código, E-mail ou ID..." 
                className="pl-10 h-11 bg-zinc-900 border-zinc-800" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <Card className="p-0 overflow-hidden border-zinc-900 bg-zinc-950/50 backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-900/50 border-b border-zinc-900">
                  <th className="px-6 py-5 text-[10px] font-black uppercase text-zinc-500 tracking-wider">Pedido</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase text-zinc-500 tracking-wider">Cliente</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase text-zinc-500 tracking-wider">Produto</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase text-zinc-500 tracking-wider">Identificador</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase text-zinc-500 tracking-wider">Valor</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase text-zinc-500 tracking-wider">Status</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase text-zinc-500 tracking-wider text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={7} className="px-6 py-8"><div className="h-4 bg-zinc-900 rounded w-full" /></td>
                    </tr>
                  ))
                ) : error ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-20 text-center">
                      <p className="text-red-500 italic font-bold mb-4">{error}</p>
                      <Button onClick={() => window.location.reload()} variant="outline" size="sm" className="border-zinc-800">
                        Tentar Novamente
                      </Button>
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-20 text-center text-zinc-600 italic font-medium">Nenhum pedido encontrado.</td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-6 font-mono text-xs font-black text-white italic">#{order.order_code}</td>
                      <td className="px-6 py-6">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-zinc-200">{order.customer_name || 'Sem nome'}</span>
                          <span className="text-[10px] text-zinc-500 font-medium">{order.customer_email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-white uppercase italic">{order.product_name}</span>
                          <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-tighter">{order.product_category}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <span className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-[10px] font-black text-neon-green italic">
                          {order.main_field_value || order.imvu_nick || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-6 font-black text-xs text-white">{formatCurrency(order.total_price)}</td>
                      <td className="px-6 py-6">
                        <Badge variant={getStatusColor(order.status)} className="text-[9px] uppercase font-black italic px-2 py-0.5">
                          {order.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => setSelectedOrderId(order.id)}
                            className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg transition-all border border-zinc-800"
                            title="Ver Detalhes"
                          >
                            <Eye size={16} />
                          </button>
                          
                          <button 
                            onClick={() => handleUpdateStatus(order.id, { status: 'pagamento confirmado', payment_status: 'pagamento confirmado' })}
                            className="p-2 bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-white rounded-lg transition-all border border-green-500/20"
                            disabled={updateLoading === order.id}
                            title="Confirmar Pagamento"
                          >
                            <CheckCircle2 size={16} />
                          </button>

                          <button 
                            onClick={() => handleUpdateStatus(order.id, { status: 'entregue' })}
                            className="p-2 bg-neon-green/10 hover:bg-neon-green text-neon-green hover:text-black rounded-lg transition-all border border-neon-green/20"
                            disabled={updateLoading === order.id}
                            title="Marcar Entregue"
                          >
                            <Package size={16} />
                          </button>

                          <button 
                            onClick={() => handleUpdateStatus(order.id, { status: 'cancelado', payment_status: 'cancelado' })}
                            className="p-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg transition-all border border-red-500/20"
                            disabled={updateLoading === order.id}
                            title="Cancelar Pedido"
                          >
                            <XCircle size={16} />
                          </button>

                          {isAdmin && (
                            <button 
                              onClick={() => handleDeleteOrder(order.id)}
                              className="p-2 bg-zinc-900 hover:bg-red-600 text-zinc-500 hover:text-white rounded-lg transition-all border border-zinc-800"
                              disabled={updateLoading === order.id}
                              title="Excluir"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Side Detail Panel */}
        <AnimatePresence>
          {selectedOrderId && selectedOrder && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedOrderId(null)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-zinc-950 border-l border-zinc-900 shadow-2xl z-[70] flex flex-col"
              >
                {/* Panel Header */}
                <div className="p-6 border-b border-zinc-900 bg-zinc-900/50 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">Detalhes do Pedido</h2>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Código: #{selectedOrder.order_code}</p>
                  </div>
                  <button 
                    onClick={() => setSelectedOrderId(null)}
                    className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-500 hover:text-white rounded-full transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Panel Body */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                  {/* Basic Info Section */}
                  <div className="space-y-6">
                    <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-4">Informações Básicas</h3>
                    
                    <div className="grid grid-cols-1 gap-4">
                      <div className="p-4 bg-zinc-900/30 border border-zinc-800 rounded-2xl flex items-center gap-4">
                        <div className="h-10 w-10 bg-zinc-800 rounded-xl flex items-center justify-center text-neon-green">
                          <User size={20} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-zinc-600 uppercase">Cliente</p>
                          <p className="text-sm font-bold text-white uppercase italic">{selectedOrder.customer_name || 'Desconhecido'}</p>
                        </div>
                      </div>

                      <div className="p-4 bg-zinc-900/30 border border-zinc-800 rounded-2xl flex items-center gap-4">
                        <div className="h-10 w-10 bg-zinc-800 rounded-xl flex items-center justify-center text-neon-purple">
                          <Mail size={20} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-zinc-600 uppercase">E-mail</p>
                          <p className="text-sm font-bold text-white select-all">{selectedOrder.customer_email}</p>
                        </div>
                      </div>

                      <div className="p-4 bg-zinc-900/30 border border-zinc-800 rounded-2xl flex items-center gap-4">
                        <div className="h-10 w-10 bg-zinc-800 rounded-xl flex items-center justify-center text-neon-green">
                          <Hash size={20} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-zinc-600 uppercase">Identificador</p>
                          <p className="text-sm font-bold text-neon-green uppercase italic underline">{selectedOrder.main_field_value || selectedOrder.imvu_nick || 'N/A'}</p>
                        </div>
                      </div>

                      <div className="p-4 bg-zinc-900/30 border border-zinc-800 rounded-2xl flex items-center gap-4">
                        <div className="h-10 w-10 bg-zinc-800 rounded-xl flex items-center justify-center text-yellow-500">
                          <CreditCard size={20} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-zinc-600 uppercase">Valor</p>
                          <p className="text-sm font-black text-white">{formatCurrency(selectedOrder.total_price)}</p>
                        </div>
                      </div>

                      <div className="p-4 bg-zinc-900/30 border border-zinc-800 rounded-2xl flex items-center gap-4">
                        <div className="h-10 w-10 bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-400">
                          <Clock size={20} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-zinc-600 uppercase">Solicitado em</p>
                          <p className="text-sm font-bold text-zinc-300">{safeDate(selectedOrder.created_at).toLocaleString('pt-BR')}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Product Section */}
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-4">Produto & Pacote</h3>
                    <div className="p-6 bg-neon-purple/5 border border-neon-purple/20 rounded-2xl">
                      <p className="text-xl font-black text-white uppercase italic mb-1">{selectedOrder.product_name}</p>
                      <p className="text-[10px] text-neon-purple font-black uppercase tracking-[0.2em]">{selectedOrder.product_category}</p>
                    </div>
                  </div>

                  {/* Notes & Others */}
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-4">Observações</h3>
                    <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl min-h-[80px]">
                      <p className="text-xs text-zinc-400 italic">
                        {selectedOrder.notes || 'Nenhuma observação do cliente.'}
                      </p>
                    </div>
                  </div>

                  {/* Actions Section */}
                  <div className="pt-6 pb-12 space-y-4">
                    <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-4">Gerenciamento</h3>
                    <div className="grid grid-cols-1 gap-3">
                      <Button 
                        variant="neon" 
                        className="w-full h-12 font-black uppercase italic text-xs"
                        onClick={() => handleUpdateStatus(selectedOrder.id, { status: 'pagamento confirmado', payment_status: 'pagamento confirmado' })}
                        isLoading={updateLoading === selectedOrder.id}
                      >
                        Confirmar Pagamento
                      </Button>
                      <div className="grid grid-cols-2 gap-3">
                        <Button 
                          variant="outline" 
                          className="h-12 font-black uppercase italic text-[10px] border-zinc-800"
                          onClick={() => handleUpdateStatus(selectedOrder.id, { status: 'entregue' })}
                          isLoading={updateLoading === selectedOrderId}
                        >
                          Entregue
                        </Button>
                        <Button 
                          variant="outline" 
                          className="h-12 font-black uppercase italic text-[10px] border-red-500/20 text-red-500 hover:bg-red-500/10"
                          onClick={() => handleUpdateStatus(selectedOrder.id, { status: 'cancelado', payment_status: 'cancelado' })}
                          isLoading={updateLoading === selectedOrderId}
                        >
                          Cancelar
                        </Button>
                      </div>
                      {isAdmin && (
                        <Button 
                          variant="outline" 
                          className="w-full h-12 font-black uppercase italic text-[10px] border-zinc-800 text-zinc-600 hover:bg-red-600 hover:text-white"
                          onClick={() => handleDeleteOrder(selectedOrder.id)}
                          isLoading={updateLoading === selectedOrderId}
                        >
                          Excluir Totalmente
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </MainLayout>
  );
}
