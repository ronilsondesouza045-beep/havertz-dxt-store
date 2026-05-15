
export interface BotOption {
  id: string;
  label: string;
  responses: string[];
  keywords: string[];
}

export const NETFLIX_CONFIG = {
  expireDay: 30,
  email: 'souzaroni187@gmail.com',
  password: 'ronichave123',
  instagram: '@ironi_ofc',
  instagramLink: 'https://www.instagram.com/ironi_ofc/'
};

export function getNetflixResponse(latestCode?: string | null, receivedAt?: string | null) {
  const now = new Date();
  const currentDay = now.getDate();

  if (currentDay > NETFLIX_CONFIG.expireDay) {
    return '🎬 A Netflix gratuita do momento já expirou. Aguarde uma nova liberação ou entre em contato pelo Instagram @ironi_ofc.';
  }

  if (latestCode) {
    let timeInfo = '';
    if (receivedAt) {
       const receivedDate = new Date(receivedAt);
       const diffSeconds = Math.floor((now.getTime() - receivedDate.getTime()) / 1000);
       
       if (diffSeconds < 60) {
         timeInfo = ` (Recebido há ${diffSeconds} segundos)`;
       } else {
         const diffMinutes = Math.floor(diffSeconds / 60);
         timeInfo = ` (Recebido há ${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''})`;
       }
    }

    return `✅ **CÓDIGO LOCALIZADO!**${timeInfo}\n\n🔑 Seu código é: **${latestCode}**\n\n📌 *Dica: Use rápido na Netflix antes que expire!* 🚀`;
  }

  return `🎬 Netflix gratuita disponível!\n\n📧 E-mail: ${NETFLIX_CONFIG.email}\n🔑 Senha: ${NETFLIX_CONFIG.password}\n\n📖 INSTRUÇÕES:\n1. Tente logar com os dados acima.\n2. Se pedir código de acesso, clique em "Enviar Código" na Netflix.\n3. Após clicar lá, volte aqui e selecione: "🔍 BUSCAR CÓDIGO AGORA".\n\n⚠️ Disponível até o dia ${NETFLIX_CONFIG.expireDay}.`;
}

export const BOT_OPTIONS: BotOption[] = [
  {
    id: 'netflix_free',
    label: '🎬 Netflix gratuita',
    responses: [],
    keywords: ['netflix', 'gratis', 'gratuita', 'codigo', 'senha', 'conta']
  },
  {
    id: 'check_netflix_code',
    label: '🔍 BUSCAR CÓDIGO AGORA',
    responses: [],
    keywords: ['buscar', 'verificar', 'codigo agora']
  },
  {
    id: 'how_to_buy',
    label: 'Como comprar?',
    responses: [
      'Escolha o catálogo, preencha os dados corretamente, crie o pedido, faça o Pix e envie o comprovante no Instagram oficial @havertz.dxt.',
      'O processo é simples: escolha o catálogo, preencha seus dados, gere o pedido e mande o comprovante no insta @havertz.dxt.',
      'Boa! Selecione seu produto no catálogo, preencha os dados e finalize o pedido. Depois envie o comprovante no Instagram @havertz.dxt.'
    ],
    keywords: ['comprar', 'como comprar', 'adquirir', 'pedido', 'compra']
  },
  {
    id: 'pix_info',
    label: 'Pix',
    responses: [
      'A chave Pix aparece no checkout logo após você criar o seu pedido.',
      'Basta finalizar o pedido que o sistema mostra a chave Pix (Copia e Cola) na hora!',
      'O pagamento é via Pix. A chave exclusiva do seu pedido aparece na última tela do checkout.'
    ],
    keywords: ['pix', 'pagamento', 'chave', 'pagar', 'efetuar']
  },
  {
    id: 'receipt',
    label: 'Comprovante',
    responses: [
      'Envie o comprovante no Instagram @havertz.dxt com o número do pedido. Isso agiliza muito o atendimento!',
      'Mande o print do comprovante lá no Direct do @havertz.dxt informando o código da compra.',
      'O comprovante deve ser enviado no nosso Instagram oficial @havertz.dxt junto com o ID do pedido.'
    ],
    keywords: ['comprovante', 'enviar print', 'mandei o pix', 'print', 'comprovar', 'mandei']
  },
  {
    id: 'delivery',
    label: 'Prazo de entrega',
    responses: [
      'Após a confirmação do pagamento, o pedido entra em análise e a entrega é iniciada o mais rápido possível.',
      'Nosso prazo costuma ser rápido. Assim que seu Pix for confirmado, o pedido já entra em processamento.',
      'O prazo varia conforme a fila, mas entregamos tudo com segurança após a validação do pagamento.'
    ],
    keywords: ['prazo', 'tempo', 'demora', 'quando chega', 'entrega', 'demorar']
  },
  {
    id: 'free_fire',
    label: 'Free Fire',
    responses: [
      'Para Free Fire, informe o ID do jogador corretamente no formulário de compra.',
      'Recarga de Dimas? Basta informar o ID certinho para que o sistema processe sua entrega.',
      'Atenção mestre: confira seu ID do Free Fire antes de finalizar o pedido!'
    ],
    keywords: ['free fire', 'ff', 'diamantes', 'dimas', 'id', 'recarga']
  },
  {
    id: 'followers',
    label: 'Seguidores',
    responses: [
      'Para pedidos de seguidores, informe corretamente o @perfil ou @nick do Instagram.',
      'Quer bombar o Insta? Informe o seu @perfil e lembre-se de deixá-lo público durante o envio.',
      'Selecione o pacote, informe o @perfil desejado e aguarde a mágica acontecer!'
    ],
    keywords: ['seguidores', 'instagram', 'insta', 'seguidor', 'perfil', 'popularidade']
  },
  {
    id: 'mn_products',
    label: 'Produtos MN',
    responses: [
      'Nossos produtos MN são exclusivos e de alta qualidade. Confira as opções no catálogo do site.',
      'Os melhores recursos MN você encontra aqui. Escolha o seu e garanta sua vantagem.',
      'A linha MN oferece qualidade superior e entrega garantida para seu perfil.'
    ],
    keywords: ['mn', 'produto mn', 'recursos', 'recursos mn']
  }
];

export const BOT_MESSAGES = {
  welcome: 'Olá 👋 Bem-vindo ao suporte HAVERTZ.DXT. Escolha uma opção abaixo ou envie sua dúvida.',
  switching_to_human: 'Certo! Vou deixar sua conversa disponível para atendimento manual. Aguarde a equipe responder.',
  not_found: 'Não entendi totalmente sua dúvida. Você pode escolher uma opção abaixo ou clicar em "Falar com atendente".',
};
