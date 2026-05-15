
export interface BotOption {
  id: string;
  label: string;
  response: string;
  keywords: string[];
}

export const BOT_OPTIONS: BotOption[] = [
  {
    id: 'how_to_buy',
    label: 'Como comprar?',
    response: 'Escolha um catálogo no site, preencha os dados corretamente, gere o pedido e envie o comprovante no Instagram @havertz.dxt.',
    keywords: ['comprar', 'como comprar', 'adquirir', 'pedido']
  },
  {
    id: 'pix_info',
    label: 'Como funciona Pix?',
    response: 'A chave Pix (Copia e Cola ou QR Code) aparece no checkout logo após você criar o seu pedido no site.',
    keywords: ['pix', 'pagamento', 'chave', 'pagar']
  },
  {
    id: 'receipt',
    label: 'Como envio comprovante?',
    response: 'O comprovante deve ser enviado no nosso Instagram oficial @havertz.dxt junto com o número do seu pedido.',
    keywords: ['comprovante', 'enviar print', 'mandei o pix', 'print', 'comprovar']
  },
  {
    id: 'delivery',
    label: 'Prazo de entrega',
    response: 'Após a confirmação do pagamento, o pedido entra em análise e a entrega é iniciada. O prazo varia conforme o produto.',
    keywords: ['prazo', 'tempo', 'demora', 'quando chega', 'entrega']
  },
  {
    id: 'free_fire',
    label: 'Free Fire',
    response: 'Para pedidos de Free Fire, envie corretamente o ID do jogador para evitar erros no processamento.',
    keywords: ['free fire', 'ff', 'diamantes', 'dimas', 'id']
  },
  {
    id: 'followers',
    label: 'Seguidores',
    response: 'Para pedidos de seguidores, envie corretamente o @perfil ou @nick do Instagram.',
    keywords: ['seguidores', 'instagram', 'insta', 'seguidor', 'perfil']
  },
  {
    id: 'mn_products',
    label: 'Produtos MN',
    response: 'Nossos produtos MN são de alta qualidade e entrega garantida. Escolha o seu no catálogo do site.',
    keywords: ['mn', 'produto mn', 'recursos']
  }
];

export const BOT_MESSAGES = {
  welcome: 'Olá 👋 Bem-vindo ao suporte HAVERTZ.DXT. Eu sou o DXT Assistente. Escolha uma opção abaixo ou envie sua dúvida.',
  switching_to_human: 'Entendido! Estou transferindo você para um de nossos operadores. Por favor, envie sua dúvida e aguarde.',
  not_found: 'Não consegui identificar sua dúvida. Escolha uma das opções abaixo ou digite "atendente" para falar com um humano.',
};
