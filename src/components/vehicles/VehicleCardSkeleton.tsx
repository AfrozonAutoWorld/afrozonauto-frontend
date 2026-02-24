
export function VehicleCardSkeleton() {
  return (
    <div className="overflow-hidden bg-white rounded-xl border border-gray-100 shadow-sm animate-pulse">
      <div className="relative aspect-[16/10] bg-gray-200" />
      <div className="p-4">
        <div className="mb-3">
          <div className="w-3/4 h-5 bg-gray-200 rounded" />
          <div className="mt-2 w-1/2 h-4 bg-gray-100 rounded" />
        </div>
        <div className="flex gap-4 items-center mb-4">
          <div className="w-12 h-4 bg-gray-100 rounded" />
          <div className="w-16 h-4 bg-gray-100 rounded" />
        </div>
        <div className="pt-4 border-t border-gray-100">
          <div className="flex justify-between items-start mb-3">
            <div>
              <div className="mb-1 w-14 h-3 bg-gray-100 rounded" />
              <div className="w-20 h-6 bg-gray-200 rounded" />
            </div>
          </div>
          <div className="w-full h-10 bg-gray-200 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
