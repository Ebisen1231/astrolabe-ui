import { TutorChat } from "@/components/tutor-chat"

export default function TutorPage() {
  return (
    <main className="content-page tutor-page">
      <p className="eyebrow">RESIDENT TUTOR</p>
      <h1>常駐チューター</h1>
      <p className="tutor-lead">
        会話履歴はこのブラウザタブだけが保持します。台帳へ入るのは、表示されたツール実行だけです。
      </p>
      <TutorChat />
    </main>
  )
}
