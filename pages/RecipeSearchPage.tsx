import React, { useState } from 'react';
import { TextToSpeechButton } from '../components/common/TextToSpeechButton';

type GuideTab = 'institutions' | 'services' | 'procedure';

const RecipeSearchPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<GuideTab>('institutions');

  const institutionsList = [
    {
      name: '🏢 市町村の障害福祉担当課（福祉窓口）',
      role: '障害福祉サービスの申請・給付決定・障害者手帳の日常生活相談に必須',
      desc: 'すべての障がい者福祉サービスの出発点となる各役所の窓口です。就労支援サービスに義務づけられる「受給者証」の申請や、各種手帳の交付手続き、生活お助けサービス等の受付対応を一括で執り行っています。'
    },
    {
      name: '🏢 障害者就業・生活支援センター (通称：なかぽつ)',
      role: '就労と日常生活の両面を一体的に支える最も機動的な相談窓口',
      desc: '全国の各地域に設置。就労スタッフ本人の職務相談に留まらず、健康・金銭管理、住居確保といった暮らしの課題を併行して解決します。農場長などの雇用管理者が「本人にどう接するか」悩んだ際の最も頼れるパートナーです。'
    },
    {
      name: '🤝 公共職業安定所 (ハローワーク 専門窓口)',
      role: '仕事の紹介と、雇用継続のための各種助成金申請・指導窓口',
      desc: '障害者専用の専門相談コーナーを常設。求人の手配や個別のマッチングだけでなく、雇用にともなって支給される各種国庫助成金（特定求職者雇用開発助成金、障害者トライアル雇用など）の法規・実務を指導支援します。'
    },
    {
      name: '🩺 地域障害者職業センター',
      role: '専門的な職業リハビリテーション、ジョブコーチ派遣、職場アセスメント等',
      desc: '専門の職業カウンセラー等が配置され、精緻な作業適性評価（アセスメント）や、現場への「ジョブコーチ」派遣、国の定める職業的重度判定を公式に行う、極めて専門性の高い中核的公的サポート機関です。'
    },
    {
      name: '🏠 基幹相談支援センター',
      role: '地域の相談ネットワークのハブとしてトータル支援を繋ぐ窓口',
      desc: '役所や他の事業所と密接に連携し、様々な困りごと、制度の境界線上にあって対応に悩む課題に対して、適切なサポート機関を案内・差配する地域の総合管制塔です。'
    }
  ];

  const servicesList = [
    {
      title: '🏠 共同生活援助 (グループホーム)',
      subtitle: '地域社会での自立と安全を確保する共同住居サービス',
      desc: '夕食の提供、夜間の見守り、薬や金銭管理の適切な支援を行いながら、スタッフが地域の一軒家やアパートで1人でなく数人で共に暮らす福祉ホーム。安定した生活基盤を整えることで、農場への遅刻・欠勤を防ぎ、規則正しい就労を支える根幹になります。'
    },
    {
      title: '🩺 訪問看護 (精神科訪問看護等)',
      subtitle: '専門の看護師等が自宅を訪問し、心身の健康や服薬を守るサービス',
      desc: '医師の指示に基づき、自宅やグループホームに看護師や作業療法士が定期訪問。服薬の適切なマネジメント、病状変化の予兆検知、生活のリズムの再構築を行い、職場復帰や持続就労を高度に医学的バックアップします。'
    },
    {
      title: '🎒 就労移行支援 / 就労定着支援',
      subtitle: '就職前のビジネス訓練と、就業開始後の定着同行ケア',
      desc: '原則2年間の期限内に、事業所に通ってビジネスマナーや農作業の基礎訓練を行う「就労移行支援」と、一般企業・農場への就活成功後の最初の半年〜3年間にわたり相談員が農場訪問・面談を重ねて離職や現場での行き違いを防ぐ「就労定着支援」があり、雇用を2段階で守ります。'
    },
    {
      title: '🌾 就労継続支援 (A型・B型)',
      subtitle: 'ステップアップや安心した活動のための訓練兼就労サービス',
      desc: '最低賃金を保障する雇用契約を結ぶ「A型事業所」（生産性を高めるトレーニング）と、雇用契約を明確に結ばず本人のペースで自主作業を行い福祉的工賃を得る「B型事業所」があり、農業の適性やコンディションに応じた活躍機会を多角的に提供します。'
    }
  ];

  return (
    <div className="p-4 space-y-6 max-w-xl mx-auto pb-12">
      {/* Page Header */}
      <div className="bg-orange-700 text-white p-6 rounded-2xl shadow-md border-2 border-orange-850">
        <h2 className="text-lg sm:text-xl font-extrabold flex items-center gap-2">
          <span>🏛 公的専門相談機関・福祉サービスガイド</span>
        </h2>
        <p className="text-sm leading-relaxed mt-2 font-bold text-orange-50">
          管理者が一人で複雑な採用、コンディション管理、私生活面の困りごとに悩む必要はありません。安心・持続する就労の実現と、農場の経営を円滑にするための行政・無料福祉サービスの全容を解説します。
        </p>
      </div>

      {/* Selector Tabs - 3 Columns responsive */}
      <div className="grid grid-cols-3 gap-1 bg-orange-100 dark:bg-gray-900 p-1 rounded-xl border-2 border-orange-300 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('institutions')}
          className={`py-2 px-1 text-xs sm:text-sm font-extrabold rounded-lg transition-all ${
            activeTab === 'institutions'
              ? 'bg-orange-700 text-white shadow-md'
              : 'text-orange-955 hover:bg-orange-200/50 dark:text-gray-300'
          }`}
        >
          📞 相談窓口
        </button>
        <button
          onClick={() => setActiveTab('services')}
          className={`py-2 px-1 text-xs sm:text-sm font-extrabold rounded-lg transition-all ${
            activeTab === 'services'
              ? 'bg-orange-700 text-white shadow-md'
              : 'text-orange-955 hover:bg-orange-200/50 dark:text-gray-300'
          }`}
        >
          🏠 支援福祉一覧
        </button>
        <button
          onClick={() => setActiveTab('procedure')}
          className={`py-2 px-1 text-xs sm:text-sm font-extrabold rounded-lg transition-all ${
            activeTab === 'procedure'
              ? 'bg-orange-700 text-white shadow-md'
              : 'text-orange-955 hover:bg-orange-200/50 dark:text-gray-300'
          }`}
        >
          📋 受給手続
        </button>
      </div>

      {/* Tab Contents: institutions */}
      {activeTab === 'institutions' && (
        <div className="space-y-4 fade-in">
          <div className="flex items-center justify-between flex-wrap gap-2 px-1 border-b border-orange-100 dark:border-gray-700 pb-2">
            <p className="text-sm text-gray-955 dark:text-gray-100 font-extrabold leading-relaxed flex-1">
              作業現場における意思疎通のすれ違いや、労働時間の配慮方法など、管理担当者のみで抱え込んで答えを出すのは極めてリスクです。以下の無料公的専門機関にいつでもご相談ください。
            </p>
            <TextToSpeechButton
              content={`公的相談窓口のご案内。
1、市町村の障害福祉担当課。障害福祉サービスの申請、給付決定、障害者手帳の日常生活相談に必須。
2、障害者就業、生活支援センター、通称なかぽつ。就労と日常生活の両面を一体的に支える最も機動的な相談窓口。健康、金銭管理、住居確保といった暮らしの課題に対応。
3、公共職業安定所、ハローワーク専門窓口。仕事の紹介と、雇用継続のための各種助成金申請、指導窓口。
4、地域障害者職業センター。専門的な職業リハビリテーション、ジョブコーチ派遣、職場アセスメント。
5、基幹相談支援センター。地域の相談ネットワークのハブとしてトータル支援を繋ぐ窓口。`}
              size="sm"
            />
          </div>
          {institutionsList.map((inst, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 p-5 rounded-2xl border-2 border-orange-300 dark:border-gray-700 shadow-md space-y-3">
              <h3 className="font-extrabold text-gray-955 dark:text-white text-sm sm:text-base">
                {inst.name}
              </h3>
              <p className="text-xs bg-orange-100 text-orange-955 dark:bg-orange-950/40 dark:text-orange-200 w-fit px-3 py-1 rounded-lg font-extrabold border border-orange-300">
                主な役割：{inst.role}
              </p>
              <p className="text-xs sm:text-sm text-gray-955 dark:text-gray-200 leading-relaxed font-bold mt-2 pt-2 border-t-2 border-dashed border-orange-200 dark:border-gray-700">
                {inst.desc}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Tab Contents: services */}
      {activeTab === 'services' && (
        <div className="space-y-4 fade-in">
          <div className="flex items-center justify-between flex-wrap gap-2 px-1 border-b border-orange-100 dark:border-gray-700 pb-2">
            <p className="text-sm text-gray-955 dark:text-gray-100 font-extrabold px-1 leading-relaxed">
              就労スタッフ本人が生活面や体調面でのコントロールを維持し、安定した貢献を行うためには、グループホーム・医療連携などの生活支援福祉サービスを利用することが重要です。
            </p>
            <TextToSpeechButton
              content={`支援福祉サービスのご案内。
1、共同生活援助、グループホーム。夕食の提供、夜間の見守り、薬や金銭管理の適切な支援を行いながら、スタッフが地域の一軒家やアパートで共に暮らす福祉ホーム。
2、訪問看護、精神科訪問看護等。専門の看護師等が自宅を訪問し、心身の健康や服薬を守るサービス。
3、就労移行支援、就労定着支援。原則2年間の期限内にマナーや農作業の基礎訓練を行う就労移行支援と、就労開始後の定着同行ケアを行う就労定着支援。
4、就労継続支援、A型、B型。最低賃金を保障する雇用契約を結ぶA型事業所と、本人のペースで自主作業を行い福祉的工賃を得るB型事業所。`}
              size="sm"
            />
          </div>
          {servicesList.map((srv, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 p-5 rounded-2xl border-2 border-orange-200 dark:border-gray-700 shadow-md space-y-2">
              <h3 className="font-extrabold text-orange-950 dark:text-orange-200 text-sm sm:text-base">
                {srv.title}
              </h3>
              <p className="text-xs font-bold text-gray-550 dark:text-gray-300">
                {srv.subtitle}
              </p>
              <p className="text-xs sm:text-sm text-gray-955 dark:text-gray-100 leading-relaxed font-semibold pt-2 border-t border-orange-100 dark:border-gray-750">
                {srv.desc}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Tab Contents: procedure */}
      {activeTab === 'procedure' && (
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border-2 border-orange-300 dark:border-gray-700 shadow-md space-y-5 fade-in">
          <div className="flex items-center justify-between flex-wrap gap-2 border-b-2 border-orange-200 pb-1.5">
            <h3 className="font-extrabold text-orange-955 dark:text-orange-200 text-base flex items-center gap-2">
              <span>📋</span> <span>障がい福祉サービス 受給までの具体的手続</span>
            </h3>
            <TextToSpeechButton
              content={`障がい福祉サービス 受給までの具体的手続。
ステップ1、障害者手帳または医師の診断書の準備。精神、知的、身体の手帳、もしくは主治医の利用が必要と記された医師の診断書や通院証明書を手に入れます。
ステップ2、市町村福祉窓口での利用相談、支給申請。市区町村役場の障害福祉課などを訪問し、自身に合ったサービスを申請します。この際、現行の体調や就労意欲に関する認定面談が行われます。
ステップ3、サービス等利用計画案の作成、提出。役所の指定する指定相談支援事業所の計画作成専門員が本人と面談し、利用計画書案を作成して市役所へ提出します。
ステップ4、受給者証の交付と福祉事業所との本契約。役所の審査、支給決定を経て、受給者証が本人のもとへ送付されます。これを持って希望するグループホームや事業所等と最終利用契約を結び、利用がスタートします。`}
              size="sm"
            />
          </div>
          <p className="text-sm text-gray-955 dark:text-gray-100 font-bold leading-relaxed">
            生活や通労を支える福祉サービスや就労支援を、自己負担「原則１割（※所得に応じた免除枠によりほぼゼロ）」で利用するためには、行政手続きを経て『受給者証』の交付を受ける必要があります。
          </p>

          <div className="space-y-4 font-bold text-sm">
            {/* Step 1 */}
            <div className="p-4 bg-orange-50/75 dark:bg-gray-955/35 rounded-xl border-2 border-orange-200 space-y-2">
              <p className="font-extrabold text-orange-955 dark:text-white text-sm sm:text-base flex items-center gap-2">
                <span className="w-6 h-6 bg-orange-700 text-white text-xs font-black rounded-full flex items-center justify-center">1</span>
                <span>障害者手帳 or 医師の診断書の準備</span>
              </p>
              <p className="text-xs sm:text-sm text-gray-955 dark:text-gray-200 leading-relaxed pl-8">
                サービス適用の大前提となる障害者手帳（精神・知的・身体）の保有、もしくは精神科・総合病院の定期通院主治医より「本サービス利用が必要である」と記された「医師の診断書・通院証明書」を手に入れます。
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-4 bg-orange-50/75 dark:bg-gray-955/35 rounded-xl border-2 border-orange-200 space-y-2">
              <p className="font-extrabold text-orange-955 dark:text-white text-sm sm:text-base flex items-center gap-2">
                <span className="w-6 h-6 bg-orange-700 text-white text-xs font-black rounded-full flex items-center justify-center">2</span>
                <span>市町村福祉窓口での「利用相談・支給申請」</span>
              </p>
              <p className="text-xs sm:text-sm text-gray-955 dark:text-gray-200 leading-relaxed pl-8">
                本人が市区町村役場の「障害福祉課」などを訪問し、自身に合ったサービスを申請します。この際、現行の体調・就労意欲に関する認定面談（聞き取り・認定調査）が行われます。
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-4 bg-orange-50/75 dark:bg-gray-955/35 rounded-xl border-2 border-orange-200 space-y-2">
              <p className="font-extrabold text-orange-955 dark:text-white text-sm sm:text-base flex items-center gap-2">
                <span className="w-6 h-6 bg-orange-700 text-white text-xs font-black rounded-full flex items-center justify-center">3</span>
                <span>「サービス等利用計画案」の作成・提出</span>
              </p>
              <p className="text-xs sm:text-sm text-gray-955 dark:text-gray-200 leading-relaxed pl-8">
                役所の指定する「指定相談支援事業所」に属する計画作成専門員が本人と面談し、「どのようにサービスを週何回使い、自立を図るか」を書いた計画書案を作成し、市役所へ提出します。
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-4 bg-green-50/75 dark:bg-gray-955/35 rounded-xl border-2 border-green-300 space-y-2">
              <p className="font-extrabold text-emerald-955 dark:text-emerald-200 text-sm sm:text-base flex items-center gap-2">
                <span className="w-6 h-6 bg-green-600 text-white text-xs font-black rounded-full flex items-center justify-center">4</span>
                <span>「受給者証」の交付＆福祉事業所との本契約</span>
              </p>
              <p className="text-xs sm:text-sm text-gray-955 dark:text-gray-200 leading-relaxed pl-8">
                役所の審査、支給決定を経て、支給決定額・有効期限が刻印された「受給者証」が本人のもとへ送付されます。これを持って希望するグループホームや事業所等と最終利用契約を結び、利用がスタートします。
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeSearchPage;
