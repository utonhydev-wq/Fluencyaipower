export interface PlacementQuestion {
  id: string;
  targetLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  question: string;
  instruction: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  audioPhrase?: string;
}

export const PLACEMENT_QUESTIONS: PlacementQuestion[] = [
  // A1 Questions
  {
    id: 'pq-1',
    targetLevel: 'A1',
    question: 'Hello! My name is Carlos. I ___ from Rio de Janeiro.',
    instruction: 'Complete a frase com a opção correta:',
    options: ['am', 'is', 'are', 'be'],
    correctAnswer: 'am',
    explanation: 'Com o pronome "I", usamos a forma "am" do verbo to be.',
    audioPhrase: 'Hello! My name is Carlos. I am from Rio de Janeiro.'
  },
  {
    id: 'pq-2',
    targetLevel: 'A1',
    question: 'Excuse me, ___ you speak English?',
    instruction: 'Qual verbo auxiliar completa a pergunta no presente?',
    options: ['do', 'are', 'is', 'does'],
    correctAnswer: 'do',
    explanation: 'Para perguntas com verbos comuns (speak, work, live) com "you", usamos o auxiliar "do".',
    audioPhrase: 'Excuse me, do you speak English?'
  },

  // A2 Questions
  {
    id: 'pq-3',
    targetLevel: 'A2',
    question: 'Yesterday, she ___ to the office because she was feeling sick.',
    instruction: 'Qual forma verbal completa a negação no passado?',
    options: ['didn\'t go', 'doesn\'t go', 'didn\'t went', 'not went'],
    correctAnswer: 'didn\'t go',
    explanation: 'Na negação do Past Simple, usamos "didn\'t" + verbo na forma base (go).',
    audioPhrase: 'Yesterday, she didn\'t go to the office because she was feeling sick.'
  },
  {
    id: 'pq-4',
    targetLevel: 'A2',
    question: 'Could you please ___ the window? It\'s quite hot in here.',
    instruction: 'Escolha a forma adequada após a expressão de polidez "Could you please":',
    options: ['open', 'opening', 'to open', 'opened'],
    correctAnswer: 'open',
    explanation: 'Após verbos modais como "could", usamos o verbo na forma base sem "to".',
    audioPhrase: 'Could you please open the window? It\'s quite hot in here.'
  },

  // B1 Questions
  {
    id: 'pq-5',
    targetLevel: 'B1',
    question: 'I have lived in this city ___ five years.',
    instruction: 'Escolha a preposição adequada de duração de tempo:',
    options: ['for', 'since', 'during', 'from'],
    correctAnswer: 'for',
    explanation: 'Usamos "for" para períodos de tempo (five years, two hours) e "since" para pontos de partida no tempo (since 2018).',
    audioPhrase: 'I have lived in this city for five years.'
  },
  {
    id: 'pq-6',
    targetLevel: 'B1',
    question: 'If it ___ tomorrow, we will have our meeting online.',
    instruction: 'Complete a primeira condicional (First Conditional):',
    options: ['rains', 'will rain', 'rained', 'is raining'],
    correctAnswer: 'rains',
    explanation: 'Na First Conditional, a oração com "if" fica no Present Simple ("if it rains"), enquanto a oração principal fica no futuro ("we will have").',
    audioPhrase: 'If it rains tomorrow, we will have our meeting online.'
  },

  // B2 Questions
  {
    id: 'pq-7',
    targetLevel: 'B2',
    question: 'By this time next year, they ___ the new international airport terminal.',
    instruction: 'Escolha a forma verbal do Future Perfect:',
    options: ['will have completed', 'will complete', 'are completing', 'have completed'],
    correctAnswer: 'will have completed',
    explanation: 'O Future Perfect ("will have + particípio") indica uma ação que estará concluída antes de um momento específico no futuro.',
    audioPhrase: 'By this time next year, they will have completed the new international airport terminal.'
  },
  {
    id: 'pq-8',
    targetLevel: 'B2',
    question: 'I really look forward to ___ with your team on this project.',
    instruction: 'Qual forma segue a expressão "look forward to"?',
    options: ['collaborating', 'collaborate', 'to collaborate', 'collaborated'],
    correctAnswer: 'collaborating',
    explanation: 'Em "look forward to", a palavra "to" é uma preposição, exigindo o verbo com terminação -ing.',
    audioPhrase: 'I really look forward to collaborating with your team on this project.'
  },

  // C1 & C2 Questions
  {
    id: 'pq-9',
    targetLevel: 'C1',
    question: 'Rarely ___ such an inspiring presentation in my entire career.',
    instruction: 'Escolha a inversão enfática correta após o advérbio negativo:',
    options: ['have I witnessed', 'I have witnessed', 'did I witnessed', 'witnessed I'],
    correctAnswer: 'have I witnessed',
    explanation: 'Advérbios negativos ou restritivos no início de frases (Rarely, Seldom, Never) exigem inversão sujeito-auxiliar.',
    audioPhrase: 'Rarely have I witnessed such an inspiring presentation in my entire career.'
  },
  {
    id: 'pq-10',
    targetLevel: 'C2',
    question: 'The CEO made a remark that was so ___ that only those familiar with the internal company politics understood the implicit warning.',
    instruction: 'Escolha o adjetivo com maior precisão e sofisticação de significado:',
    options: ['nuanced', 'obvious', 'clumsy', 'monotonous'],
    correctAnswer: 'nuanced',
    explanation: '"Nuanced" refere-se a algo sutil, com camadas de significado e sofisticação que exigem interpretação atenta.',
    audioPhrase: 'The CEO made a remark that was so nuanced that only those familiar with internal politics understood.'
  }
];
