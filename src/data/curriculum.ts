import { Module } from '../types';

export const CURRICULUM_MODULES: Module[] = [
  // ==========================================
  // LEVEL A1 — PRIMEIROS PASSOS
  // ==========================================
  {
    id: 'a1-mod-1',
    level: 'A1',
    title: 'A1: Primeiros Passos & Fundamentos',
    description: 'Saudações, apresentações pessoais, verbo to be e estruturas essenciais para começar a falar inglês hoje.',
    units: [
      {
        id: 'a1-u1',
        moduleId: 'a1-mod-1',
        title: 'Unidade 1: Saudações & Apresentações',
        description: 'Aprenda a cumprimentar, dizer seu nome, de onde você é e usar o verbo to be com confiança.',
        lessons: [
          {
            id: 'a1-l1',
            moduleId: 'a1-mod-1',
            level: 'A1',
            title: 'Lição 1: Hello & Nice to meet you',
            subtitle: 'Como cumprimentar e se apresentar naturalmente',
            durationMinutes: 10,
            description: 'Aprenda os cumprimentos mais usados por falantes nativos e a estrutura básica para dizer seu nome e origem.',
            grammarTip: 'Em inglês, sempre usamos o pronome sujeito antes do verbo. Dizemos "I am John" (e não apenas "Am John"). A contração "I\'m" é a mais usada na fala informal.',
            vocabulary: [
              {
                word: 'Hello / Hi',
                translation: 'Olá / Oi',
                phonetic: '/həˈloʊ/ /haɪ/',
                example: 'Hello! My name is Lucas.',
                exampleTranslation: 'Olá! Meu nome é Lucas.'
              },
              {
                word: 'Nice to meet you',
                translation: 'Prazer em conhecer você',
                phonetic: '/naɪs tu miːt juː/',
                example: 'Hi, I am Sarah. Nice to meet you!',
                exampleTranslation: 'Oi, eu sou a Sarah. Prazer em te conhecer!'
              },
              {
                word: 'Where are you from?',
                translation: 'De onde você é?',
                phonetic: '/wɛər ɑːr juː frʌm/',
                example: 'Where are you from? I am from Brazil.',
                exampleTranslation: 'De onde você é? Eu sou do Brasil.'
              },
              {
                word: 'Good morning / afternoon / evening',
                translation: 'Bom dia / Boa tarde / Boa noite (chegada)',
                phonetic: '/ɡʊd ˈmɔːrnɪŋ/',
                example: 'Good morning! How are you today?',
                exampleTranslation: 'Bom dia! Como vai você hoje?'
              }
            ],
            dialogue: [
              { speaker: 'Alex', text: 'Hi! I am Alex. Nice to meet you.', translation: 'Oi! Eu sou o Alex. Prazer em conhecê-la.' },
              { speaker: 'Beatriz', text: 'Hello Alex! I am Beatriz. Nice to meet you too.', translation: 'Olá Alex! Eu sou a Beatriz. Prazer em conhecê-lo também.' },
              { speaker: 'Alex', text: 'Where are you from, Beatriz?', translation: 'De onde você é, Beatriz?' },
              { speaker: 'Beatriz', text: 'I am from São Paulo, Brazil. And you?', translation: 'Eu sou de São Paulo, Brasil. E você?' },
              { speaker: 'Alex', text: 'I am from Toronto, Canada.', translation: 'Eu sou de Toronto, Canadá.' }
            ],
            exercises: [
              {
                id: 'a1-l1-ex1',
                type: 'multiple_choice',
                title: 'Completar a Saudação',
                instruction: 'Escolha a resposta mais adequada para quando alguém diz "Nice to meet you":',
                promptText: 'Person A: "Hi, I am David. Nice to meet you!"\nPerson B: "___"',
                options: ['Nice to meet you too!', 'Good night!', 'I have twenty years.', 'See you yesterday.'],
                correctAnswer: 'Nice to meet you too!',
                explanation: 'A resposta padrão e educada para "Nice to meet you" é "Nice to meet you too" (Prazer em conhecê-lo também).',
                translation: 'Prazer em conhecer você também!',
                audioPhrase: 'Nice to meet you too!'
              },
              {
                id: 'a1-l1-ex2',
                type: 'word_order',
                title: 'Construir a Frase',
                instruction: 'Organize as palavras na ordem correta para dizer de onde você é:',
                promptText: 'Eu sou do Brasil.',
                words: ['am', 'from', 'I', 'Brazil'],
                correctAnswer: 'I am from Brazil',
                explanation: 'A ordem padrão em inglês é Sujeito (I) + Verbo (am) + Preposição de origem (from) + Lugar (Brazil).',
                translation: 'Eu sou do Brasil.',
                audioPhrase: 'I am from Brazil.'
              },
              {
                id: 'a1-l1-ex3',
                type: 'fill_blank',
                title: 'Preencher a Lacuna',
                instruction: 'Selecione a forma correta do verbo to be:',
                promptText: 'Where ___ you from?',
                options: ['are', 'is', 'am', 'be'],
                correctAnswer: 'are',
                explanation: 'Com o pronome "you", a forma correta do verbo to be no presente é sempre "are".',
                translation: 'De onde você é?',
                audioPhrase: 'Where are you from?'
              },
              {
                id: 'a1-l1-ex4',
                type: 'pronunciation',
                title: 'Treinar Pronúncia',
                instruction: 'Fale a frase no microfone com clareza:',
                promptText: 'Good morning, nice to meet you!',
                correctAnswer: 'Good morning, nice to meet you!',
                explanation: 'Atenção ao som de "meet" (vogal longa /iː/) e evite colocar "i" no fim de "good".',
                translation: 'Bom dia, prazer em conhecer você!',
                audioPhrase: 'Good morning, nice to meet you!'
              }
            ]
          },
          {
            id: 'a1-l2',
            moduleId: 'a1-mod-1',
            level: 'A1',
            title: 'Lição 2: Verbo To Be & Pronomes',
            subtitle: 'Eu sou, você é, nós estamos — a espinha dorsal do inglês',
            durationMinutes: 12,
            description: 'Domine I am, You are, He is, She is, It is, We are, They are sem decoreba e com frases práticas.',
            grammarTip: 'O verbo "to be" significa tanto SER quanto ESTAR. O contexto indica o sentido: "I am happy" (Estou feliz) vs "I am a doctor" (Sou médico). Para negar, apenas adicione NOT: "I am not tired".',
            vocabulary: [
              { word: 'Student', translation: 'Estudante / Aluno', phonetic: '/ˈstuː.dənt/', example: 'I am an English student.', exampleTranslation: 'Eu sou um estudante de inglês.' },
              { word: 'Ready', translation: 'Pronto / Preparado', phonetic: '/ˈrɛd.i/', example: 'Are you ready?', exampleTranslation: 'Você está pronto?' },
              { word: 'Tired', translation: 'Cansado', phonetic: '/taɪərd/', example: 'He is very tired today.', exampleTranslation: 'Ele está muito cansado hoje.' },
              { word: 'Here', translation: 'Aqui', phonetic: '/hɪər/', example: 'We are here to learn.', exampleTranslation: 'Estamos aqui para aprender.' }
            ],
            exercises: [
              {
                id: 'a1-l2-ex1',
                type: 'fill_blank',
                title: 'Verbo To Be no Singular',
                instruction: 'Complete com a forma correta do verbo to be:',
                promptText: 'She ___ a software engineer.',
                options: ['is', 'are', 'am', 'be'],
                correctAnswer: 'is',
                explanation: 'Para a terceira pessoa do singular (He, She, It), usamos "is".',
                translation: 'Ela é engenheira de software.',
                audioPhrase: 'She is a software engineer.'
              },
              {
                id: 'a1-l2-ex2',
                type: 'multiple_choice',
                title: 'Forma Negativa',
                instruction: 'Qual frase significa "Nós não estamos atrasados"?',
                promptText: 'Traduza: "Nós não estamos atrasados"',
                options: ['We are not late.', 'We not are late.', 'We no late.', 'We isn\'t late.'],
                correctAnswer: 'We are not late.',
                explanation: 'A negação com o verbo to be coloca o NOT após o verbo: "are not" (ou aren\'t).',
                translation: 'Nós não estamos atrasados.',
                audioPhrase: 'We are not late.'
              },
              {
                id: 'a1-l2-ex3',
                type: 'word_order',
                title: 'Pergunta com To Be',
                instruction: 'Organize as palavras para fazer a pergunta "Você está pronto?":',
                promptText: 'Você está pronto?',
                words: ['ready', 'Are', 'you'],
                correctAnswer: 'Are you ready',
                explanation: 'Em perguntas com o verbo to be, invertemos a ordem: o verbo vem antes do sujeito (Are + you + ready?).',
                translation: 'Você está pronto?',
                audioPhrase: 'Are you ready?'
              }
            ]
          }
        ]
      },
      {
        id: 'a1-u2',
        moduleId: 'a1-mod-1',
        title: 'Unidade 2: Números, Horas & Rotina Básica',
        description: 'Aprenda a contar, dizer as horas e falar sobre suas atividades diárias.',
        lessons: [
          {
            id: 'a1-l3',
            moduleId: 'a1-mod-1',
            level: 'A1',
            title: 'Lição 3: Números & Que Horas São?',
            subtitle: 'Dizer horários, preços e números essenciais',
            durationMinutes: 10,
            description: 'Aprenda os números de 1 a 100 e a estrutura fundamental "What time is it?".',
            grammarTip: 'Para perguntar as horas, dizemos "What time is it?". Para responder, usamos "It is..." ou "It\'s...", por exemplo: "It is 8:30" (It\'s eight thirty).',
            vocabulary: [
              { word: 'Time', translation: 'Tempo / Hora', phonetic: '/taɪm/', example: 'What time is it?', exampleTranslation: 'Que horas são?' },
              { word: 'O\'clock', translation: 'Em ponto', phonetic: '/əˈklɑːk/', example: 'It is two o\'clock.', exampleTranslation: 'São duas horas em ponto.' },
              { word: 'Now', translation: 'Agora', phonetic: '/naʊ/', example: 'I need to go now.', exampleTranslation: 'Preciso ir agora.' }
            ],
            exercises: [
              {
                id: 'a1-l3-ex1',
                type: 'multiple_choice',
                title: 'Perguntar as Horas',
                instruction: 'Como se pergunta "Que horas são?" em inglês?',
                promptText: 'Qual a expressão correta?',
                options: ['What time is it?', 'Which hour is?', 'What hour have you?', 'How many hours?'],
                correctAnswer: 'What time is it?',
                explanation: 'A expressão nativa correta para perguntar as horas é "What time is it?".',
                translation: 'Que horas são?',
                audioPhrase: 'What time is it?'
              }
            ]
          }
        ]
      }
    ]
  },

  // ==========================================
  // LEVEL A2 — COMUNICAÇÃO COTIDIANA
  // ==========================================
  {
    id: 'a2-mod-1',
    level: 'A2',
    title: 'A2: Comunicação Cotidiana & Prática',
    description: 'Fale sobre rotina, passado simples, planos para o futuro, compras, restaurantes e direções.',
    units: [
      {
        id: 'a2-u1',
        moduleId: 'a2-mod-1',
        title: 'Unidade 1: Falando do Passado (Past Simple)',
        description: 'Aprenda a contar o que você fez ontem, no fim de semana ou nas últimas férias.',
        lessons: [
          {
            id: 'a2-l1',
            moduleId: 'a2-mod-1',
            level: 'A2',
            title: 'Lição 1: O Que Você Fez Ontem? (Past Simple)',
            subtitle: 'Verbos regulares com -ed e o auxiliar DID',
            durationMinutes: 15,
            description: 'Domine a terminação -ed e o uso do auxiliar "did" para perguntas e negativas.',
            grammarTip: 'Para perguntas no passado, usamos "Did" + sujeito + verbo no infinitivo (sem -ed): "Did you work yesterday?". Na negação: "I didn\'t work". O -ed só aparece em frases afirmativas!',
            vocabulary: [
              { word: 'Yesterday', translation: 'Ontem', phonetic: '/ˈjɛs.tər.deɪ/', example: 'I worked all day yesterday.', exampleTranslation: 'Trabalhei o dia todo ontem.' },
              { word: 'Last week / month', translation: 'Semana passada / Mês passado', phonetic: '/læst wiːk/', example: 'I visited my family last week.', exampleTranslation: 'Visitei minha família semana passada.' },
              { word: 'Did', translation: 'Auxiliar do passado', phonetic: '/dɪd/', example: 'Did you like the movie?', exampleTranslation: 'Você gostou do filme?' },
              { word: 'Went', translation: 'Fui / Foi (passado de go)', phonetic: '/wɛnt/', example: 'She went to the supermarket.', exampleTranslation: 'Ela foi ao supermercado.' }
            ],
            exercises: [
              {
                id: 'a2-l1-ex1',
                type: 'fill_blank',
                title: 'Pergunta no Passado',
                instruction: 'Complete a pergunta com o auxiliar correto:',
                promptText: '___ you study English yesterday?',
                options: ['Did', 'Do', 'Are', 'Were'],
                correctAnswer: 'Did',
                explanation: 'Usamos "Did" para fazer perguntas sobre ações concluídas no passado com verbos de ação.',
                translation: 'Você estudou inglês ontem?',
                audioPhrase: 'Did you study English yesterday?'
              },
              {
                id: 'a2-l1-ex2',
                type: 'multiple_choice',
                title: 'Negação no Passado',
                instruction: 'Qual frase está gramaticalmente correta?',
                promptText: 'Escolha a opção correta:',
                options: ['I didn\'t watch TV last night.', 'I didn\'t watched TV last night.', 'I no watched TV last night.', 'I don\'t watched TV last night.'],
                correctAnswer: 'I didn\'t watch TV last night.',
                explanation: 'Quando usamos o auxiliar "didn\'t", o verbo principal volta para sua forma base (watch, e não watched).',
                translation: 'Eu não assisti TV ontem à noite.',
                audioPhrase: 'I didn\'t watch TV last night.'
              }
            ]
          }
        ]
      },
      {
        id: 'a2-u2',
        moduleId: 'a2-mod-1',
        title: 'Unidade 2: No Restaurante & Pedidos',
        description: 'Pedir comida, fazer perguntas sobre o cardápio e pedir a conta com polidez.',
        lessons: [
          {
            id: 'a2-l2',
            moduleId: 'a2-mod-1',
            level: 'A2',
            title: 'Lição 2: Can I have...? Pedindo com Educação',
            subtitle: 'Como falar como um nativo educado em restaurantes e cafés',
            durationMinutes: 12,
            description: 'Substitua "I want" por "Could I have..." ou "I\'d like..." para soar natural e cortês.',
            grammarTip: 'Em inglês, dizer "I want this" soa ríspido para falantes nativos. A forma mais comum e educada é "Could I have the check, please?" ou "I would like (I\'d like) a coffee".',
            vocabulary: [
              { word: 'Could I have...?', translation: 'Você poderia me trazer...? / Poderia me dar...?', phonetic: '/kʊd aɪ hæv/', example: 'Could I have a glass of water, please?', exampleTranslation: 'Poderia me trazer um copo de água, por favor?' },
              { word: 'The check / bill', translation: 'A conta', phonetic: '/ðə tʃɛk/', example: 'Can we have the check, please?', exampleTranslation: 'Podemos ter a conta, por favor?' },
              { word: 'To go / Takeaway', translation: 'Para viagem', phonetic: '/tuː ɡoʊ/', example: 'Is that for here or to go?', exampleTranslation: 'É para consumir aqui ou para viagem?' }
            ],
            exercises: [
              {
                id: 'a2-l2-ex1',
                type: 'word_order',
                title: 'Pedindo a Conta',
                instruction: 'Organize as palavras para pedir a conta educadamente:',
                promptText: 'Podemos ter a conta, por favor?',
                words: ['the', 'have', 'check,', 'please?', 'Can', 'we'],
                correctAnswer: 'Can we have the check, please?',
                explanation: 'Estrutura educada padrão: "Can we have the check, please?".',
                translation: 'Podemos ter a conta, por favor?',
                audioPhrase: 'Can we have the check, please?'
              }
            ]
          }
        ]
      }
    ]
  },

  // ==========================================
  // LEVEL B1 — INDEPENDÊNCIA
  // ==========================================
  {
    id: 'b1-mod-1',
    level: 'B1',
    title: 'B1: Independência & Fluência Funcional',
    description: 'Expresse opiniões, relate experiências com o Present Perfect, participe de reuniões e lide com imprevistos.',
    units: [
      {
        id: 'b1-u1',
        moduleId: 'b1-mod-1',
        title: 'Unidade 1: Experiências de Vida (Present Perfect)',
        description: 'Aprenda a falar sobre coisas que você já fez ou nunca fez na vida usando Have + Particípio.',
        lessons: [
          {
            id: 'b1-l1',
            moduleId: 'b1-mod-1',
            level: 'B1',
            title: 'Lição 1: Have You Ever...? Conectando Passado e Presente',
            subtitle: 'A diferença crucial entre Past Simple e Present Perfect',
            durationMinutes: 15,
            description: 'Entenda quando usar "I have visited" (sem tempo específico) vs "I visited in 2022" (tempo definido).',
            grammarTip: 'Use o Present Perfect para experiências sem data especificada ("I have been to New York"). Se você especificar QUANDO aconteceu ("last year", "in 2020"), mude imediatamente para o Past Simple ("I went there last year").',
            vocabulary: [
              { word: 'Have you ever...?', translation: 'Você alguma vez já...?', phonetic: '/hæv juː ˈɛv.ər/', example: 'Have you ever worked remotely?', exampleTranslation: 'Você alguma vez já trabalhou remotamente?' },
              { word: 'Already', translation: 'Já (em afirmativas)', phonetic: '/ɔːlˈrɛd.i/', example: 'I have already finished the report.', exampleTranslation: 'Eu já terminei o relatório.' },
              { word: 'Yet', translation: 'Ainda / Já (negativas e perguntas)', phonetic: '/jɛt/', example: 'I haven\'t received the email yet.', exampleTranslation: 'Eu ainda não recebi o e-mail.' }
            ],
            exercises: [
              {
                id: 'b1-l1-ex1',
                type: 'fill_blank',
                title: 'Experiência de Vida',
                instruction: 'Escolha a opção que completa a frase corretamente:',
                promptText: 'Have you ever ___ to London?',
                options: ['been', 'went', 'go', 'going'],
                correctAnswer: 'been',
                explanation: 'Com "Have you ever", usamos o particípio passado do verbo to be: "been".',
                translation: 'Você já esteve em Londres alguma vez?',
                audioPhrase: 'Have you ever been to London?'
              }
            ]
          }
        ]
      }
    ]
  },

  // ==========================================
  // LEVEL B2 — COMUNICAÇÃO AVANÇADA
  // ==========================================
  {
    id: 'b2-mod-1',
    level: 'B2',
    title: 'B2: Comunicação Avançada & Profissional',
    description: 'Debates, argumentação clara, phrasal verbs idiomáticos, vocabulário corporativo e nuances de tom.',
    units: [
      {
        id: 'b2-u1',
        moduleId: 'b2-mod-1',
        title: 'Unidade 1: Negócios & Argumentação',
        description: 'Apresente pontos de vista, discorde diplomaticamente e negocie com elegância.',
        lessons: [
          {
            id: 'b2-l1',
            moduleId: 'b2-mod-1',
            level: 'B2',
            title: 'Lição 1: Discordando com Diplomacia',
            subtitle: 'Como expressar pontos de vista divergentes em reuniões corporativas',
            durationMinutes: 15,
            description: 'Aprenda expressões como "I see your point, however..." e "I\'m not entirely convinced that...".',
            grammarTip: 'No ambiente profissional anglófono, a discordância direta ("You are wrong") é evitada. Usamos "hedging" para suavizar: "I see what you mean, but from my perspective...".',
            vocabulary: [
              { word: 'However / Nonetheless', translation: 'No entanto / Contudo', phonetic: '/haʊˈɛv.ər/', example: 'We have good results; however, costs increased.', exampleTranslation: 'Temos bons resultados; no entanto, os custos aumentaram.' },
              { word: 'From my perspective', translation: 'Do meu ponto de vista', phonetic: '/frʌm maɪ pərˈspɛktɪv/', example: 'From my perspective, this solution is more scalable.', exampleTranslation: 'Do meu ponto de vista, essa solução é mais escalável.' }
            ],
            exercises: [
              {
                id: 'b2-l1-ex1',
                type: 'multiple_choice',
                title: 'Expressão Diplomática',
                instruction: 'Qual frase soa mais profissional para discordar numa reunião?',
                promptText: 'Escolha a melhor formulação:',
                options: [
                  'I see your point, however, we should consider the budget constraints.',
                  'You are totally mistaken about the budget.',
                  'That is bad idea.',
                  'I hate this proposal.'
                ],
                correctAnswer: 'I see your point, however, we should consider the budget constraints.',
                explanation: '"I see your point, however..." valida a fala do colega antes de introduzir uma ressalva construtiva.',
                translation: 'Entendo seu ponto, contudo, devemos considerar as restrições orçamentárias.',
                audioPhrase: 'I see your point, however, we should consider the budget constraints.'
              }
            ]
          }
        ]
      }
    ]
  },

  // ==========================================
  // LEVEL C1 — FLUÊNCIA AVANÇADA
  // ==========================================
  {
    id: 'c1-mod-1',
    level: 'C1',
    title: 'C1: Fluência & Domínio Idiomático',
    description: 'Comunicação espontânea, nuances estilísticas, inversões de ênfase e compreensão de diferentes sotaques.',
    units: [
      {
        id: 'c1-u1',
        moduleId: 'c1-mod-1',
        title: 'Unidade 1: Ênfase & Inversões Formais',
        description: 'Domine construções como "Rarely have I seen..." e "Not only did he..." para falar e escrever com maestria.',
        lessons: [
          {
            id: 'c1-l1',
            moduleId: 'c1-mod-1',
            level: 'C1',
            title: 'Lição 1: Inversão Gramatical para Ênfase',
            subtitle: 'Elevando o nível do seu discurso executivo e acadêmico',
            durationMinutes: 18,
            description: 'Aprenda como iniciar frases com advérbios negativos ou restritivos (Seldom, Rarely, Under no circumstances) altera a ordem do verbo.',
            grammarTip: 'Quando iniciamos com "Not only...", invertemos o sujeito e o auxiliar como se fosse uma pergunta: "Not only did we achieve our target, but we also expanded our market share".',
            vocabulary: [
              { word: 'Seldom / Rarely', translation: 'Raramente', phonetic: '/ˈsɛl.dəm/', example: 'Seldom have we witnessed such rapid technological change.', exampleTranslation: 'Raramente testemunhamos uma mudança tecnológica tão rápida.' },
              { word: 'Under no circumstances', translation: 'Sob nenhuma hipótese', phonetic: '/ˈʌn.dər noʊ ˈsɜːr.kəmˌstænsɪz/', example: 'Under no circumstances should sensitive data be shared.', exampleTranslation: 'Sob hipótese alguma dados confidenciais devem ser compartilhados.' }
            ],
            exercises: [
              {
                id: 'c1-l1-ex1',
                type: 'fill_blank',
                title: 'Inversão com Not Only',
                instruction: 'Complete a frase usando a inversão formal correta:',
                promptText: 'Not only ___ the deadline, but they also exceeded expectations.',
                options: ['did they meet', 'they met', 'they have meet', 'met they'],
                correctAnswer: 'did they meet',
                explanation: 'A inversão exige o auxiliar "did" antes do sujeito "they" seguido do verbo base "meet".',
                translation: 'Não apenas eles cumpriram o prazo, mas também superaram as expectativas.',
                audioPhrase: 'Not only did they meet the deadline, but they also exceeded expectations.'
              }
            ]
          }
        ]
      }
    ]
  },

  // ==========================================
  // LEVEL C2 — MAESTRIA & NUANCES
  // ==========================================
  {
    id: 'c2-mod-1',
    level: 'C2',
    title: 'C2: Maestria Linguística & Cultural',
    description: 'Textos densos, ironia, referências contextuais, eufemismos britânicos e americanos e precisão cirúrgica.',
    units: [
      {
        id: 'c2-u1',
        moduleId: 'c2-mod-1',
        title: 'Unidade 1: Sutilezas Culturais & Eufemismos',
        description: 'Decifre o que os nativos realmente querem dizer quando usam "With all due respect" ou "That is an interesting idea".',
        lessons: [
          {
            id: 'c2-l1',
            moduleId: 'c2-mod-1',
            level: 'C2',
            title: 'Lição 1: O Subtexto da Linguagem Britânica e Americana',
            subtitle: 'Compreender ironia, understatement e duplo sentido em negociações de alto nível',
            durationMinutes: 20,
            description: 'Aprenda a ler nas entrelinhas quando interlocutores nativos usam polidez para expressar desacordo profundo.',
            grammarTip: 'O "Understatement" é uma técnica retórica onde algo grave ou impressionante é descrito como menor do que é: "We have a slight problem" geralmente significa "Temos uma crise catastrófica".',
            vocabulary: [
              { word: 'With all due respect', translation: 'Com todo o respeito (frequentemente antecipa um forte desacordo)', phonetic: '/wɪð ɔːl djuː rɪˈspɛkt/', example: 'With all due respect, the data does not substantiate that conclusion.', exampleTranslation: 'Com todo o respeito, os dados não sustentam essa conclusão.' },
              { word: 'Ubiquitous', translation: 'Onipresente / Universal', phonetic: '/juːˈbɪk.wə.təs/', example: 'Smartphones have become ubiquitous across all demographics.', exampleTranslation: 'Smartphones tornaram-se onipresentes em todas as faixas demográficas.' }
            ],
            exercises: [
              {
                id: 'c2-l1-ex1',
                type: 'multiple_choice',
                title: 'Interpretação de Subtexto',
                instruction: 'Em uma negociação de alto escalão, o que a frase "That is certainly a bold proposal" costuma sinalizar no subtexto?',
                promptText: 'Qual a interpretação pragmática mais provável?',
                options: [
                  'A proposta é considerada excessivamente arriscada ou irrealista.',
                  'A proposta foi aceita imediatamente sem qualquer ressalva.',
                  'O interlocutor achou a proposta corajosa e quer dobrar o valor.',
                  'Significa que o projeto está finalizado.'
                ],
                correctAnswer: 'A proposta é considerada excessivamente arriscada ou irrealista.',
                explanation: 'Em linguagem executiva anglo-saxã, classificar uma proposta como "bold" (ousada) costuma ser um eufemismo cortês para dizer que ela é arriscada demais ou beira o imprudente.',
                translation: 'Essa é certamente uma proposta ousada.',
                audioPhrase: 'That is certainly a bold proposal.'
              }
            ]
          }
        ]
      }
    ]
  }
];
