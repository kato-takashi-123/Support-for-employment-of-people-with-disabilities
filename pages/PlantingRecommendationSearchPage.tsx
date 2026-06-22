import React, { useState } from 'react';

type DisabilityGroup = 'intellectual' | 'mental' | 'developmental' | 'physical';

const PlantingRecommendationSearchPage: React.FC = () => {
  const [activeGroup, setActiveGroup] = useState<DisabilityGroup>('developmental');

  const groups = [
    { id: 'developmental', title: '⚡️ 発達障がい (ASD/ADHD/LD等)', shortTitle: '発達障がい', icon: '⚡️' },
    { id: 'mental', title: '🧠 精神障がい (統合失調症・うつ・てんかん等)', shortTitle: '精神障がい', icon: '🧠' },
    { id: 'intellectual', title: '🧩 知的障がい (ダウン症・知的自閉症含む)', shortTitle: '知的障がい', icon: '🧩' },
    { id: 'physical', title: '♿️ 身体障がい (作業設備・身の回り配慮)', shortTitle: '身体障がい', icon: '♿️' },
  ];

  return (
    <div className="p-4 space-y-6 max-w-xl mx-auto pb-12">
      {/* Page Header */}
      <div className="bg-orange-700 text-white p-6 rounded-2xl shadow-md border-2 border-orange-850">
        <h2 className="text-lg sm:text-xl font-extrabold flex items-center gap-2">
          <span>💡 障がい特性・合理的配慮解説</span>
        </h2>
        <p className="text-sm leading-relaxed mt-2 font-bold text-orange-50">
          サポートの中心となる各種障がい特性の一般的な特徴と、現場作業における優しい配慮事例・接し方をわかりやすく解説します。
        </p>
      </div>

      {/* Group Selector Buttons - Beautiful horizontal 4-column grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {groups.map(g => (
          <button
            key={g.id}
            onClick={() => setActiveGroup(g.id as DisabilityGroup)}
            className={`p-3 rounded-xl border-2 text-center flex flex-col items-center justify-center gap-1 transition-all ${
              activeGroup === g.id
                ? 'bg-orange-700 text-white border-transparent shadow-md font-extrabold'
                : 'bg-white text-gray-950 border-orange-200 hover:bg-orange-50 dark:bg-gray-800 dark:text-white dark:border-gray-700 font-bold'
            }`}
          >
            <span className="text-2xl">{g.icon}</span>
            <span className="text-[10px] xs:text-xs sm:text-sm leading-tight block">{g.shortTitle}</span>
          </button>
        ))}
      </div>

      {/* Detailed Accordion content with clear high-contrast type scale */}
      <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-md border-2 border-orange-200 dark:border-gray-750 space-y-4">
        {activeGroup === 'intellectual' && (
          <div className="space-y-4">
            <h3 className="font-extrabold text-orange-950 dark:text-orange-200 text-base sm:text-lg border-b-2 border-orange-200 pb-1.5 flex items-center gap-2">
              <span>🧩</span> <span>知的障がい・自閉症の特性と作業配慮</span>
            </h3>
            
            <div className="space-y-4 text-sm sm:text-base leading-relaxed text-gray-950 dark:text-gray-100">
              {/* Feature 1 */}
              <div>
                <p className="font-extrabold text-orange-850 dark:text-orange-300 text-sm sm:text-base mb-1.5">■ 主な行動特性と得意・苦手</p>
                <ul className="list-disc list-outside pl-5 space-y-2 font-bold">
                  <li><strong>得意：</strong>決められた手順やパターンの繰り返し作業。時間を厳密に守り、約束やルールを非常に真面目にコツコツ遂行すること。</li>
                  <li><strong>苦手：</strong>複雑で長い指示。同時に2つ以上の用件を一度に言われること。急なスケジュール変更。具体的ではない曖昧なやり方（例:「適当にやっておいて」「その辺に置いて」等）。</li>
                </ul>
              </div>

              {/* Diagram mapping with high contrast */}
              <div className="p-4 bg-orange-100 dark:bg-gray-900/40 rounded-xl border-2 border-orange-300 space-y-2">
                <p className="font-extrabold text-orange-950 dark:text-orange-200 text-sm">💡 作業指示を具体的に工夫する例</p>
                <div className="text-xs sm:text-sm space-y-2">
                  <p className="text-red-800 dark:text-red-400 font-extrabold">🚫 伝わりにくい例：「そこの雑草を適当に抜いて、カゴに上手に入れて」</p>
                  <p className="text-emerald-800 dark:text-emerald-400 font-extrabold">✅ 伝わりやすい例：</p>
                  <div className="border-2 border-emerald-300 bg-white dark:bg-gray-800 p-3 rounded-lg text-gray-950 dark:text-gray-100 font-bold space-y-1.5">
                    <p>【工程1】：この「写真の見本と同じ形の草」だけを根元から抜きます。</p>
                    <p className="text-xs text-orange-600 font-extrabold">　↓ (そのあとに)</p>
                    <p>【工程2】：抜いた草は、この「赤い目印テープ」が貼られたカゴに入れます。</p>
                  </div>
                </div>
              </div>

              {/* General accommodations */}
              <div>
                <p className="font-extrabold text-orange-850 dark:text-orange-300 text-sm sm:text-base mb-1.5">■ 具体的アプローチと合理的配慮</p>
                <ol className="list-decimal list-outside pl-5 space-y-3 font-bold">
                  <li>
                    <strong>工程の細分化（スモールステップ）：</strong>
                    複雑な工程は一度に指示せず、「植え穴をあける」「種を1つ穴に置く」「上から薄く土をかける」のように工程を細かく分解して伝えます。
                  </li>
                  <li>
                    <strong>目に見える視覚的な情報：</strong>
                    口頭の指示だけでなく、実際の道具の写真、手本のイラスト、あるいはカラーテープを目印とするなど、目で見て理解を促します。
                  </li>
                  <li>
                    <strong>できた直後にしっかり褒める：</strong>
                    承認される喜びをとても大切にする方が多いです。「いつも種まきが丁寧で助かるよ」「ありがとう！」と肯定的な言葉をかけることで、自信とモチベーションが高まります。
                  </li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {activeGroup === 'mental' && (
          <div className="space-y-4">
            <h3 className="font-extrabold text-orange-950 dark:text-orange-200 text-base sm:text-lg border-b-2 border-orange-200 pb-1.5 flex items-center gap-2">
              <span>🧠</span> <span>精神障がいの特性と対応策</span>
            </h3>

            <div className="space-y-4 text-sm sm:text-base leading-relaxed text-gray-950 dark:text-gray-100">
              {/* Types */}
              <div className="p-3 bg-orange-50 dark:bg-gray-750/30 rounded-xl border border-orange-255">
                <p className="font-extrabold text-orange-900 dark:text-orange-300 text-xs sm:text-sm">📌 主な種類</p>
                <p className="text-xs sm:text-sm font-bold mt-1 text-gray-800 dark:text-gray-200">
                  統合失調症（意欲低下、感情の平板化等）、うつ病・双極性障害（気分の極度な波）、不安障害（強いパニックや予期不安）、てんかん等。
                </p>
              </div>

              {/* Traits */}
              <div>
                <p className="font-extrabold text-orange-850 dark:text-orange-300 text-sm sm:text-base mb-1.5">■ 主な行動特性と得意・苦手</p>
                <ul className="list-disc list-outside pl-5 space-y-2 font-bold">
                  <li><strong>得意：</strong>指示内容や勤務体制、手順が安定した落ち着いた個人作業。手順を丁寧に守り確実に進めること。</li>
                  <li><strong>苦手：</strong>騒音、周囲の強い緊張感、不規則な役割・時間の変更。日々（午前中、朝方、季節の巡り）の体調や薬の影響、気分の波。</li>
                </ul>
              </div>

              {/* Stress control diagram */}
              <div className="p-4 bg-orange-100 dark:bg-gray-900/40 rounded-xl border-2 border-orange-300 space-y-2">
                <p className="font-extrabold text-orange-950 dark:text-orange-200 text-sm">💡 精神的緊張をおさえて安心して動く例</p>
                <div className="border-2 border-orange-200 bg-white dark:bg-gray-800 p-3 rounded-lg text-xs sm:text-sm text-gray-950 dark:text-gray-100 leading-relaxed font-bold space-y-2">
                  <p><strong>・体調の可視化：</strong>「今日は体調良好です（顔マーク緑）」「少し疲れ気味（黄）」「休息が必要です（赤）」などの選択カードを設定。言葉による負担なしで状況を共有できます。</p>
                  <p><strong>・こまめなブレイク：</strong>「疲れた」と本人から言いにくい場合が多いため、事前に「1時間作業したら必ずベンチで10分休む」のようにルール化しておきます。</p>
                </div>
              </div>

              {/* Accommodations */}
              <div>
                <p className="font-extrabold text-orange-850 dark:text-orange-300 text-sm sm:text-base mb-1.5">■ 具体的アプローチと合理的配慮</p>
                <ol className="list-decimal list-outside pl-5 space-y-3 font-bold">
                  <li>
                    <strong>波を想定した柔軟な就労プラン：</strong>
                    服薬の副作用や体調の波に伴う「午前中の強い倦怠感、起きづらさ」を想定し、勤務開始を遅くする「スライド勤務制度」や、最初は週2日の短時間からスタートするなどの調整が極めて有効です。
                  </li>
                  <li>
                    <strong>安心感を与えるコミュニケーション：</strong>
                    「失敗したらどうしよう」という焦りや恐怖感が強いため、「失敗しても全く怒りませんので心配いりません。落ち着いて一緒に手順を確認していきましょう」と最初に明言しておきます。
                  </li>
                  <li>
                    <strong>定期的な『15分個別面談』枠の固定：</strong>
                    週に一度や月に何度か、業務時間内に農場長と個別に話す相談タイムを用意します。本人が不安を自分で抱え込んでフリーズや突然の離職に至る前に、適切な業務量調整を行うことができます。
                  </li>
                  <li>
                    <strong>服薬と通院環境の確保：</strong>
                    症状をコントロールするための服薬と通院は最重要事項です。プライベートにしっかり配慮した上で、勤務中の決まった時間での確実な服薬を静かに見守り、通院のための通院日の調整や配慮を行います。
                  </li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {activeGroup === 'developmental' && (
          <div className="space-y-4">
            <h3 className="font-extrabold text-orange-950 dark:text-orange-200 text-base sm:text-lg border-b-2 border-orange-200 pb-1.5 flex items-center gap-2">
              <span>⚡️</span> <span>発達障がい（ASD/ADHD/LD等）の特性と対応策</span>
            </h3>

            <div className="space-y-4 text-sm sm:text-base leading-relaxed text-gray-950 dark:text-gray-100">
              {/* Types */}
              <div className="p-3 bg-orange-50 dark:bg-gray-750/30 rounded-xl border border-orange-255">
                <p className="font-extrabold text-orange-900 dark:text-orange-300 text-xs sm:text-sm">📌 主な種類</p>
                <div className="text-xs sm:text-sm font-bold mt-1 text-gray-800 dark:text-gray-200 space-y-1">
                  <p><strong>・ASD (自閉スペクトラム症)：</strong>コミュニケーションや社会性の独特さ、強いこだわり、特定の変化への戸惑い。</p>
                  <p><strong>・ADHD (注意欠如・多動症)：</strong>不注意（見落とし、忘れ物、集中しづらさ）、多動・衝動性（じっとしていられない、突発的に動く）。</p>
                  <p><strong>・LD/SLD (学習障害)：</strong>全体的な知的発達に問題はないが、読む・書く・計算する等の特定の習得・活用だけの困難。</p>
                </div>
              </div>

              {/* Traits */}
              <div>
                <p className="font-extrabold text-orange-850 dark:text-orange-300 text-sm sm:text-base mb-1.5">■ 各タイプごとの行動特性と得意・苦手</p>
                <div className="space-y-3">
                  <div className="border border-stone-200 p-3 rounded-xl bg-orange-50/20 dark:bg-gray-850">
                    <p className="font-bold text-xs sm:text-sm text-orange-950 dark:text-orange-300 mb-1">【自閉スペクトラム症 (ASD)】</p>
                    <ul className="list-disc list-outside pl-5 text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-300 space-y-1">
                      <li><strong>得意：</strong>手順やルーティンが決められた反復業務。約束したルール・時間の厳格な順守。細かな違いの発見。</li>
                      <li><strong>苦手：</strong>曖昧な指示（例:「ここらへんを優しくやって」）、不親切な段取り変更、言葉以外の隠された意図を読み取ること。</li>
                    </ul>
                  </div>
                  <div className="border border-stone-200 p-3 rounded-xl bg-orange-50/20 dark:bg-gray-850">
                    <p className="font-bold text-xs sm:text-sm text-orange-950 dark:text-orange-300 mb-1">【注意欠如・多動症 (ADHD)】</p>
                    <ul className="list-disc list-outside pl-5 text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-300 space-y-1">
                      <li><strong>得意：</strong>関心がある役割での並外れた迅速さと発想力、自発的にテンポよく軽快にアクションを起こすこと。</li>
                      <li><strong>苦手：</strong>長時間の全く動きのない単調作業、身の周りの片づけや複数の道具の適切な整理・同時管理。</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* ADHD/ASD Diagram Instruction mapping */}
              <div className="p-4 bg-orange-100 dark:bg-gray-900/40 rounded-xl border-2 border-orange-300 space-y-2">
                <p className="font-extrabold text-orange-950 dark:text-orange-200 text-sm">💡 具体的な作業指示の明確な工夫例</p>
                <div className="border-2 border-orange-200 bg-white dark:bg-gray-800 p-3 rounded-lg text-xs sm:text-sm text-gray-950 dark:text-gray-100 leading-relaxed font-bold space-y-1">
                  <p className="text-red-800 dark:text-red-400 font-extrabold">🚫 迷う言葉：「お水、乾いたトマトの列にそれなりにたっぷり撒いてね」</p>
                  <p className="text-emerald-800 dark:text-emerald-400 font-extrabold">✅ 確実な言葉：</p>
                  <div className="p-2.5 border border-emerald-300 bg-emerald-50 dark:bg-gray-950/50 rounded-lg text-gray-950 dark:text-gray-200 text-xs">
                    「このトマト苗（A列の全部で10株）の根本へ、この『青いラインが引かれたジョウロ』丸ごと1杯（5リットル）ずつ、ゆっくりかけてください。終わったら表にチェックを入れて次のB列に進みます」
                  </div>
                </div>
              </div>

              {/* Accommodations */}
              <div>
                <p className="font-extrabold text-orange-850 dark:text-orange-300 text-sm sm:text-base mb-1.5">■ 具体的アプローチと合理的な配慮</p>
                <ol className="list-decimal list-outside pl-5 space-y-3 font-bold">
                  <li>
                    <strong>全ての指示の徹底的な数値化（一意の定義）：</strong>
                    「適宜」「よく見て」「しっかり」を追放。作業基準を「何ミリ」「何個」「何センチ」または「写真シートと同じ色かどうか」という客観的なスケールで定義します。
                  </li>
                  <li>
                    <strong>やることリスト（工程管理ボード）での不注意忘れカバー：</strong>
                    ADHDの方の「手順の一部をうっかり飛ばす」ミスを防ぐため、作業順にフックにカードが並び、完了したらカードを下にひっくり返すというような視覚的・物理的な進捗管理法を取り入れます。
                  </li>
                  <li>
                    <strong>感覚過敏（騒音・強い光・身体の接近）への対応：</strong>
                    強い農機のエンジン音、夏の強い反射光、他の者と背中合わせですぐ近い位置での作業はパニックを招きます。防音用イヤーマフの使用許可、サングラス・特製帽子の着用、他者と3メートル以上距離をあけた作業スペース（または別室）を明確に設けます。
                  </li>
                  <li>
                    <strong>図や写真、ビジュアルでの作業ガイド（LD/ASD向け）：</strong>
                    長文の文字指示は把握の負担になります。「刈り取る大きさの見本（段ボールをくりぬいた穴に通るかどうか）」や「カゴに入れる配置の図面」を現場の目の前に拡大してラミネート掲示しておきます。
                  </li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {activeGroup === 'physical' && (
          <div className="space-y-4">
            <h3 className="font-extrabold text-orange-950 dark:text-orange-200 text-base sm:text-lg border-b-2 border-orange-200 pb-1.5 flex items-center gap-2">
              <span>♿️</span> <span>身体障がいの特性と配慮ポイント</span>
            </h3>

            <div className="space-y-4 text-sm sm:text-base leading-relaxed text-gray-950 dark:text-gray-100">
              <div>
                <p className="font-extrabold text-orange-850 dark:text-orange-300 text-sm sm:text-base mb-1.5">■ 身体障がいの主な区分</p>
                <p className="font-bold">肢体不自由（下肢・上肢・体幹）、車いす使用者、あるいは視覚・聴覚障がいなどの方々です。</p>
              </div>

              {/* Simple diagram */}
              <div className="p-4 bg-orange-100 dark:bg-gray-900/40 rounded-xl border-2 border-orange-300 space-y-2">
                <p className="font-extrabold text-orange-950 dark:text-orange-200 text-sm">♿️ 農場における物理的バリアフリー配慮例</p>
                <ul className="text-xs sm:text-sm text-gray-950 dark:text-gray-100 list-disc list-outside pl-5 space-y-1.5 font-bold">
                  <li>腰を深く曲げる姿勢を減らすための「高床式（レイズドベッド）栽培ベンチ」の導入。</li>
                  <li>段差への耐久性の高い木製・金属製スロープの配置、および通路スペースの拡張。</li>
                  <li>重い荷物を直接持ち上げずに移動できるキャスター付き軽量台車の運用。</li>
                  <li>聴覚障がいの方にチャイムだけで知らせず、フラッシュランプやカラー旗等の目でわかる伝達ツールを導入。</li>
                </ul>
              </div>

              <div>
                <p className="font-extrabold text-orange-850 dark:text-orange-300 text-sm sm:text-base mb-1.5">■ 合理的配慮のポイント</p>
                <p className="leading-relaxed font-bold">
                  身体的な障がいに対するアプローチでは、主に<strong>「設備・動線・作業ツールのカスタマイズ」</strong>が最重要となります。
                  スタッフ一人ひとりとじっくり面談し、動かせる可動域を考慮し、作業に用いるスコップに滑り止めを巻く、車いすが余裕で通れる畝幅を確保するなど、ツールや環境の側の工夫で、安全で無理のない自立した就労を長く守ることができます。
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlantingRecommendationSearchPage;
