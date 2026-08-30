import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type, Schema } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

// Parse JSON request bodies up to 15MB for camera image uploads
app.use(express.json({ limit: '15mb' }));

// Lazy initialization of GoogleGenAI client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
    });
  }
  return aiClient;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    timestamp: Date.now()
  });
});

// JSON Schema for structured, token-efficient Gemini AI output
const recyclingAnalysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    contaminationPercent: {
      type: Type.INTEGER,
      description: 'Total contamination rate percentage of the item from 0% (completely clean/spotless) to 100% (heavily soiled/full of residue). e.g. 0, 5, 12, 35, 80'
    },
    cleanlinessScore: {
      type: Type.INTEGER,
      description: 'Cleanliness score from 0 (very dirty/unwashed) to 100 (spotless, label removed, clean). Must equal 100 - contaminationPercent.'
    },
    status: {
      type: Type.STRING,
      enum: ['PERFECT', 'CLEAN', 'SLIGHT_STAIN', 'CONTAMINATED'],
      description: 'Cleanliness rating: PERFECT (contamination <= 10%), CLEAN (contamination <= 30%), SLIGHT_STAIN (contamination 31-50%), CONTAMINATED (contamination > 50%)'
    },
    verdict: {
      type: Type.STRING,
      enum: ['PLANT_SEEDLING', 'CHOP_TREE'],
      description: 'PLANT_SEEDLING if contamination <= 30% (score >= 70), otherwise CHOP_TREE'
    },
    detectedItem: {
      type: Type.STRING,
      description: 'Short name of the detected object in Korean (e.g. 투명 페트병, 배달용기, 플라스틱 컵, 알루미늄 캔)'
    },
    detectedCategory: {
      type: Type.STRING,
      enum: ['tteokbokki_container', 'plastic_cup', 'plastic_bottle', 'beverage_can', 'paper_carton', 'glass_bottle', 'general_plastic'],
      description: 'Classified recycling category of the item'
    },
    isBackgroundSeparated: {
      type: Type.BOOLEAN,
      description: 'True if background/table colors were distinguished from the actual container'
    },
    hasLabelRemoved: {
      type: Type.BOOLEAN,
      description: 'True if vinyl label or non-recyclable parts are properly removed (especially for PET bottles/cups)'
    },
    feedbackTitle: {
      type: Type.STRING,
      description: 'Short punchy Korean title with emoji (max 20 chars, e.g. 🌟 총 오염도 0% 완벽 세척!, 🌱 총 오염도 12% 양호)'
    },
    feedbackMessage: {
      type: Type.STRING,
      description: 'Clear concise Korean eco-guidance explaining the item condition and why it passed or what needs cleaning (max 1-2 sentences)'
    },
    rewardText: {
      type: Type.STRING,
      description: 'Reward message or advice in Korean'
    },
    penaltyText: {
      type: Type.STRING,
      description: 'Penalty message if chopped, or null'
    },
    carbonSavedGrams: {
      type: Type.INTEGER,
      description: 'Grams of CO2 saved (e.g. 100-200 if clean, 0 if contaminated)'
    },
    xpAwarded: {
      type: Type.INTEGER,
      description: 'XP points earned (100-150 if clean, 0-20 if contaminated)'
    }
  },
  required: [
    'contaminationPercent',
    'cleanlinessScore',
    'status',
    'verdict',
    'detectedItem',
    'feedbackTitle',
    'feedbackMessage',
    'rewardText',
    'carbonSavedGrams',
    'xpAwarded'
  ]
};

