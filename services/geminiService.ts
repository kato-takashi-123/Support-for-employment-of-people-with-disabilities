import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { PestInfo, AppSettings, PlantDiagnosis } from '../types';

let ai: GoogleGenAI | null = null;

export const updateGeminiApiKey = (apiKey: string) => {
  if (apiKey && apiKey.trim()) {
    ai = new GoogleGenAI({ apiKey });
  } else {
    ai = null;
  }
};

export class GeminiApiKeyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GeminiApiKeyError';
  }
}

const getAiClient = (): GoogleGenAI => {
  if (!ai) {
    throw new GeminiApiKeyError('Gemini APIキーが設定されていません。設定ページでキーを入力してください。');
  }
  return ai;
};

export class ApiRateLimitError extends Error {
  constructor(message: string, public originalError: any) {
    super(message);
    this.name = 'ApiRateLimitError';
  }
}

// --- Retry Helper ---
const withRetry = async <T>(apiCall: () => Promise<T>, options: { retries?: number; delay?: number } = {}): Promise<T> => {
  const { retries = 3, delay = 2000 } = options;
  let lastError: any;

  for (let i = 0; i < retries; i++) {
    try {
      return await apiCall();
    } catch (error: any) {
      lastError = error;

      if (error instanceof GeminiApiKeyError) {
        throw error;
      }

      const isRateLimitError = (e: any): boolean => {
        const status = e?.error?.code || e?.status;
        const statusText = e?.error?.status || '';
        return status === 429 || statusText === 'RESOURCE_EXHAUSTED';
      };

      if (isRateLimitError(error)) {
        throw new ApiRateLimitError("APIの利用上限に達しました。時間をおいてもう一度お試しいただくか、APIキーの設定を確認してください。", error);
      }
      
      const isRetryableServerError = (e: any): boolean => {
        const status = e?.error?.code || e?.status;
        return status >= 500 && status < 600;
      };

      if (isRetryableServerError(error) && i < retries - 1) {
        const backoffDelay = delay * Math.pow(2, i) + Math.random() * 1000;
        console.warn(`API呼び出しが失敗しました（再試行 ${i + 1}/${retries}）。${Math.round(backoffDelay / 1000)}秒後に再試行します...`);
        await new Promise(res => setTimeout(res, backoffDelay));
      } else {
        throw error;
      }
    }
  }
  throw lastError;
};

export interface AiSearchResult {
  text: string;
  groundingChunks?: any[];
}

/**
 * 毎日の心がけ/アドバイスの一言メッセージ
 */
export const getDailyQuote = async (theme: string, forceRefresh = false): Promise<string> => {
  const cacheKey = 'dailyQuoteCache';
  const lastFetchInfoKey = 'dailyQuoteLastFetchInfo';
  const todayDate = new Date();
  const today = todayDate.toISOString().split('T')[0];
  const effectiveTheme = theme.trim() || '今日の心がけ';

  let lastFetchInfo: { date: string; theme: string } | null = null;
  try {
    const storedInfo = localStorage.getItem(lastFetchInfoKey);
    if (storedInfo) {
      lastFetchInfo = JSON.parse(storedInfo);
    }
  } catch (e) {
    console.error("Could not read last fetch info", e);
  }

  const isFirstFetchOfDay = !lastFetchInfo || lastFetchInfo.date !== today || lastFetchInfo.theme !== effectiveTheme;
  const shouldRefresh = forceRefresh || isFirstFetchOfDay;

  if (!shouldRefresh) {
    try {
      const cachedData = localStorage.getItem(cacheKey);
      if (cachedData) {
        const cache = JSON.parse(cachedData);
        if (cache[effectiveTheme] && cache[effectiveTheme].date === today && cache[effectiveTheme].quote) {
          return cache[effectiveTheme].quote;
        }
      }
    } catch (error) {
      console.error("Failed to read daily quote from cache", error);
      localStorage.removeItem(cacheKey);
    }
  }
  
  let promptDetails = `「${effectiveTheme}」に沿った、障がい者雇用に取り組む「農場長」への心温まるサポートアドバイスを一言メッセージとして返してください。`;
  if (effectiveTheme === '今日の心がけ') {
    promptDetails = "障がい者雇用の現場で「農場長」が「就労スタッフ」を優しくサポートするためのコツや、温かい心がけフレーズを一つ選んでください。";
  }

  const response = await withRetry<GenerateContentResponse>(() => getAiClient().models.generateContent({
    model: 'gemini-3.5-flash',
    contents: promptDetails,
    config: {
      systemInstruction: "あなたは障がい者雇用の現場支援を行うハートフルな就労支援専門員です。農場の指導員（農場長）に向けて、前向きで、合理的配慮を実践したくなるような「今日の心がけ」を1文、50文字前後で回答してください。笑顔、焦らない、寄り添う気持ちなどを大切にした具体的なコミュニケーションのアドバイスが好ましいです。個人情報は絶対に考慮・入力させない旨の注意喚起も念頭に入れてください。障害ではなく『障がい』、スタッフは『就労スタッフ』、指導者は『農場長』と表記します。",
      temperature: 0.8,
    }
  }));
  const newQuote = response.text.trim().split('\n')[0];
  const finalQuote = (newQuote && newQuote.length > 5) ? newQuote : "ゆっくり、確実に。就労スタッフ一人ひとりの得意な強みを活かしていきましょう！";
  
  try {
    const cachedData = localStorage.getItem(cacheKey);
    const cache = cachedData ? JSON.parse(cachedData) : {};
    cache[effectiveTheme] = { quote: finalQuote, date: today };
    localStorage.setItem(cacheKey, JSON.stringify(cache));
    localStorage.setItem(lastFetchInfoKey, JSON.stringify({ date: today, theme: effectiveTheme }));
  } catch (error) {
    console.error("Failed to write daily quote to cache", error);
  }

  return finalQuote;
};

