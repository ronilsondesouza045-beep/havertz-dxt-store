import { useEffect, useState } from 'react';
import { MainLayout } from '../../layouts/MainLayout';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Profile } from '../../types';
import { Search, User, Mail, Calendar, Hash } from 'lucide-react';
import { safeDate } from '../../lib/utils';
import { handleFirestoreError, OperationType } from '../../lib/firestoreErrors';

export default function AdminCustomers() {
  const { isAdmin } = useAuth();
  const [customers, setCustomers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!isAdmin) return;

    const profilesRef = collection(db, 'profiles');
    const q = query(profilesRef, orderBy('created_at', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const customersData = snapshot.docs.map(doc => ({
        id: doc.id,
        uid: doc.id,
        ...doc.data()
      }) as unknown as Profile);
      
      setCustomers(customersData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'profiles');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isAdmin]);

  const filteredCustomers = customers.filter(c => {
    const term = searchTerm.toLowerCase();
    return (
      (c.name || '').toLowerCase().includes(term) ||
      (c.email || '').toLowerCase().includes(term) ||
      (c.id || '').toLowerCase().includes(term)
    );
  });

  return (
    <MainLayout>
      <div className="container mx-auto py-12 px-4">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">
            Lista de Clientes 👥
          </h1>
          <p className="text-zinc-500 text-sm italic mt-2">Visualize e gerencie todos os súditos do império.</p>
          
          <div className="mt-8 relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input 
              placeholder="Nome, E-mail ou UID..." 
              className="pl-10 h-11 bg-zinc-900 border-zinc-800" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Card className="p-0 overflow-hidden border-zinc-900 bg-zinc-950/50 backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-900/50 border-b border-zinc-900">
                  <th className="px-6 py-5 text-[10px] font-black uppercase text-zinc-500 tracking-wider">Cliente</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase text-zinc-500 tracking-wider">UID</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase text-zinc-500 tracking-wider">Data de Cadastro</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase text-zinc-500 tracking-wider">Nick IMVU</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={4} className="px-6 py-8"><div className="h-4 bg-zinc-900 rounded w-full" /></td>
                    </tr>
                  ))
                ) : filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-20 text-center text-zinc-600 italic font-medium">Nenhum cliente encontrado.</td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 overflow-hidden shrink-0">
                            {customer.avatar_url ? (
                              <img src={customer.avatar_url} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              <User size={18} />
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-white uppercase italic tracking-tight">{customer.name || 'Sem nome'}</span>
                            <span className="text-[10px] text-zinc-500 font-medium flex items-center gap-1">
                              <Mail size={10} /> {customer.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6 font-mono text-[10px] text-zinc-500">{customer.id}</td>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-2 text-zinc-400 text-xs italic">
                          <Calendar size={14} className="text-zinc-600" />
                          {customer.created_at ? safeDate(customer.created_at).toLocaleDateString('pt-BR') : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <span className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-[10px] font-black text-neon-green italic">
                          {customer.imvu_nick || 'N/A'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
