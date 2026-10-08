import { Suspense } from "react";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import ChatView from "@/components/chat/ChatView";
import { getChatWithMessages } from "@/lib/chats-data";

async function ChatContent({ params }: PageProps<"/chats/[chatId]">) {
  const [{ chatId }, { userId }] = await Promise.all([params, auth()]);
  const chat = userId ? await getChatWithMessages(userId, chatId) : null;
  if (!chat) notFound();
  return <ChatView chatId={chat.id} />;
}

export default function ChatPage(props: PageProps<"/chats/[chatId]">) {
  return (
    <Suspense fallback={null}>
      <ChatContent {...props} />
    </Suspense>
  );
}
