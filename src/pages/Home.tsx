import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Link } from 'react-router-dom';
import { CheckCircle2, ShieldCheck, Zap, HelpCircle, Star, ArrowRight } from 'lucide-react';
import { MainLayout } from '../layouts/MainLayout';
import { NoticeSection } from '../components/ui/InfoSection';

export default function Home() {
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
      a: 'Apos finalizar o pedido no site, envie o comprovante do Pix pelo Instagram oficial (@havertz.dxt) informando o numero do pedido para validacao manual.'
    }
  ];

  const reviews = [
    { name: 'Lucas S.', text: 'Entrega rápida e atendimento muito bom pelo whats.', stars: 5 },
    { name: 'Ana Paula', text: 'Comprei 50k e chegou tudo certinho em menos de 30 min.', stars: 5 },
    { name: 'Victor M.', text: 'Preço justo e confiança 100%. Recomendo.', stars: 4 }
  ];

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="container mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="neon" className="mb-6">SISTEMA PREMIUM V1.0</Badge>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white mb-6 uppercase italic">
              ⚫🧪 HAVERTZ<span className="text-neon-green">.DXT</span> — CRÉDITOS IMVU 🧪⚫
            </h1>
            <p className="text-xl md:text-2xl text-zinc-400 mb-10 max-w-2xl mx-auto font-mono">
              Rotina limpa. Execução precisa. Resultado inevitável.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/loja">
                <Button variant="neon" size="lg" className="w-full sm:w-auto h-14 px-10 text-lg uppercase italic font-bold">
                  Comprar Via Direto
                </Button>
              </Link>
              <Link to="/loja">
                <Button variant="neon-purple" size="lg" className="w-full sm:w-auto h-14 px-10 text-lg uppercase italic font-bold">
                  Comprar Via Presente
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
              <h2 className="text-3xl font-bold text-white mb-10 flex items-center gap-3">
                <Star className="text-neon-purple" /> O que dizem nossos clientes
              </h2>
              <div className="grid grid-cols-1 gap-6">
                {reviews.map((review, i) => (
                  <div key={i}>
                    <Card className="bg-zinc-900/20 border-zinc-900">
                      <div className="flex items-center gap-1 mb-3">
                        {[...Array(review.stars)].map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-neon-green text-neon-green" />
                        ))}
                      </div>
                      <p className="text-sm text-zinc-400 mb-4 italic">"{review.text}"</p>
                      <p className="text-xs font-bold text-white uppercase">{review.name}</p>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <div className="relative rounded-3xl overflow-hidden bg-zinc-900/40 border border-zinc-800 p-12 text-center">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] from-neon-green/5 pointer-events-none" />
            <h2 className="text-4xl font-bold text-white mb-6">Pronto para elevar sua conta?</h2>
            <p className="text-zinc-500 mb-10 max-w-xl mx-auto italic">
              Seja VIP no IMVU com os melhores preços do mercado e segurança garantida pela HAVERTZ.DXT.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/loja">
                <Button variant="neon" size="lg" className="h-14 px-12 text-lg font-bold">
                  ABRIR LOJA AGORA <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="lg" 
                className="h-14 px-12 text-lg font-bold border-green-500/50 text-green-500 hover:bg-green-500/10"
                onClick={() => window.open('https://w.app/cgfqyj', '_blank')}
              >
                SUPORTE WHATSAPP
              </Button>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
