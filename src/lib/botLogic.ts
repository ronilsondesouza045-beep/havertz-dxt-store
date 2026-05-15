
export interface BotOption {
  id: string;
  label: string;
  response: string;
  keywords: string[];
}

export const BOT_OPTIONS: BotOption[] = [
  {
    id: 'how_to_buy',
    label: 'Como comprar créditos?',
    response: 'Para comprar, escolha o catálogo desejado (Créditos IMVU, Free Fire, etc), preencha seus dados corretamente e gere o pedido. O pagamento é via Pix e a chave aparece logo após finalizar.',
    keywords: ['comprar', 'créditos', 'como comprar', 'adquirir']
  },
  {
    id: 'pix_info',
    label: 'Como funciona o Pix?',
    response: 'O sistema gera uma chave Pix (Copia e Cola ou QR Code) exclusiva para o seu pedido. Após pagar, o sistema reconhece e inicia o processamento.',
    keywords: ['pix', 'pagamento', 'chave', 'qr code', 'pagar']
  },
  {
    id: 'receipt',
    label: 'Como envio comprovante?',
    response: 'Após o pagamento, envie o comprovante no nosso Instagram oficial @havertz.dxt informando o código do seu pedido para agilizar a conferência.',
    keywords: ['comprovante', 'enviar print', 'mandei o pix', 'print']
  },
  {
    id: 'delivery',
    label: 'Prazo de entrega',
    response: 'O prazo varia conforme o produto. Créditos IMVU costumam cair em minutos após aprovação. Outros serviços podem levar até 24h úteis.',
    keywords: ['prazo', 'tempo', 'demora', 'quando chega', 'entrega']
  },
  {
    id: 'free_fire',
    label: 'Suporte Free Fire',
    response: 'Certifique-se de ter enviado o ID do jogador corretamente. Pedidos com ID errado não podem ser estornados.',
    keywords: ['free fire', 'ff', 'diamantes', 'dimas', 'id']
  },
  {
    id: 'order_status',
    label: 'Ver status do meu pedido',
    response: 'Por favor, digite o código do seu pedido (Ex: #HVZ-123456) para que eu verifique no laboratório.',
    keywords: ['status', 'meu pedido', 'onde esta', 'rastrear', 'codigo']
  }
];

export const BOT_MESSAGES = {
  welcome: 'Olá 👋 Bem-vindo ao suporte HAVERTZ.DXT. Eu sou o DXT Assistente. Escolha uma opção abaixo ou envie sua dúvida.',
  switching_to_human: 'Entendido! Estou transferindo você para um de nossos operadores humanos. Por favor, aguarde um momento...',
  not_found: 'Não consegui identificar sua dúvida. Escolha uma das opções abaixo ou digite "atendente" para falar com um humano.',
  order_info: (code: string, status: string) => `Localizei seu pedido ${code}! O status atual é: ${status.toUpperCase()}.`,
  order_not_found: 'Não encontrei nenhum pedido com esse código no sistema. Verifique se digitou corretamente.',
};
