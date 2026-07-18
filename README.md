# Astrolabe UI

Astrolabeの学習台帳exportを読む、ローカル専用のNext.js学習マップです。

## Fixtureで起動

```bash
npm install
npm run dev
```

`ASTROLABE_EXPORTS_DIR`が未設定の場合は、同梱の合成fixtureを表示し、全ページ上部に
「fixtureデータ表示中(実台帳未接続)」と表示します。

## 実台帳のexportを表示

core側でJSONを生成してから、private ledgerの`exports/`を指定します。

```bash
ASTROLABE_LEDGER_PATH=/path/to/astrolabe.db astrolabe export
ASTROLABE_EXPORTS_DIR=/path/to/astrolabe-ledger/exports npm run dev
```

実台帳・実export・`.env`はpublicの本リポジトリへコミットしません。UI実行時のLLM・
外部API呼び出しはなく、フィードバックだけがGitHub Issue作成画面へのリンクです。

## 検証

```bash
npm test
npm run lint
npm run build
```
