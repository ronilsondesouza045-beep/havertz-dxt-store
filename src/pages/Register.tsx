import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { MainLayout } from '../layouts/MainLayout';
import { UserPlus, Chrome } from 'lucide-react';
import { isAdminEmail } from '../constants/admins';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrors';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    imvu_nick: '',
  });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Sign up user
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      if (user) {
        // Update display name
        await updateProfile(user, { displayName: formData.name });

        // 2. Create profile entry in Firestore
        const profileData = {
          id: user.uid,
          name: formData.name,
          email: formData.email,
          imvu_nick: formData.imvu_nick,
          role: isAdminEmail(formData.email) ? 'admin' : 'client',
          created_at: new Date().toISOString()
        };

        try {
          await setDoc(doc(db, 'profiles', user.uid), profileData);
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `profiles/${user.uid}`);
        }
      }

      navigate('/account');
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(null);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (user) {
        // Check if profile exists, if not create it
        const profileData = {
          id: user.uid,
          name: user.displayName || '',
          email: user.email || '',
          avatar_url: user.photoURL || '',
          imvu_nick: '', // Initially empty for Google login
          role: isAdminEmail(user.email || '') ? 'admin' : 'client',
          created_at: new Date().toISOString()
        };

        try {
          await setDoc(doc(db, 'profiles', user.uid), profileData, { merge: true });
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `profiles/${user.uid}`);
        }
      }

      navigate('/account');
    } catch (err: any) {
      setError(err.message || 'Erro ao entrar com Google');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto flex items-center justify-center py-10 md:py-20 px-4 md:px-0">
        <Card className="w-full max-w-md p-6 md:p-10">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-black text-white mb-3 uppercase italic tracking-tighter">Criar Conta 🧪</h1>
            <p className="text-zinc-500 text-base italic">Junte-se à elite dos créditos IMVU.</p>
          </div>

          <div className="space-y-4 mb-10">
            <Button 
              type="button" 
              className="w-full h-14 bg-white text-black hover:bg-zinc-200 text-base font-bold"
              onClick={handleGoogleSignIn}
              isLoading={googleLoading}
            >
              <Chrome className="mr-3 h-6 w-6" /> ENTRAR COM O GOOGLE
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-zinc-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#09090b] px-4 text-zinc-500">ou preencha os dados</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            <Input
              label="Nome Completo"
              placeholder="Seu nome completo"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="text-lg"
            />
            <Input
              label="E-mail"
              type="email"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="text-lg"
            />
            <Input
              label="IMVU Nick"
              placeholder="@nickname"
              value={formData.imvu_nick}
              onChange={(e) => setFormData({ ...formData, imvu_nick: e.target.value })}
              required
              className="text-lg"
            />
            <Input
              label="Senha"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              className="text-lg"
            />

            {error && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm italic font-medium text-center">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full h-16 text-lg font-black uppercase italic tracking-wide" variant="neon" isLoading={loading}>
              <UserPlus className="mr-3 h-6 w-6" /> CADASTRAR CONTA
            </Button>
          </form>

          <p className="mt-10 text-center text-base text-zinc-500">
            Já tem uma conta?{' '}
            <Link to="/login" className="text-neon-green hover:underline font-bold">
              Faça login
            </Link>
          </p>
        </Card>
      </div>
    </MainLayout>
  );
}
