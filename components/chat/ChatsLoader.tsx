import { auth } from "@clerk/nextjs/server";
import ChatsProvider from "@/components/chat/ChatsProvider";
import { getChatsData } from "@/lib/chats-data";

/** Loads the signed-in user's chats and notebooks; render it inside Suspense since it reads the session. */
export default async function ChatsLoader({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  const initialData = userId
    ? await getChatsData(userId)
    : { chats: [], notebooks: [] };
  return (
    <ChatsProvider initialData={initialData} isGuest={!userId}>
      {children}
    </ChatsProvider>
  );
}
