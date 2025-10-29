export default function LoadingLesson() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-4">
        <div className="h-6 w-40 bg-slate-200 rounded animate-pulse" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-20 bg-slate-200 rounded-xl animate-pulse" />
          <div className="h-20 bg-slate-200 rounded-xl animate-pulse" />
          <div className="h-20 bg-slate-200 rounded-xl animate-pulse" />
          <div className="h-20 bg-slate-200 rounded-xl animate-pulse" />
        </div>
        <div className="h-10 w-full bg-slate-200 rounded-lg animate-pulse" />
      </div>
    </div>
  );
}
