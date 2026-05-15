import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { LayoutDashboard, LogOut, Menu, User, X } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function Header() {
  const { user, profile, signOut, isAdmin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { label: 'Início', path: '/' },
    { label: 'Créditos IMVU', path: '/loja' },
    { label: 'Serviços', path: '/servicos' },
    { label: 'Produtos MN', path: '/produtos-mn' },
    { label: 'Free Fire', path: '/free-fire' },
    { label: 'Seguidores', path: '/seguidores' },
    { label: 'Avaliações', path: '/avaliacoes' },
  ];

  if (user) {
    navLinks.push({ label: 'Suporte', path: '/account/support' });
    navLinks.push({ label: 'Meus Pedidos', path: '/account/orders' });
    if (isAdmin) {
      navLinks.push({ label: 'Admin', path: '/admin' });
      navLinks.push({ label: 'Clientes', path: '/admin/clientes' });
      navLinks.push({ label: 'Chats', path: '/admin/chat' });
      navLinks.push({ label: 'Reviews Admin', path: '/admin/avaliacoes' });
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800/50 bg-dark-bg/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neon-green/20 border border-neon-green/30">
            <span className="text-sm font-bold text-neon-green">H</span>
          </div>
          <span className="text-xl font-bold tracking-tighter text-white">
            HAVERTZ<span className="text-neon-green">.DXT</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm font-medium transition-colors hover:text-neon-green ${
                location.pathname === link.path ? 'text-neon-green' : 'text-zinc-400'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-4">
              <Link to="/account">
                <Button variant="ghost" size="sm" className="space-x-2 h-10 px-3 hover:bg-zinc-800">
                  <div className="h-6 w-6 rounded-full overflow-hidden bg-zinc-800 flex items-center justify-center">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="Profile" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <span className="text-[10px] font-black">{profile?.name?.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <span className="font-bold">{profile?.name?.split(' ')[0]}</span>
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={() => signOut()} className="h-10 w-10 p-0 border-zinc-800 hover:bg-red-500/10 hover:text-red-500 transition-colors">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">Entrar</Button>
              </Link>
              <Link to="/register">
                <Button variant="neon" size="sm">Criar Conta</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 text-zinc-400 hover:text-white transition-colors"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 top-16 z-40 bg-black/60 backdrop-blur-sm md:hidden"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-16 z-50 h-[calc(100vh-64px)] w-4/5 max-w-sm border-l border-zinc-800 bg-zinc-950 p-6 shadow-2xl md:hidden"
            >
              <div className="flex flex-col h-full">
                <div className="flex-1 space-y-2 overflow-y-auto pb-6">
                  {navLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center rounded-xl px-4 py-4 text-lg font-medium transition-colors active:bg-zinc-900 ${
                        location.pathname === link.path ? 'bg-neon-green/10 text-neon-green' : 'text-zinc-400'
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
                
                <div className="space-y-4 border-t border-zinc-800 pt-6">
                  {user ? (
                    <div className="flex flex-col space-y-3">
                      <Link to="/account" onClick={() => setIsOpen(false)}>
                        <Button className="w-full justify-start py-4 text-base" variant="ghost">
                          <User className="mr-3 h-5 w-5" />
                          <span>Minha Conta</span>
                        </Button>
                      </Link>
                      <Button
                        className="w-full justify-start py-4 text-base text-red-400 hover:text-red-300"
                        variant="ghost"
                        onClick={() => {
                          signOut();
                          setIsOpen(false);
                        }}
                      >
                        <LogOut className="mr-3 h-5 w-5" />
                        <span>Sair da Conta</span>
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col space-y-3">
                      <Link to="/login" onClick={() => setIsOpen(false)}>
                        <Button className="w-full py-4 text-base" variant="outline">Entrar</Button>
                      </Link>
                      <Link to="/register" onClick={() => setIsOpen(false)}>
                        <Button className="w-full py-4 text-base" variant="neon">Criar Conta</Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
