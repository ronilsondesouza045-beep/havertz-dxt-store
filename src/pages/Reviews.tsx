import React, { useState, useEffect } from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { ReviewForm } from '../components/reviews/ReviewForm';
import { ReviewList } from '../components/reviews/ReviewList';
import { Filter, Star, Trophy, Users, CheckCircle2 } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { Review } from '../types';
import { Badge } from '../components/ui/Badge';
import { motion } from 'motion/react';

const FILTERS = [
  { id: 'all', label: 'Todos' },
  { id: '5stars', label: '5 Estrelas', icon: Star },
  { id: 'Créditos IMVU', label: 'Créditos' },
  { id: 'Serviços', label: 'Serviços' },
  { id: 'Free Fire', label: 'Free Fire' },
  { id: 'Seguidores', label: 'Seguidores' },
  { id: 'Atendimento', label: 'Atendimento' },
];

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    let q = query(collection(db, 'reviews'), orderBy('created_at', 'desc'));

    if (activeFilter === '5stars') {
      q = query(collection(db, 'reviews'), where('rating', '==', 5), orderBy('created_at', 'desc'));
    } else if (activeFilter !== 'all') {
      q = query(collection(db, 'reviews'), where('category', '==', activeFilter), orderBy('created_at', 'desc'));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reviewData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Review[];
      setReviews(reviewData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [activeFilter]);

  const stats = {
    total: reviews.length,
    average: reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : '5.0',
    fiveStars: reviews.filter(r => r.rating === 5).length
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-16 md:py-24 px-4">
        {/* Header Section */}
        <div className="max-w-4xl mx-auto text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Badge variant="neon" className="px-6 py-2 text-xs font-black italic tracking-widest bg-zinc-950">
              ELITE CUSTOMER FEEDBACK
            </Badge>
            <h1 className="text-5xl md:text-7xl font-black text-white italic uppercase tracking-tighter leading-none mb-6">
              A VOZ DO <span className="text-neon-green">LABORATÓRIO</span>
            </h1>
            <p className="text-zinc-500 text-lg md:text-xl font-medium italic opacity-80 max-w-2xl mx-auto">
              Veja o que nossos clientes dizem sobre a experiência de injeção elite e o suporte ultra-rápido da HAVERTZ.DXT.
            </p>
          </motion.div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="p-8 rounded-[2.5rem] bg-zinc-950 border border-zinc-900 flex flex-col items-center justify-center text-center shadow-xl hover:border-zinc-800 transition-all hover:bg-zinc-900/10"
          >
            <div className="h-14 w-14 bg-neon-green/10 text-neon-green rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(57,255,20,0.1)]">
              <Star size={30} className="fill-neon-green" />
            </div>
            <span className="text-4xl font-black text-white italic mb-1">{stats.average}<span className="text-zinc-500 text-xl">/5</span></span>
            <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Média de Satisfação</span>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="p-8 rounded-[2.5rem] bg-zinc-950 border border-zinc-900 flex flex-col items-center justify-center text-center shadow-xl hover:border-zinc-800 transition-all hover:bg-zinc-900/10"
          >
            <div className="h-14 w-14 bg-neon-purple/10 text-neon-purple rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(188,19,254,0.1)]">
              <Users size={30} />
            </div>
            <span className="text-4xl font-black text-white italic mb-1">{stats.total}</span>
            <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Avaliações Totais</span>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="p-8 rounded-[2.5rem] bg-zinc-950 border border-zinc-900 flex flex-col items-center justify-center text-center shadow-xl hover:border-zinc-800 transition-all hover:bg-zinc-900/10"
          >
            <div className="h-14 w-14 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
              <CheckCircle2 size={30} />
            </div>
            <span className="text-4xl font-black text-white italic mb-1">{stats.fiveStars}</span>
            <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Reviews 5 Estrelas</span>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Sidebar Area */}
          <div className="lg:col-span-4 space-y-8">
            <div className="sticky top-24">
              <ReviewForm />
              
              <div className="mt-12 p-8 rounded-[2rem] bg-zinc-950 border-2 border-zinc-900 border-dashed text-center">
                 <Trophy size={40} className="text-neon-green mx-auto mb-4 opacity-50" />
                 <h4 className="text-lg font-black text-white uppercase italic mb-2 tracking-tighter">Selo de Qualidade Elite</h4>
                 <p className="text-xs text-zinc-500 italic font-medium leading-relaxed">Cada avaliação aqui apresentada é verificada pelo nosso protocolo de integridade, garantindo transparência total.</p>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-10">
            {/* Filter Bar */}
            <div className="flex items-center gap-4 overflow-x-auto pb-4 scrollbar-hide no-scrollbar">
              <div className="p-3 bg-zinc-950 rounded-2xl border border-zinc-900 text-zinc-500">
                <Filter size={18} />
              </div>
              <div className="flex gap-2">
                {FILTERS.map(filter => (
                  <button
                    key={filter.id}
                    onClick={() => setActiveFilter(filter.id)}
                    className={`px-6 py-3 rounded-2xl text-xs font-black uppercase italic tracking-widest transition-all whitespace-nowrap border ${
                      activeFilter === filter.id 
                        ? 'bg-neon-green text-black border-neon-green shadow-[0_10px_20px_rgba(57,255,20,0.2)]' 
                        : 'bg-zinc-950 text-zinc-500 border-zinc-900 hover:border-zinc-700'
                    }`}
                  >
                    {filter.icon && <filter.icon size={12} className="inline mr-2" />}
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            <ReviewList reviews={reviews} isLoading={loading} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
