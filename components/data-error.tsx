export function DataError({ error }: { error: unknown }) {
  const message = error instanceof Error ? error.message : "不明な読込エラーが発生しました。"
  return (
    <main className="content-page">
      <section className="data-error" role="alert">
        <p className="eyebrow">DATA CONTRACT ERROR</p>
        <h1>学習データを表示できません</h1>
        <p>{message}</p>
        <p className="muted">
          coreで再度 <code>astrolabe export</code> を実行し、UIと同じschemaへ揃えてください。
        </p>
      </section>
    </main>
  )
}
