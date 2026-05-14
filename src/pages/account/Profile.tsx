import React, { useEffect, useState } from 'react';
import { MainLayout } from '../../layouts/MainLayout';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { User, Shield, AtSign, Save } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../../lib/firestoreErrors';

export default function AccountProfile() {
  const { user, profile } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    imvu_nick: '',
    whatsapp: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        imvu_nick: profile.imvu_nick || '',
        whatsapp: profile.whatsapp || '',
      });
    }
  }, [profile]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    setSuccess(false);

    try {
      const profileRef = doc(db, 'profiles', user.uid);
      await updateDoc(profileRef, {
        name: formData.name,
        imvu_nick: formData.imvu_nick,
        whatsapp: formData.whatsapp,
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      handleFirestoreError(err, OperationType.UPDATE, `profiles/${user.uid}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-10">
            <h1 className="text-3xl font-black text-white italic uppercase">
               Perfil do Agente 🧪
            </h1>
            <p className="text-zinc-500 text-sm italic mt-1">Gerencie suas informações de acesso.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sidebar info */}
            <div className="space-y-6">
              <Card className="text-center p-8 bg-zinc-950">
                 <div className="h-20 w-20 rounded-2xl bg-neon-green/10 border border-neon-green/20 flex items-center justify-center mx-auto mb-4">
                   <User className="h-10 w-10 text-neon-green" />
                 </div>
                 <h2 className="text-xl font-bold text-white uppercase italic">{profile?.name}</h2>
                 <p className="text-xs text-zinc-500 font-mono mt-1">{profile?.email}</p>
                 <div className="mt-6 flex justify-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                      <Shield className="h-3 w-3" /> {profile?.role} Access
                    </div>
                 </div>
              </Card>

              <div className="flex flex-col gap-2">
                 <Button variant="ghost" className="justify-start text-xs uppercase font-bold" onClick={() => window.location.href='/account/orders'}>
                    Histórico de Pedidos
                 </Button>
                 <Button variant="ghost" className="justify-start text-xs uppercase font-bold text-red-500 hover:bg-red-500/10 hover:text-red-500">
                    Excluir Conta
                 </Button>
              </div>
            </div>

            {/* Profile Form */}
            <div className="lg:col-span-2">
              <Card className="p-8">
                <form onSubmit={handleUpdate} className="space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="Nome Completo"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                      <Input
                        label="Nick IMVU Primário"
                        placeholder="@nickname"
                        value={formData.imvu_nick}
                        onChange={(e) => setFormData({ ...formData, imvu_nick: e.target.value })}
                        required
                      />
                      <Input
                        label="WhatsApp"
                        placeholder="(00) 00000-0000"
                        value={formData.whatsapp}
                        onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                      />
                   </div>

                   <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center gap-4 opacity-70">
                      <AtSign className="h-5 w-5 text-zinc-500" />
                      <div>
                        <p className="text-xs text-zinc-600 font-black uppercase">E-mail (Imutável)</p>
                        <p className="text-sm font-bold text-zinc-400">{profile?.email}</p>
                      </div>
                   </div>

                   {success && (
                      <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500 text-sm">
                         Perfil atualizado com sucesso!
                      </div>
                   )}

                   <Button type="submit" variant="neon" className="w-full sm:w-auto h-12 px-10" isLoading={loading}>
                      <Save className="mr-2 h-5 w-5" /> SALVAR ALTERAÇÕES
                   </Button>
                </form>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
