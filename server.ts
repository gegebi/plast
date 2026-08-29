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
    cleanlinessScore: {
      type: Type.INTEGER,
      description: 'Cleanliness score from 0 (very dirty/unwashed) to 100 (spotless, label removed, clean)'
    },
    status: {
      type: Type.STRING,
      enum: ['PERFECT', 'CLEAN', 'SLIGHT_STAIN', 'CONTAMINATED'],
      description: 'Category cleanliness rating'
    },
    verdict: {
      type: Type.STRING,
      enum: ['PLANT_SEEDLING', 'CHOP_TREE'],
      description: 'PLANT_SEEDLING if score >= 70, otherwise CHOP_TREE'
    },
    detectedItem: {
      type: Type.STRING,
      description: 'Short name of the detected object in Korean (e.g. 투명 페트병, 엽기떡볶이 배달용기, 알루미늄 캔)'
    },
    isBackgroundSeparated: {
      type: Type.BOOLEAN,
      description: 'True if background/table colors were distinguished from the actual container'
    },
    hasLabelRemoved: {
      type: Type.BOOLEAN,
      description: 'True if vinyl label or non-recyclable parts are properly removed (especially for PET bottles/cups)'
    },
    redStainPercent: {
      type: Type.INTEGER,
      description: 'Estimated % of food/chili sauce stains on the container itself (0-100)'
    },
    darkGrimePercent: {
      type: Type.INTEGER,
      description: 'Estimated % of grime/leftover beverage/dirt on the container (0-100)'
    },
    feedbackTitle: {
      type: Type.STRING,
      description: 'Short punchy Korean title with emoji (max 20 chars, e.g. 🌟 완벽한 무결점 분리수거!)'
    },
    feedbackMessage: {
      type: Type.STRING,
      description: 'Clear concise Korean eco-guidance explaining why it passed or what needs cleaning (max 1-2 sentences)'
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

    const categoryNames: Record<string, string> = {
      tteokbokki_container: '엽떡/배달용기 (플라스틱 배달용기 및 붉은 고추기름 세척 여부)',
      plastic_cup: '투명 일회용 플라스틱 컵 (음료 잔여물, 빨대 및 뚜껑 분리)',
      plastic_bottle: '투명 페트병 (비닐 라벨 제거, 뚜껑 분리, 내부 세척 및 압착)',
      beverage_can: '음료 캔/알루미늄 (음료 찌꺼기 세척, 이물질 혼입 여부)',
      paper_carton: '우유팩/종이팩 (물 세척 후 펼쳐서 건조된 상태)',
      glass_bottle: '유리병 (담배꽁초 등 내부 이물질 없음, 뚜껑 분리)',
      general_plastic: '일반 플라스틱 용기 (음식물 세척 및 라벨 제거)'
    };

    const targetCategoryDesc = categoryNames[category] || '재활용 분리수거 품목';

    // Highly optimized system instructions with strict token conservation
    const prompt = `당신은 대한민국 환경부의 AI 스마트 분리수거 수석 감정관입니다.
사용자가 촬영한 사진에서 재활용 대상 물품을 분석하고 오염도와 분리배출 적합성을 판별하십시오.

[선택된 품목]: ${targetCategoryDesc}

[판정 핵심 규칙 - 배경 분리 및 정밀 검사]:
1. **배경과 물품 분리 (중요)**: 사진의 배경(예: 붉은 목재 식탁, 갈색 바닥, 어두운 그림자, 조명 반사)을 물품의 오염으로 오인하지 마십시오. 오직 재활용 용기 표면 및 내부의 실제 오염물질만 판정하십시오.
2. **오염도 기준**:
   - 떡볶이/배달용기: 붉은 고추기름 얼룩, 양념 찌꺼기가 남아있으면 70점 미만(CHOP_TREE). 깨끗이 씻겨 투명/하얗다면 80~100점(PLANT_SEEDLING).
   - 페트병/일회용컵: 비닐 라벨 미제거, 음료 잔여물, 빨대 꽂혀있음 등은 감점.
   - 캔/유리병/우유팩: 내용물 찌꺼기나 이물질이 없어야 합격.
3. **점수 및 판정**:
   - 85점 이상: PERFECT (무결점 분리수거) -> verdict: PLANT_SEEDLING
   - 70~84점: CLEAN (양호한 분리배출) -> verdict: PLANT_SEEDLING
   - 50~69점: SLIGHT_STAIN (경미한 오염/라벨 미제거) -> verdict: CHOP_TREE
   - 0~49점: CONTAMINATED (심각한 음식물 오염) -> verdict: CHOP_TREE
4. 토큰 절약을 위해 간결하고 명확한 한국어로 작성하십시오.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
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
        maxOutputTokens: 300, // Token budget optimization
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