/**
 * 障がい者福祉用語辞典の検索
 */
export const searchGardeningTerm = async (query: string): Promise<AiSearchResult> => {
  if (!query.trim()) return { text: "質問や検索ワードを入力してください。" };

  const config: any = {
    systemInstruction: "あなたは障がい者福祉および雇用推進において、極めてわかりやすく支援制度や法規を伝える就労支援プランナーです。提示された用語について、素人である『農場長』に向けて説明してください。専門用語には丁寧な補足を付け、リストや丁寧な対比、あるいはアスキーアートなどの目立つレイアウトを用いて、直感的でわかりやすい解説にしてください。注意：本サービスはAIによる一般的な指標であり、具体的な利用方法や法解釈は自治体、福祉担当窓口、支援専門機関にご相談いただくよう、最下部で注意喚起してください。また、個人情報の入力は防ぐよう促してください。表記ルールを厳守（障害→『障がい』、指導員→『農場長』、障がい者本人→『就労スタッフ』）。",
    temperature: 0.5,
  };
  const response = await withRetry<GenerateContentResponse>(() => getAiClient().models.generateContent({
    model: 'gemini-3.5-flash',
    contents: `障がい者福祉・雇用における「${query}」という用語について、イラストや丁寧な図解調を交えて解説してください。`,
    config,
  }));
  return {
    text: response.text.trim(),
    groundingChunks: []
  };
};

/**
 * 障害者雇用促進法 ＆ 障害者虐待防止法 検索（元病害虫・症状検索）
 */
