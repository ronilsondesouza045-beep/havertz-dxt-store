import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { MainLayout } from '../layouts/MainLayout';
import { LogIn, Chrome } from 'lucide-react';
import { isAdminEmail } from '../constants/admins';

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
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if profile exists
      const docRef = doc(db, 'profiles', user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        await setDoc(docRef, {
          id: user.uid,
          name: user.displayName || 'Usuário Google',
          email: user.email || '',
          imvu_nick: '',
          role: isAdminEmail(user.email) ? 'admin' : 'client',
          created_at: new Date().toISOString()
        });
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
      <div className="container mx-auto flex items-center justify-center py-20 px-4">
        <Card className="w-full max-w-md p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2 italic uppercase">Acesso 🧪</h1>
            <p className="text-zinc-500 text-sm italic">Acesse sua conta para gerenciar seus pedidos.</p>
          </div>

          <div className="space-y-4 mb-8">
            <Button 
              type="button" 
              className="w-full h-12 bg-white text-black hover:bg-zinc-200"
              onClick={handleGoogleSignIn}
              isLoading={googleLoading}
            >
              <Chrome className="mr-2 h-5 w-5" /> ENTRAR COM O GOOGLE
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-zinc-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-zinc-950 px-2 text-zinc-500">ou use e-mail</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="E-mail"
              type="email"
              placeholder="exemplo@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Senha"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs text-center italic">
                {error}
              </div>
            )}

            <div className="text-right">
              <Link to="/forgot-password" size="sm" className="text-xs text-neon-green hover:underline italic font-bold">
                Esqueceu sua senha?
              </Link>
            </div>

            <Button type="submit" className="w-full h-14 text-lg font-bold italic" variant="neon" isLoading={loading}>
              <LogIn className="mr-2 h-5 w-5" /> ACESSAR MINHA CONTA
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-zinc-500">
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
