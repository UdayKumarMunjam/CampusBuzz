export default function SkeletonPost() {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 animate-pulse space-y-3 mx-2">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
        <div className="flex-1 space-y-1">
          <div className="h-4 bg-gray-300 rounded w-1/3"></div>
          <div className="h-3 bg-gray-300 rounded w-1/4"></div>
        </div>
      </div>
      <div className="h-48 bg-gray-300 rounded"></div>
      <div className="h-4 bg-gray-300 rounded w-5/6"></div>
      <div className="h-4 bg-gray-300 rounded w-2/3"></div>
    </div>
  );
}
