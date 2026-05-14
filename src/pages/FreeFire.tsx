import { motion } from 'framer-motion';
import { MainLayout } from '../layouts/MainLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { FREE_FIRE_PACKAGES } from '../constants/free_fire';
import { formatCurrency } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Zap, Target, Flame } from 'lucide-react';
import { InfoNotice } from '../components/ui/InfoNotice';

export default function FreeFire() {
  const navigate = useNavigate();

  const handleBuy = (productId: string) => {
    navigate(`/checkout?id=${productId}`);
  };

  const getProductImage = (product: any) => {
    // For Free Fire catalog, we use the specific FF background
    return "https://wallpapercave.com/wp/wp5195928.jpg";
  };

  const notices = [
    { type: 'important' as const, text: 'ID do jogador é obrigatório para o processamento do resgate.' },
    { type: 'security' as const, text: 'Processo de injeção manual com total segurança anti-ban.' },
    { type: 'delivery' as const, text: 'Entrega realizada por ordem de chegada no sistema.' },
    { type: 'observation' as const, text: 'Prazo máximo de conclusão até às 00h do dia solicitado.' }
  ];

  return (
    <MainLayout>
      <div className="container mx-auto py-12 px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-white italic mb-4 uppercase tracking-tighter text-glow">
            ⚫🧪 HAVERTZ.DXT — DIAMANTES FREE FIRE 🧪⚫
          </h1>
          <p className="text-zinc-500 max-w-2xl mx-auto italic">
            Entrega manual rápida e organizada.
          </p>
        </div>

        <div>
          <div className="flex items-center gap-4 mb-8">
            <div className="h-10 w-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <Flame className="text-orange-500" />
            </div>
            <h2 className="text-2xl font-black text-white uppercase italic tracking-widest">PACOTES</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {FREE_FIRE_PACKAGES.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="group hover:border-orange-500/50 bg-zinc-950/50 transition-all border-zinc-900 overflow-hidden">
                  <div className="aspect-video w-full overflow-hidden border-b border-zinc-900 bg-zinc-900/50">
                    <img 
                      src={getProductImage(product)} 
                      alt={`${product.name} Preview`}
                      className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="p-4">
                    <div className="mb-4">
                      <h3 className="text-lg font-bold text-white uppercase mb-2">{product.name}</h3>
                      <Badge variant="outline" className="border-orange-500/20 text-orange-500 uppercase italic">Injeção Manual</Badge>
                    </div>
                    
                    <div className="mt-auto pt-4 border-t border-zinc-900 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-zinc-600 uppercase font-black">Preço</p>
                        <p className="text-xl font-black text-white">{formatCurrency(product.price)}</p>
                      </div>
                      <Button 
                        variant="neon" 
                        size="sm" 
                        className="font-bold italic bg-orange-500 hover:bg-orange-600 text-white"
                        onClick={() => handleBuy(product.id)}
                      >
                        RESGATAR <ShoppingCart className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
