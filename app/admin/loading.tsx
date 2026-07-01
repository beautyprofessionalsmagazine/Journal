export default function AdminLoading() {
  return (
    <main className="min-h-screen bg-white p-6 text-black">
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="h-[80vh] border border-black/15" />
        <div className="flex flex-col gap-6">
          <div className="h-32 border border-black/15" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="h-32 border border-black/15" />
            <div className="h-32 border border-black/15" />
            <div className="h-32 border border-black/15" />
            <div className="h-32 border border-black/15" />
          </div>
          <div className="h-96 border border-black/15" />
        </div>
      </div>
    </main>
  );
}
