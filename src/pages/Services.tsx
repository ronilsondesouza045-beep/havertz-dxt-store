import { motion } from 'framer-motion';
import { MainLayout } from '../layouts/MainLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { SERVICES_UPGRADES, FOLLOWERS_IMVU_BASIC, FOLLOWERS_INSTAGRAM_BASIC, STREAMING_SERVICES } from '../constants/services';
import { FREE_FIRE_PACKAGES } from '../constants/free_fire';
import { formatCurrency } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Shield, Zap, Tv, Users } from 'lucide-react';
import { InfoNotice } from '../components/ui/InfoNotice';

export default function Services() {
  const navigate = useNavigate();

  const handleBuy = (productId: string) => {
    navigate(`/checkout?id=${productId}`);
  };

  const getProductImage = (product: any) => {
    const name = product.name.toLowerCase();
    const cat = product.category;
    
    if (product.name === 'AGE') return "https://cdn.sistemawbuy.com.br/arquivos/b7f36453f415a540dffee82d02b0ae0c/produtos/646a436f2cc96/imvu_age-655984c72768e.webp";
    if (product.name === 'AP') return "https://cdn.sistemawbuy.com.br/arquivos/b7f36453f415a540dffee82d02b0ae0c/produtos/646a452b08014/imvu_ap-655984d31aca3.webp";
    if (product.name === 'NFT') return "https://tse1.mm.bing.net/th/id/OIP.Qbg5stqkjacR0hr5tKUckQAAAA?pid=Api&P=0&h=180";
    if (product.name === 'VIP PLATA') return "https://cdn.ggmax.com.br/images/61a95fc96df775ccafa9142bc849a749.sm.jpg";
    
    if (name.includes('netflix')) return "https://i.pinimg.com/originals/6c/2d/1d/6c2d1d9ecba586273c0fa42b9cec9a6e.jpg";
    if (name.includes('disney')) return "https://images6.alphacoders.com/134/thumb-1920-1340430.jpeg";
    if (name.includes('paramount')) return "https://cinemaweb.com.br/wp-content/uploads/2023/08/2002.jpg";
    if (name.includes('play plus')) return "https://pop.proddigital.com.br/wp-content/uploads/sites/8/2023/05/01-104.jpg";
    if (name.includes('prime video')) return "https://i.pinimg.com/originals/94/b5/93/94b5931daaf3a1ae37970ffc7b210da9.png";
    if (name.includes('premiere')) return "https://i0.wp.com/portalaltadefinicao.com/wp-content/uploads/2021/02/Globoplay-e-Premiere-1-1.jpg?w=1200&quality=100&ssl=1";
    if (name.includes('canva')) return "https://mundobytes.com/wp-content/uploads/2025/06/canva-pro.jpg";
    if (name.includes('capcut')) return "https://i.pinimg.com/originals/51/6c/3b/516c3b7c578c2cd56652a7f0a1049e9d.jpg";
    if (name.includes('chatgpt')) return "https://www.writecream.com/wp-content/uploads/2023/01/1_Yp0GbP9pdkBHW5842SuI7w.png";
    if (name.includes('free fire') || name.includes('dimas') || cat === 'free_fire') return "https://wallpapercave.com/wp/wp5195928.jpg";
    if (name.includes('instagram')) return "https://i.pinimg.com/originals/ca/2b/d1/ca2bd1b89bf7f1abb0c4fc3028de3377.jpg";
    if (name.includes('globoplay') || name.includes('globo play')) return "https://i1.wp.com/gkpb.com.br/wp-content/uploads/2020/08/globoplay-mais-canais-ao-vivo-logo.jpg?resize=803%2C420&ssl=1"
    
    return null;
  };

  const serviceNotices = [
    { type: 'delivery' as const, text: 'Prazo médio de processamento de até 24h úteis após confirmação.' },
    { type: 'important' as const, text: 'Atendimento e execução realizados manualmente pela equipe dex.' },
    { type: 'security' as const, text: 'Processo organizado seguindo rigorosos protocolos de segurança.' },
    { type: 'delivery' as const, text: 'Entrega imediata dos acessos após a verificação do pagamento.' }
  ];

  const sections = [
    { title: 'UPGRADES IMVU', icon: <Zap className="text-neon-green" />, products: SERVICES_UPGRADES },
    { title: 'SEGUIDORES IMVU', icon: <Users className="text-neon-purple" />, products: FOLLOWERS_IMVU_BASIC, footer: '+ quantidades no PV' },
    { title: 'SEGUIDORES INSTAGRAM', icon: <Users className="text-blue-500" />, products: FOLLOWERS_INSTAGRAM_BASIC },
    { title: 'FREE FIRE', icon: <Zap className="text-orange-500" />, products: FREE_FIRE_PACKAGES },
    { title: 'STREAMING & SERVIÇOS', icon: <Tv className="text-red-500" />, products: STREAMING_SERVICES },
  ];

  return (
    <MainLayout>
      <div className="container mx-auto py-12 px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-white italic mb-4 uppercase tracking-tighter text-glow">
            ⚫🧪 HAVERTZ.DXT — SERVIÇOS & UPGRADES 🧪⚫
          </h1>
          <p className="text-zinc-500 max-w-2xl mx-auto italic">
            Processamento manual e atendimento personalizado.
          </p>
        </div>

        <div className="space-y-20">
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
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card className="group hover:border-zinc-700 bg-zinc-950/50">
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
                        <Badge variant="outline" className="border-neon-green/50 text-neon-green">🧪</Badge>
                      </div>
                      
                      <div className="mt-auto pt-4 border-t border-zinc-900 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] text-zinc-600 uppercase font-black tracking-[0.2em]">Valor</p>
                          <p className="text-xl font-black text-white">{formatCurrency(product.price)}</p>
                        </div>
                        <Button 
                          variant="neon" 
                          size="sm" 
                          className="font-bold italic"
                          onClick={() => handleBuy(product.id)}
                        >
                          COMPRAR <ShoppingCart className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
              {section.footer && (
                <p className="mt-4 text-xs text-zinc-600 uppercase font-black text-right tracking-[0.3em]">{section.footer}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
