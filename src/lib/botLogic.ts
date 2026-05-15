
export interface BotOption {
  id: string;
  label: string;
  responses: string[];
  keywords: string[];
}

export const BOT_OPTIONS: BotOption[] = [
  {
    id: 'how_to_buy',
    label: 'Comprar',
    responses: [
      'Escolha um catálogo no site, selecione o produto, preencha os dados e gere seu pedido. O Pix aparece no final!',
      'Para comprar, navegue pelos nossos catálogos, selecione o item desejado e siga o checkout. É rápido e seguro.',
      'Boa! O passo a passo é simples: escolha o catálogo, preencha seus dados corretamente e gere o pedido no site.'
    ],
    keywords: ['comprar', 'como comprar', 'adquirir', 'pedido', 'compra']
  },
  {
    id: 'pix_info',
    label: 'Pix',
    responses: [
      'A chave Pix (Copia e Cola ou QR Code) aparece no checkout logo após você criar o pedido. Copie e pague no seu banco.',
      'Sem problema! Logo após finalizar o pedido no site, a chave Pix será gerada automaticamente para você.',
      'O pagamento é via Pix. A chave exclusiva do seu pedido aparece na última tela após a confirmação.'
    ],
    keywords: ['pix', 'pagamento', 'chave', 'pagar', 'efetuar']
  },
  {
    id: 'receipt',
    label: 'Comprovante',
    responses: [
      'Envie o comprovante no nosso Instagram oficial @havertz.dxt informando o número do pedido para agilizar.',
      'Após pagar, mande o print do comprovante lá no Direct do @havertz.dxt junto com o código do seu pedido.',
      'O comprovante deve ser enviado no Instagram @havertz.dxt. Isso ajuda nossa equipe a localizar sua compra na hora!'
    ],
    keywords: ['comprovante', 'enviar print', 'mandei o pix', 'print', 'comprovar', 'mandei']
  },
  {
    id: 'delivery',
    label: 'Prazo',
    responses: [
      'Após a confirmação do pagamento, seu pedido entra em fila de análise e a entrega é iniciada o mais rápido possível.',
      'O prazo varia conforme a demanda, mas costumamos entregar rapidamente assim que o Pix é confirmado.',
      'Fique tranquilo! Assim que o sistema reconhecer seu pagamento, nossa equipe inicia o processamento da entrega.'
    ],
    keywords: ['prazo', 'tempo', 'demora', 'quando chega', 'entrega', 'demorar']
  },
  {
    id: 'order_status',
    label: 'Status do pedido',
    responses: [
      'Você pode acompanhar tudo em "Meus Pedidos". Lá você vê se está aguardando, em análise ou entregue.',
      'Consulte a aba de pedidos na sua conta para ver o status em tempo real da sua compra.',
      'No menu lateral, clique em "Meus Pedidos" para rastrear o progresso da sua entrega agora mesmo.'
    ],
    keywords: ['status', 'meu pedido', 'rastrear', 'onde esta', 'progresso', 'situacao']
  },
  {
    id: 'imvu_credits',
    label: 'Créditos IMVU',
    responses: [
      'Para créditos IMVU, certifique-se de informar o @nick correto. Temos opções via Direto e via Presente!',
      'Os créditos IMVU são entregues diretamente na sua conta. Escolha entre Direto ou Presente no catálogo.',
      'IMVU é nossa especialidade! Informe o nick exato do avatar para que a entrega ocorra sem erros.'
    ],
    keywords: ['imvu', 'creditos', 'fichas', 'avatar', 'direto', 'presente']
  },
  {
    id: 'free_fire',
    label: 'Free Fire',
    responses: [
      'Para Free Fire, precisamos do seu ID de jogador. Confira bem os números antes de finalizar o pedido.',
      'Diamantes no FF? Basta informar o ID no formulário de compra. A recarga cai conforme o prazo informado.',
      'Certifique-se de ter digitado o ID do FF corretamente. IDs errados não podem ser estornados pela Garena.'
    ],
    keywords: ['free fire', 'ff', 'diamantes', 'dimas', 'id', 'recarga']
  },
  {
    id: 'followers',
    label: 'Seguidores',
    responses: [
      'Para seguidores, envie o @perfil ou @nick do Instagram. Lembre-se de deixar o perfil PÚBLICO durante a entrega.',
      'Alavanque seu Insta! Informe o perfil correto e aguarde o processamento iniciado pelo sistema.',
      'Temos seguidores de alta qualidade. Informe o link ou @nick do perfil e não mude o nome durante a entrega.'
    ],
    keywords: ['seguidores', 'instagram', 'insta', 'seguidor', 'perfil', 'popularidade']
  },
  {
    id: 'mn_products',
    label: 'Produtos MN',
    responses: [
      'Nossos produtos MN são exclusivos e de alta qualidade. Escolha o seu recurso preferido no catálogo.',
      'A linha MN oferece os melhores recursos para sua conta. Confira a disponibilidade no site.',
      'Recursos MN garantidos! Selecione o pacote desejado e siga as instruções de identificação.'
    ],
    keywords: ['mn', 'produto mn', 'recursos', 'recursos mn']
  }
];

export const BOT_MESSAGES = {
  welcome: 'Olá 👋 Eu sou o DXT Assistente. Posso te ajudar com compras, Pix, comprovante, prazos e status do pedido.',
  switching_to_human: 'Certo! Vou deixar sua conversa disponível para atendimento manual. Por favor, envie sua dúvida e aguarde a equipe responder.',
  not_found: 'Não consegui identificar sua dúvida. Escolha uma das opções abaixo ou clique em "Falar com atendente".',
};
