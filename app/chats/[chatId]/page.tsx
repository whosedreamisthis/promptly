import { Suspense } from "react";
import ChatView from "@/components/chat/ChatView";

export default function ChatPage({ params }: PageProps<"/chats/[chatId]">) {
  return (
    <Suspense fallback={null}>
      {params.then(({ chatId }) => (
        <ChatView chatId={chatId} />
      ))}
    </Suspense>
  );
}
