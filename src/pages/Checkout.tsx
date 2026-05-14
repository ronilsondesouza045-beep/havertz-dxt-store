import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { doc, getDoc, setDoc, addDoc, collection, query, where, getDocs, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { PRODUCTS_DIRETO, PRODUCTS_PRESENTE } from '../constants/products';
import { SERVICES_UPGRADES, FOLLOWERS_IMVU_BASIC, FOLLOWERS_INSTAGRAM_BASIC, STREAMING_SERVICES } from '../constants/services';
import { POSES_MN, N_FEMININO_MN, N_MASCULINO_MN, SALAS_MN } from '../constants/mn_products';
import { FREE_FIRE_PACKAGES } from '../constants/free_fire';
import { FOLLOWERS_INSTAGRAM, FOLLOWERS_IMVU_FULL } from '../constants/followers';
import { formatCurrency, generateOrderCode } from '../lib/utils';
import { Copy, Check, ShieldCheck, MessageCircle, User, Radio, ExternalLink, ListChecks } from 'lucide-react';
import { InfoNotice } from '../components/ui/InfoNotice';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrors';

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('id');
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdOrderCode, setCreatedOrderCode] = useState('');
  
  const [formData, setFormData] = useState({
    imvu_nick: profile?.imvu_nick || '',
    player_id: '',
    player_nick: '',
    instagram_handle: '',
    access_email: '',
    note: '',
  });

  const allProducts = [
    ...PRODUCTS_DIRETO, 
    ...PRODUCTS_PRESENTE,
    ...SERVICES_UPGRADES,
    ...FOLLOWERS_IMVU_BASIC,
    ...FOLLOWERS_INSTAGRAM_BASIC,
    ...STREAMING_SERVICES,
    ...POSES_MN,
    ...N_FEMININO_MN,
    ...N_MASCULINO_MN,
    ...SALAS_MN,
    ...FREE_FIRE_PACKAGES,
    ...FOLLOWERS_INSTAGRAM,
    ...FOLLOWERS_IMVU_FULL
  ];

  const product = allProducts.find(p => p.id === productId);

  useEffect(() => {
    if (!product) {
      navigate('/');
      return;
    }
    
    const fetchSettings = async () => {
      try {
        const settingsRef = doc(db, 'settings', 'config');
        const docSnap = await getDoc(settingsRef);
        if (docSnap.exists()) {
          setSettings(docSnap.data());
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };
    fetchSettings();
  }, [product, navigate]);

  const handleCopyPix = () => {
    const pixKey = settings?.pix_key || 'havertz.dxt@gmail.com';
    navigator.clipboard.writeText(pixKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert("Você precisa estar logado para finalizar o pedido.");
      return;
    }

    if (!product) {
      return;
    }

    setLoading(true);
    
    const orderCode = generateOrderCode();
    
    try {
      // Determine main field label and value based on product category/type
      let mainFieldLabel = '';
      let mainFieldValue = '';
      
      switch (product.category) {
        case 'credits':
        case 'service':
        case 'produto_mn':
        case 'seguidores':
          if (product.id.includes('instagram')) {
            mainFieldLabel = '@Instagram';
            mainFieldValue = formData.instagram_handle;
          } else {
            mainFieldLabel = 'Nick IMVU';
            mainFieldValue = formData.imvu_nick;
          }
          break;
        case 'free_fire':
          mainFieldLabel = 'ID Jogador';
          mainFieldValue = formData.player_id;
          break;
        case 'streaming':
          mainFieldLabel = 'E-mail de Acesso';
          mainFieldValue = formData.access_email;
          break;
        default:
          mainFieldLabel = 'Identificador';
          mainFieldValue = formData.imvu_nick || formData.player_id || formData.instagram_handle || formData.access_email || 'N/A';
      }

      // 1. Create order in Firestore
      const orderData = {
        order_code: orderCode,
        user_id: user.uid,
        customer_name: profile?.name || user.displayName || 'Cliente',
        customer_email: user.email || '',
        imvu_nick: formData.imvu_nick || '',
        player_id: formData.player_id || '',
        player_nick: formData.player_nick || '',
        instagram_handle: formData.instagram_handle || '',
        access_email: formData.access_email || '',
        product_type: product.type || product.category,
        product_name: product.name,
        product_category: product.category,
        notes: formData.note || '',
        main_field_label: mainFieldLabel,
        main_field_value: mainFieldValue,
        payment_method: 'PIX',
        payment_status: 'aguardando comprovante',
        total_price: product.price,
        amount_k: (product as any).amount_k || 0,
        status: 'aguardando comprovante',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      let orderId = '';
      try {
        const orderRef = await addDoc(collection(db, 'orders'), orderData);
        orderId = orderRef.id;
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, 'orders');
        throw err;
      }

      // 2. Integration with Support Chat
      try {
        const q = query(collection(db, 'support_conversations'), where('customer_email', '==', user.email));
        const querySnapshot = await getDocs(q);
        
        let conversationId = '';
        const supportSubject = `Pedido #${orderCode} — aguardando comprovante`;
        
        if (!querySnapshot.empty) {
          const convDoc = querySnapshot.docs[0];
          conversationId = convDoc.id;
          await updateDoc(doc(db, 'support_conversations', conversationId), {
            subject: supportSubject,
            order_id: orderId,
            order_code: orderCode,
            last_message: 'Pedido criado. Aguardando envio do comprovante pelo cliente.',
            updated_at: new Date().toISOString(),
            status: 'aberta'
          });
        } else {
          const newConvRef = await addDoc(collection(db, 'support_conversations'), {
            user_id: user.uid,
            order_id: orderId,
            order_code: orderCode,
            customer_name: profile?.name || user.email || 'Cliente',
            customer_email: user.email || '',
            subject: supportSubject,
            status: 'aberta',
            last_message: 'Pedido criado. Aguardando envio do comprovante pelo cliente.',
            updated_at: new Date().toISOString()
          });
          conversationId = newConvRef.id;
        }

        if (conversationId) {
          const details = [];
          if (mainFieldLabel && mainFieldValue) {
            details.push(`${mainFieldLabel}: ${mainFieldValue}`);
          }

          const supportMsg = `Olá! Seu pedido foi criado com sucesso.

Número do Pedido: #${orderCode}
Produto: ${product.name}
Valor: ${formatCurrency(product.price)}
Status: aguardando comprovante

${details.length > 0 ? `**Dados informados:**\n${details.join('\n')}` : ''}

Agora envie o comprovante do Pix pelo Instagram oficial informando o número do pedido.

Instagram: @havertz.dxt`;

          await addDoc(collection(db, `support_conversations/${conversationId}/messages`), {
            conversation_id: conversationId,
            sender_type: 'admin',
            sender_id: 'system',
            message: supportMsg,
            read: false,
            created_at: new Date().toISOString()
          });
        }

      } catch (supportErr) {
        console.warn("Pedido salvo, mas suporte não foi criado:", supportErr);
      }

      setCreatedOrderCode(orderCode);
      setShowSuccessModal(true);
      
    } catch (error: any) {
      console.error("ERRO CHECKOUT:", error);
      alert("Erro ao finalizar pedido. Verifique os dados e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSupport = () => {
    window.dispatchEvent(new CustomEvent('openChat'));
    setShowSuccessModal(false);
    navigate('/account/orders');
  };

  if (!product) return null;

  return (
    <MainLayout>
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <header className="mb-10 text-center">
            <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">
              🧪 CHECKOUT <span className="text-neon-green">.DXT</span>
            </h1>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Col: PIX & Info */}
            <div className="lg:col-span-2 space-y-8">
              <Card className="border-neon-green/20 bg-gradient-to-br from-zinc-950 to-zinc-900/50 p-8 relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                <div className="absolute top-0 right-0 p-4 opacity-20">
                   <div className="h-12 w-12 rounded-full bg-neon-green/10 flex items-center justify-center border border-neon-green/20">
                      <img src="https://logopng.com.br/logos/pix-106.png" className="w-6 h-6 grayscale invert" alt="PIX" referrerPolicy="no-referrer" />
                   </div>
                </div>

                <div className="mb-8">
                  <Badge variant="neon" className="mb-4">OPÇÃO PIX SELECIONADA</Badge>
                  <h3 className="text-2xl font-black text-white flex items-center gap-2 italic uppercase">
                    Área Pix Rápido
                  </h3>
                </div>
                
                {/* PIX Details */}
                <div className="space-y-6">
                  <div className="p-6 rounded-2xl bg-black/40 border border-zinc-800 backdrop-blur-sm group hover:border-neon-green/30 transition-all">
                    <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-3">Chave PIX (E-mail Mercado Pago)</p>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-xl md:text-2xl font-mono text-neon-green break-all font-black">
                        havertz.dxt@gmail.com
                      </span>
                      <Button 
                        type="button"
                        variant={copied ? "neon" : "outline"} 
                        size={copied ? "sm" : "default"} 
                        onClick={handleCopyPix}
                        className="flex-shrink-0"
                      >
                        {copied ? (
                          <><Check className="mr-2 h-4 w-4" /> COPIADO</>
                        ) : (
                          <><Copy className="mr-2 h-4 w-4" /> COPIAR PIX</>
                        )}
                      </Button>
                    </div>
                  </div>
  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl bg-black/40 border border-zinc-800">
                      <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-2">Favorecido</p>
                      <p className="font-black text-white uppercase italic text-lg tracking-tight">RONILSON SOUZA</p>
                    </div>
                    <div className="p-5 rounded-2xl bg-neon-green/5 border border-neon-green/20 flex flex-col justify-center">
                       <p className="text-[10px] text-neon-green uppercase font-black tracking-widest mb-1">Aviso importante</p>
                       <p className="text-[11px] text-zinc-300 italic font-medium leading-tight">
                         Após fazer o Pix, envie o comprovante pelo Instagram oficial informando o número do pedido.
                       </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <Button 
                    className="flex-1 bg-[#E1306C] hover:bg-[#C13584] text-white font-black italic uppercase text-xs h-12"
                    onClick={() => window.open('https://www.instagram.com/havertz.dxt/', '_blank')}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" /> Enviar por Instagram
                  </Button>
                </div>

                <div className="mt-8">
                  <InfoNotice 
                    variant="inline"
                    className="p-1 rounded-full"
                    notices={[
                      { type: 'security', text: 'Pagamento processado via Mercado Pago' },
                      { type: 'delivery', text: 'Entrega manual após validação do comprovante' },
                      { type: 'important', text: 'Envie o print pelo Instagram oficial' }
                    ]} 
                  />
                </div>
              </Card>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-8">
                <Card className="p-8 bg-zinc-950/80 border-zinc-900 shadow-xl">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="h-8 w-1 bg-neon-green rounded-full shadow-[0_0_10px_#39FF14]" />
                    <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Dados de Entrega</h3>
                  </div>

                  <div className="grid grid-cols-1 gap-8">
                    <Input
                      label="INSTAGRAM (@perfil)"
                      placeholder="@perfil"
                      required={!!product.requirements?.instagram_handle}
                      value={formData.instagram_handle}
                      onChange={(e) => setFormData({ ...formData, instagram_handle: e.target.value })}
                      className="bg-zinc-900 border-zinc-800 focus:border-neon-green/50"
                    />

                    {/* Conditional Fields */}
                    {product.requirements?.imvu_nick && (
                      <Input
                        label="NICK IMVU (@nickname)"
                        placeholder="@nickname"
                        required
                        value={formData.imvu_nick}
                        onChange={(e) => setFormData({ ...formData, imvu_nick: e.target.value })}
                        className="bg-zinc-900 border-zinc-800 focus:border-neon-green/50"
                      />
                    )}

                    {product.requirements?.player_id && (
                      <Input
                        label="ID DO JOGADOR FREE FIRE"
                        placeholder="ID numérico"
                        required
                        value={formData.player_id}
                        onChange={(e) => setFormData({ ...formData, player_id: e.target.value })}
                        className="bg-zinc-900 border-zinc-800 focus:border-neon-green/50"
                      />
                    )}

                    {product.requirements?.player_id && (
                      <Input
                        label="NOME NO JOGO (OPCIONAL)"
                        placeholder="Sua tag"
                        value={formData.player_nick}
                        onChange={(e) => setFormData({ ...formData, player_nick: e.target.value })}
                        className="bg-zinc-900 border-zinc-800 focus:border-neon-green/50"
                      />
                    )}

                    {product.requirements?.access_email && (
                      <Input
                        label="EMAIL DE ACESSO"
                        placeholder="email@exemplo.com"
                        required
                        type="email"
                        value={formData.access_email}
                        onChange={(e) => setFormData({ ...formData, access_email: e.target.value })}
                        className="bg-zinc-900 border-zinc-800 focus:border-neon-green/50"
                      />
                    )}
                  </div>

                  <div className="mt-8">
                    <Input
                      label="OBSERVAÇÕES ADICIONAIS"
                      placeholder="Algum detalhe extra mestre?"
                      value={formData.note}
                      onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                      className="bg-zinc-900 border-zinc-800 focus:border-neon-green/50"
                    />
                  </div>
                </Card>

                <div className="space-y-4">
                  <Button 
                    type="submit" 
                    className="w-full h-24 text-2xl font-black uppercase italic tracking-widest shadow-[0_10px_30px_-10px_rgba(57,255,20,0.3)] hover:shadow-[0_15px_40px_-10px_rgba(57,255,20,0.5)] transition-all" 
                    variant="neon"
                    isLoading={loading}
                    disabled={loading}
                  >
                     {loading ? 'PROCESSANDO...' : <><ShieldCheck className="mr-3 h-8 w-8" /> CRIAR PEDIDO AGORA</>}
                  </Button>
                  
                  <p className="text-center text-[10px] text-zinc-500 uppercase font-bold tracking-widest">
                     Ao clicar em criar pedido, você concorda em enviar o comprovante pelo Instagram oficial.
                  </p>
                </div>
              </form>
            </div>

            {/* Right Col: Summary */}
            <div className="space-y-6">
              <Card className="sticky top-24 p-8 bg-zinc-950 border-zinc-900 overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-neon-green/5 blur-3xl rounded-full -mr-16 -mt-16" />
                
                <h3 className="text-xl font-black text-white mb-8 border-b border-zinc-900 pb-4 uppercase italic">Resumo do Pedido</h3>
                
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-20 w-20 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-neon-green p-1 shadow-inner overflow-hidden">
                       {product.image_url ? (
                         <img 
                           src={product.image_url} 
                           alt={product.name} 
                           className="h-full w-full object-cover rounded-xl"
                           referrerPolicy="no-referrer"
                         />
                       ) : (
                         product.category === 'credits' ? <User size={24} /> : <Radio size={24} />
                       )}
                    </div>
                    <div>
                      <p className="text-white font-black text-base uppercase italic leading-none">{product.name}</p>
                      <p className="text-[10px] text-neon-purple uppercase font-black mt-2 tracking-widest">{product.category}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 pt-4">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-500 font-bold uppercase">Subtotal</span>
                      <span className="text-white font-mono">{formatCurrency(product.price)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-500 font-bold uppercase">Taxas de Entrega</span>
                      <span className="text-neon-green font-mono">GRÁTIS</span>
                    </div>
                    <div className="flex justify-between items-center text-xs pt-4 border-t border-zinc-900">
                      <span className="text-zinc-200 font-black uppercase text-sm italic">Total a pagar</span>
                      <div className="text-right">
                        <span className="text-3xl font-black text-neon-green block leading-none">
                          {formatCurrency(product.price)}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-bold uppercase">Pagamento via Pix</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-10">
                   <div className="flex items-center gap-2 mb-3">
                      <ListChecks size={16} className="text-neon-green" />
                      <span className="text-[10px] text-white font-black uppercase tracking-widest italic">Protocolos de Segurança</span>
                   </div>
                   <ul className="space-y-2">
                     <li className="flex items-start gap-2 text-[10px] text-zinc-400 font-medium italic">
                       <span className="h-1 w-1 rounded-full bg-neon-green mt-1.5 flex-shrink-0" />
                       Crie o pedido agora para registrar no sistema dex.
                     </li>
                     <li className="flex items-start gap-2 text-[10px] text-zinc-300 font-black italic">
                       <span className="h-1 w-1 rounded-full bg-neon-green mt-1.5 flex-shrink-0" />
                       Envie o comprovante pelo Instagram @havertz.dxt
                     </li>
                   </ul>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <Modal 
        isOpen={showSuccessModal} 
        onClose={() => navigate('/account/orders')} 
        title="PEDIDO CRIADO COM SUCESSO!"
      >
        <div className="text-center space-y-6">
          <div className="h-20 w-20 rounded-full bg-neon-green/10 flex items-center justify-center mx-auto border border-neon-green/20">
            <Check className="text-neon-green h-10 w-10" />
          </div>
          
          <div className="space-y-2">
            <p className="text-white font-bold text-lg uppercase italic leading-tight">
              Seu pedido #{createdOrderCode} foi registrado!
            </p>
            <p className="text-zinc-400 text-sm italic">
              Agora envie o comprovante do Pix pelo Instagram oficial informando o número do pedido.
            </p>
            <p className="text-[#E1306C] font-black text-sm uppercase tracking-widest mt-2">
              Instagram: @havertz.dxt
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 pt-4">
            <Button variant="neon" size="lg" className="w-full font-black uppercase italic bg-[#E1306C] border-none hover:bg-[#C13584]" onClick={() => window.open('https://www.instagram.com/havertz.dxt/', '_blank')}>
              <ExternalLink className="mr-2 h-5 w-5" /> ABRIR INSTAGRAM
            </Button>
            <Button variant="outline" size="lg" className="w-full font-black uppercase italic border-zinc-800" onClick={() => navigate('/account/orders')}>
              <ListChecks className="mr-2 h-5 w-5" /> VER MEUS PEDIDOS
            </Button>
          </div>
        </div>
      </Modal>
    </MainLayout>
  );
}
