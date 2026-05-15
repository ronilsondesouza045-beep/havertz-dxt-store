import React, { useState } from 'react';
import { Star, MessageSquare, Send, Check } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';

interface ReviewFormProps {
  onSuccess?: () => void;
}

const CATEGORIES = [
  { value: 'Créditos IMVU', label: 'Créditos IMVU' },
  { value: 'Serviços', label: 'Serviços' },
  { value: 'Produtos MN', label: 'Produtos MN' },
  { value: 'Free Fire', label: 'Free Fire' },
  { value: 'Seguidores', label: 'Seguidores' },
  { value: 'Atendimento', label: 'Atendimento' },
];

export function ReviewForm({ onSuccess }: ReviewFormProps) {
  const { user, profile } = useAuth();
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [category, setCategory] = useState('Créditos IMVU');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const displayName = profile?.name || user.displayName || user.email?.split('@')[0] || 'Cliente';
      
      await addDoc(collection(db, 'reviews'), {
        user_id: user.uid,
        user_name: displayName,
        user_email: user.email,
        user_avatar: profile?.avatar_url || user.photoURL || null,
        rating,
        category,
        comment,
        is_visible: true,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });

      setSubmitted(true);
      if (onSuccess) onSuccess();
      
      // Reset form after a delay
      setTimeout(() => {
        setComment('');
        setRating(5);
        setSubmitted(false);
      }, 3000);
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Card className="p-8 text-center bg-zinc-950/50 border-zinc-900 border-dashed">
        <h3 className="text-xl font-black text-white uppercase italic mb-4">Sua opinião importa! 🧪</h3>
        <p className="text-zinc-500 mb-6 italic">Inicie sua sessão para deixar uma avaliação sobre nossos serviços elite.</p>
        <Button variant="neon" onClick={() => window.location.href = '/login'}>
          Entrar para avaliar
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-6 md:p-8 bg-zinc-950 border-zinc-900 relative overflow-hidden">
      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div 
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center py-8"
          >
            <div className="h-20 w-20 bg-neon-green/20 text-neon-green rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(57,255,20,0.2)]">
              <Check size={40} className="stroke-[3]" />
            </div>
            <h3 className="text-2xl font-black text-white italic uppercase mb-2">Avaliação Enviada!</h3>
            <p className="text-zinc-500 italic">Obrigado por fortalecer a comunidade HAVERTZ.DXT.</p>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="h-8 w-1 bg-neon-green rounded-full shadow-[0_0_10px_#39FF14]" />
              <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Deixe seu Review</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Sua Nota Elite</p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className="transition-all active:scale-90"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHover(star)}
                      onMouseLeave={() => setHover(0)}
                    >
                      <Star
                        size={32}
                        className={`transition-colors ${
                          star <= (hover || rating) 
                            ? 'fill-neon-green text-neon-green' 
                            : 'text-zinc-800 fill-zinc-900 hover:text-zinc-700'
                        } ${(hover || rating) === star ? 'scale-110 drop-shadow-[0_0_8px_rgba(57,255,20,0.4)]' : ''}`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Categoria do Serviço</p>
                  <select
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white italic font-bold focus:border-neon-green/50 focus:ring-0 transition-all outline-none"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Identificação</p>
                  <div className="px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-zinc-400 font-bold italic">
                    {profile?.name || user.displayName || user.email?.split('@')[0] || 'Cliente'}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Seu Comentário</p>
                <textarea
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-4 text-white italic font-medium focus:border-neon-green/50 focus:ring-0 transition-all outline-none min-h-[120px] resize-none"
                  placeholder="Conte como foi sua experiência com a injeção..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                />
              </div>

              <Button 
                type="submit" 
                variant="neon" 
                className="w-full h-14 text-sm font-black italic uppercase tracking-widest group"
                isLoading={loading}
                disabled={loading || !comment.trim()}
              >
                PUBLICAR AVALIAÇÃO <Send className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
