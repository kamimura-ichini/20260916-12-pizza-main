# ピザ会 発表資料（2026/09/16）

## ファイル構成

| ファイル | 内容 |
|---|---|
| index.html | 本編フル版（19枚）— ブラウザで開く入口 |
| deck-v2.html | index.html と同内容 |
| workshop.html | 実践パートのみ（挑戦選択＋付録詳細・7枚） |
| deck.css / deck.js | 共通スタイル・操作 |
| *.png / *.jpg | スクリーンショット画像 |

## ローカルで共有する

```bash
cd 20260916-pizza-12
python3 -m http.server 8080 --bind 0.0.0.0
```

- 本編: http://127.0.0.1:8080/
- 実践のみ: http://127.0.0.1:8080/workshop.html
