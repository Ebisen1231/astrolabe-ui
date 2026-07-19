# Astrolabe UI

Astrolabeの学習台帳exportを読むNext.js学習マップです。ローカルではfixture/ファイルexport、
公開時はSupabase Authと認証付きcore APIを使います。

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

## 公開モード

次の3変数がすべてある場合だけ公開モードになり、未認証時は全ページでログイン画面を
表示します。一部だけ設定された状態はbuild/runtime errorとして扱います。

```bash
NEXT_PUBLIC_ASTROLABE_API_URL=https://core-project.vercel.app
NEXT_PUBLIC_SUPABASE_URL=https://project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

anon keyはWeb公開用です。`SUPABASE_SERVICE_ROLE_KEY`と`OPENAI_API_KEY`をUIへ設定しては
いけません。星図・報告・履歴・タスク・チューターは同じBearer付きcore APIへ接続します。

## 検証

```bash
npm test
npm run lint
npm run build
```
