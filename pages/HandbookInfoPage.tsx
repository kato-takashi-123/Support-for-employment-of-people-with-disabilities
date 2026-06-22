import React from 'react';

const HandbookInfoPage: React.FC = () => {
  return (
    <div className="p-4 space-y-6 max-w-xl mx-auto pb-12">
      {/* Page Header */}
      <div className="bg-orange-700 text-white p-6 rounded-2xl shadow-md border-2 border-orange-850">
        <h2 className="text-lg sm:text-xl font-extrabold flex items-center gap-2">
          <span>📊 障害者手帳の区分・基準と重度判定解説</span>
        </h2>
        <p className="text-sm leading-relaxed mt-2 font-bold text-orange-50">
          障がい者雇用や福祉サービス利用の基準となる「障害者手帳」の等級と目安、そして雇用管理において極めて重要な「重度・軽度」の境界線をわかりやすく視覚化しました。
        </p>
      </div>

      {/* Distinction Summary Table */}
      <div className="bg-amber-50 dark:bg-gray-800 p-5 rounded-2xl border-2 border-amber-300 dark:border-gray-700 space-y-3 shadow-sm">
        <h3 className="font-extrabold text-amber-950 dark:text-amber-200 text-sm sm:text-base flex items-center gap-1.5">
          <span>⚠️</span> <span>【最重要】雇用・法律上の「重度」と「中・軽度」の区分</span>
        </h3>
        <p className="text-xs sm:text-sm text-gray-955 dark:text-gray-100 leading-relaxed font-bold">
          雇用率制度において、どの等級からが「重度」に分類されるかは法律で厳しく定められています。
          <span className="text-red-700 dark:text-red-400">「精神障がい」には、法律上の「重度」という区分が存在しない</span>点に注意が必要です。
        </p>
        
        <div className="overflow-x-auto pt-1">
          <table className="min-w-full text-xs border border-amber-300 dark:border-gray-600 font-bold">
            <thead>
              <tr className="bg-amber-100 dark:bg-gray-700 text-amber-950 dark:text-gray-100 text-left border-b border-amber-300">
                <th className="p-2 border-r border-amber-300">手帳の種類</th>
                <th className="p-2 border-r border-amber-300 text-red-700 dark:text-red-300">🔴 重度 (ダブルカウント対象)</th>
                <th className="p-2 text-emerald-800 dark:text-emerald-300">🟢 中・軽度 (通常カウント)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-200 dark:divide-gray-700 text-gray-955 dark:text-gray-100">
              <tr>
                <td className="p-2 border-r border-amber-200 bg-amber-50/50 dark:bg-gray-800 font-extrabold">療育手帳<br />(知的)</td>
                <td className="p-2 border-r border-amber-200 bg-red-50/40 dark:bg-red-950/20 text-red-800 dark:text-red-300">
                  <strong>A 判定</strong> (最重度・重度)<br />IQ 35以下が目安
                </td>
                <td className="p-2 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300">
                  <strong>B 判定</strong> (中度・軽度)<br />IQ 36〜70が目安
                </td>
              </tr>
              <tr>
                <td className="p-2 border-r border-amber-200 bg-amber-50/50 dark:bg-gray-800 font-extrabold">身体障害者手帳</td>
                <td className="p-2 border-r border-amber-200 bg-red-50/40 dark:bg-red-950/20 text-red-800 dark:text-red-300">
                  <strong>1 級・2 級</strong><br />(または3級が重複する場合)
                </td>
                <td className="p-2 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300">
                  <strong>3 級 〜 6 級</strong>
                </td>
              </tr>
              <tr>
                <td className="p-2 border-r border-amber-200 bg-amber-50/50 dark:bg-gray-800 font-extrabold text-xs">精神障害者手帳</td>
                <td className="p-2 border-r border-amber-200 bg-gray-100 dark:bg-gray-850 text-gray-600 dark:text-gray-400 text-[10px] leading-tight font-extrabold">
                  ❌ <span className="underline">法律上の「重度」区分なし</span><br />
                  (1級であっても雇用算定上のダブルカウントはありません)
                </td>
                <td className="p-2 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300">
                  <strong>1 級・2 級・3 級</strong><br />(すべて同一の1名扱い)
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 3 Handbooks Details */}
      <div className="space-y-5">
        
        {/* Intellectual Details */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border-2 border-orange-250 dark:border-gray-750 shadow-md space-y-4">
          <div className="border-b-2 border-orange-200 pb-2 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-orange-700 text-white flex items-center justify-center font-black">智</span>
            <h3 className="font-extrabold text-gray-955 dark:text-white text-base sm:text-lg">療育手帳（知的障がい）の目安と特徴</h3>
          </div>
          <p className="text-xs sm:text-sm text-gray-955 dark:text-gray-200 leading-relaxed font-bold">
            児童相談所や知的障害者更生相談所の判定により交付。自治体ごとに「愛の手帳(東京都)」「みどりの手帳」など名称や等級の分け方が異なりますが、国の基本ガイドラインにおける知能指数（IQ）と社会生活能力に応じた目安は以下のとおりです。
          </p>

          <div className="space-y-3 font-bold text-xs sm:text-sm">
            {/* Severe / Heavy zone border line */}
            <div className="p-3.5 bg-red-50 dark:bg-red-950/10 border-2 border-red-300 rounded-xl space-y-2">
              <span className="px-2.5 py-1 bg-red-600 text-white text-[10px] font-black rounded-full uppercase">🚨 重度区分 (A判定)</span>
              <div className="space-y-1.5 pt-1 text-gray-955 dark:text-gray-100">
                <p className="font-extrabold text-[#991b1b] dark:text-red-300">・最重度（A1）：IQ 20以下（発達年齢 1〜2歳レベル）</p>
                <p className="text-[11px] font-semibold text-gray-755 dark:text-gray-200 pl-4 leading-relaxed">日常生活の一切にわたり常時の監護・介護ヘルパーを要する状態。言葉でのコミュニケーションは極めて限定的です。</p>
                <p className="font-extrabold text-[#991b1b] dark:text-red-300">・重度（A2）：IQ 21〜35（発達年齢 3〜5歳レベル）</p>
                <p className="text-[11px] font-semibold text-gray-755 dark:text-gray-200 pl-4 leading-relaxed">身の回りの排泄や食事などに常時の促し、または個別指導を必要とする状態。危険の察知や対話訓練をじっくり進める必要があります。</p>
              </div>
            </div>

            {/* Boundary visual line */}
            <div className="flex items-center justify-center gap-2 text-red-600 dark:text-red-400 my-1 font-black text-xs">
              <span className="h-[2px] bg-red-300 flex-grow"></span>
              <span>☝️ ここから上が重度 (ダブルカウント) ｜ ⚡️ ここから下が中・軽度 👇</span>
              <span className="h-[2px] bg-red-300 flex-grow"></span>
            </div>

            {/* Mild / Moderate zone */}
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/10 border-2 border-emerald-350 rounded-xl space-y-2">
              <span className="px-2.5 py-1 bg-emerald-600 text-white text-[10px] font-black rounded-full uppercase">🟢 中・軽度区分 (B判定)</span>
              <div className="space-y-1.5 pt-1 text-gray-955 dark:text-gray-100">
                <p className="font-extrabold text-emerald-900 dark:text-emerald-300">・中度（B1）：IQ 36〜50（発達年齢 6〜9歳／小学校低学年レベル）</p>
                <p className="text-[11px] font-semibold text-gray-755 dark:text-gray-200 pl-4 leading-relaxed">簡単な日常会話ができ、個別の実務手順に沿って繰り返し作業を行えます。不測のルール変更等には混乱しやすいため、わかりやすい静止イラストや手順書が非常に有効です。</p>
                <p className="font-extrabold text-emerald-900 dark:text-emerald-300">・軽度（B2）：IQ 51〜70（発達年齢 10〜12歳／小学校高学年レベル）</p>
                <p className="text-[11px] font-semibold text-gray-755 dark:text-gray-200 pl-4 leading-relaxed">数字の計算や文字の読み書きも行え、周囲の指導体制が整っていれば自立して通退勤し、農場の一連の作業手順（収穫・選別・袋詰めなど）を極めて正確、かつスピーディに遂行する得意能力を十二分に発揮します。</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mental Details */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border-2 border-orange-250 dark:border-gray-750 shadow-md space-y-4">
          <div className="border-b-2 border-orange-200 pb-2 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-orange-750 text-white flex items-center justify-center font-black">精</span>
            <h3 className="font-extrabold text-gray-955 dark:text-white text-base sm:text-lg">精神障害者保健福祉手帳の目安</h3>
          </div>
          <p className="text-xs sm:text-sm text-gray-955 dark:text-gray-200 leading-relaxed font-bold">
            統合失調症、うつ病、双極性障害、発達障害（自閉スペクトラム症、ADHD等）、てんかん等があり、日常生活や社会生活にかなりの制限がある方が対象です。2年ごとに精神科医の診断書等を添えて更新審査を受けます。
          </p>

          <div className="space-y-3 font-bold text-xs sm:text-sm">
            {/* Warning card about NO severe concept */}
            <div className="p-3 bg-red-100/50 dark:bg-red-950/20 border-2 border-red-300 rounded-xl">
              <p className="text-red-800 dark:text-red-400 font-extrabold text-xs sm:text-sm">
                ⚠️ 注意：雇用促進法上の「重度」区分なし！
              </p>
              <p className="text-[11px] text-gray-800 dark:text-gray-300 leading-relaxed mt-1">
                精神障がいは「1級」「2級」「3級」の等級が存在しますが、<strong>障害者雇用促進法における算定上の「重度障害者（2名分換算）」の対象にはなりません。</strong>どの級であっても通常は1名（短時間なら0.5名）カウントとなります。
              </p>
            </div>

            {/* Grade 1 */}
            <div className="p-3.5 bg-gray-50/80 dark:bg-gray-900 border border-gray-200 rounded-xl">
              <p className="font-extrabold text-orange-955 dark:text-orange-300">・ 1 級（日常生活に常時助力が必要）</p>
              <p className="text-[11px] leading-relaxed text-gray-755 dark:text-gray-350 mt-1 pl-4 font-semibold">
                他人の援助を受けなければ身の回りのことの多くが困難。入院治療や自宅等での完全な随行サポーターがないと生活できない状態。
              </p>
            </div>

            {/* Grade 2 */}
            <div className="p-3.5 bg-gray-50/80 dark:bg-gray-900 border border-gray-200 rounded-xl">
              <p className="font-extrabold text-orange-955 dark:text-orange-300">・ 2 級（日常生活に著しい制限・就労に多大なサポートが必要）</p>
              <p className="text-[11px] leading-relaxed text-gray-755 dark:text-gray-350 mt-1 pl-4 font-semibold">
                ある程度の身の回りの自活は可能だが、極度のストレス耐性の低下、幻覚行動、対人折衝の破綻を招き、社会的なサポートなしに自力での通常勤務は厳しい状態（週20時間未満など、時間を短縮した配慮や農業作業などの段階的な導入が向いています）。
              </p>
            </div>

            {/* Grade 3 */}
            <div className="p-3.5 bg-gray-50/80 dark:bg-gray-900 border border-gray-200 rounded-xl">
              <p className="font-extrabold text-orange-955 dark:text-orange-300">・ 3 級（日常生活に一定の制限がある）</p>
              <p className="text-[11px] leading-relaxed text-gray-755 dark:text-gray-350 mt-1 pl-4 font-semibold">
                大まかな日常生活は自力で営めますが、季節の変わり目、人間関係の摩擦、急な仕事の変更等が起きたときに症状が再発または悪化しやすい。作業の手順を定め、プレッシャーの少ない環境下にし、周囲がこまめに相談に乗ることで、高いチームパフォーマンスを自立して発揮可能です。
              </p>
            </div>
          </div>
        </div>

        {/* Physical Details */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border-2 border-orange-250 dark:border-gray-750 shadow-md space-y-4">
          <div className="border-b-2 border-orange-200 pb-2 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-orange-800 text-white flex items-center justify-center font-black">身</span>
            <h3 className="font-extrabold text-gray-955 dark:text-white text-base sm:text-lg">身体障害者手帳の目安</h3>
          </div>
          <p className="text-xs sm:text-sm text-gray-955 dark:text-gray-200 leading-relaxed font-bold">
            視覚・聴覚・平衡機能、肢体不自由（手・足・体幹）、心臓・腎臓・呼吸器・小腸などの内部障害等が対象。1級から6級までの等級があり、数字が小さいほど重度です。
          </p>

          <div className="space-y-3 font-bold text-xs sm:text-sm">
            {/* Severe Physical Group */}
            <div className="p-3.5 bg-red-50 dark:bg-red-950/10 border-2 border-red-300 rounded-xl space-y-2">
              <span className="px-2.5 py-1 bg-red-600 text-white text-[10px] font-black rounded-full uppercase">🚨 重度区分 (1級・2級)</span>
              <p className="text-xs sm:text-sm text-gray-955 dark:text-gray-100 leading-relaxed font-bold pt-1">
                ・<b>1級および2級の所持者</b>が雇用算定上の「重度身体障害者」となり、雇用率ダブルカウントの優遇対象になります。<br />
                ・車いすの利用、または高度な排泄管理・人工透析補助（内部障害）等を伴いますが、農業用バリアフリー（平坦な車いす対応通路や高設栽培、日除け温室など）の合理的配慮を施すことで、身体的ハンディキャップを克服して能力を全開することができます。
              </p>
            </div>

            {/* Boundary visual line */}
            <div className="flex items-center justify-center gap-2 text-red-600 dark:text-red-400 my-1 font-black text-xs">
              <span className="h-[2px] bg-red-300 flex-grow"></span>
              <span>☝️ 1〜2級が重度 (ダブルカウント) ｜ ⚡️ 3〜6級が通常カウント 👇</span>
              <span className="h-[2px] bg-red-300 flex-grow"></span>
            </div>

            {/* Light / Moderate Physical Group */}
            <div className="p-3.5 bg-emerald-55 dark:bg-emerald-950/10 border-2 border-emerald-350 rounded-xl space-y-2">
              <span className="px-2.5 py-1 bg-emerald-600 text-white text-[10px] font-black rounded-full uppercase">🟢 中・軽度区分 (3級〜6級)</span>
              <p className="text-xs sm:text-sm text-gray-955 dark:text-gray-100 leading-relaxed font-bold pt-1">
                ・<b>3級、4級、5級、6級の所持者</b>が該当します。日常生活は自立度が高く、特定の身体活動、重労働にのみ制限が生じる状態です。<br />
                ・適切な道具の選定や、移動ルートの整備、過度に重い荷物の持ち運びを別スタッフが担う等の少しのチーム体制アレンジによって、一般スタッフと変わらぬ極めて優秀な作業員として大活躍いただけます。
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HandbookInfoPage;
