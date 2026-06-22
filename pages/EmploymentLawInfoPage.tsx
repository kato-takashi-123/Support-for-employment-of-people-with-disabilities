import React from 'react';
import { AppSettings } from '../types';

type EmploymentLawInfoPageProps = {
  settings?: AppSettings;
};

const EmploymentLawInfoPage: React.FC<EmploymentLawInfoPageProps> = ({ settings }) => {
  // Read values dynamically with robust pre-set fallbacks
  const rate2024 = settings?.legalRate2024 ?? 2.5;
  const rate2026 = settings?.legalRate2026 ?? 2.7;
  const levyVal = settings?.levyAmount ?? 50000;
  const adjVal = settings?.adjustmentAmount ?? 29000;
  const rewardVal = settings?.rewardAmount ?? 21000;
  const updateLog = settings?.legalUpdateLog;
  const lastCheck = settings?.lastLegalUpdateCheck;

  // Dynamically calculate the trigger company size (100 / rate, rounded nicely)
  const workersLimit2024 = rate2024 === 2.5 ? "40.0" : (100 / rate2024).toFixed(1);
  const workersLimit2026 = rate2026 === 2.7 ? "37.5" : (100 / rate2026).toFixed(1);

  return (
    <div className="p-4 space-y-6 max-w-xl mx-auto pb-12" id="employment-law-page">
      {/* Page Header */}
      <div className="bg-orange-700 text-white p-6 rounded-2xl shadow-md border-2 border-orange-850">
        <h2 className="text-lg sm:text-xl font-extrabold flex items-center gap-2">
          <span>⚖️ 障害者雇用促進法・実務カウント解説</span>
        </h2>
        <p className="text-sm leading-relaxed mt-2 font-bold text-orange-50">
          事業主が守るべき「法定雇用率」の仕組み、スタッフ採用時の「人数カウント（計算ルール）」、そして納付金・助成金のマネジメントを、図を交えて徹底解説します。
        </p>
      </div>

      {/* Sync Status Badge if verified */}
      <div className="bg-orange-50 dark:bg-gray-900 border-2 border-orange-200 dark:border-gray-700 p-4 rounded-2xl shadow-sm text-xs font-bold text-gray-800 dark:text-gray-200 space-y-2">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-orange-800 dark:text-orange-300">
            <span className="inline-block w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
            <b>📲 法改正自動パッチ同期状態</b>
          </span>
          <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 px-2 py-0.5 rounded-full">
            {lastCheck ? `${lastCheck.split('T')[0]} 同期済` : '初期組み込み版（最新）'}
          </span>
        </div>
        <p className="text-gray-600 dark:text-gray-400 font-light leading-relaxed text-[11px] border-t border-orange-100 dark:border-gray-800 pt-2">
          {updateLog || "2024年4月の2.5％法定雇用率引き上げ、週10〜20時間未満の特定短時間算定の追加、および2026年7月の2.7％引き上げまで完全対応しています。設定の「法改正チェックボタン」から最新情報をいつでも確認できます。"}
        </p>
      </div>

      {/* 1. Legal Rate Transition Graph */}
      <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border-2 border-orange-300 dark:border-gray-700 shadow-md space-y-4">
        <h3 className="font-extrabold text-orange-950 dark:text-orange-200 text-base border-b border-orange-150 pb-1.5 flex items-center gap-2 animate-fadeIn">
          <span>📈</span> <span>法定雇用率の推移と「義務となる企業規模」</span>
        </h3>
        <p className="text-xs sm:text-sm text-gray-955 dark:text-gray-100 font-bold leading-relaxed">
          働く意欲のある障がい者を社会全体で支えるため、法律で定められた雇用義務割合は段階的に引き下げ（義務対象の拡大）および雇用率基準の引き上げがされています。常用労働者数（分母）の基準も引き下がり、中小農場にとっても大変身近な問題となっています。
        </p>

        {/* CSS-based Bar Grid Displaying Trend of statutory rate */}
        <div className="space-y-3 pt-2 font-bold text-xs sm:text-sm">
          {/* Year 2018 */}
          <div className="space-y-1">
            <div className="flex justify-between text-gray-755 dark:text-gray-300">
              <span>📅 2018年4月〜</span>
              <span>2.2 ％ (常用労働者 45.5人以上)</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-700 h-5 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-650">
              <div className="bg-orange-300 h-full flex items-center pl-3 text-orange-950 text-[10px]" style={{ width: '81%' }}>
                81% / 基準値
              </div>
            </div>
          </div>

          {/* Year 2021 */}
          <div className="space-y-1">
            <div className="flex justify-between text-gray-755 dark:text-gray-300">
              <span>📅 2021年3月〜</span>
              <span>2.3 ％ (常用労働者 43.5人以上)</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-700 h-5 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-650">
              <div className="bg-orange-400 h-full flex items-center pl-3 text-orange-950 text-[10px]" style={{ width: '85%' }}>
                85% / 旧改正
              </div>
            </div>
          </div>

          {/* Year 2024 (Now) */}
          <div className="space-y-1">
            <div className="flex justify-between text-red-700 dark:text-red-400 font-black">
              <span>🔥 2024年4月〜 (現在)</span>
              <span>{rate2024.toFixed(1)} ％ (常用労働者 {workersLimit2024}人以上で雇用義務)</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-700 h-6 rounded-lg overflow-hidden border-2 border-orange-500">
              <div className="bg-orange-600 text-white h-full flex items-center pl-3 text-xs font-black animate-pulse" style={{ width: `${(rate2024 / 2.7) * 100}%` }}>
                {rate2024.toFixed(1)}％ 適用中！
              </div>
            </div>
          </div>

          {/* Year 2026 (Upcoming) */}
          <div className="space-y-1">
            <div className="flex justify-between text-red-900 dark:text-red-300 font-black">
              <span>🚀 2026年7月〜 (確定)</span>
              <span>{rate2026.toFixed(1)} ％ (常用労働者 {workersLimit2026}人以上で雇用義務)</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-700 h-7 rounded-lg overflow-hidden border-2 border-red-700">
              <div className="bg-red-700 text-white h-full flex items-center pl-3 text-xs font-black" style={{ width: '100%' }}>
                {rate2026.toFixed(1)}％ 急拡大（雇用基準引上げ）
              </div>
            </div>
          </div>
        </div>
        <p className="text-[10px] text-gray-500 font-bold leading-normal">
          ※常用労働者数とは、役員等を除く「週30時間以上働く従業員（1.0人換算）」と「週20時間以上30時間未満働く従業員（0.5人換算）」の合計人数です。アルバイトの比率等によって対象になるか決まります。
        </p>
      </div>

      {/* 2. Counting Rule (頭数カウントの仕組み) */}
      <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border-2 border-orange-300 dark:border-gray-700 shadow-md space-y-4">
        <h3 className="font-extrabold text-orange-950 dark:text-orange-200 text-base border-b border-orange-150 pb-1.5 flex items-center gap-2">
          <span>🧮</span> <span>障がい者雇用の「人数換算・計算ルール」</span>
        </h3>
        <p className="text-xs sm:text-sm text-gray-955 dark:text-gray-100 font-bold leading-relaxed">
          障がい者雇用率の算定時、スタッフの「障害等級（重度・軽度）」および「週の所定労働時間」によって、1契約あたり何人分として法的にカウントされるかが大きく変わります。
        </p>

        <div className="overflow-x-auto">
          <table className="min-w-full text-xs border-2 border-orange-200 dark:border-gray-750 font-bold">
            <thead>
              <tr className="bg-orange-50 dark:bg-gray-900 border-b border-orange-200 text-orange-950 dark:text-white">
                <th className="p-2 border-r border-orange-200">契約区分 \ 障害種別</th>
                <th className="p-2 border-r border-orange-200 text-center text-emerald-900 dark:text-emerald-300">一般(中・軽度)</th>
                <th className="p-2 text-center text-red-800 dark:text-red-300">重度 (身体・知的)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-orange-100 dark:divide-gray-700 text-gray-955 dark:text-gray-100">
              <tr>
                <td className="p-2 border-r border-orange-200 bg-orange-50/20 font-extrabold text-left leading-tight">
                  🕰 <b>常時雇用</b><br />(週30時間以上)
                </td>
                <td className="p-2 border-r border-orange-200 text-center font-extrabold text-[#15803d]">
                  1.0 人分
                </td>
                <td className="p-2 text-center font-black text-red-700 bg-red-50/30">
                  ⚡️ 2.0 人分<br />(ダブル換算)
                </td>
              </tr>
              <tr>
                <td className="p-2 border-r border-orange-200 bg-orange-50/20 font-extrabold text-left leading-tight">
                  🕰 <b>短時間雇用</b><br />(週20h以上30h未満)
                </td>
                <td className="p-2 border-r border-orange-200 text-center font-extrabold text-gray-600 dark:text-gray-300">
                  0.5 人分
                </td>
                <td className="p-2 text-center font-black text-[#15803d] bg-emerald-50/30">
                  1.0 人分<br />(1名カウント)
                </td>
              </tr>
              <tr>
                <td className="p-2 border-r border-orange-200 bg-orange-50/20 font-extrabold text-left leading-tight">
                  ⚠️ <b>特定短時間</b><br />(週10h以上20h未満)<br />
                  <span className="text-[9px] text-gray-405 font-medium">※2024年4月解禁！</span>
                </td>
                <td className="p-2 border-r border-orange-200 text-center font-semibold text-gray-500 dark:text-gray-400">
                  不対象<br />
                  <span className="text-[9px] text-gray-400 font-medium">(※精神のみ0.5人可)</span>
                </td>
                <td className="p-2 text-center font-extrabold text-[#15803d] bg-yellow-50/20">
                  💡 0.5 人分<br />
                  <span className="text-[9px] text-gray-500 font-medium">(超短時間雇用が可能)</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Mental Specific warning */}
        <div className="p-3 bg-blue-50 dark:bg-gray-900 border border-blue-250 rounded-lg text-xs leading-relaxed">
          <span className="font-extrabold text-blue-900 dark:text-blue-300 font-bold">💡 【精神障害のある方の特例】：</span><br />
          精神障害者手帳の保有者を<strong>「短時間（週20時間以上30時間未満）」</strong>で雇用する場合、一定の要件（雇入れから3年以内、または精神障害者手帳取得から3年以内等の要件を満たす場合。または新規入社全般）において、通常0.5名のところ<strong>特別に「1.0名」として算定できる緩和特例</strong>が設けられています（超短時間でも0.5人対象）。精神障がいの採用を強力にあと押しする国の政策です。
        </div>
      </div>

      {/* 3. Levy and Grants System (納付金・調整金) */}
      <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border-2 border-orange-300 dark:border-gray-700 shadow-md space-y-4">
        <h3 className="font-extrabold text-orange-950 dark:text-orange-200 text-base border-b border-orange-150 pb-1.5 flex items-center gap-2">
          <span>💰</span> <span>障害者雇用納付金制度（ペナルティと還元の仕組み）</span>
        </h3>
        <p className="text-xs sm:text-sm text-gray-955 dark:text-gray-100 font-bold leading-relaxed">
          障がい者雇用に関わる企業の経済的負担の不均衡を平準化するため、国（独立行政法人 高齢・障害・求職者雇用支援機構：JEED）が徴収・配分する仕組みです。<strong>「従業員100人を超える中小企業・大企業」</strong>を基準にして、以下のようにお金の動きが規定されます。
        </p>

        <div className="space-y-3 font-bold text-xs sm:text-sm">
          {/* Penalty path */}
          <div className="p-3.5 bg-red-100/40 dark:bg-red-950/20 border border-red-200 rounded-xl">
            <p className="text-[#991b1b] dark:text-red-300 font-extrabold flex items-center gap-1">
              <span>🛑</span> <span>法定雇用率に「未達成」の場合：<b>納付金</b></span>
            </p>
            <p className="text-xs leading-relaxed text-gray-800 dark:text-gray-200 mt-1 pl-5">
              従業員が100人を超える企業において、不足している障がい者スタッフ1人につき、並行して<strong>毎月 {levyVal.toLocaleString()} 円</strong>のペナルティ（納付金）が徴収されます（不納付時に労働局告示・実名公表などのコンプライアンスリスク等あり）。
            </p>
          </div>

          {/* Reward path */}
          <div className="p-3.5 bg-green-100/40 dark:bg-emerald-950/20 border border-green-200 rounded-xl">
            <p className="text-emerald-800 dark:text-emerald-300 font-extrabold flex items-center gap-1">
              <span>🎉</span> <span>法定雇用率に「達成・超過」の場合：<b>調整金・報奨金</b></span>
            </p>
            <div className="text-xs leading-relaxed text-gray-800 dark:text-gray-200 mt-1 pl-5 space-y-1">
              <p>雇用義務のある100人超え企業が超過させた場合：</p>
              <p className="font-extrabold text-emerald-900 border-l-2 border-emerald-500 pl-2">
                🌟 超過1名につき、月額 <b>{adjVal.toLocaleString()} 円</b> の「障害者雇用調整金」を支給！
              </p>
              <p className="mt-2">雇用義務がない100人以下の小規模農場であっても、一定人数（常用4％または年度計72人超等）の障がい者を雇用している場合：</p>
              <p className="font-extrabold text-emerald-900 border-l-2 border-emerald-500 pl-2">
                🌟 基準を超えた1名につき、月額 <b>{rewardVal.toLocaleString()} 円</b> の「障害者雇用報奨金」を還元支給！
              </p>
            </div>
          </div>
        </div>

        <p className="text-[10px] text-gray-500 font-bold">
          ※これら支払われた納付金を財源にして、国（JEED）は事業者向けの「作業をやりやすくするためのスロープ整備・高設ベンチ改修」「農器具購入」等の高額な助成金（障害者作業施設設置等助成金など）を事業主に返還支給しています。
        </p>
      </div>
    </div>
  );
};

export default EmploymentLawInfoPage;
