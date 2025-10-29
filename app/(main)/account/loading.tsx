export default function LoadingAccount() {
  return (
    <div className="flex flex-row-reverse gap-[48px] px-4 sm:px-6 w-full">
      <div className="hidden md:block w-[320px]" aria-hidden>
        <div className="sticky top-6 space-y-4">
          <div className="h-40 bg-slate-200 rounded-xl animate-pulse" />
          <div className="h-24 bg-slate-200 rounded-xl animate-pulse" />
        </div>
      </div>
      <div className="flex-1">
        <div className="w-full flex flex-col items-center pb-4 sm:pb-0">
          <div className="h-7 w-56 bg-slate-200 rounded animate-pulse my-6" />
          <div className="max-w-2xl w-full bg-white border rounded-xl p-4 sm:p-6 space-y-6">
            <div className="h-6 w-40 bg-slate-200 rounded animate-pulse" />
            <div className="space-y-3">
              <div className="h-9 bg-slate-200 rounded-md animate-pulse" />
              <div className="h-9 bg-slate-200 rounded-md animate-pulse" />
            </div>
            <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-5 gap-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="h-20 bg-slate-200 rounded-lg animate-pulse" />
              ))}
            </div>
            <div className="flex items-center justify-between">
              <div className="h-10 w-24 bg-slate-200 rounded-md animate-pulse" />
              <div className="h-10 w-24 bg-slate-200 rounded-md animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
