import React from 'react';
import { Star, Quote, User, Clock, Trash2, ShieldCheck } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Review } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/firebase';
import { doc, deleteDoc } from 'firebase/firestore';
import { motion } from 'motion/react';

interface ReviewListProps {
  reviews: Review[];
  isLoading?: boolean;
}

export function ReviewList({ reviews, isLoading }: ReviewListProps) {
  const { user, isAdmin } = useAuth();

  const handleDelete = async (id: string) => {
    if (!window.confirm('Deseja excluir permanentemente este review?')) return;
    try {
      await deleteDoc(doc(db, 'reviews', id));
    } catch (error) {
      console.error('Error deleting review:', error);
    }
  };

  const safeDate = (date: any) => {
    if (!date) return new Date();
    if (date.toDate) return date.toDate();
    if (typeof date === 'string') return new Date(date);
    return new Date();
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="h-64 rounded-3xl bg-zinc-900/50 animate-pulse border border-zinc-800" />
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <Card className="p-20 text-center border-dashed border-zinc-800 bg-zinc-900/10">
        <div className="h-20 w-20 bg-zinc-900 rounded-3xl flex items-center justify-center mx-auto mb-8 text-zinc-600 border border-zinc-800">
          <Quote size={40} />
        </div>
        <h3 className="text-2xl font-black text-white mb-3 italic tracking-tighter uppercase">Sem avaliações ainda</h3>
        <p className="text-zinc-500 max-w-sm mx-auto text-base italic">Seja o primeiro a deixar seu feedback sobre nosso laboratório.</p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
      {reviews.map((review, i) => (
        <motion.div
          key={review.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, type: 'spring', damping: 20 }}
        >
          <Card className="h-full bg-zinc-950/80 border-zinc-900 hover:border-zinc-700 transition-all p-6 md:p-8 flex flex-col relative overflow-hidden group">
            <div className={`absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform ${review.rating >= 4 ? 'text-neon-green' : 'text-zinc-500'}`}>
              <Quote size={80} />
            </div>

            <div className="flex justify-between items-start mb-6">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    size={16} 
                    className={`${star <= review.rating ? 'text-neon-green fill-neon-green' : 'text-zinc-800 fill-zinc-900'}`} 
                  />
                ))}
              </div>
              <Badge variant="outline" className="text-[10px] font-black tracking-widest uppercase italic border-zinc-800 text-zinc-500 bg-zinc-950">
                {review.category}
              </Badge>
            </div>

            <div className="flex-1 space-y-4">
              <p className="text-zinc-300 italic font-medium leading-relaxed">
                "{review.comment}"
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-zinc-900 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 shadow-inner group-hover:border-neon-green/30 transition-colors overflow-hidden">
                  {review.user_avatar ? (
                    <img src={review.user_avatar} alt={review.user_name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <User size={18} />
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-white italic tracking-tighter uppercase leading-none">
                    {review.user_name}
                  </span>
                  <div className="flex items-center gap-1.5 mt-1 text-zinc-600">
                    <Clock size={10} />
                    <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                      {safeDate(review.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              </div>

              {(isAdmin || review.user_id === user?.uid) && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-zinc-700 hover:text-red-500 hover:bg-red-500/10 transition-all rounded-lg"
                  onClick={() => handleDelete(review.id)}
                >
                  <Trash2 size={14} />
                </Button>
              )}
            </div>
            
            {review.rating >= 5 && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 py-1 bg-neon-green/10 border border-neon-green/20 rounded-full flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-500 shadow-[0_0_15px_rgba(57,255,20,0.1)]">
                <ShieldCheck size={10} className="text-neon-green" />
                <span className="text-[8px] text-neon-green font-black uppercase tracking-[0.2em] italic">Elite Experience</span>
              </div>
            )}
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