export const searchPestInfo = async (query: string, image?: { mimeType: string; data: string }): Promise<PestInfo> => {
  if (!query.trim() && !image) throw new Error("キーワードを入力する、またはメモの画像をアップロードしてください。");
  
  const lawInfoSchema = {
    type: Type.OBJECT,
    properties: {
        pestName: { type: Type.STRING, description: '法律の名称とその条文またはテーマの簡易タイトル。例:「障害者雇用促進法における合理的配慮の提供」' },
        imageQueries: {
            type: Type.ARRAY,
            description: '無視してください。ダミーとして ["dummy"] を返します。',
            items: { type: Type.STRING },
        },
        summary: {
            type: Type.OBJECT,
            properties: {
                characteristics: { type: Type.STRING, description: '概要やポイント（100字以内）。' },
                causes: { type: Type.STRING, description: 'なぜこの規定・保護が必要とされるのか（100字以内）。' },
                countermeasures: { type: Type.STRING, description: '農場長や農場管理者として満たすべき具体的行動、配慮のポイント（100字以内）。' },
            },
            required: ['characteristics', 'causes', 'countermeasures']
        },
        details: {
            type: Type.OBJECT,
            properties: {
                characteristics: { type: Type.STRING, description: '法律の目的や規定の詳細解説。専門用語は分かりやすく。' },
                causes: { type: Type.STRING, description: '違反や虐待（不適切な関わり）、配慮義務違反にあたる具体的な行為例。' },
                countermeasures: { type: Type.STRING, description: '農場長が遵守すべきチェックリストや具体的な雇用管理のアドバイス（作業指示、通報先、相談連絡等）。' },
            },
            required: ['characteristics', 'causes', 'countermeasures']
        }
    },
    required: ['pestName', 'imageQueries', 'summary', 'details']
  };

  const parts: any[] = [];
  if (image) parts.push({ inlineData: { mimeType: image.mimeType, data: image.data } });
  const baseQuery = image ? `このアップロードされた指示書またはメモ、および質問「${query || "なし"}」に関わる、` : `「${query}」に関わる、`;
  const fullPrompt = `${baseQuery}「障害者雇用促進法」または「障害者虐待防止法」についての解説および具体的対応のアドバイスを、指定されたJSONスキーマに従って構築してください。絶対に個人名や特定できる詳細を回答に含めず、一般的解説として示してください。`;
  parts.push({ text: fullPrompt });

  const config: any = {
      systemInstruction: "あなたは障がい者雇用における法律順守（コンプライアンス）の監査員でありアドバイザーです。障害者雇用促進法（合理的配慮義務、雇用率など）および障害者虐待防止法（身体・言葉による虐待、不承認など）について、一般の農場管理者である『農場長』に向けて明快かつ具体的に説明してください。罰則や規定義務だけでなく、いかに就労スタッフにとって安全な職場を作れるか、合理的配慮を実践できるかの実務的指針にしてください。「障害」については正式な法律用語（障害者雇用促進法、障害者虐待防止法など）以外はすべて「障がい」と表記してください。回答は指定されたJSONスキーマに従ってください。最下部には、必ず「AIの回答は法的な最終判断材料ではなく、必要に応じて都道府県労働局、ハローワーク、専門弁護士等の窓口に適宜相談してください」という旨の注意喚起、および個別スタッフの個別具体的な特性に合わせた対応の推奨を含めます。",
      temperature: 0.5,
      responseMimeType: "application/json",
      responseSchema: lawInfoSchema,
  };
  
  const response = await withRetry<GenerateContentResponse>(() => getAiClient().models.generateContent({ model: 'gemini-3.5-flash', contents: { parts }, config }));
  
  try {
      const jsonText = response.text.trim();
      const parsed = JSON.parse(jsonText);
      parsed.imageQueries = ["dummy"]; // Ensure it stays as array
      return parsed as PestInfo;
  } catch (parseError) {
      console.error("Failed to parse Gemini response as JSON for law info:", response.text, parseError);
      throw new Error("AIからの法律検索応答が不正な形式でした。");
  }
};

/**
 * 障がい者雇用 ＆ 合理的配慮アドバイス（元AI作物診断）
 */
