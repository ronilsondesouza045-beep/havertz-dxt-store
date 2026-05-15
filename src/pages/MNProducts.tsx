import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MainLayout } from '../layouts/MainLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { POSES_MN, N_FEMININO_MN, N_MASCULINO_MN, SALAS_MN } from '../constants/mn_products';
import { formatCurrency } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, ExternalLink, ShieldAlert, Heart, User, Home, AlertCircle } from 'lucide-react';
import { InfoNotice } from '../components/ui/InfoNotice';

export default function MNProducts() {
  const navigate = useNavigate();
  const [showAgeGate, setShowAgeGate] = useState(true);

  const handleBuy = (productId: string) => {
    navigate(`/checkout?id=${productId}`);
  };

  const sections = [
    { 
      title: 'POSES', 
      icon: <Heart className="text-pink-500" />, 
      products: POSES_MN,
      notices: [
        { type: 'important' as const, text: 'Envios processados a partir de pedidos com no mínimo 3 poses.' },
        { type: 'security' as const, text: 'Necessário possuir AP + AGE para recebimento seguro dos itens.' }
      ]
    },
    { 
      title: 'N. FEMININOS', 
      icon: <User className="text-neon-purple" />, 
      products: N_FEMININO_MN 
    },
    { 
      title: 'N. MASCULINOS', 
      icon: <User className="text-blue-500" />, 
      products: N_MASCULINO_MN 
    },
    { 
      title: 'SALAS', 
      icon: <Home className="text-neon-green" />, 
      products: SALAS_MN,
      notices: [
        { type: 'important' as const, text: 'Necessário possuir AGE verificado na conta para acesso às salas.' },
        { type: 'alert' as const, text: 'Conteúdo estritamente destinado ao público +18 (NSFW).' },
        { type: 'security' as const, text: 'Alguns itens do catálogo podem requerer permissões especiais.' }
      ]
    },
  ];

  return (
    <MainLayout>
      <AnimatePresence>
        {showAgeGate && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-md w-full bg-zinc-950 border border-zinc-800 p-8 rounded-3xl text-center shadow-[0_0_50px_rgba(57,255,20,0.1)]"
            >
              <div className="h-16 w-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldAlert size={32} />
              </div>
              <h2 className="text-2xl font-black text-white uppercase italic mb-4">Aviso de Conteúdo</h2>
              <p className="text-zinc-500 mb-8 italic">
                Esta seção pode conter produtos destinados a maiores de 18 anos.
              </p>
              <div className="flex flex-col gap-3">
                <Button variant="neon" size="lg" className="font-bold italic" onClick={() => setShowAgeGate(false)}>
                  TENHO 18+ ANOS
                </Button>
                <Button variant="ghost" size="lg" className="font-bold text-zinc-500" onClick={() => navigate('/')}>
                  SAIR
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto py-12 px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-white italic mb-4 uppercase tracking-tighter">
            🧪⬛️ HAVERTZ.DXT — PRODUTOS MN DEXTER EDITION ⬛️🧪
          </h1>
          <p className="text-zinc-500 max-w-2xl mx-auto italic mb-10">
            Itens exclusivos com processamento manual e seguro.
          </p>
          <Button 
              variant="outline" 
              className="border-zinc-800 text-zinc-400 hover:text-white hover:border-white h-12 px-8 font-bold italic uppercase"
              onClick={() => window.open('https://drive.google.com/drive/folders/1dIKLWWUBi-VQFblVZK8ZFRjyvnSA10fS', '_blank')}
          >
              Ver catálogo no Google Drive <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
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
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card className="group hover:border-zinc-700 bg-zinc-950/50">
                      <div className={`mb-4 rounded-xl overflow-hidden border border-zinc-900 bg-zinc-900/50 ${section.title === 'POSES' ? 'aspect-square p-2' : 'aspect-video'}`}>
                        <img 
                          src={
                            product.image_url || (
                              section.title === 'SALAS' 
                                ? "https://i.ytimg.com/vi/ztlWgpX4K_Q/maxresdefault.jpg" 
                                : "https://conteudo.imguol.com.br/c/entretenimento/09/2017/02/17/theon-alfie-allen-fica-nu-em-game-of-thrones---nsfw-1487356056824_v2_750x421.jpg"
                            )
                          } 
                          alt={`${product.name} Preview`}
                          className={`w-full h-full transition-opacity opacity-80 group-hover:opacity-100 ${section.title === 'POSES' ? 'object-contain' : 'object-cover'}`}
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="mb-4 flex justify-between items-start">
                        <h3 className="text-lg font-bold text-white uppercase">{product.name}</h3>
                        <Badge variant="outline" className="border-zinc-800 text-zinc-600">MN</Badge>
                      </div>
                      
                      <div className="mt-auto pt-4 border-t border-zinc-900 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] text-zinc-600 uppercase font-black tracking-[0.2em]">Custo</p>
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
              {section.notices && (
                <div className="mt-8">
                  <InfoNotice notices={section.notices} variant="inline" className="bg-zinc-900/20 p-4 rounded-2xl border border-zinc-800/50" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
