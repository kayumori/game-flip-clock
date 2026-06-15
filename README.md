# 🕹️ Flip Clock / Typing Ascent

フリップ時計と、ローマ字タイピング登山ゲームが一体になったウィジェット。
依存ライブラリなしの **HTML + CSS + JavaScript だけ**（1ファイル）で動きます。

**▶ デモ: https://kayumori.github.io/game-flip-clock/**

## ⏰ フリップ時計

- パタッとめくれるフリップアニメーション（変わった桁だけが動く）
- システマチックでミニマルな見た目、埋め込み幅に合わせて自動スケール

## ⛰️ タイピング登山モード

時計の下の**山アイコン（START）を押す**と、**時計の数字カードがそのままスペル（ローマ字）入力に変化**。寿司打風のタイピング練習になります。

- **ローマ字入力** … 表示された日本語（「さくら」など）をローマ字で打つ。打てた文字のカードが緑に光る
- **登山** … 正しく打てた単語の数だけ山を登る
- **〇〇級判定** … 時間切れで、登った高さに応じて「ふもと → 丘 → 高尾山 → 筑波山 → 富士山 → モンブラン → エベレスト級」を判定
- **3コース** … EASY（90秒）／ NORMAL（60秒）／ HARD（45秒）

> 遊ぶときは一度ウィジェットをクリックしてキーボード入力を有効にしてください（スマホはタップでキーボードが出ます）。

## 🚀 使い方

**`index.html` をダブルクリックして開くだけ。** CSS・JS はすべて1ファイルに入っているので、ビルドも追加ファイルも不要です。

```bash
git clone https://github.com/kayumori/game-flip-clock.git
cd game-flip-clock
open index.html        # macOS（Windows は start、Linux は xdg-open）
```

GitHub Pages に置けば URL でそのまま遊べます（Settings → Pages → ブランチを指定するだけ）。

## ⚙️ カスタマイズ

時計の表記は `index.html` の `.clock` 要素の `data-*` 属性で設定できます。

```html
<div class="clock"
     data-format="12"     <!-- "12" または "24" -->
     data-seconds="true"> <!-- "true" / "false"  秒の表示 -->
```

単語リスト・制限時間・級のしきい値は `<script>` 内の `WORDS` / `MODES` / `RANKS` で変更できます。
色やサイズは `<style>` 先頭の `:root` にある CSS 変数でまとめて変更できます。

```css
:root {
  --bg: #ffffff;        /* 背景色 */
  --card-bg: #16181d;   /* カードの色 */
  --accent: #ffcf33;    /* 入力中の文字のハイライト */
  --done: #2fd0a6;      /* 入力済みの文字の色 */
  --card-w: 84px;       /* 時計カード幅 */
  --lw: 62px;           /* スペルカード幅 */
}
```

## 📁 構成

```
game-flip-clock/
├── index.html   # これ1つで完結（HTML + CSS + JavaScript をすべて内包）
├── README.md
└── LICENSE
```

## 📜 ライセンス

[MIT](LICENSE)