export const diagnosePlantHealth = async (image: { mimeType: string; data: string } | null, textInput?: string): Promise<PlantDiagnosis> => {
  const schema = {
    type: Type.OBJECT,
    properties: {
        plantName: { type: Type.STRING, description: '相談された状況の要旨、または主な相談テーマ（例：自閉症特性のあるスタッフへの時間厳守の指導）。' },
        overallHealth: { type: Type.STRING, description: 'サポートの優先度・注意レベル。「良好・見守り継続」「中レベル対応：要対話・合理的配慮調整」「高レベル対応：要作業の見直し・支援員相談」など。' },
        pestAndDisease: {
            type: Type.OBJECT,
            properties: {
                isDetected: { type: Type.BOOLEAN, description: '何らかの配慮の行きづまりや課題が検出されたかどうか。' },
                details: { type: Type.STRING, description: '提出された相談（または手書きメモの文字起こし情報）に基づく、就労スタッフ側の行動特性や心理的負担のプロフェッショナルな状態分析（自閉、多動、不安等。わかりやすい解説付き）。個人を特定する情報は一切排すること。' },
                countermeasures: { type: Type.STRING, description: '合理的配慮に基づく、農場長から出すべき具体的配慮提案（例：作業工程のセグメント化、写真つきマニュアル、タイマーの活用、感情への共感）。箇条書きで極めて細かく。' },
            },
            required: ['isDetected', 'details', 'countermeasures']
        },
        fertilizer: {
            type: Type.OBJECT,
            properties: {
                recommendation: { type: Type.STRING, description: '農場長（サポートスタッフ）としての心構え。笑顔の関わり、自尊心を高める肯定フレーズ例など。' },
            },
            required: ['recommendation']
        },
        watering: {
            type: Type.OBJECT,
            properties: {
                status: { type: Type.STRING, enum: ['適切', '過剰', '不足', '要調整'], description: '現在の指導サポートの密度・バランス。「見守り適切」「指示指示が多すぎる（過剰指導）」「対話や指示が足りない（コミュニケーション不足）」などの分析。' },
                recommendation: { type: Type.STRING, description: 'スタッフ一人ひとりのモチベーションと自主性を高める、見守りの適切な頻度やアプローチのアドバイス。' },
            },
            required: ['status', 'recommendation']
        },
        environment: {
            type: Type.OBJECT,
            properties: {
                recommendation: { type: Type.STRING, description: '農場の物理的な環境配慮（日よけ・熱中症防止、作業エリアの区分け、刺激や雑音の低減、治具や視覚化アイテムの作成・提供）。' },
            },
            required: ['recommendation']
        }
    },
    required: ['plantName', 'overallHealth', 'pestAndDisease', 'fertilizer', 'watering', 'environment']
  };

  const textToAnalyze = textInput || "（画像による手書きマニュアルやメモの読み込みとアドバイス）";
  const prompt = `以下の農場長からの『就労スタッフに関する相談・状況メモ』に基づき、最適かつ思いやり溢れる雇用支援・合理的配慮のアドバイスを作成してください。
  
  内容：${textToAnalyze}
  
  絶対に個人の本名や、完全な本人特定につながるプライバシー情報は回答に含めず、一般的な状況としての解決例、アドバイスとしてください。また、これが画一的な答えではなく、スタッフ一人ひとりの特性により最適な対応は異なることを促す注意書きを各所に折り込んでください。`;
  
  const parts: any[] = [];
  if (image) {
      parts.push({ inlineData: { mimeType: image.mimeType, data: image.data } });
      parts.push({ text: "画像に写っている手書きメモや作業指示書の文字起こしを行いつつ、次のプロンプトの分析を実施してください：" });
  }
  parts.push({ text: prompt });

  const config = {
      systemInstruction: `あなたは農場などで働く知的障がい、発達障害、精神障害のある「就労スタッフ」への支援を行う最高の職場適応援助者（ジョブコーチ）です。
      専門家ではない「農場長（指導員）」に対して、合理的配慮をベースにした言葉がけ、見守りの頻度、作業指示の工夫、および物理的な環境調整についての具体的なアクションプランを提案します。
      専門用語（例えば「シングルフォーカス」「視覚支援「感覚過敏「構造化」など）を使用する場合は、必ず素人にも理解しやすい言葉で「〜（これは特定のものに注目が向きすぎる状態です）」のように分かりやすい徹底解説を添え、箇条書きやフロー、顔文字や記号などを見やすく装飾した画面構成を念頭に置いてアドバイスを作成してください。
      個人情報の保護のため、回答に特定の個人名や企業名を出さないでください。
      回答は指定されたJSONスキーマに従ってください。
      アドバイスはあくまでAIが生成した一般的な推奨事項・ガイドラインであり、最終的にはその就労スタッフ個人の特性やペースに耳を傾け、試行錯誤しながら合わせていく必要があることを必ず大きく強調・注意喚起してください。`,
      temperature: 0.4,
      responseMimeType: "application/json",
      responseSchema: schema,
  };

  const response = await withRetry<GenerateContentResponse>(() => getAiClient().models.generateContent({ model: 'gemini-3.5-flash', contents: { parts }, config }));
  
  try {
      const jsonText = response.text.trim();
      return JSON.parse(jsonText) as PlantDiagnosis;
  } catch (parseError) {
      console.error("Failed to parse Gemini response as JSON for plant diagnosis:", response.text, parseError);
      throw new Error("AI雇用支援分析の応答が不正な形式でした。");
  }
};

/**
 * 画像からのテキスト(OCR)抽出
 */
export const extractTextFromImage = async (mimeType: string, data: string): Promise<string> => {
    if (!data) return "";

    const response = await withRetry<GenerateContentResponse>(() => getAiClient().models.generateContent({
      model: 'gemini-3.5-flash',
      contents: { parts: [ { text: "この画像から日本語のテキスト（手書きメモ、指示書、プリントなど）を正確に美しく文字起こし（OCR）してください。人物やプライバシーに関係する情報が含まれている場合は、個人を特定できる実名は省いて出力してください。テキストが存在しない場合は、「テキストが見つかりませんでした」と返してください。" }, { inlineData: { mimeType, data } } ] },
    }));
    return response.text.trim();
};

/**
 * 障がい者の区分・特性解説の専門AIアドバイザー（旧 PlantingRecommendation / 作付けおすすめ検索）
 */
export const getPlantingRecommendations = async (months: number[], difficulty: 'low' | 'medium' | 'high', vegetableList: string[]): Promise<any> => {
  // We can leave this as dummy so compiling succeeds, but we will make PlantRecommendationSearchPage a fully offline, beautifully formatted characteristic tutorial layout.
  return [];
};
