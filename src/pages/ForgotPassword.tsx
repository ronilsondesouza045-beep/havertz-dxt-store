import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { MainLayout } from '../layouts/MainLayout';
import { Mail } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar e-mail');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto flex items-center justify-center py-20 px-4">
        <Card className="w-full max-w-md p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Recuperar Senha</h1>
            <p className="text-zinc-500">Enviaremos um link de recuperação para seu e-mail.</p>
          </div>

          {success ? (
            <div className="text-center space-y-6">
              <div className="p-4 rounded-lg bg-neon-green/10 border border-neon-green/20 text-neon-green text-sm">
                E-mail de recuperação enviado com sucesso! Verifique sua caixa de entrada.
              </div>
              <Link to="/login">
                <Button variant="outline" className="w-full">Voltar para Login</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <Input
                label="E-mail"
                type="email"
                placeholder="exemplo@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full h-12" variant="neon" isLoading={loading}>
                <Mail className="mr-2 h-5 w-5" /> RECOBRAR SENHA
              </Button>

              <div className="text-center">
                <Link to="/login" className="text-sm text-zinc-500 hover:text-neon-green">
                  Voltar para login
                </Link>
              </div>
            </form>
          )}
        </Card>
      </div>
    </MainLayout>
  );
}
