import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Link } from 'react-router-dom';
import { CheckCircle2, ShieldCheck, Zap, HelpCircle, Star, ArrowRight, MessageSquare } from 'lucide-react';
import { MainLayout } from '../layouts/MainLayout';
import { NoticeSection } from '../components/ui/InfoSection';
import { ReviewList } from '../components/reviews/ReviewList';
import { db } from '../lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { Review } from '../types';

export default function Home() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'reviews'), orderBy('created_at', 'desc'), limit(3));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Review[];
      setReviews(data);
      setLoadingReviews(false);
    });
    return () => unsubscribe();
  }, []);

  const benefits = [
    {
      icon: <Zap className="h-6 w-6 text-neon-green" />,
      title: 'Entrega Manual',
      description: 'Processo humanizado para garantir que seus créditos cheguem com segurança.'
    },
    {
      icon: <ShieldCheck className="h-6 w-6 text-neon-purple" />,
      title: 'Anti-Ban System',
      description: 'Métodos testados e aprovados que não colocam sua conta em risco.'
    },
    {
      icon: <CheckCircle2 className="h-6 w-6 text-neon-green" />,
      title: 'Sem Acesso à Conta',
      description: 'Não pedimos sua senha. Precisamos apenas do seu @nickname do IMVU.'
    }
  ];

  const faqs = [
    {
      q: 'Quanto tempo demora a entrega?',
      a: 'Geralmente entre 15 a 60 minutos após a confirmação do pagamento, dependendo do volume de pedidos.'
    },
    {
      q: 'É seguro? Posso ser banido?',
      a: 'Nosso método é 100% seguro. Usamos transferências manuais que respeitam os limites do IMVU, evitando qualquer risco de banimento.'
    },
    {
      q: 'Como envio o comprovante?',
      a: 'Apos finalizar o pedido no site, envie o comprovante do Pix pelo Instagram oficial (@havertz.offc) informando o numero do pedido para validacao manual.'
    }
  ];

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 md:py-32 px-4">
        <div className="container mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, type: 'spring', damping: 20 }}
            className="space-y-8"
          >
            <Badge variant="neon" className="px-6 py-2 text-xs md:text-sm font-black italic tracking-widest bg-zinc-900 border border-zinc-700 shadow-xl shadow-black ring-4 ring-zinc-950">PLATAFORMA ELITE V3.2</Badge>
            <h1 className="text-4xl sm:text-5xl md:text-8xl font-black tracking-tighter text-white mb-6 uppercase italic leading-[0.9] drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
              ⚫🧪 HAVERTZ<span className="text-neon-green">.DXT</span> <br className="hidden md:block" /> CRÉDITOS IMVU 🧪⚫
            </h1>
            <p className="text-lg md:text-3xl text-zinc-500 mb-12 max-w-3xl mx-auto font-black italic tracking-tight opacity-80 leading-tight">
              Rotina limpa. Execução precisa. <br className="hidden sm:block" /> Resultado inevitável.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
              <Link to="/loja" className="w-full sm:w-auto overflow-hidden rounded-[1.5rem] shadow-2xl shadow-neon-green/20">
                <Button variant="neon" size="lg" className="w-full sm:w-auto h-20 md:h-16 px-12 text-xl md:text-lg font-black uppercase italic tracking-widest ring-4 ring-zinc-950">
                  VIA DIRETO ⚡
                </Button>
              </Link>
              <Link to="/loja" className="w-full sm:w-auto overflow-hidden rounded-[1.5rem] shadow-2xl shadow-neon-purple/20">
                <Button variant="neon-purple" size="lg" className="w-full sm:w-auto h-20 md:h-16 px-12 text-xl md:text-lg font-black uppercase italic tracking-widest ring-4 ring-zinc-950">
                  VIA PRESENTE 🎁
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl opacity-20 pointer-events-none">
          <div className="absolute top-0 left-0 w-64 h-64 bg-neon-green rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-neon-purple rounded-full blur-[120px]" />
        </div>
      </section>

      {/* Free Tools Section */}
      <section className="py-20 px-4 bg-zinc-950/50 border-y border-zinc-900 relative">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-neon-green/5 blur-[100px] pointer-events-none" />
        <div className="container mx-auto">
          <div className="mb-12 text-center md:text-left">
            <Badge variant="neon" className="mb-4">NOVIDADE</Badge>
            <h2 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter mb-4">Laboratório <span className="text-neon-green">Gratuito</span></h2>
            <p className="text-zinc-500 italic max-w-2xl">Ferramentas exclusivas e acessos liberados para a comunidade Havertz.dxt.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-zinc-900/20 border-zinc-900 p-8 flex flex-col items-start gap-6 group hover:border-neon-purple/30 transition-all">
              <div className="h-14 w-14 rounded-2xl bg-neon-purple/10 border border-neon-purple/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Zap className="text-neon-purple h-8 w-8" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white italic uppercase mb-2">STREAMING <span className="text-neon-purple">INFO</span></h3>
                <p className="text-zinc-500 text-sm italic mb-6">Acompanhe as contas públicas de Netflix e Prime Video direto pelo nosso bot de suporte.</p>
                <Button 
                  variant="neon-purple" 
                  size="sm" 
                  className="w-full uppercase italic font-black"
                  onClick={() => {
                    const chatBtn = document.querySelector('[aria-label="Abrir chat de suporte"]') as HTMLButtonElement;
                    if (chatBtn) chatBtn.click();
                  }}
                >
                  ABRIR SUPORTE 💬
                </Button>
              </div>
            </Card>

            <Card className="bg-zinc-900/20 border-zinc-900 p-8 flex flex-col items-center justify-center gap-6 border-dashed opacity-50">
              <div className="h-14 w-14 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                <CheckCircle2 className="text-zinc-600 h-8 w-8" />
              </div>
              <p className="text-zinc-600 font-black italic uppercase tracking-widest text-center">MAIS FERRAMENTAS EM BREVE</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Unified Notice and Benefits Section */}
      <div className="container mx-auto px-4">
        <NoticeSection title="Protocolos Elite Havertz.dxt" />
      </div>

      {/* FAQ & Reviews */}
      <section id="faq" className="py-24 px-4 overflow-hidden">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <h2 className="text-3xl font-bold text-white mb-10 flex items-center gap-3">
                <HelpCircle className="text-neon-green" /> Perguntas Frequentes
              </h2>
              <div className="space-y-6">
                {faqs.map((faq, i) => (
                  <div key={i} className="border-b border-zinc-900 pb-6">
                    <h4 className="text-lg font-semibold text-white mb-2 italic">🧪 {faq.q}</h4>
                    <p className="text-zinc-500 text-sm">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                  <Star className="text-neon-purple" /> O que dizem nossos clientes
                </h2>
                <Link to="/avaliacoes">
                  <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-white uppercase italic font-black text-[10px] tracking-widest">
                    Ver Todos <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </Link>
              </div>
              <div className="space-y-6">
                {loadingReviews ? (
                  <div className="flex flex-col gap-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-32 bg-zinc-900/50 rounded-2xl animate-pulse" />)}
                  </div>
                ) : reviews.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6">
                    {reviews.map((review, i) => (
                      <motion.div
                        key={review.id}
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <Card className="bg-zinc-900/20 border-zinc-900 p-6 relative overflow-hidden group">
                          <div className="flex items-center gap-1 mb-3">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={12} className={i < review.rating ? "fill-neon-green text-neon-green" : "fill-zinc-800 text-zinc-800"} />
                            ))}
                          </div>
                          <p className="text-sm text-zinc-400 mb-4 italic leading-relaxed">"{review.comment}"</p>
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-black text-white uppercase italic tracking-tighter">{review.user_name}</p>
                            <Badge variant="outline" className="text-[8px] border-zinc-800 uppercase text-zinc-600">{review.category}</Badge>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                    <Link to="/avaliacoes">
                      <Button variant="outline" className="w-full border-zinc-900 text-zinc-500 hover:text-white hover:bg-zinc-900 py-6 border-dashed">
                        DEIXAR MINHA AVALIAÇÃO <MessageSquare className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <Card className="p-12 text-center border-dashed border-zinc-800 bg-zinc-900/10">
                    <p className="text-zinc-500 italic mb-6">Nenhuma avaliação ainda. Seja o primeiro!</p>
                    <Link to="/avaliacoes">
                      <Button variant="neon" size="sm">DEIXAR AVALIAÇÃO</Button>
                    </Link>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <div className="relative rounded-[3rem] overflow-hidden bg-zinc-950 border border-zinc-900 p-10 md:p-20 text-center shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)]">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] from-neon-green/5 pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-neon-purple/10 blur-[100px] rounded-full pointer-events-none" />
            
            <Badge variant="outline" className="mb-8 border-zinc-800 text-zinc-500 px-4 py-1 font-black italic tracking-[0.3em]">READY TO LEVEL UP</Badge>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 uppercase italic tracking-tighter leading-none">Pronto para elevar <br className="hidden md:block" /> sua conta imvu?</h2>
            <p className="text-zinc-500 mb-12 max-w-xl mx-auto italic text-lg font-medium opacity-80 leading-relaxed">
              Torne-se VIP com os melhores preços do mercado <br className="hidden sm:block" /> e segurança garantida pela elite HAVERTZ.DXT.
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              <Link to="/loja" className="w-full md:w-auto">
                <Button variant="neon" size="lg" className="h-20 md:h-16 w-full md:px-14 text-xl md:text-lg font-black italic uppercase tracking-widest shadow-2xl shadow-neon-green/20">
                  ABRIR LABORATÓRIO <ArrowRight className="ml-3 h-6 w-6" />
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="lg" 
                className="h-20 md:h-16 w-full md:px-14 text-xl md:text-lg font-black italic uppercase tracking-widest border-2 border-zinc-800 hover:bg-zinc-900"
                onClick={() => window.open('https://w.app/cgfqyj', '_blank')}
              >
                WHATSAPP ELITE
              </Button>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
