import { RoleplayScenario } from '../types';

export const ROLEPLAY_SCENARIOS: RoleplayScenario[] = [
  {
    id: 'sc-restaurant',
    title: 'Pedindo Comida no Restaurante',
    category: 'Alimentação & Viagens',
    difficulty: 'A2',
    partnerName: 'Michael',
    partnerRole: 'Garçom atencioso no Soho Bistro, Nova York',
    avatarIcon: 'Utensils',
    description: 'Pratique pedir seu prato, tirar dúvidas sobre o cardápio, solicitar água e pedir a conta com polidez.',
    goal: 'Pedir uma refeição principal, uma bebida sem gelo e solicitar a conta no final.',
    initialMessage: 'Good evening! Welcome to Soho Bistro. Table for one tonight? Can I start you off with something to drink?',
    suggestedPhrases: [
      'Good evening! Yes, a table for one, please.',
      'Could I have a sparkling water with no ice, please?',
      'What do you recommend as the daily special?'
    ]
  },
  {
    id: 'sc-hotel',
    title: 'Check-in no Hotel',
    category: 'Viagens & Hospedagem',
    difficulty: 'A2',
    partnerName: 'Emma',
    partnerRole: 'Recepcionista no Grand Plaza Hotel, Londres',
    avatarIcon: 'Building',
    description: 'Faça o check-in da sua estadia, confirme os horários do café da manhã e pergunte sobre a senha do Wi-Fi.',
    goal: 'Apresentar a reserva, solicitar um quarto silencioso e tirar dúvidas sobre comodidades.',
    initialMessage: 'Hello, welcome to the Grand Plaza Hotel! How may I assist you this afternoon?',
    suggestedPhrases: [
      'Hello! I have a reservation under the name Lucas Silva.',
      'Could I get a quiet room on a higher floor if possible?',
      'What time is breakfast served in the morning?'
    ]
  },
  {
    id: 'sc-interview',
    title: 'Entrevista de Emprego em Inglês',
    category: 'Carreira & Profissional',
    difficulty: 'B2',
    partnerName: 'Sarah Jenkins',
    partnerRole: 'Head of Talent Acquisition em uma empresa global',
    avatarIcon: 'Briefcase',
    description: 'Responda a perguntas comportamentais, fale sobre suas principais conquistas e explique por que é ideal para a vaga.',
    goal: 'Apresentar sua trajetória profissional com segurança e fazer uma pergunta estratégica no final.',
    initialMessage: 'Hi there! Thank you for joining us today. To start off, could you tell me a little bit about your background and what motivated you to apply for this role?',
    suggestedPhrases: [
      'Thank you for having me. I have over four years of experience in...',
      'One of my proudest achievements was leading a project that improved...',
      'What are the main priorities for this position in the first 90 days?'
    ]
  },
  {
    id: 'sc-networking',
    title: 'Conhecendo Pessoas num Evento',
    category: 'Social & Networking',
    difficulty: 'A1',
    partnerName: 'Julian',
    partnerRole: 'Desenvolvedor e participante de uma conferência internacional',
    avatarIcon: 'Users',
    description: 'Quebre o gelo, pergunte de onde a pessoa é, com o que ela trabalha e troque contatos de forma descontraída.',
    goal: 'Iniciar um diálogo amigável, falar sobre sua área e encontrar interesses em comum.',
    initialMessage: 'Hey! Mind if I join you at this table? That keynote presentation was pretty interesting, wasn\'t it?',
    suggestedPhrases: [
      'Sure, please have a seat! My name is Roberto, by the way.',
      'Yeah, I found the AI discussion really fascinating. What about you?',
      'Where are you based? Are you attending the workshops tomorrow?'
    ]
  },
  {
    id: 'sc-directions',
    title: 'Pedindo Informações na Rua',
    category: 'Viagens & Sobrevivência',
    difficulty: 'A1',
    partnerName: 'Officer Miller',
    partnerRole: 'Policial solícito próximo à Times Square',
    avatarIcon: 'Compass',
    description: 'Aprenda a pedir orientações para chegar ao metrô, entender termos como "turn left", "blocks" e "straight ahead".',
    goal: 'Descobrir como chegar à estação de metrô mais próxima e quanto tempo leva a pé.',
    initialMessage: 'Hello there! You look like you might need a hand. Are you looking for a specific landmark around here?',
    suggestedPhrases: [
      'Excuse me, could you tell me how to get to the nearest subway station?',
      'Is it within walking distance from here?',
      'Should I turn left at the next traffic light?'
    ]
  },
  {
    id: 'sc-meeting',
    title: 'Reunião de Equipe & Brainstorming',
    category: 'Carreira & Negócios',
    difficulty: 'B1',
    partnerName: 'Carlos Ramirez',
    partnerRole: 'Líder técnico do time de produto',
    avatarIcon: 'Laptop',
    description: 'Dê sua atualização de status diário (Daily Standup), aponte eventuais impedimentos e proponha uma melhoria.',
    goal: 'Compartilhar o que você fez ontem, o que fará hoje e alinhar os próximos passos com a equipe.',
    initialMessage: 'Morning team! Let\'s kick off today\'s sync. Who would like to give their update first on the customer dashboard feature?',
    suggestedPhrases: [
      'I can go first. Yesterday I finalized the authentication flow.',
      'Today I am focusing on the unit tests and mobile responsiveness.',
      'I don\'t have any blockers right now, but I\'d like a quick code review later.'
    ]
  },
  {
    id: 'sc-immigration',
    title: 'Imigração no Aeroporto',
    category: 'Viagens Internacionais',
    difficulty: 'A2',
    partnerName: 'Officer Thompson',
    partnerRole: 'Agente de Controle de Fronteiras dos EUA',
    avatarIcon: 'Plane',
    description: 'Responda com calma às perguntas padrão da imigração sobre o motivo da sua viagem, duração e hospedagem.',
    goal: 'Apresentar passaporte, declarar propósito de turismo/negócios e tempo de estadia sem hesitação.',
    initialMessage: 'Good afternoon. Passports and customs declarations, please. What is the purpose of your visit to the United States?',
    suggestedPhrases: [
      'Good afternoon, here is my passport. I am here for vacation and tourism.',
      'I will be staying for two weeks in Orlando with my family.',
      'I have a return ticket booked for November 15th.'
    ]
  },
  {
    id: 'sc-shopping',
    title: 'Compras & Tamanhos na Loja',
    category: 'Cotidiano & Compras',
    difficulty: 'A2',
    partnerName: 'Chloe',
    partnerRole: 'Vendedora na flagship store de moda',
    avatarIcon: 'ShoppingBag',
    description: 'Pergunte se há outro tamanho ou cor, onde fica o provador e se aceitam cartão de crédito internacional.',
    goal: 'Experimentar uma peça no seu tamanho, perguntar o preço com desconto e efetuar o pagamento.',
    initialMessage: 'Hi! Let me know if you are looking for any particular size or style today. We have a 20% sale on outerwear.',
    suggestedPhrases: [
      'Hi! Do you have this jacket in medium, please?',
      'Where are the fitting rooms located?',
      'Do you accept international contactless credit cards?'
    ]
  }
];
