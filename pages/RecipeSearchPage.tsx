import React, { useState } from 'react';
import { ExternalLinkIcon } from '../components/Icons';

type GuideTab = 'institutions' | 'process';

const RecipeSearchPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<GuideTab>('institutions');

  const institutionsList = [
    {
      name: '🏢 JEED 高齢・障害・求職者雇用支援機構 (高齢・障害者業務所在地)',
      role: '障害者雇用の実務マニュアル・助成金申請・合理的配慮データベース提供元',
      desc: '障害者の雇用の促進・継続を多角的にバックアップする国の専門機関。高齢者の就労支援も管轄しています。各種障害者雇用納付金、合理的配慮の具体的事例が業種ごとに検索できる日本最大の「合理的配慮事例データベース」を公開しており、農場長をはじめとする事業主の強い味方です。',
      url: 'https://www.jeed.go.jp/index.html'
    },
    {
      name: '🩺 地域障害者職業センター (JEED運営)',
      role: '専門的な職業リハビリテーション・ジョブコーチ派遣を行う専門機関',
      desc: 'JEEDが各都道府県に設置している専門センター。障害特性の科学的評価（アセスメント）や、職場を模した準備訓練、ジョブコーチ（職場適応を助ける専門員）を農場に直接派遣する事業を行っています。専門性の高い個別プランに基づき、スタッフが長く働ける環境作りを無料サポートします。',
      url: 'https://www.jeed.go.jp/disability/jeed_center.html'
    },
    {
      name: '🏢 障害者就業・生活支援センター (なかぽつ)',
      role: '就労と日常生活を一体的に支える最も身近な総合相談窓口',
      desc: '全国の各地区（複数の自治体に1箇所程度）に設置。仕事面だけでなく、健康管理、金銭管理、住生活の悩みなど、暮らす上での自立も同時に助けます。日々の農業現場での本人とのすれ違いや、ちょっとした行動の乱れについても気軽に相談できる最も身近なパートナーです。',
    },
    {
      name: '🤝 公共職業安定所 (ハローワーク 専門窓口)',
      role: '仕事の紹介と、雇用継続のための各種助成金・指導要請窓口',
      desc: '各地域のハローワークに設置されている障害者専門窓口。雇用契約の新規締結、障害特性に応じたマッチングの提供、体験的に雇用する「トライアル雇用助成金」の申請、職場適応を促す指導員等の配置助成金などの相談を受け付けています。',
    }
  ];

  return (
    <div className="p-4 space-y-6 max-w-xl mx-auto pb-12">
      {/* Page Header with High Contrast for Accessibility */}
      <div className="bg-orange-700 text-white p-6 rounded-2xl shadow-md border-2 border-orange-850">
        <h2 className="text-lg sm:text-xl font-extrabold flex items-center gap-2">
          <span>🏛 JEED・外部公的専門相談機関ガイド</span>
        </h2>
        <p className="text-sm leading-relaxed mt-2 font-bold text-orange-50">
          農場長が一人で悩みを抱え込まず、高齢者や障害者の雇用安定を支える国の推進機関「JEED（高齢・障害・求職者雇用支援機構）」などの外部公的機関を頼るためのルートガイドです。
        </p>
      </div>

      {/* Official Directory Highlights of JEED */}
      <div className="bg-orange-50 dark:bg-gray-800 p-5 rounded-2xl border-2 border-orange-350 space-y-3">
        <h3 className="font-extrabold text-orange-950 dark:text-orange-200 text-sm sm:text-base flex items-center gap-1.5">
          <span>💼</span> <span>高齢者・障害者雇用の専門推進機関：JEED</span>
        </h3>
        <p className="text-xs sm:text-sm text-gray-950 dark:text-gray-100 leading-relaxed font-bold">
          独立行政法人 高齢・障害・求職者雇用支援機構（JEED）は、障害や年齢にかかわらず、誰もが適性に応じて持てる力を発揮し働ける社会づくりを無料支援している極めて重要な組織機関です。
        </p>
        
        {/* Large Portal Access Buttons */}
        <div className="grid grid-cols-1 gap-2 pt-1">
          <a
            href="https://www.jeed.go.jp/index.html"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3.5 bg-white hover:bg-orange-100 dark:bg-gray-700 dark:hover:bg-gray-650 border-2 border-orange-300 rounded-xl transition-all shadow-sm active:scale-95 group"
          >
            <div className="flex-grow pr-2">
              <span className="text-xs sm:text-sm font-black text-gray-950 dark:text-orange-203 block">JEEDの公式ホームページ</span>
              <span className="text-xs text-gray-900 dark:text-gray-300 font-bold block mt-0.5">最新の障害者雇用関連法、助成金の仕組み、高齢者・障害者雇用マニュアル・マテリアルを一覧閲覧できます。</span>
            </div>
            <ExternalLinkIcon className="h-5 w-5 text-orange-700 flex-shrink-0 group-hover:scale-110 transition-transform" />
          </a>

          <a
            href="https://www.jeed.go.jp/disability/employer/reasonable_accommodation.html"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3.5 bg-white hover:bg-orange-100 dark:bg-gray-700 dark:hover:bg-gray-650 border-2 border-orange-300 rounded-xl transition-all shadow-sm active:scale-95 group"
          >
            <div className="flex-grow pr-2">
              <span className="text-xs sm:text-sm font-black text-gray-950 dark:text-orange-203 block">合理的配慮 事例データベース</span>
              <span className="text-xs text-gray-900 dark:text-gray-300 font-bold block mt-0.5">合理的配慮の提供義務化に伴い、農業分野、知的・発達・精神など特性別に何百もの実践配慮の成功事例を検索・確認できます。</span>
            </div>
            <ExternalLinkIcon className="h-5 w-5 text-orange-700 flex-shrink-0 group-hover:scale-110 transition-transform" />
          </a>
        </div>
      </div>

      {/* Selector Tabs with Bold and High Contrast */}
      <div className="flex bg-orange-100 p-1.5 rounded-xl border-2 border-orange-300">
        <button
          onClick={() => setActiveTab('institutions')}
          className={`flex-1 py-3 text-sm font-extrabold rounded-lg transition-all ${
            activeTab === 'institutions'
              ? 'bg-orange-700 text-white shadow-md'
              : 'text-orange-950 hover:bg-orange-200/50'
          }`}
        >
          📞 国・公的外部相談機関
        </button>
        <button
          onClick={() => setActiveTab('process')}
          className={`flex-1 py-3 text-sm font-extrabold rounded-lg transition-all ${
            activeTab === 'process'
              ? 'bg-orange-700 text-white shadow-md'
              : 'text-orange-950 hover:bg-orange-200/50'
          }`}
        >
          🔄 各種支援サービス利用の流れ
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'institutions' && (
        <div className="space-y-4 fade-in">
          <p className="text-sm text-gray-950 dark:text-gray-100 font-extrabold px-1 leading-relaxed">
            高齢者や障害者の就労におけるトラブルが生じた時、管理者がひとりで判断してはいけません。下記の公的機関・専門員は、すべて親身に相談や問題解決をしてくれます。
          </p>
          {institutionsList.map((inst, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 p-5 rounded-2xl border-2 border-orange-300 dark:border-gray-700 shadow-md space-y-3">
              <div className="flex justify-between items-start gap-2">
                <h3 className="font-extrabold text-gray-950 dark:text-white text-base">
                  {inst.name}
                </h3>
                {inst.url && (
                  <a
                    href={inst.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 px-2.5 bg-orange-100 hover:bg-orange-200 dark:bg-gray-750 text-orange-950 dark:text-orange-203 text-xs font-black rounded border border-orange-350 flex items-center gap-1"
                  >
                    <span>詳細解説</span>
                    <ExternalLinkIcon className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
              <p className="text-xs sm:text-sm bg-orange-100 text-orange-950 dark:bg-orange-950/40 dark:text-orange-200 w-fit px-3 py-1.5 rounded-lg font-extrabold border-2 border-orange-300">
                役割：{inst.role}
              </p>
              <p className="text-sm text-gray-950 dark:text-gray-100 leading-relaxed font-bold mt-2 pt-2 border-t-2 border-dashed border-orange-200 dark:border-gray-700">
                {inst.desc}
              </p>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'process' && (
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border-2 border-orange-300 dark:border-gray-700 shadow-md space-y-5 fade-in">
          <h3 className="font-extrabold text-orange-950 dark:text-orange-200 text-base border-b-2 border-orange-200 pb-1.5 flex items-center gap-2">
            <span>🔄</span> <span>公的福祉サービス・JOBCoach導入の4つのステップ</span>
          </h3>
          <p className="text-sm text-gray-950 dark:text-gray-100 font-bold leading-relaxed">
            ジョブコーチ（職場適応支援者）の農場への派遣や、就労継続支援（A型・B型）・定着支援サービス等を新規に導入・利用する場合の一般的な行政・推進手続きフローを解説します。
          </p>

          {/* Flowchart Diagram */}
          <div className="space-y-4 font-bold text-sm">
            {/* Step 1 */}
            <div className="p-4 bg-orange-50/70 dark:bg-gray-950/30 rounded-xl border-2 border-orange-200 flex gap-3">
              <span className="w-8 h-8 bg-orange-700 text-white text-base font-extrabold rounded-lg flex items-center justify-center flex-shrink-0">1</span>
              <div>
                <p className="font-extrabold text-orange-950 dark:text-white text-sm sm:text-base mb-1">① お近くの相談支援窓口、またはハローワークへの相談（事前診断）</p>
                <p className="text-xs sm:text-sm text-gray-955 dark:text-gray-100 leading-relaxed font-bold">まずは市区町村の役所、なかぽつセンター、またはハローワークに相談。ジョブコーチ支援をご希望の場合は最寄りの地域障害者職業センターへ直接申請を行います。</p>
              </div>
            </div>
            <div className="text-center font-extrabold text-orange-600 text-2xl">&#x2193;</div>

            {/* Step 2 */}
            <div className="p-4 bg-orange-50/70 dark:bg-gray-950/30 rounded-xl border-2 border-orange-200 flex gap-3">
              <span className="w-8 h-8 bg-orange-700 text-white text-base font-extrabold rounded-lg flex items-center justify-center flex-shrink-0">2</span>
              <div>
                <p className="font-extrabold text-orange-950 dark:text-white text-sm sm:text-base mb-1">② 専門家による「職場アセスメント（現状把握と計画立案）」</p>
                <p className="text-xs sm:text-sm text-gray-955 dark:text-gray-100 leading-relaxed font-bold">専門の相談員や職業カウンセラーが農業現場に訪問。作業内容、スタッフ本人と周囲の指導員のやりとりを観察・評価し、具体的な支援計画（合理的配慮の内容や指導時間など）を作成します。</p>
              </div>
            </div>
            <div className="text-center font-extrabold text-orange-600 text-2xl">&#x2193;</div>

            {/* Step 3 */}
            <div className="p-4 bg-orange-50/70 dark:bg-gray-950/30 rounded-xl border-2 border-orange-300 flex gap-3">
              <span className="w-8 h-8 bg-orange-700 text-white text-base font-extrabold rounded-lg flex items-center justify-center flex-shrink-0">3</span>
              <div>
                <p className="font-extrabold text-orange-950 dark:text-white text-sm sm:text-base mb-1">③ 支援期間の決定（職場適応の試行＆トレーニング）</p>
                <p className="text-xs sm:text-sm text-gray-955 dark:text-gray-100 leading-relaxed font-bold">ジョブコーチが農場に常駐、または定期訪問を繰り返します。作業手順を写真やリストで構造化（ビジュアル化）する合理的配慮を共に施し、現場環境に適用させていきます。</p>
              </div>
            </div>
            <div className="text-center font-extrabold text-orange-600 text-2xl">&#x2193;</div>

            {/* Step 4 */}
            <div className="p-4 bg-green-50/70 dark:bg-gray-950/30 rounded-xl border-2 border-green-300 flex gap-3">
              <span className="w-8 h-8 bg-green-600 text-white text-base font-extrabold rounded-lg flex items-center justify-center flex-shrink-0">4</span>
              <div>
                <p className="font-extrabold text-emerald-950 dark:text-emerald-200 text-sm sm:text-base mb-1">④ コーチ支援の終了 ＆ 自立就労への安定フォロー</p>
                <p className="text-xs sm:text-sm text-gray-955 dark:text-gray-100 leading-relaxed font-bold">本人への課題が落ち着き、既存スタッフとの直接やり取り（フェージング）が整い次第、支援員が段階的に撤退。その後も何か変化があれば、いつでも迅速に再相談ができる体制となります。</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeSearchPage;
