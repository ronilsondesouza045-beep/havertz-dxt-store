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
  ];

  if (user) {
    navLinks.push({ label: 'Suporte', path: '/account/support' });
    navLinks.push({ label: 'Meus Pedidos', path: '/account/orders' });
    if (isAdmin) {
      navLinks.push({ label: 'Admin', path: '/admin' });
      navLinks.push({ label: 'Chat Admin', path: '/admin/chat' });
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
                <Button variant="ghost" size="sm" className="space-x-2">
                  <User className="h-4 w-4" />
                  <span>{profile?.name?.split(' ')[0]}</span>
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={() => signOut()}>
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
          className="md:hidden text-zinc-400 hover:text-white"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-16 left-0 w-full border-b border-zinc-800 bg-dark-bg p-4 md:hidden"
          >
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`text-lg font-medium ${
                    location.pathname === link.path ? 'text-neon-green' : 'text-zinc-400'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <hr className="border-zinc-800" />
              {user ? (
                <div className="flex flex-col space-y-2">
                  <Link to="/account" onClick={() => setIsOpen(false)}>
                    <Button className="w-full justify-start space-x-2" variant="ghost">
                      <User className="h-4 w-4" />
                      <span>Minha Conta</span>
                    </Button>
                  </Link>
                  <Button
                    className="w-full justify-start space-x-2"
                    variant="ghost"
                    onClick={() => {
                      signOut();
                      setIsOpen(false);
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sair</span>
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col space-y-2">
                  <Link to="/login" onClick={() => setIsOpen(false)}>
                    <Button className="w-full" variant="outline">Entrar</Button>
                  </Link>
                  <Link to="/register" onClick={() => setIsOpen(false)}>
                    <Button className="w-full" variant="neon">Criar Conta</Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
