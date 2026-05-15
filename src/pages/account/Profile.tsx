import React, { useEffect, useState } from 'react';
import { MainLayout } from '../../layouts/MainLayout';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { doc, updateDoc } from 'firebase/firestore';
import { db, storage } from '../../lib/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { User, Shield, AtSign, Save, Camera, Trash2, Upload, Loader2 } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../../lib/firestoreErrors';

export default function AccountProfile() {
  const { user, profile } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    imvu_nick: '',
    whatsapp: '',
  });
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("A imagem deve ter no máximo 2MB");
      return;
    }

    setUploadLoading(true);
    try {
      const storageRef = ref(storage, `profile-avatars/${user.uid}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      const profileRef = doc(db, 'profiles', user.uid);
      await updateDoc(profileRef, {
        avatar_url: downloadURL
      });
    } catch (err: any) {
      console.error("Error uploading photo:", err);
      alert("Erro ao enviar foto");
    } finally {
      setUploadLoading(false);
    }
  };

  const removePhoto = async () => {
    if (!user || !profile?.avatar_url) return;
    
    setUploadLoading(true);
    try {
      // Only delete from storage if it's our storage
      if (profile.avatar_url.includes('firebasestorage.googleapis.com')) {
        const storageRef = ref(storage, `profile-avatars/${user.uid}`);
        await deleteObject(storageRef).catch(e => console.log("File might not exist", e));
      }

      const profileRef = doc(db, 'profiles', user.uid);
      await updateDoc(profileRef, {
        avatar_url: null
      });
    } catch (err: any) {
      console.error("Error removing photo:", err);
      alert("Erro ao remover foto");
    } finally {
      setUploadLoading(false);
    }
  };

  const getInitial = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : '?';
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
              <Card className="text-center p-8 bg-zinc-950 flex flex-col items-center">
                 <div className="relative group mb-6">
                    <div className="h-32 w-32 rounded-3xl bg-zinc-900 border-2 border-zinc-800 overflow-hidden flex items-center justify-center relative">
                      {profile?.avatar_url ? (
                        <img 
                          src={profile.avatar_url} 
                          alt="Avatar" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="text-4xl font-black text-zinc-700 italic">
                          {getInitial(profile?.name || '')}
                        </div>
                      )}
                      
                      {uploadLoading && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <Loader2 className="h-8 w-8 text-neon-green animate-spin" />
                        </div>
                      )}
                    </div>
                    
                    <label className="absolute -bottom-2 -right-2 h-10 w-10 bg-neon-green text-black rounded-xl border-4 border-[#09090b] flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-lg shadow-neon-green/20">
                      <Camera className="h-5 w-5" />
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploadLoading} />
                    </label>

                    {profile?.avatar_url && !uploadLoading && (
                      <button 
                        onClick={removePhoto}
                        className="absolute -top-2 -right-2 h-8 w-8 bg-red-500 text-white rounded-lg border-4 border-[#09090b] flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                        title="Remover foto"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                 </div>

                 <h2 className="text-xl font-bold text-white uppercase italic">{profile?.name}</h2>
                 <p className="text-xs text-zinc-500 font-mono mt-1">{profile?.email}</p>
                 
                 <div className="mt-6 flex justify-center w-full">
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
