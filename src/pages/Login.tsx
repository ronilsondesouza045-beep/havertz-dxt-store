import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { MainLayout } from '../layouts/MainLayout';
import { LogIn, Chrome } from 'lucide-react';
import { isAdminEmail } from '../constants/admins';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrors';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/account');
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login');
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
        // Create profile if it doesn't exist (merge: true)
        const profileData = {
          id: user.uid,
          name: user.displayName || '',
          email: user.email || '',
          avatar_url: user.photoURL || '',
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
            <h1 className="text-3xl md:text-4xl font-black text-white mb-3 italic uppercase tracking-tighter">Acesso 🧪</h1>
            <p className="text-zinc-500 text-base italic">Acesse sua conta para gerenciar seus pedidos.</p>
          </div>

          <div className="space-y-4 mb-10 text-zinc-400">
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
                <span className="bg-[#09090b] px-4 text-zinc-500">ou use seu e-mail</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <Input
              label="E-mail"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="text-lg"
            />
            <Input
              label="Senha"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="text-lg"
            />

            {error && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center italic font-medium">
                {error}
              </div>
            )}

            <div className="text-right">
              <Link to="/forgot-password" className="text-sm text-neon-green hover:underline italic font-bold">
                Esqueceu sua senha?
              </Link>
            </div>

            <Button type="submit" className="w-full h-16 text-lg font-black italic tracking-wide" variant="neon" isLoading={loading}>
              <LogIn className="mr-3 h-6 w-6" /> ACESSAR MINHA CONTA
            </Button>
          </form>

          <p className="mt-10 text-center text-base text-zinc-500">
            Não tem uma conta?{' '}
            <Link to="/register" className="text-neon-green hover:underline font-bold">
              Crie agora
            </Link>
          </p>
        </Card>
      </div>
    </MainLayout>
  );
}
