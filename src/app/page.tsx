import { site } from "@/config/site";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center gap-4 px-6 py-12">
      <h1 className="text-3xl font-bold">{site.name}</h1>
      <p className="text-lg">Geliştirme aşamasında.</p>
      <p>GitHub analizi, puanlama ve paylaşım özellikleri henüz kullanıma açık değil.</p>
    </main>
  );
}
