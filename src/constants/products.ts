import { Product } from '../types';

export const PRICE_DIRETO_PER_K = 2.80;
export const PRICE_PRESENTE_PER_K = 1.80;

const amounts = [5, 10, 15, 20, 25, 30, 40, 50, 60, 70, 80, 90, 100];

export const PRODUCTS_DIRETO: Product[] = amounts.map(amount => ({
  id: `direto-${amount}k`,
  name: `${amount}K Créditos Direto`,
  amount_k: amount,
  price: amount * PRICE_DIRETO_PER_K,
  type: 'DIRETO',
  category: 'credits',
  requirements: { imvu_nick: true }
}));

export const PRODUCTS_PRESENTE: Product[] = amounts.map(amount => ({
  id: `presente-${amount}k`,
  name: `${amount}K Créditos Presente`,
  amount_k: amount,
  price: amount * PRICE_PRESENTE_PER_K,
  type: 'PRESENTE',
  category: 'credits',
  image_url: 'https://cdn.ggmax.com.br/images/ed8e2aedf73abb51943c86aa4f28ed7a.sm.jpg',
  requirements: { imvu_nick: true }
}));
