import { LiveInterviewSession } from "@/components/interview/LiveInterviewSession";

export default function InterviewSessionPage({
  params,
}: {
  params: { sessionId: string };
}) {
  return <LiveInterviewSession sessionId={params.sessionId} />;
}
