import { Product } from '../types';

export const SERVICES_UPGRADES: Product[] = [
  { id: 'upgrade-age', name: 'AGE', price: 36.90, category: 'service', type: 'UPGRADES IMVU', requirements: { imvu_nick: true } },
  { id: 'upgrade-ap', name: 'AP', price: 60.00, category: 'service', type: 'UPGRADES IMVU', requirements: { imvu_nick: true } },
  { id: 'upgrade-nft', name: 'NFT', price: 8.90, category: 'service', type: 'UPGRADES IMVU', requirements: { imvu_nick: true } },
  { id: 'upgrade-vip-plata', name: 'VIP PLATA', price: 39.90, category: 'service', type: 'UPGRADES IMVU', requirements: { imvu_nick: true } },
];

export const FOLLOWERS_IMVU_BASIC: Product[] = [
  { id: 'followers-imvu-1k', name: '1K Seguidores IMVU', price: 6.90, category: 'service', type: 'SEGUIDORES IMVU', requirements: { imvu_nick: true } },
  { id: 'followers-imvu-5k', name: '5K Seguidores IMVU', price: 16.90, category: 'service', type: 'SEGUIDORES IMVU', requirements: { imvu_nick: true } },
  { id: 'followers-imvu-10k', name: '10K Seguidores IMVU', price: 24.90, category: 'service', type: 'SEGUIDORES IMVU', requirements: { imvu_nick: true } },
];

export const FOLLOWERS_INSTAGRAM_BASIC: Product[] = [
  { id: 'followers-ig-1k', name: '1K Seguidores Instagram', price: 10.90, category: 'service', type: 'SEGUIDORES INSTAGRAM', requirements: { instagram_handle: true } },
];

export const STREAMING_SERVICES: Product[] = [
  { id: 'stream-netflix-priv', name: 'Netflix privada', price: 15.90, category: 'service', type: 'STREAMING & SERVIÇOS', requirements: { access_email: true } },
  { id: 'stream-netflix-prem', name: 'Netflix premium', price: 9.90, category: 'service', type: 'STREAMING & SERVIÇOS', requirements: { access_email: true } },
  { id: 'stream-disney-std', name: 'Disney padrão', price: 9.90, category: 'service', type: 'STREAMING & SERVIÇOS', requirements: { access_email: true } },
  { id: 'stream-disney-prem', name: 'Disney premium', price: 12.90, category: 'service', type: 'STREAMING & SERVIÇOS', requirements: { access_email: true } },
  { id: 'stream-paramount', name: 'Paramount', price: 9.90, category: 'service', type: 'STREAMING & SERVIÇOS', requirements: { access_email: true } },
  { id: 'stream-playplus', name: 'Play Plus', price: 9.90, category: 'service', type: 'STREAMING & SERVIÇOS', requirements: { access_email: true } },
  { id: 'stream-prime', name: 'Prime Video', price: 8.90, category: 'service', type: 'STREAMING & SERVIÇOS', requirements: { access_email: true } },
  { id: 'stream-premiere', name: 'Premiere', price: 9.90, category: 'service', type: 'STREAMING & SERVIÇOS', requirements: { access_email: true } },
  { id: 'stream-paramount-plus', name: 'Paramount+', price: 8.90, category: 'service', type: 'STREAMING & SERVIÇOS', requirements: { access_email: true } },
  { id: 'stream-globoplay-canais', name: 'Globoplay + canais', price: 12.90, category: 'service', type: 'STREAMING & SERVIÇOS', requirements: { access_email: true } },
  { id: 'stream-globoplay', name: 'Globoplay', price: 9.90, category: 'service', type: 'STREAMING & SERVIÇOS', requirements: { access_email: true } },
  { id: 'tool-canva', name: 'Canva Pro', price: 2.50, category: 'service', type: 'STREAMING & SERVIÇOS', requirements: { access_email: true } },
  { id: 'tool-capcut', name: 'CapCut Pro', price: 10.90, category: 'service', type: 'STREAMING & SERVIÇOS', requirements: { access_email: true } },
  { id: 'tool-chatgpt', name: 'ChatGPT Pro', price: 19.90, category: 'service', type: 'STREAMING & SERVIÇOS', requirements: { access_email: true } },
];
