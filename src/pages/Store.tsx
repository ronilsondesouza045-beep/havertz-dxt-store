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
      <div className="container mx-auto py-8 md:py-12 px-4">
        <div className="text-center mb-10 md:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-white italic mb-4 uppercase tracking-tighter text-glow leading-tight">
            ⚫🧪 LABORATÓRIO <br className="sm:hidden" /> DE CRÉDITOS 🧪⚫
          </h1>
          <p className="text-zinc-500 max-w-2xl mx-auto italic text-base md:text-lg">
            Escolha o método de injeção elite para sua conta IMVU.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-10 md:mb-12">
          <div className="flex w-full max-w-md p-1.5 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl shadow-black">
            <button
              onClick={() => setTab('DIRETO')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 rounded-xl text-xs md:text-sm font-black uppercase transition-all ${
                tab === 'DIRETO' 
                  ? 'bg-zinc-100 text-black shadow-[0_0_20px_rgba(255,255,255,0.1)]' 
                  : 'text-zinc-500 hover:text-white active:bg-zinc-800'
              }`}
            >
              <Zap className="h-4 w-4" /> Via Direto
            </button>
            <button
              onClick={() => setTab('PRESENTE')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 rounded-xl text-xs md:text-sm font-black uppercase transition-all ${
                tab === 'PRESENTE' 
                  ? 'bg-neon-purple text-white shadow-[0_0_20px_rgba(188,19,254,0.3)]' 
                  : 'text-zinc-500 hover:text-white active:bg-zinc-800'
              }`}
            >
              <Gift className="h-4 w-4" /> Via Presente
            </button>
          </div>
        </div>

        {/* Method Info */}
        <div className="max-w-4xl mx-auto mb-10 md:mb-16">
           <AnimatePresence mode="wait">
             <motion.div
               key={tab}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               className="space-y-6 md:space-y-8"
             >
                <div className="p-6 md:p-10 rounded-[2rem] bg-zinc-950 border border-zinc-800 flex flex-col md:flex-row items-center gap-6 md:gap-10 backdrop-blur-md shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    <div className={`h-24 w-24 md:h-20 md:w-20 rounded-3xl flex items-center justify-center shrink-0 border-2 transition-transform group-hover:scale-105 ${tab === 'DIRETO' ? 'bg-zinc-100 text-black border-white/20' : 'bg-neon-purple/10 text-neon-purple border-neon-purple/20'}`}>
                      {tab === 'DIRETO' ? <Zap size={48} /> : <Gift size={48} />}
                    </div>
                    <div className="flex-1 text-center md:text-left space-y-2">
                      <h3 className="text-2xl md:text-3xl font-black text-white uppercase italic tracking-tighter leading-none">
                        Injeção via {tab}
                      </h3>
                      <p className="text-zinc-500 font-medium italic text-base md:text-lg">
                        {tab === 'DIRETO' 
                          ? 'Créditos enviados diretamente ao seu nickname. Processo de alta segurança e estabilidade imbatível.' 
                          : 'Receba seus créditos como presentes em sua wishlist. Método otimizado para máxima economia.'}
                      </p>
                    </div>
                    <div className="flex flex-col items-center md:items-end gap-1">
                      <Badge variant={tab === 'DIRETO' ? 'default' : 'info'} className="text-lg md:text-base px-6 py-2 md:px-4 md:py-1 font-black italic">
                        {tab === 'DIRETO' ? 'R$ 2,80 / 1K' : 'R$ 1,80 / 1K'}
                      </Badge>
                      <p className="text-[10px] text-zinc-600 uppercase font-black tracking-widest mt-1">Protocolo Manual Verificado</p>
                    </div>
                </div>

                <div className="bg-zinc-900/10 p-2 rounded-[2.5rem] border border-zinc-900 shadow-inner">
                   <InfoNotice notices={tab === 'DIRETO' ? directNotices : presentNotices} variant="inline" className="p-4 md:p-6" />
                </div>
             </motion.div>
           </AnimatePresence>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
          {(tab === 'DIRETO' ? PRODUCTS_DIRETO : PRODUCTS_PRESENTE).map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, type: 'spring', damping: 20 }}
              className="h-full"
            >
              <Card className="h-full group hover:border-zinc-500 bg-zinc-950 relative overflow-hidden transition-all duration-500 flex flex-col p-6 md:p-8 min-h-[280px] shadow-lg shadow-black/50 border-zinc-800">
                 {/* Background decoration */}
                 <div className={`absolute -top-10 -right-10 p-4 opacity-[0.03] pointer-events-none group-hover:scale-150 transition-transform duration-1000 ${tab === 'DIRETO' ? 'text-white' : 'text-neon-purple'}`}>
                   {tab === 'DIRETO' ? <Zap size={200} /> : <Gift size={200} />}
                 </div>

                 {product.image_url && (
                   <div className="absolute top-0 right-0 w-32 h-32 md:w-40 md:h-40 opacity-10 group-hover:opacity-30 transition-all duration-700 pointer-events-none grayscale group-hover:grayscale-0 scale-125 group-hover:scale-100">
                     <img 
                       src={product.image_url} 
                       alt="" 
                       className="w-full h-full object-cover rounded-bl-[4rem] border-l border-b border-white/5 shadow-2xl"
                       referrerPolicy="no-referrer"
                     />
                   </div>
                 )}
                 
                 <div className="relative z-10 flex flex-col h-full">
                   <div className="flex justify-between items-start mb-6">
                      <div className="flex flex-col gap-2">
                        <Badge variant={tab === 'DIRETO' ? 'default' : 'info'} className="w-fit text-[10px] font-black italic tracking-widest px-3 py-1">BEST SALE</Badge>
                        <h3 className="text-5xl md:text-6xl font-black text-white italic tracking-tighter leading-none group-hover:text-neon-green transition-colors">{product.amount_k}K</h3>
                      </div>
                   </div>
                   
                   <div className="flex items-center gap-4 mb-8 mt-auto">
                     {product.image_url && (
                       <div className="h-14 w-14 md:h-12 md:w-12 shrink-0 overflow-hidden rounded-2xl border-2 border-zinc-800 bg-zinc-900 group-hover:border-white/20 transition-all duration-500 shadow-xl group-hover:shadow-white/5 ring-4 ring-zinc-950">
                         <img 
                           src={product.image_url} 
                           alt={product.name}
                           className="h-full w-full object-cover"
                           referrerPolicy="no-referrer"
                         />
                       </div>
                     )}
                     <div>
                        <p className="text-zinc-500 text-[10px] uppercase font-black tracking-[0.2em] mb-0.5">Créditos IMVU</p>
                        <p className={`text-[10px] font-black uppercase tracking-widest ${tab === 'DIRETO' ? 'text-zinc-300' : 'text-neon-purple'}`}>Protocolo {tab}</p>
                     </div>
                   </div>
                   
                   <div className="flex items-center justify-between pt-6 border-t border-zinc-900/50">
                     <div className="flex flex-col">
                       <span className="text-[10px] text-zinc-600 uppercase font-black tracking-widest mb-1 leading-none">Preço Final</span>
                       <span className="text-3xl md:text-2xl font-black text-white italic tracking-tighter drop-shadow-md">{formatCurrency(product.price)}</span>
                     </div>
                     <Button 
                       variant={tab === 'DIRETO' ? 'primary' : 'neon-purple'} 
                       size="icon" 
                       className="rounded-2xl h-14 w-14 md:h-12 md:w-12 bg-zinc-100 hover:bg-white text-black shadow-lg shadow-black group-hover:scale-110 active:scale-95 transition-all"
                       onClick={() => handleBuy(product.id)}
                     >
                       <ChevronRight size={24} />
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
