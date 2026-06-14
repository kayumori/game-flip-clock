# 🕹️ Game Flip Clock

ちょっとゲーム感のある、横長のフリップ時計ウィジェット。
依存ライブラリなしの **HTML + CSS + JavaScript だけ** で動きます。

<!-- スクリーンショットを撮って preview.png として置くと、ここに表示されます
![preview](preview.png)
-->

## ✨ 特徴

- パタッとめくれる **フリップアニメーション**（変わった桁だけが動く）
- 3 つのテーマ … `arcade`（黒）/ `mono`（モノクロ）/ `neon`（ネオン）
- 12 / 24 時間表記の切り替え、秒の表示 ON/OFF
- レスポンシブ（`clamp()` で画面幅に合わせて自動スケール）
- ビルド不要・依存ゼロ。`index.html` を開くだけ

## 🚀 使い方

リポジトリを取得して `index.html` をブラウザで開くだけです。

```bash
git clone https://github.com/<your-name>/game-flip-clock.git
cd game-flip-clock
open index.html        # macOS（Windows は start、Linux は xdg-open）
```

## ⚙️ カスタマイズ

`index.html` の `.clock` 要素の `data-*` 属性を変えるだけで設定できます。

```html
<div class="clock"
     data-format="12"      <!-- "12" または "24" -->
     data-seconds="true"   <!-- "true" / "false"  秒の表示 -->
     data-theme="arcade">  <!-- "arcade" / "mono" / "neon" -->
```

実行中に切り替えることもできます。

```js
document.getElementById('clock').dataset.theme = 'neon';
```

### 見た目の微調整

色やサイズは `style.css` の `:root` にある CSS 変数でまとめて変更できます。

```css
:root {
  --card-bg: #1c1c1c;   /* カードの色 */
  --digit-color: #f5f5f5; /* 数字の色 */
  --accent: #ffcf33;    /* AM/PM バッジの色 */
  --card-w: clamp(58px, 12vw, 96px); /* カード幅 */
  --card-h: clamp(86px, 18vw, 140px);/* カード高さ */
  --flip-speed: 0.3s;   /* めくる速さ */
}
```

## 📁 構成

```
game-flip-clock/
├── index.html   # マークアップ
├── style.css    # スタイル & フリップアニメーション
├── script.js    # 時刻の更新ロジック
└── README.md
```

## 📜 ライセンス

[MIT](LICENSE)
