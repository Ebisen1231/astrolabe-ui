import { TutorChat } from "@/components/tutor-chat"

export default async function TutorPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>
}) {
  const rawQuery = (await searchParams).q
  const initialQuery = typeof rawQuery === "string" ? rawQuery : ""
  return (
    <main className="content-page tutor-page">
      <p className="eyebrow">RESIDENT TUTOR</p>
      <h1>常駐チューター</h1>
      <p className="tutor-lead">
        会話履歴はこのブラウザタブだけが保持します。台帳へ入るのは、表示されたツール実行だけです。
      </p>
      <TutorChat initialQuery={initialQuery} />
    </main>
  )
}
