# Astrolabe UI — エージェント向け指示

設計の正は `Ebisen1231/astrolabe-core` の `docs/design.md`。矛盾を見つけたら、
UI側だけで決めずにcoreの設計へ追記する。

## M2の境界

- Next.js App Router / TypeScriptで、ローカルの静的export JSONだけを読む。
- 実台帳・実export・`.env`・秘密情報をpublicリポジトリへコミットしない。
- 依存追加は実装前に理由を添えて施主へ提案する。
- 実行時のLLM呼び出しと外部API呼び出しはゼロ。描画は決定的コードで行う。
- フィードバックはprefilled GitHub Issueリンク。API routeとSupabaseはM3まで作らない。
- デプロイ・認証・リモート閲覧はM2の範囲外。

## データ安全

- `ASTROLABE_EXPORTS_DIR`未設定時だけ、同梱の合成fixtureを読む。
- fixtureモードでは全ページに「fixtureデータ表示中(実台帳未接続)」を表示する。
- 全JSONの`schema_version`を読込時に検証し、不一致は明示的なエラー画面にする。

<!-- BEGIN:nextjs-agent-rules -->
## Next.jsローカル規約

このNext.jsは破壊的変更を含みうる。実装前に `node_modules/next/dist/docs/` の関連章を読み、
非推奨警告に従うこと。
<!-- END:nextjs-agent-rules -->
