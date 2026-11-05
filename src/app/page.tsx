import Chat from "@/components/Chat";
import { profile } from "@/lib/cv";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-4 py-8 sm:py-12">
      <Chat profile={profile} />
    </main>
  );
}
