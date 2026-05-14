import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="border-t border-zinc-900 bg-zinc-950 py-12 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neon-green/10 border border-neon-green/20">
                <span className="text-sm font-bold text-neon-green">H</span>
              </div>
              <span className="text-xl font-bold tracking-tighter text-white">
                HAVERTZ<span className="text-neon-green">.DXT</span>
              </span>
            </Link>
            <p className="text-sm text-zinc-500 leading-relaxed max-w-xs">
              Rotina limpa. Execução precisa. Resultado inevitável. Sua loja premium de créditos IMVU.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-widest">Produtos</h4>
            <ul className="space-y-2 text-sm text-zinc-500">
              <li><Link to="/loja" className="hover:text-neon-green transition-colors">Créditos IMVU</Link></li>
              <li><Link to="/servicos" className="hover:text-neon-green transition-colors">Serviços & Upgrades</Link></li>
              <li><Link to="/produtos-mn" className="hover:text-neon-green transition-colors">Produtos MN</Link></li>
              <li><Link to="/free-fire" className="hover:text-neon-green transition-colors">Free Fire</Link></li>
              <li><Link to="/seguidores" className="hover:text-neon-green transition-colors">Seguidores</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-widest">Suporte</h4>
            <ul className="space-y-2 text-sm text-zinc-500">
              <li><Link to="/#faq" className="hover:text-neon-green transition-colors">FAQ</Link></li>
              <li><a href="https://w.app/cgfqyj" target="_blank" rel="noreferrer" className="hover:text-neon-green transition-colors">WhatsApp Suporte</a></li>
              <li><Link to="/terms" className="hover:text-neon-green transition-colors">Termos de Uso</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-widest">Segurança</h4>
            <ul className="space-y-2 text-sm text-zinc-500">
              <li className="flex items-center space-x-2">
                <div className="h-1.5 w-1.5 rounded-full bg-neon-green" />
                <span>Anti-Ban System</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="h-1.5 w-1.5 rounded-full bg-neon-green" />
                <span>Manual Delivery</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="h-1.5 w-1.5 rounded-full bg-neon-green" />
                <span>Secure Payments</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center text-xs text-zinc-600">
          <p>© {new Date().getFullYear()} HAVERTZ.DXT. Todos os direitos reservados.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
             <span>Desenvolvido com ❤️ para a comunidade</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
