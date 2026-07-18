"use client"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main className="content-page">
      <section className="data-error" role="alert">
        <p className="eyebrow">DISPLAY ERROR</p>
        <h1>画面を表示できません</h1>
        <p>{error.message}</p>
        <button onClick={reset} type="button">
          もう一度試す
        </button>
      </section>
    </main>
  )
}
