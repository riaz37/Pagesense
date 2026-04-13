import { Suspense } from 'react';
import { setRequestLocale } from 'next-intl/server';
import { ChatRoom } from './_components/ChatRoom';

interface ChatPageProps {
  params: Promise<{ locale: string }>;
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <Suspense>
      <ChatRoom />
    </Suspense>
  );
}
