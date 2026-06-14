# 🕹️ Game Flip Clock

ただ時刻を表示するだけじゃない、**遊べる**フリップ時計ウィジェット。
依存ライブラリなしの **HTML + CSS + JavaScript だけ** で動きます。

<!-- スクリーンショットを撮って preview.png として置くと、ここに表示されます
![preview](preview.png)
-->

## 🎮 遊び要素

- **★コインキャッチ** … カードの上にときどき出現するコインをタップしてスコアを稼ぐ
- **コンボ** … 連続でキャッチするほど倍率アップ（少し間が空くとリセット）
- **チャンスタイム** … ゾロ目の時刻（11:11 など）や毎時0分にコインが降り注ぐ
- **反応するマスコット** … キャッチや操作に合わせて跳ねたり喋ったりする相棒
- **実績システム** … コンボ・スコア・ゾロ目キャッチなどでバッジを解除（`localStorage`に保存）
- **触って気持ちいい演出** … カードを叩くとプルッと跳ねて火花＆効果音（WebAudioでファイル不要）

ハイスコアと解除した実績はブラウザに保存され、次回も引き継がれます。

## ⏰ 時計としての機能

- パタッとめくれるフリップアニメーション（変わった桁だけが動く）
- 12 / 24 時間表記、秒の表示 ON/OFF
- レスポンシブ（`clamp()` で画面幅に合わせて自動スケール）

## 🚀 使い方

```bash
git clone https://github.com/<your-name>/game-flip-clock.git
cd game-flip-clock
open index.html        # macOS（Windows は start、Linux は xdg-open）
```

ビルド不要・依存ゼロ。`index.html` を開くだけです。

## ⚙️ カスタマイズ

`index.html` の `.clock` 要素の `data-*` 属性で設定できます。

```html
<div class="clock"
     data-format="12"     <!-- "12" または "24" -->
     data-seconds="true"> <!-- "true" / "false"  秒の表示 -->
```

色やサイズは `style.css` の `:root` にある CSS 変数でまとめて変更できます。

```css
:root {
  --bg: #ffffff;        /* 背景色 */
  --card-bg: #1c1c1c;   /* カードの色 */
  --accent: #ffcf33;    /* コイン・AM/PM・マスコットの色 */
  --pop: #ff5d73;       /* コンボ・特別コインの色 */
  --card-w: clamp(54px, 11vw, 92px);  /* カード幅 */
  --card-h: clamp(82px, 17vw, 134px); /* カード高さ */
  --flip-speed: 0.3s;   /* めくる速さ */
}
```

## 📁 構成

```
game-flip-clock/
├── index.html   # マークアップ（時計 + ゲームUI + マスコット）
├── style.css    # スタイル / フリップ・コイン・演出のアニメーション
├── script.js    # 時計の更新 + ゲームエンジン
└── README.md
```

## 📜 ライセンス

[MIT](LICENSE)
