import React from 'react';
import {
  ObservationIcon, VegetableSearchIcon, PestSearchIcon,
  DictionaryIcon, RecipeIcon, PlantingIcon, TrueLeavesIcon, CalculatorIcon
} from '../components/Icons';

const ToolsPage: React.FC<{ setPage: (page: string) => void }> = ({ setPage }) => {
  const tools = [
    { name: '農場長サポートAI相談窓口', desc: '音声・テキスト・手書き指示書OCRでAIのアドバイスをいつでも受けられます。', icon: ObservationIcon, page: 'PLANT_DIAGNOSIS', color: 'text-orange-800' },
    { name: '緊急対応マニュアル', desc: '熱中症・心肺蘇生(CPR)・てんかんなどの緊急対応指示と救急タイマー・音声メモ。', icon: VegetableSearchIcon, page: 'VEGETABLE_SEARCH', color: 'text-red-700' },
    { name: '合理的配慮・コンプライアンス法律検索', desc: '障がい者雇用促進法と虐待防止法の厳守事項とおちいりやすい不適切関わりを検索。', icon: PestSearchIcon, page: 'PEST_SEARCH', color: 'text-orange-900' },
    { name: '障がい特性・合理的配慮解説', desc: '知的・発達・精神・身体障がいごとの特性と現場で今すぐ役立つ合理的配慮アプローチ。', icon: PlantingIcon, page: 'PLANTING_RECOMMENDATION_SEARCH', color: 'text-amber-800' },
    { name: '障害者手帳の基準・重度判定解説', desc: '国の定める手帳基準の目安と、雇用算定等で重視される重度・軽度の区分線を詳しく解説。', icon: TrueLeavesIcon, page: 'HANDBOOK_INFO', color: 'text-orange-700' },
    { name: '障害者雇用促進法の算定・計算解説', desc: '法定雇用率の推移、ダブルカウントや特定短時間の人数計算、納付金制度を分かり易く解説。', icon: CalculatorIcon, page: 'EMPLOYMENT_LAW_INFO', color: 'text-rose-800' },
    { name: '障がい者福祉用語辞典', desc: '就労移行支援、感覚過敏など、対話のなかで出てくる専門用語を分かりやすく引き出せます。', icon: DictionaryIcon, page: 'TERM_SEARCH', color: 'text-orange-700' },
    { name: '専門相談窓口・福祉サービス利用ガイド', desc: '地域障がい者職業センターやハローワーク、相談窓口の一覧を活用手順を含めてご紹介。', icon: RecipeIcon, page: 'RECIPE_SEARCH', color: 'text-amber-900' },
  ];

  return (
    <div className="p-4 max-w-xl mx-auto space-y-4 pb-12">
      {/* Intro block with high contrast design */}
      <div className="bg-orange-100 dark:bg-gray-800 p-5 rounded-2xl border-2 border-orange-350 shadow-sm">
        <h3 className="font-extrabold text-orange-950 dark:text-orange-200 text-base sm:text-lg flex items-center gap-2">
          <span>🛠️</span> <span>現場で役立つ管理者向け対応支援ツール</span>
        </h3>
        <p className="text-sm sm:text-base text-gray-950 dark:text-gray-100 leading-relaxed mt-2 font-bold">
          農場の日常運営、障がい特性に合わせた対話のアプローチ、そして緊急を要する熱中症や発作トラブルなど、いつでもすぐに確認・測定できる専門ツール集です。
        </p>
      </div>

      {/* Grid: 2 columns for a neat grid layout on all screens */}
      <div className="grid grid-cols-2 gap-3">
        {tools.map(tool => (
          <button
            key={tool.page}
            onClick={() => setPage(tool.page)}
            className="bg-white dark:bg-gray-800 p-3.5 rounded-2xl shadow-md border-2 border-orange-200 dark:border-gray-700 hover:bg-orange-50 dark:hover:bg-gray-755 transition-all flex flex-col items-center text-center gap-2.5 w-full active:scale-[0.98]"
          >
            {/* Top Icon panel */}
            <div className={`p-3 rounded-xl bg-orange-100 dark:bg-gray-750 ${tool.color} flex-shrink-0 flex items-center justify-center border border-orange-200`}>
              <tool.icon className="h-6 w-6" />
            </div>

            {/* Bottom Text content */}
            <div className="space-y-1 w-full">
              <span className="font-extrabold text-gray-950 dark:text-gray-100 block text-xs sm:text-sm md:text-base leading-snug">
                {tool.name}
              </span>
              <span className="text-[10px] sm:text-xs text-gray-800 dark:text-gray-300 block font-bold leading-normal">
                {tool.desc}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ToolsPage;
