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
import { Copy, Check, ShieldCheck, MessageCircle, User, Radio, ExternalLink, ListChecks, ShoppingCart } from 'lucide-react';
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

  const customerName = profile?.name || user?.displayName || (user?.email ? user.email.split('@')[0] : 'Cliente');
  const customerEmail = user?.email || '';

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
        customer_name: customerName,
        customer_email: customerEmail,
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
        is_deleted: false,
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
      <div className="container mx-auto py-8 md:py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <header className="mb-10 text-center md:text-left">
            <h1 className="text-3xl md:text-5xl font-black text-white italic uppercase tracking-tighter leading-none">
              🧪 CHECKOUT <span className="text-neon-green">.DXT</span>
            </h1>
            <p className="text-zinc-500 mt-2 text-xs md:text-sm font-black uppercase tracking-[0.3em]">Ambiente Seguro & Criptografado</p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left Col: PIX & Info */}
            <div className="lg:col-span-2 space-y-10">
              <Card className="border-neon-green/20 bg-gradient-to-br from-zinc-950 to-zinc-900/50 p-6 md:p-10 relative overflow-hidden shadow-[0_30px_70px_rgba(0,0,0,0.7)] group">
                <div className="absolute top-0 right-0 p-6 opacity-30 group-hover:scale-110 transition-transform duration-700">
                   <div className="h-16 w-16 md:h-14 md:w-14 rounded-3xl bg-neon-green/10 flex items-center justify-center border border-neon-green/30 shadow-lg shadow-neon-green/5 ring-8 ring-neon-green/5">
                      <img src="https://logopng.com.br/logos/pix-106.png" className="w-8 h-8 grayscale invert" alt="PIX" referrerPolicy="no-referrer" />
                   </div>
                </div>

                <div className="mb-10 text-center md:text-left">
                  <Badge variant="neon" className="mb-6 px-4 py-1.5 text-xs font-black italic tracking-widest bg-neon-green text-black">PAGAMENTO VIA PIX SELECIONADO</Badge>
                  <h3 className="text-3xl md:text-4xl font-black text-white flex items-center justify-center md:justify-start gap-3 italic uppercase tracking-tighter">
                    Área Pix <span className="text-neon-green">Express</span>
                  </h3>
                  <p className="text-zinc-500 text-xs md:text-sm italic font-medium mt-2">Envio instantâneo após validação do comprovante.</p>
                </div>
                
                {/* PIX Details */}
                <div className="space-y-8">
                  <div className="p-6 md:p-8 rounded-3xl bg-black/60 border border-zinc-800 backdrop-blur-md group-hover:border-neon-green/40 transition-all shadow-inner relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-neon-green shadow-[0_0_15px_#39FF14]" />
                    <p className="text-[10px] text-zinc-500 uppercase font-black tracking-[0.2em] mb-4">Chave PIX (E-mail Mercado Pago)</p>
                    <div className="flex flex-col gap-6">
                      <span className="text-2xl md:text-3xl font-black text-neon-green break-all leading-tight tracking-tight drop-shadow-[0_0_10px_rgba(57,255,20,0.2)]">
                        havertz.dxt@gmail.com
                      </span>
                      <Button 
                        type="button"
                        variant={copied ? "neon" : "primary"} 
                        size={copied ? "md" : "lg"} 
                        onClick={handleCopyPix}
                        className="w-full h-16 md:h-14 font-black italic text-lg md:text-base tracking-widest shadow-2xl transition-all active:scale-95"
                      >
                        {copied ? (
                          <><Check className="mr-3 h-6 w-6" /> COPIADO COM SUCESSO</>
                        ) : (
                          <><Copy className="mr-3 h-6 w-6" /> COPIAR CHAVE PIX</>
                        )}
                      </Button>
                    </div>
                  </div>
  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-6 rounded-3xl bg-black/40 border border-zinc-800 flex flex-col justify-center shadow-lg">
                      <p className="text-[10px] text-zinc-600 uppercase font-black tracking-widest mb-2">Favorecido Pix (Recebedor)</p>
                      <p className="font-black text-white uppercase italic text-xl tracking-tighter leading-none">RONILSON SOUZA</p>
                    </div>
                    <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 flex flex-col justify-center shadow-lg">
                      <p className="text-[10px] text-neon-green uppercase font-black tracking-widest mb-2">Cliente Logado (Pagador)</p>
                      <p className="font-black text-white uppercase italic text-xl tracking-tighter leading-none truncate">{customerName}</p>
                      <p className="text-[10px] text-zinc-500 font-mono mt-1 opacity-60 truncate">{customerEmail}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-10 flex flex-col md:flex-row gap-4">
                  <Button 
                    className="w-full h-16 md:h-14 bg-zinc-100 hover:bg-white text-black font-black italic uppercase text-xs md:text-sm tracking-widest rounded-2xl shadow-xl transition-all active:scale-95"
                    onClick={() => window.open('https://www.instagram.com/havertz.dxt/', '_blank')}
                  >
                    <ExternalLink className="mr-3 h-5 w-5" /> ENVIAR PELO INSTAGRAM
                  </Button>
                </div>

                <div className="mt-10 pt-8 border-t border-zinc-900">
                  <InfoNotice 
                    variant="inline"
                    className="p-1 rounded-full opacity-80"
                    notices={[
                      { type: 'security', text: 'Segurança Mercado Pago' },
                      { type: 'delivery', text: 'Injeção elite manual' },
                      { type: 'important', text: 'Envie o print pelo IG' }
                    ]} 
                  />
                </div>
              </Card>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-10">
                <Card className="p-8 md:p-12 bg-zinc-950/80 border-zinc-900 shadow-3xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-neon-green/5 blur-[120px] rounded-full -mr-32 -mt-32" />
                  
                  <div className="flex items-center gap-4 mb-10">
                    <div className="h-10 w-1.5 bg-neon-green rounded-full shadow-[0_0_20px_#39FF14]" />
                    <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">Dados de Entrega</h3>
                  </div>

                  <div className="grid grid-cols-1 gap-10">
                    <Input
                      label="SEU INSTAGRAM (@usuario)"
                      placeholder="@"
                      required={!!product.requirements?.instagram_handle}
                      value={formData.instagram_handle}
                      onChange={(e) => setFormData({ ...formData, instagram_handle: e.target.value })}
                      className="bg-zinc-900/50 border-zinc-800 focus:border-neon-green/50 h-16 md:h-14 text-lg md:text-base font-bold italic"
                    />

                    {/* Conditional Fields */}
                    {product.requirements?.imvu_nick && (
                      <Input
                        label="MODO DE NICK IMVU (@nick)"
                        placeholder="@"
                        required
                        value={formData.imvu_nick}
                        onChange={(e) => setFormData({ ...formData, imvu_nick: e.target.value })}
                        className="bg-zinc-900/50 border-zinc-800 focus:border-neon-green/50 h-16 md:h-14 text-lg md:text-base font-bold italic"
                      />
                    )}

                    {product.requirements?.player_id && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                          label="ID DO JOGADOR (FF)"
                          placeholder="Digite o ID"
                          required
                          value={formData.player_id}
                          onChange={(e) => setFormData({ ...formData, player_id: e.target.value })}
                          className="bg-zinc-900/50 border-zinc-800 focus:border-neon-green/50 h-16 md:h-14 text-lg md:text-base font-bold italic"
                        />
                        <Input
                          label="NICK NO JOGO (OPCIONAL)"
                          placeholder="Sua Tag"
                          value={formData.player_nick}
                          onChange={(e) => setFormData({ ...formData, player_nick: e.target.value })}
                          className="bg-zinc-900/50 border-zinc-800 focus:border-neon-green/50 h-16 md:h-14 text-lg md:text-base font-bold italic"
                        />
                      </div>
                    )}

                    {product.requirements?.access_email && (
                      <Input
                        label="E-MAIL DE ACESSO (PARA STREAMING)"
                        placeholder="email@servico.com"
                        required
                        type="email"
                        value={formData.access_email}
                        onChange={(e) => setFormData({ ...formData, access_email: e.target.value })}
                        className="bg-zinc-900/50 border-zinc-800 focus:border-neon-green/50 h-16 md:h-14 text-lg md:text-base font-bold italic"
                      />
                    )}
                  </div>

                  <div className="mt-10">
                    <Input
                      label="OBSERVAÇÕES ADICIONAIS (OPCIONAL)"
                      placeholder="Algum detalhe extra para o mestre?"
                      value={formData.note}
                      onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                      className="bg-zinc-900/50 border-zinc-800 focus:border-neon-green/50 h-16 md:h-14 text-lg md:text-base font-bold italic"
                    />
                  </div>
                </Card>

                <div className="space-y-6">
                  <Button 
                    type="submit" 
                    className="w-full h-24 md:h-28 text-2xl md:text-3xl font-black uppercase italic tracking-widest shadow-[0_20px_50px_-10px_rgba(57,255,20,0.2)] hover:shadow-[0_25px_60px_-10px_rgba(57,255,20,0.4)] transition-all active:scale-95 group relative overflow-hidden" 
                    variant="neon"
                    isLoading={loading}
                    disabled={loading}
                  >
                     {loading ? 'MODULANDO PEDIDO...' : (
                       <div className="flex flex-col items-center gap-1">
                          <div className="flex items-center gap-3">
                            <ShieldCheck className="h-8 w-8 md:h-10 md:w-10 group-hover:rotate-12 transition-transform" /> 
                            <span>CRIAR PEDIDO ELITE</span>
                          </div>
                          <span className="text-[10px] opacity-60 font-black tracking-[0.4em] mt-1 italic">Protocolo havertz.xyz</span>
                       </div>
                     )}
                     <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  </Button>
                  
                  <p className="text-center text-[10px] text-zinc-600 uppercase font-black tracking-widest px-4 leading-relaxed">
                     Ao confirmar, seu pedido será registrado em nosso laboratório. Lembre-se de enviar o comprovante Pix pelo Instagram.
                  </p>
                </div>
              </form>
            </div>

            {/* Right Col: Summary */}
            <div className="space-y-8">
              <Card className="sticky top-24 p-8 md:p-10 bg-zinc-950 border-zinc-900 overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.8)] border-t border-t-zinc-800">
                <div className="absolute top-0 right-0 w-32 h-32 bg-neon-green/5 blur-3xl rounded-full -mr-16 -mt-16" />
                
                <h3 className="text-xl md:text-2xl font-black text-white mb-10 border-b border-zinc-900/50 pb-6 uppercase italic tracking-tighter flex items-center gap-3">
                  <ShoppingCart size={24} className="text-neon-green" /> Resumo Elite
                </h3>
                
                <div className="space-y-10">
                  <div className="flex items-center gap-6 group">
                    <div className="h-24 w-24 md:h-20 md:w-20 rounded-[2rem] bg-zinc-900 border border-zinc-800 flex items-center justify-center text-neon-green p-1 shadow-inner overflow-hidden transition-transform group-hover:rotate-2">
                       {product.image_url ? (
                         <img 
                           src={product.image_url} 
                           alt={product.name} 
                           className="h-full w-full object-cover rounded-[1.5rem] brightness-90 group-hover:brightness-110 transition-all"
                           referrerPolicy="no-referrer"
                         />
                       ) : (
                         product.category === 'credits' ? <User size={32} /> : <Radio size={32} />
                       )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-white font-black text-lg md:text-xl uppercase italic leading-none tracking-tighter group-hover:text-neon-green transition-colors">{product.name}</p>
                      <Badge variant="info" className="text-[10px] uppercase font-black tracking-widest mt-2">{product.category.replace('_', ' ')}</Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-4 pt-6 border-t border-zinc-900/50">
                    <div className="flex flex-col gap-1 px-4 py-3 rounded-2xl bg-zinc-900/30 border border-zinc-900">
                      <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">Identificação do Cliente</span>
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-white italic tracking-tighter uppercase">{customerName}</span>
                        <span className="text-[10px] text-zinc-500 font-mono truncate">{customerEmail}</span>
                      </div>
                    </div>

                    {(formData.imvu_nick || formData.player_id || formData.instagram_handle) && (
                      <div className="flex flex-col gap-1 px-4 py-3 rounded-2xl bg-zinc-900/30 border border-zinc-900">
                        <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">Identificador Informado</span>
                        <span className="text-sm font-black text-white italic tracking-tighter uppercase">
                          {formData.imvu_nick || formData.player_id || formData.instagram_handle}
                        </span>
                      </div>
                    )}

                    {formData.note && (
                      <div className="flex flex-col gap-1 px-4 py-3 rounded-2xl bg-zinc-900/30 border border-zinc-900">
                        <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">Observação</span>
                        <span className="text-xs text-zinc-400 font-medium italic leading-relaxed">{formData.note}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center px-4">
                      <span className="text-zinc-600 font-black uppercase text-[10px] tracking-widest">Investimento Base</span>
                      <span className="text-zinc-300 font-black italic text-base">{formatCurrency(product.price)}</span>
                    </div>
                    <div className="flex justify-between items-center px-4">
                      <span className="text-zinc-600 font-black uppercase text-[10px] tracking-widest">Protocolo de Entrega</span>
                      <span className="text-neon-green font-black italic text-xs tracking-widest">SEM TAXAS</span>
                    </div>
                    <div className="pt-4 flex flex-col items-center gap-2">
                      <span className="text-zinc-500 font-black uppercase text-[10px] tracking-widest leading-none">Total Unificado</span>
                      <div className="text-center">
                        <span className="text-5xl md:text-4xl font-black text-white italic tracking-tighter leading-none drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                          {formatCurrency(product.price)}
                        </span>
                        <div className="flex items-center justify-center gap-2 mt-3 bg-zinc-900/50 px-4 py-2 rounded-xl border border-zinc-800">
                          <img src="https://logopng.com.br/logos/pix-106.png" className="w-3 h-3 grayscale invert opacity-50" alt="" referrerPolicy="no-referrer" />
                          <span className="text-[10px] text-zinc-500 font-black uppercase tracking-tighter italic">Válido para Pix Hoje</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-12 p-6 bg-zinc-900/30 border border-zinc-900 rounded-[2rem] space-y-4">
                   <div className="flex items-center gap-3">
                      <ListChecks size={20} className="text-neon-green" />
                      <span className="text-xs text-white font-black uppercase tracking-widest italic">Checklist Final</span>
                   </div>
                   <ul className="space-y-3">
                     <li className="flex items-start gap-3 text-xs text-zinc-400 font-medium italic">
                       <span className="h-1.5 w-1.5 rounded-full bg-neon-green mt-1.5 shrink-0 shadow-[0_0_5px_#39FF14]" />
                       O pedido será registrado no laboratório.
                     </li>
                     <li className="flex items-start gap-3 text-xs text-zinc-200 font-black italic">
                       <span className="h-1.5 w-1.5 rounded-full bg-neon-green mt-1.5 shrink-0 shadow-[0_0_5px_#39FF14]" />
                       Mande o print no IG @havertz.dxt
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
