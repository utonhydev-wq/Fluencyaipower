import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI server-side with User-Agent header as required
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
} else {
  console.warn('GEMINI_API_KEY is not set. Educational offline mode will be used as fallback.');
}

// Helper to safely call Gemini with fallback
async function callGemini(contents: string, systemInstruction: string, jsonMode = false) {
  if (!ai) {
    throw new Error('AI service unavailable: GEMINI_API_KEY is missing.');
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents,
    config: {
      systemInstruction,
      responseMimeType: jsonMode ? 'application/json' : 'text/plain',
      temperature: 0.7,
    },
  });

  return response.text;
}

// API Routes

// 1. Private Tutor Chat (Professional English Professor)
app.post('/api/ai/tutor', async (req: Request, res: Response) => {
  try {
    const {
      message,
      history = [],
      level = 'A1',
      mode = 'iniciante',
      userGoal = 'Geral',
      teacherPersona = 'Adam'
    } = req.body;

    const systemPrompt = `Você é um Professor Particular de Inglês de Elite (certificado Cambridge CELTA/Delta) do fluencyaipower, especializado em ensinar falantes nativos de português brasileiro do nível A1 ao C2.
Seu perfil: Professor ${teacherPersona}, empático, didático, focado em destravar a fala e acelerar a fluência sem decoreba inútil.
Nível CEFR do aluno: ${level}.
Objetivo do aluno: ${userGoal}.
Modo selecionado: ${mode} (iniciante: acolhedor com explicações em português; conversacao: diálogo fluido e incentivo; imersao: 90% em inglês com notas de vocabulário).

Responda SEMPRE em JSON estrito com o seguinte esquema:
{
  "reply": "Sua resposta principal em inglês natural (ou bilíngue amigável se o aluno for A1/iniciante), falando diretamente com o aluno como professor.",
  "portugueseExplanation": "Explicação didática clara em português do Brasil sobre o conceito, padrão linguístico ou significado prático.",
  "correction": {
    "originalText": "trecho com erro do aluno, se houver",
    "correctedText": "como um nativo falaria de forma natural",
    "explanation": "explicação curta do erro (ex: falsos cognatos como actually/atualmente, preposições 'listen to', evitar colocar 'i' mudo no fim das palavras)"
  } ou null se a fala do aluno estiver correta,
  "phoneticTip": "Dica fonética prática voltada para a boca de um brasileiro (ex: som do TH com ponta da língua entre os dentes, pronúncia do -ED no passado, som do R em car/water)",
  "suggestedFollowUps": [
    "Opção 1 simples para o aluno responder em inglês",
    "Opção 2 mais expressiva",
    "Opção 3 fazendo uma contra-pergunta"
  ],
  "savedVocabulary": [
    {
      "word": "Palavra ou phrasal verb chave",
      "translation": "Tradução contextualizada",
      "phonetic": "/transcrição fonética/",
      "example": "Exemplo curto em frase real"
    }
  ]
}

Regras pedagógicas:
1. Jamais faça o aluno se sentir envergonhado por errar. Erros são a matéria-prima do aprendizado.
2. Identifique e corrija vícios comuns de brasileiros: traduzir 'ter x anos' como 'have x years' em vez de 'be x years old', esquecer o 'to' após 'listen', colocar som de vogal após consoantes mudas ('like-i', 'face-i').
3. No final da sua fala ("reply"), faça sempre uma pergunta que instigue o aluno a continuar a conversa em inglês.`;

    const formattedHistory = (history as Array<{ role: string; text: string }>)
      .slice(-6)
      .map(h => `${h.role === 'user' ? 'Aluno' : 'Professor'}: ${h.text}`)
      .join('\n');

    const prompt = `${formattedHistory ? `Histórico recente do diálogo:\n${formattedHistory}\n\n` : ''}Mensagem do Aluno: "${message}"\nResponda em formato JSON estrito:`;

    if (!ai) {
      return res.json({
        reply: `Hello! I'm delighted to practice with you. In English, when we want to express this, we often focus on practical phrases. What would you like to try saying next?`,
        portugueseExplanation: `Excelente pergunta! No nível ${level}, o foco é entender a estrutura de forma prática, associando o significado direto sem tradução palavra por palavra.`,
        correction: null,
        phoneticTip: "Dica de pronúncia: Ao falar em inglês, relaxe os músculos faciais e preste atenção nas consoantes finais sem adicionar som de 'i'.",
        suggestedFollowUps: [
          "I want to practice my daily conversation.",
          "Could you give me another example?",
          "How do I say this in a business meeting?"
        ],
        savedVocabulary: [
          {
            word: "Keep going",
            translation: "Continue firme / Não desista",
            phonetic: "/kiːp ˈɡoʊ.ɪŋ/",
            example: "Keep going, your English is improving every day!"
          }
        ]
      });
    }

    const text = await callGemini(prompt, systemPrompt, true);
    try {
      const parsed = JSON.parse(text || '{}');
      res.json(parsed);
    } catch {
      res.json({
        reply: text || 'Great to chat with you! Let\'s keep practicing.',
        portugueseExplanation: 'Estou aqui para guiar sua pronúncia e gramática passo a passo.',
        correction: null,
        phoneticTip: null,
        suggestedFollowUps: ['Tell me more', 'How do you say that?', 'Give me a challenge']
      });
    }
  } catch (error: any) {
    console.error('Tutor error:', error);
    res.status(500).json({
      error: 'Não foi possível processar a resposta do professor no momento.',
      details: error.message,
    });
  }
});

