import { useState } from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { PRODUCTS_DIRETO, PRODUCTS_PRESENTE } from '../constants/products';
import { formatCurrency } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Zap, Gift, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { InfoNotice } from '../components/ui/InfoNotice';

export default function Store() {
  const [tab, setTab] = useState<'DIRETO' | 'PRESENTE'>('DIRETO');
  const navigate = useNavigate();

  const handleBuy = (productId: string) => {
    navigate(`/checkout?id=${productId}`);
  };

  const directNotices = [
    { type: 'security' as const, text: 'Protocolo de injeção direta de alta segurança sem risco de estorno.' },
    { type: 'delivery' as const, text: 'Prazo médio de entrega de 5 a 30 minutos após confirmação.' },
    { type: 'important' as const, text: 'Certifique-se de que o nickname informado está correto.' }
  ];

  const presentNotices = [
    { type: 'observation' as const, text: 'Créditos enviados via presentes (Wishlist) para sua conta.' },
    { type: 'security' as const, text: 'Método 100% legal e seguro dentro das diretrizes da plataforma.' },
    { type: 'important' as const, text: 'Sua Wishlist deve conter itens suficientes para o valor comprado.' }
  ];

  return (
    <MainLayout>
      <div className="container mx-auto py-12 px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-white italic mb-4 uppercase tracking-tighter text-glow">
            ⚫🧪 LABORATÓRIO DE CRÉDITOS 🧪⚫
          </h1>
          <p className="text-zinc-500 max-w-2xl mx-auto italic">
            Escolha o método de injeção elite para sua conta IMVU.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex p-1 bg-zinc-900 border border-zinc-800 rounded-xl">
            <button
              onClick={() => setTab('DIRETO')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold uppercase transition-all ${
                tab === 'DIRETO' 
                  ? 'bg-neon-green text-black shadow-[0_0_15px_rgba(57,255,20,0.3)]' 
                  : 'text-zinc-500 hover:text-white'
              }`}
            >
              <Zap className="h-4 w-4" /> Via Direto
            </button>
            <button
              onClick={() => setTab('PRESENTE')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold uppercase transition-all ${
                tab === 'PRESENTE' 
                  ? 'bg-neon-purple text-white shadow-[0_0_15px_rgba(188,19,254,0.3)]' 
                  : 'text-zinc-500 hover:text-white'
              }`}
            >
              <Gift className="h-4 w-4" /> Via Presente
            </button>
          </div>
        </div>

        {/* Method Info */}
        <div className="max-w-4xl mx-auto mb-16">
           <AnimatePresence mode="wait">
             <motion.div
               key={tab}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               className="space-y-8"
             >
                <div className="p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800 flex flex-col md:flex-row items-center gap-8 backdrop-blur-md">
                    <div className={`h-20 w-20 rounded-3xl flex items-center justify-center ${tab === 'DIRETO' ? 'bg-neon-green/10 text-neon-green' : 'bg-neon-purple/10 text-neon-purple'}`}>
                      {tab === 'DIRETO' ? <Zap size={40} /> : <Gift size={40} />}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-black text-white mb-2 uppercase italic tracking-tighter">
                        Injeção via {tab}
                      </h3>
                      <p className="text-zinc-400 font-medium italic">
                        {tab === 'DIRETO' 
                          ? 'Créditos enviados diretamente ao seu nickname. Processo de alta segurança e estabilidade.' 
                          : 'Receba seus créditos como presentes em sua wishlist. Método otimizado para economia.'}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={tab === 'DIRETO' ? 'neon' : 'info'} className="mb-2 text-sm px-4 py-1">
                        {tab === 'DIRETO' ? 'R$ 2,80 / 1K' : 'R$ 1,80 / 1K'}
                      </Badge>
                      <p className="text-[10px] text-zinc-600 uppercase font-black tracking-widest">Protocolo Manual</p>
                    </div>
                </div>

                <div className="bg-zinc-900/10 p-1 rounded-[2rem] border border-zinc-900 shadow-inner">
                   <InfoNotice notices={tab === 'DIRETO' ? directNotices : presentNotices} variant="inline" className="p-4" />
                </div>
             </motion.div>
           </AnimatePresence>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {(tab === 'DIRETO' ? PRODUCTS_DIRETO : PRODUCTS_PRESENTE).map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="group hover:border-zinc-700 bg-zinc-950 relative overflow-hidden">
                 <div className={`absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-125 transition-transform duration-500 ${tab === 'DIRETO' ? 'text-neon-green' : 'text-neon-purple'}`}>
                   {tab === 'DIRETO' ? <Zap size={80} /> : <Gift size={80} />}
                 </div>
                 
                 <div className="relative z-10">
                   <div className="flex justify-between items-start mb-4">
                     <h3 className="text-3xl font-black text-white italic">{product.amount_k}K</h3>
                     <Badge variant={tab === 'DIRETO' ? 'neon' : 'info'}>SALE</Badge>
                   </div>
                   <p className="text-zinc-500 text-xs uppercase font-bold tracking-widest mb-6">IMVU Credits — {tab}</p>
                   
                   <div className="flex items-center justify-between mt-auto pt-6 border-t border-zinc-900">
                     <div className="flex flex-col">
                       <span className="text-xs text-zinc-600 uppercase font-bold">Valor Total</span>
                       <span className="text-2xl font-black text-white">{formatCurrency(product.price)}</span>
                     </div>
                     <Button 
                       variant={tab === 'DIRETO' ? 'neon' : 'neon-purple'} 
                       size="icon" 
                       className="rounded-full h-12 w-12"
                       onClick={() => handleBuy(product.id)}
                     >
                       <ChevronRight />
                     </Button>
                   </div>
                 </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
