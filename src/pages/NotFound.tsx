import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { MainLayout } from '../layouts/MainLayout';
import { ShieldAlert } from 'lucide-react';

export default function NotFound() {
  return (
    <MainLayout>
      <div className="container mx-auto flex flex-col items-center justify-center py-32 px-4 text-center">
        <div className="h-24 w-24 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-8">
           <ShieldAlert size={48} />
        </div>
        <h1 className="text-6xl font-black text-white italic mb-4 uppercase italic">404</h1>
        <p className="text-zinc-500 text-xl mb-10 font-mono">ACESSO NEGADO OU ROTA INEXISTENTE.</p>
        <Link to="/">
          <Button variant="neon" size="lg" className="px-10 font-bold uppercase italic h-14">
             Voltar para a Base
          </Button>
        </Link>
      </div>
    </MainLayout>
  );
}
