import React, { useEffect, useState } from 'react';
import { MainLayout } from '../../layouts/MainLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Settings } from '../../types';
import { Save, AlertCircle, ShoppingBag, MessageSquare, Landmark } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../../lib/firestoreErrors';

export default function AdminSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const settingsRef = doc(db, 'settings', 'config');
      const snapshot = await getDoc(settingsRef);
        
      if (snapshot.exists()) {
        setSettings(snapshot.data() as Settings);
      } else {
        // Initialize if not exists
        const initialSettings: Partial<Settings> = {
          pix_key: '',
          pix_name: '',
          whatsapp: '',
          instagram_official: '',
          whatsapp_official: '',
          proof_instructions: '',
          store_notice: '',
          store_open: true
        };
        await setDoc(settingsRef, initialSettings);
        setSettings(initialSettings as Settings);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'settings/config');
    } finally {
      setLoading(false);
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    
    setSaveLoading(true);
    setSuccess(false);

    try {
      const settingsRef = doc(db, 'settings', 'config');
      await updateDoc(settingsRef, {
        pix_key: settings.pix_key,
        pix_name: settings.pix_name,
        whatsapp: settings.whatsapp,
        instagram_official: settings.instagram_official || '',
        whatsapp_official: settings.whatsapp_official || '',
        proof_instructions: settings.proof_instructions || '',
        store_notice: settings.store_notice,
        store_open: settings.store_open,
        updated_at: serverTimestamp()
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      handleFirestoreError(err, OperationType.UPDATE, 'settings/config');
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) return null;

  return (
    <MainLayout>
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-10">
            <h1 className="text-3xl font-black text-white italic uppercase">
               Configurações Gerenciais 🧪
            </h1>
            <p className="text-zinc-500 text-sm italic mt-1">Ajuste os parâmetros da HAVERTZ.DXT.</p>
          </div>

          <form onSubmit={handleUpdate} className="space-y-8">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* PIX Settings */}
                <Card className="p-8 space-y-6">
                   <h3 className="text-lg font-bold text-white uppercase italic flex items-center gap-2">
                      <Landmark className="text-neon-green" /> Dados PIX
                   </h3>
                   <Input 
                     label="Chave PIX" 
                     value={settings?.pix_key} 
                     onChange={(e) => setSettings({ ...settings!, pix_key: e.target.value })}
                     required
                   />
                   <Input 
                     label="Nome do Favorecido" 
                     value={settings?.pix_name} 
                     onChange={(e) => setSettings({ ...settings!, pix_name: e.target.value })}
                     required
                   />
                </Card>

                {/* Contact Settings */}
                <Card className="p-8 space-y-6">
                   <h3 className="text-lg font-bold text-white uppercase italic flex items-center gap-2">
                      <MessageSquare className="text-blue-500" /> Contato
                   </h3>
                   <Input 
                     label="WhatsApp Suporte" 
                     placeholder="5511999999999"
                     value={settings?.whatsapp} 
                     onChange={(e) => setSettings({ ...settings!, whatsapp: e.target.value })}
                     required
                   />
                   <p className="text-[10px] text-zinc-500 leading-relaxed italic">
                      Insira o número apenas com dígitos (ex: 5511999999999). Ele será usado para os links automáticos.
                   </p>
                </Card>
             </div>

             {/* Store Status */}
             <Card className="p-8 space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                   <div className="flex items-center gap-4">
                      <div className={`h-12 w-12 rounded-2xl flex items-center justify-center border ${settings?.store_open ? 'bg-neon-green/10 border-neon-green/30 text-neon-green' : 'bg-red-500/10 border-red-500/30 text-red-500'}`}>
                         <ShoppingBag size={24} />
                      </div>
                      <div>
                         <h3 className="text-lg font-bold text-white uppercase italic">Status da Loja</h3>
                         <p className="text-xs text-zinc-500">Determine se os clientes podem realizar novos pedidos.</p>
                      </div>
                   </div>
                   
                   <div className="inline-flex p-1 bg-zinc-950 border border-zinc-900 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setSettings({ ...settings!, store_open: true })}
                        className={`px-6 py-2 rounded-lg text-xs font-bold uppercase transition-all ${settings?.store_open ? 'bg-neon-green text-black' : 'text-zinc-600'}`}
                      >
                         Aberta
                      </button>
                      <button
                        type="button"
                        onClick={() => setSettings({ ...settings!, store_open: false })}
                        className={`px-6 py-2 rounded-lg text-xs font-bold uppercase transition-all ${!settings?.store_open ? 'bg-red-500 text-white' : 'text-zinc-600'}`}
                      >
                         Fechada
                      </button>
                   </div>
                </div>

                <div className="space-y-4">
                   <label className="text-sm font-medium text-zinc-400 block italic flex items-center gap-2">
                     <AlertCircle size={14} className="text-neon-purple" /> Aviso Geral da Loja (Visível para todos)
                   </label>
                   <textarea 
                     className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-neon-purple/50 min-h-[100px]"
                     value={settings?.store_notice}
                     onChange={(e) => setSettings({ ...settings!, store_notice: e.target.value })}
                     placeholder="Ex: Entrega super rápida hoje!"
                   />
                </div>
             </Card>

             <div className="flex justify-end">
                {success && (
                   <span className="text-neon-green text-sm font-bold uppercase italic mr-6 mt-3 animate-pulse">
                      Configurações aplicadas com sucesso!
                   </span>
                )}
                <Button type="submit" variant="neon" className="h-14 px-12 text-lg font-bold uppercase italic" isLoading={saveLoading}>
                   <Save className="mr-2" /> Salvar Configurações
                </Button>
             </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
}
