import { motion } from 'framer-motion';
import { MainLayout } from '../layouts/MainLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { FOLLOWERS_INSTAGRAM, FOLLOWERS_IMVU_FULL } from '../constants/followers';
import { formatCurrency } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Users, Instagram, Zap, AlertCircle } from 'lucide-react';
import { InfoNotice, NoticeType } from '../components/ui/InfoNotice';

export default function Followers() {
  const navigate = useNavigate();

  const handleBuy = (productId: string) => {
    navigate(`/checkout?id=${productId}`);
  };

  const getProductImage = (product: any) => {
    const name = product.name.toLowerCase();
    if (name.includes('instagram')) return "https://i.pinimg.com/originals/ca/2b/d1/ca2bd1b89bf7f1abb0c4fc3028de3377.jpg";
    return null;
  };

  const sections = [
    { 
      title: 'INSTAGRAM', 
      icon: <Instagram className="text-pink-500" />, 
      products: FOLLOWERS_INSTAGRAM,
      notices: [
        { type: 'important' as const, text: 'Oscilações podem ocorrer conforme o fluxo do sistema.' },
        { type: 'security' as const, text: 'Reposição não garantida para perdas externas.' },
        { type: 'delivery' as const, text: 'Quantidades entregues exatamente conforme solicitado.' },
        { type: 'observation' as const, text: 'Valores sujeitos a alteração sem aviso prévio.' }
      ]
    },
    { 
      title: 'IMVU', 
      icon: <Zap className="text-neon-green" />, 
      products: FOLLOWERS_IMVU_FULL,
      footer: 'Quantidades maiores consultar privado.'
    },
  ];

  return (
    <MainLayout>
      <div className="container mx-auto py-12 px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-white italic mb-4 uppercase tracking-tighter">
            ⚫🧪 HAVERTZ.DXT — SEGUIDORES ATIVOS 🧪⚫
          </h1>
          <p className="text-zinc-500 max-w-2xl mx-auto italic mb-10">
            Crescimento organizado e gradual.
          </p>
        </div>

        <div className="space-y-24">
          {sections.map((section, idx) => (
            <div key={idx}>
              <div className="flex items-center gap-4 mb-8">
                <div className="h-10 w-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                  {section.icon}
                </div>
                <h2 className="text-2xl font-black text-white uppercase italic tracking-widest">{section.title}</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {section.products.map((product, i) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card className="group hover:border-zinc-700 bg-zinc-950/50 overflow-hidden">
                      {getProductImage(product) && (
                        <div className="mb-4 aspect-video rounded-xl overflow-hidden border border-zinc-900 bg-zinc-900/50">
                          <img 
                            src={getProductImage(product) || ""} 
                            alt={`${product.name} Preview`}
                            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}
                      <div className="mb-4 flex justify-between items-start">
                        <h3 className="text-lg font-bold text-white uppercase">{product.name}</h3>
                        <Badge variant="outline" className="border-zinc-800 text-zinc-600">UP</Badge>
                      </div>
                      
                      <div className="mt-auto pt-4 border-t border-zinc-900 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] text-zinc-600 uppercase font-black">Investimento</p>
                          <p className="text-xl font-black text-white">{formatCurrency(product.price)}</p>
                        </div>
                        <Button 
                          variant="neon" 
                          size="sm" 
                          className="font-bold italic"
                          onClick={() => handleBuy(product.id)}
                        >
                          SOLICITAR <ShoppingCart className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {section.footer && (
                <p className="mt-4 text-xs text-zinc-600 uppercase font-black text-right italic tracking-[0.2em]">{section.footer}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
