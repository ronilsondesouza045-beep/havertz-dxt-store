import React, { useState, useEffect } from 'react';
import { MainLayout } from '../../layouts/MainLayout';
import { db } from '../../lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Review } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Star, ShieldCheck, Eye, EyeOff, Trash2, Clock, User, Filter } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Badge } from '../../components/ui/Badge';
import { motion } from 'motion/react';

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const q = query(collection(db, 'reviews'), orderBy('created_at', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Review[];
      setReviews(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const toggleVisibility = async (id: string, currentVisible: boolean) => {
    try {
      await updateDoc(doc(db, 'reviews', id), {
        is_visible: !currentVisible,
        updated_at: new Date().toISOString()
      });
      toast.success(currentVisible ? 'Review ocultado' : 'Review visível');
    } catch (error) {
      toast.error('Erro ao atualizar visibility');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Excluir permanentemente?')) return;
    try {
      await deleteDoc(doc(db, 'reviews', id));
      toast.success('Review excluído');
    } catch (error) {
      toast.error('Erro ao excluir');
    }
  };

  const filteredReviews = reviews.filter(r => {
    if (filter === 'visible') return r.is_visible;
    if (filter === 'hidden') return !r.is_visible;
    return true;
  });

  return (
    <MainLayout>
      <div className="container mx-auto py-12 px-4">
        <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">Gerenciar Avaliações 🧪</h1>
            <p className="text-zinc-500 italic mt-1 font-medium">Controle as injeções de feedback do laboratório.</p>
          </div>

          <div className="flex items-center gap-2 bg-zinc-950 p-1.5 rounded-2xl border border-zinc-900 overflow-x-auto no-scrollbar whitespace-nowrap">
            <Button 
              variant={filter === 'all' ? 'neon' : 'ghost'} 
              size="sm" 
              onClick={() => setFilter('all')}
              className="text-[10px] font-black uppercase tracking-widest h-10 px-6 italic"
            >
              Todos
            </Button>
            <Button 
              variant={filter === 'visible' ? 'neon' : 'ghost'} 
              size="sm" 
              onClick={() => setFilter('visible')}
              className="text-[10px] font-black uppercase tracking-widest h-10 px-6 italic"
            >
              Visíveis
            </Button>
            <Button 
              variant={filter === 'hidden' ? 'neon' : 'ghost'} 
              size="sm" 
              onClick={() => setFilter('hidden')}
              className="text-[10px] font-black uppercase tracking-widest h-10 px-6 italic"
            >
              Ocultos
            </Button>
          </div>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => <div key={i} className="h-48 bg-zinc-900 animate-pulse rounded-3xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filteredReviews.map((review, i) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className={`h-full p-8 flex flex-col relative overflow-hidden transition-all duration-500 ${review.is_visible ? 'bg-zinc-950 border-zinc-900' : 'bg-black opacity-60 border-red-900/30'}`}>
                   {!review.is_visible && (
                      <div className="absolute inset-0 bg-red-950/5 flex items-center justify-center pointer-events-none">
                         <div className="rotate-12 border-2 border-red-500/20 px-8 py-2 rounded-xl text-red-500 font-black italic tracking-[0.5em] uppercase text-2xl">OCULTO</div>
                      </div>
                   )}

                   <div className="flex justify-between items-start mb-6">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            size={14} 
                            className={`${star <= review.rating ? 'text-neon-green fill-neon-green' : 'text-zinc-800 fill-zinc-900'}`} 
                          />
                        ))}
                      </div>
                      <Badge variant="outline" className="text-[10px] font-black italic tracking-widest bg-zinc-900">
                        {review.category}
                      </Badge>
                   </div>

                   <p className="text-zinc-400 italic text-sm mb-8 leading-relaxed flex-1">"{review.comment}"</p>

                   <div className="pt-6 border-t border-zinc-900 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="h-10 w-10 bg-zinc-900 rounded-xl flex items-center justify-center text-zinc-500 border border-zinc-800">
                           <User size={18} />
                         </div>
                         <div className="flex flex-col">
                            <span className="text-sm font-black text-white italic tracking-tighter uppercase leading-none">{review.user_name}</span>
                            <span className="text-[9px] text-zinc-600 font-bold uppercase mt-1">{review.user_email}</span>
                         </div>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className={`h-10 w-10 rounded-xl transition-all ${review.is_visible ? 'text-zinc-500 hover:text-white border-zinc-800' : 'text-red-500 border-red-900/30 bg-red-500/5 hover:bg-red-500 hover:text-white'}`}
                          onClick={() => toggleVisibility(review.id, review.is_visible)}
                        >
                          {review.is_visible ? <Eye size={16} /> : <EyeOff size={16} />}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-10 w-10 text-zinc-700 hover:text-red-500 border-zinc-800 rounded-xl hover:bg-red-500/5 transition-all"
                          onClick={() => handleDelete(review.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                   </div>
                </Card>
              </motion.div>
            ))}

            {filteredReviews.length === 0 && (
              <div className="col-span-full py-20 text-center">
                 <Badge variant="outline" className="mb-4 border-zinc-800 opacity-50">SISTEMA LIMPO</Badge>
                 <h2 className="text-2xl font-black text-zinc-700 italic uppercase">Nenhum review encontrado</h2>
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
