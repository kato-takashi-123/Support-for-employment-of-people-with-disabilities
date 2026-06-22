import React, { useState } from 'react';

type DisabilityGroup = 'intellectual' | 'mental_developmental' | 'physical';

const PlantingRecommendationSearchPage: React.FC = () => {
  const [activeGroup, setActiveGroup] = useState<DisabilityGroup>('intellectual');

  const groups = [
    { id: 'intellectual', title: '🧩 知的障がい (ダウン症・自閉症含む)', icon: '🧩' },
    { id: 'mental_developmental', title: '🧠 精神障がい・発達障がい', icon: '🧠' },
    { id: 'physical', title: '♿️ 身体障がい (作業設備・身の回り配慮)', icon: '♿️' },
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

      {/* Group Selector Buttons - Larger and bolder for easier tap and readability */}
      <div className="flex flex-col gap-2">
        {groups.map(g => (
          <button
            key={g.id}
            onClick={() => setActiveGroup(g.id as DisabilityGroup)}
            className={`w-full p-4 rounded-xl border-2 text-sm sm:text-base font-extrabold transition-all flex items-center justify-between ${
              activeGroup === g.id
                ? 'bg-orange-700 text-white border-transparent shadow-md'
                : 'bg-white text-gray-950 border-orange-200 hover:bg-orange-50 dark:bg-gray-800 dark:text-white dark:border-gray-700'
            }`}
          >
            <span>{g.title}</span>
            <span className="text-lg">→</span>
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
                    複雑な工程は一度に指示せず、「植え穴をあける」「種を1つ穴に置く」「上から薄く土をかける」のように個別の単一作業に細かく分解して一つずつ伝えます。
                  </li>
                  <li>
                    <strong>目に見える視覚的な情報：</strong>
                    口頭の指示だけではなく、実際の道具の写真、手本のイラスト、あるいは地面に貼ったカラーテープなどを基準として、目で見て直感的に理解を促します。
                  </li>
                  <li>
                    <strong>できた直後にしっかり褒める：</strong>
                    他者との心の交流や、認められる喜びをとても大切にする特性を持つ方が多いです。「いつも種まきが丁寧で助かるよ」「ありがとう！」と肯定的な言葉をストレートにかけることで、驚くほど自信とモチベーションが高まります。
                  </li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {activeGroup === 'mental_developmental' && (
          <div className="space-y-4">
            <h3 className="font-extrabold text-orange-950 dark:text-orange-200 text-base sm:text-lg border-b-2 border-orange-200 pb-1.5 flex items-center gap-2">
              <span>🧠</span> <span>精神障がい・発達障がい（ASD/ADHD等）の特性と対応</span>
            </h3>

            <div className="space-y-4 text-sm sm:text-base leading-relaxed text-gray-950 dark:text-gray-100">
              {/* Feature 1 */}
              <div>
                <p className="font-extrabold text-orange-850 dark:text-orange-300 text-sm sm:text-base mb-1.5">■ 主な行動特性と得意・苦手</p>
                <ul className="list-disc list-outside pl-5 space-y-2 font-bold">
                  <li><strong>得意：</strong>自身の強いこだわりや興味、得意な一分野における並外れた集中力。データ集計、規則的なデータ検索やパターンの発見。</li>
                  <li><strong>苦手：</strong>騒音、強い日光、他のスタッフとの物理的に近すぎる作業環境（感覚過敏）。他者の感情をその場の空気で読み取ること。体調や薬の影響による、日・週ごとの活動力のアップダウン。</li>
                </ul>
              </div>

              {/* Diagram */}
              <div className="p-4 bg-orange-100 dark:bg-gray-900/40 rounded-xl border-2 border-orange-300 space-y-2">
                <p className="font-extrabold text-orange-950 dark:text-orange-200 text-sm">💡 コミュニケーション環境の工夫例</p>
                <div className="border-2 border-orange-200 bg-white dark:bg-gray-800 p-3 rounded-lg text-xs sm:text-sm text-gray-950 dark:text-gray-100 leading-relaxed font-bold">
                  <p><strong>・感覚過敏への対応：</strong>作業中のイヤーマフの着用や、日差しの下でのサングラス・つば広帽子の許可、冷房を入れた休憩所の明確な確保などを行います。</p>
                  <p className="mt-2"><strong>・質問しやすい関係：</strong>「何か質問はありますか？」と大雑把に尋ねるのではなく、「この工程のところで、迷った所やうまくいかない部分はありましたか？」のように選択しやすい声かけをして、不安によるフリーズを防ぎます。</p>
                </div>
              </div>

              {/* General accommodations */}
              <div>
                <p className="font-extrabold text-orange-850 dark:text-orange-300 text-sm sm:text-base mb-1.5">■ 具体的アプローチと合理的配慮</p>
                <ol className="list-decimal list-outside pl-5 space-y-3 font-bold">
                  <li>
                    <strong>一時的なクールダウン場所（安全地帯）の設定：</strong>
                    感覚刺激が多すぎて混乱しそうな時や感情のコントロールが難しくなりそうな時、誰にも声をかけられない静かなベンチや一人用簡易テントを整備し、自発的に短時間休める約束を作っておきます。
                  </li>
                  <li>
                    <strong>言葉の基準をハッキリさせる：</strong>
                    「適宜、適度のタイミングで」「様子を見ながら」という指示は強い苦痛を与えます。「土の表面が乾いて白くなったら、じょうろで水を２回満遍なくまきます」と実際の数字で判断できるように定義します。
                  </li>
                  <li>
                    <strong>体調の波への理解と事前のルール化：</strong>
                    精神疾患に伴う「どうしても午前中体が動かない日がある」などの特性には、スライド勤務（遅出勤務）の仕組みや、「本日の体調通知カード（赤・黄・緑のプレートを置くだけ等）」を使って、言葉での説明負担なく現場と意思疎通できる配慮を行います。
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