// AI-Powered Multimodal Recycling & Contamination Analysis API
app.post('/api/analyze-recycling', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', category } = req.body;

    if (!imageBase64) {
      res.status(400).json({ error: 'imageBase64 is required' });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      res.status(503).json({
        error: 'GEMINI_API_KEY_NOT_CONFIGURED',
        message: 'Gemini API 키가 설정되지 않아 로컬 비전 모드로 전환합니다.'
      });
      return;
    }

    // Clean base64 string
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const isAutoDetect = !category || category === 'auto';
    const categoryNames: Record<string, string> = {
      auto: '✨ AI 자동 감지 모드 (사진 속 품목을 AI가 스스로 식별 및 종합 오염도 산출)',
      tteokbokki_container: '배달/플라스틱 용기 (음식물 잔여물 및 기름기 세척 여부)',
      plastic_cup: '투명 일회용 플라스틱 컵 (음료 잔여물, 빨대 및 뚜껑 분리)',
      plastic_bottle: '투명 페트병 (비닐 라벨 제거, 뚜껑 분리, 내부 세척 및 압착)',
      beverage_can: '음료 캔/알루미늄 (음료 찌꺼기 세척, 이물질 혼입 여부)',
      paper_carton: '우유팩/종이팩 (물 세척 후 펼쳐서 건조된 상태)',
      glass_bottle: '유리병 (담배꽁초 등 내부 이물질 없음, 뚜껑 분리)',
      general_plastic: '일반 플라스틱 용기 (음식물 세척 및 라벨 제거)'
    };

    const targetCategoryDesc = categoryNames[category] || categoryNames.auto;

    // Highly optimized system instructions with strict token conservation
    const prompt = `당신은 대한민국 환경부의 AI 스마트 분리수거 수석 감정관입니다.
사용자가 촬영한 사진에서 재활용 대상 물품을 분석하고 【총 오염도(%)】와 분리배출 적합성을 정밀하게 판별하십시오.

[요청 모드]: ${targetCategoryDesc}

[판정 핵심 규칙]:
1. **총 오염도(contaminationPercent, 0~100%) 산출**:
   - 특정 오염물질에 얽매이지 말고, 사진 속 물품의 전체적인 이물질, 잔여 음식물/음료, 얼룩, 스티커 잔여물 등을 종합하여 실제 【총 오염도(예: 8%, 12%, 25%, 60%)】를 객관적으로 평가하십시오.
   - cleanlinessScore = 100 - contaminationPercent 입니다.
2. **배경과 물품 완벽 분리 (중요)**:
   - 사진의 배경(목재 테이블, 바닥 타일, 그림자, 손, 주변 사물)을 물품의 오염으로 오인하지 마십시오. 오직 재활용 대상 용기/물품 자체의 오염도만 측정하십시오.
3. **품목 자동 분류**:
   - 사진 속 물품을 정확히 파악하여 detectedItem(예: '투명 페트병', '배달 플라스틱 용기', '아이스 아메리카노 컵', '알루미늄 캔', '우유팩' 등)을 한국어로 작성하십시오.
4. **오염도 기준 및 판정**:
   - 총 오염도 0~15% (청결도 85~100점): PERFECT (무결점 분리배출) -> verdict: PLANT_SEEDLING
   - 총 오염도 16~30% (청결도 70~84점): CLEAN (양호한 분리배출) -> verdict: PLANT_SEEDLING
   - 총 오염도 31~50% (청결도 50~69점): SLIGHT_STAIN (경미한 오염/세척 미흡) -> verdict: CHOP_TREE
   - 총 오염도 51~100% (청결도 0~49점): CONTAMINATED (심각한 오염/재활용 불가) -> verdict: CHOP_TREE
5. 토큰 절약을 위해 간결하고 명확한 한국어로 작성하십시오.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                data: cleanBase64,
                mimeType: mimeType
              }
            },
            {
              text: prompt
            }
          ]
        }
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: recyclingAnalysisSchema,
        temperature: 0.1,
        maxOutputTokens: 300,
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error('Gemini API returned an empty response');
    }

    const parsed = JSON.parse(responseText);

    res.json({
      success: true,
      data: parsed,
      isAiPowered: true
    });
  } catch (error: unknown) {
    console.error('Gemini Recycling Analysis error:', error);
    const errMessage = error instanceof Error ? error.message : 'Unknown AI analysis error';
    res.status(500).json({
      success: false,
      error: errMessage
    });
  }
});

// Start the server with Vite middleware integration
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
