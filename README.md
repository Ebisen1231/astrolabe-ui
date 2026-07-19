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

実台帳・実export・`.env`はpublicの本リポジトリへコミットしません。

## 常駐チューター

core側でloopback限定APIを起動してから `/tutor` または `/tasks` を開きます。

```bash
astrolabe tutor-serve --port 8787
npm run dev
```

接続先を変える場合だけ、ブラウザ公開用の非秘密設定をビルド時に指定します。

```bash
NEXT_PUBLIC_ASTROLABE_TUTOR_URL=http://localhost:8787 npm run dev
```

APIキー・SupabaseキーはPython側だけが保持し、Next.jsへ設定しません。会話履歴はブラウザの
React stateだけに保持され、ページ再読み込みで消えます。

## 検証

```bash
npm test
npm run lint
npm run build
```