// 2. Roleplay / Conversação em Situações Reais
app.post('/api/ai/roleplay', async (req: Request, res: Response) => {
  try {
    const { scenarioId, scenarioTitle, role, history = [], userMessage, level = 'A1' } = req.body;

    const systemPrompt = `Você é um personagem nativo no cenário de simulação "${scenarioTitle}" do fluencyaipower.
Seu papel na cena: ${role}.
Nível do aluno: ${level}.
Você deve responder EM FORMATO JSON estrito com o seguinte esquema:
{
  "reply": "Sua fala em inglês natural compatível com o nível do aluno",
  "portugueseTranslation": "Tradução amigável da sua fala para o português",
  "grammarCorrection": "Correção curta e amigável da última mensagem do aluno, se houver erro gramatical ou de naturalidade (ou null se estiver correto)",
  "suggestedReplies": [
    "Opção 1 de resposta em inglês que o aluno pode falar ou escolher",
    "Opção 2 de resposta em inglês",
    "Opção 3 de resposta em inglês"
  ],
  "vocabularyTip": "Dica rápida de vocabulário ou expressão idiomática útil para essa situação (ou null)"
}
Regras:
- Mantenha a fala curta e autêntica (1 a 2 frases).
- Sempre incentive o aluno a responder de forma realista.
- Ofereça opções variadas em suggestedReplies (uma simples, uma intermediária, uma alternativa).`;

    const dialogHistory = (history as Array<{ speaker: string; text: string }>)
      .map(h => `${h.speaker}: ${h.text}`)
      .join('\n');

    const prompt = `Cenário: ${scenarioTitle}\nHistórico do Diálogo:\n${dialogHistory}\n\nÚltima mensagem do aluno: "${userMessage}"\nResponda em JSON:`;

    if (!ai) {
      return res.json({
        reply: "Nice to meet you! How can I help you today?",
        portugueseTranslation: "Prazer em conhecê-lo! Como posso ajudar você hoje?",
        grammarCorrection: null,
        suggestedReplies: [
          "I would like to order a coffee, please.",
          "Could you give me more information?",
          "I'm looking for the check-in desk."
        ],
        vocabularyTip: "Em inglês, usar 'Could I have...' ou 'I would like...' soa muito mais educado do que 'I want'."
      });
    }

    const text = await callGemini(prompt, systemPrompt, true);
    const parsed = JSON.parse(text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Roleplay error:', error);
    res.status(500).json({ error: 'Erro ao gerar resposta da simulação.', details: error.message });
  }
});

// 3. Pronunciation & Speech Analysis
app.post('/api/ai/analyze-speech', async (req: Request, res: Response) => {
  try {
    const { targetPhrase, recognizedText, level = 'A1' } = req.body;

    const systemPrompt = `Você é um avaliador de pronúncia e fala para falantes de português brasileiro aprendendo inglês.
Analise a correspondência entre a frase alvo que o aluno deveria falar e o texto reconhecido pelo microfone.
Retorne SEMPRE em JSON estrito com o esquema:
{
  "score": número de 0 a 100 de precisão e fluência,
  "accuracy": "excelente" | "bom" | "regular" | "precisa_melhorar",
  "recognized": "o que foi reconhecido",
  "target": "frase alvo",
  "phoneticTip": "Dica fonética específica para brasileiros (ex: sons de TH, R caipira vs inglês, consoantes finais mudas como -ed, terminação -m pronunciada com lábios fechados)",
  "wordAnalysis": [
    {
      "word": "palavra da frase alvo",
      "status": "correct" | "minor_issue" | "missed",
      "hint": "dica se houver"
    }
  ],
  "encouragement": "Mensagem breve de incentivo em português"
}
Atenção: Diferencie pequenas variações normais de sotaque de erros que prejudicam a comunicação. Seja encorajador.`;

    const prompt = `Frase Alvo: "${targetPhrase}"\nTexto reconhecido da voz do aluno: "${recognizedText || ''}"\nNível do Aluno: ${level}\nAnalise e responda em JSON:`;

    if (!ai) {
      const match = (targetPhrase || '').toLowerCase().trim() === (recognizedText || '').toLowerCase().trim();
      return res.json({
        score: match ? 95 : 75,
        accuracy: match ? 'excelente' : 'bom',
        recognized: recognizedText,
        target: targetPhrase,
        phoneticTip: "Dica: Em inglês, não adicione o som de 'i' no final de palavras que terminam com consoantes mudas (como 'like', 'book', 'stop').",
        wordAnalysis: (targetPhrase || '').split(' ').map((w: string) => ({
          word: w,
          status: 'correct',
          hint: 'Boa pronúncia',
        })),
        encouragement: 'Muito bem! Continue praticando para ganhar ritmo e confiança!'
      });
    }

    const text = await callGemini(prompt, systemPrompt, true);
    const parsed = JSON.parse(text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Speech analysis error:', error);
    res.status(500).json({ error: 'Erro ao analisar pronúncia.', details: error.message });
  }
});

// 4. Dynamic Exercise Generation
app.post('/api/ai/generate-exercise', async (req: Request, res: Response) => {
  try {
    const { topic, level = 'A1', type = 'fill_blank' } = req.body;

    const systemPrompt = `Você é um especialista em pedagogia do idioma inglês. Crie um exercício sob medida para alunos brasileiros.
Nível CEFR: ${level}.
Tópico: ${topic}.
Tipo solicitado: ${type}.
Retorne em JSON estrito com o esquema:
{
  "id": "gen_ex_${Date.now()}",
  "type": "${type}",
  "title": "Título curto em português",
  "instruction": "Instrução clara para o aluno em português",
  "promptText": "A frase em inglês com lacuna ou questão",
  "options": ["Opção 1", "Opção 2", "Opção 3", "Opção 4"],
  "correctAnswer": "A resposta correta exata",
  "explanation": "Explicação didática em português de por que essa é a resposta correta e por que as outras não se aplicam",
  "translation": "Tradução completa da frase correta",
  "audioPhrase": "A frase completa correta para áudio"
}`;

    const prompt = `Crie um exercício de alta qualidade pedagógica sobre "${topic}" para nível ${level}.`;

    if (!ai) {
      return res.json({
        id: `gen_${Date.now()}`,
        type: 'multiple_choice',
        title: `Prática de ${topic}`,
        instruction: 'Escolha a opção que completa a frase corretamente:',
        promptText: 'She ___ to the office every morning.',
        options: ['goes', 'go', 'going', 'is go'],
        correctAnswer: 'goes',
        explanation: 'No Present Simple, com terceira pessoa do singular (he, she, it), adicionamos -es ao verbo go.',
        translation: 'Ela vai para o escritório toda manhã.',
        audioPhrase: 'She goes to the office every morning.'
      });
    }

    const text = await callGemini(prompt, systemPrompt, true);
    const parsed = JSON.parse(text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Generate exercise error:', error);
    res.status(500).json({ error: 'Erro ao gerar exercício.', details: error.message });
  }
});

// 5. Text-to-Speech via Gemini TTS
app.post('/api/ai/tts', async (req: Request, res: Response) => {
  try {
    const { text, voice = 'Kore', speed = 'normal' } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Texto não fornecido.' });
    }

    if (!ai) {
      return res.status(200).json({ fallback: true, message: 'Use browser SpeechSynthesis' });
    }

    // Call gemini-3.8-flash-lite-tts
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: speed === 'slow' ? `Speak slowly and clearly: ${text}` : text,
              speechMetadata: {
                style: speed === 'slow' ? 'Slow, clear language learning tutor' : 'Natural, clear American English accent',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice as any || 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      res.json({ audioData: base64Audio, mimeType: 'audio/wav' });
    } else {
      res.json({ fallback: true });
    }
  } catch (error: any) {
    console.warn('Gemini TTS error, falling back to Web Speech API:', error.message);
    res.json({ fallback: true, error: error.message });
  }
});

// 6. Placement Test Evaluation
app.post('/api/ai/evaluate-level', async (req: Request, res: Response) => {
  try {
    const { answers, score, totalQuestions, userSelfRating, goal, dailyMinutes } = req.body;

    const systemPrompt = `Você é um avaliador pedagógico de proficiência de língua inglesa com base no CEFR (A1, A2, B1, B2, C1, C2).
Analise o desempenho do aluno no teste de nivelamento do fluencyaipower e formule uma avaliação motivadora.
Retorne em JSON estrito com o esquema:
{
  "estimatedLevel": "A1" | "A2" | "B1" | "B2" | "C1" | "C2",
  "levelTitle": "Título do nível em português (ex: Básico A2 - Comunicação Cotidiana)",
  "summary": "Resumo pedagógico encorajador (2-3 frases) destacando os pontos fortes e o que ele vai destravar",
  "strengths": ["Ponto forte 1", "Ponto forte 2"],
  "focusAreas": ["Área de foco prioritária 1", "Área de foco prioritária 2"],
  "weeklyPlan": "Plano de 7 dias recomendado para sua rotina de ${dailyMinutes} minutos/dia",
  "startingModuleId": "Identificador do módulo inicial recomendado"
}`;

    const prompt = `Respostas do teste: ${JSON.stringify(answers)}
Acertos: ${score} de ${totalQuestions} questões
Autoavaliação do aluno: ${userSelfRating}
Objetivo: ${goal}
Tempo disponível diário: ${dailyMinutes} minutos
Calcule o nível CEFR estimado e responda em JSON:`;

    if (!ai) {
      // Deterministic calculation
      const pct = (score / totalQuestions) * 100;
      let level = 'A1';
      let title = 'Iniciante (A1) — Primeiros Passos';
      if (pct > 85) { level = 'B2'; title = 'Intermediário Avançado (B2)'; }
      else if (pct > 65) { level = 'B1'; title = 'Intermediário Independente (B1)'; }
      else if (pct > 40) { level = 'A2'; title = 'Básico Cotidiano (A2)'; }

      return res.json({
        estimatedLevel: level,
        levelTitle: title,
        summary: `Você demonstrou excelente potencial! Seu ponto de partida ideal foi identificado como ${level}, permitindo consolidar a base e acelerar sua fala sem lacunas.`,
        strengths: ['Identificação de vocabulário chave', 'Disposição para aprender'],
        focusAreas: ['Construção de frases espontâneas', 'Fluência auditiva'],
        weeklyPlan: `Dedique ${dailyMinutes} minutos diários alternando entre lições interativas e simulações com o tutor de IA.`,
        startingModuleId: `${level.toLowerCase()}-mod-1`
      });
    }

    const text = await callGemini(prompt, systemPrompt, true);
    const parsed = JSON.parse(text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Level eval error:', error);
    res.status(500).json({ error: 'Erro ao avaliar nível.', details: error.message });
  }
});

// Setup Vite in middleware mode during development, or serve dist in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`fluencyaipower Server running at http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
