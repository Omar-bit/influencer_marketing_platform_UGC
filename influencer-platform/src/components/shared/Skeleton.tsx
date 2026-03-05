export const SkeletonText = ({
  width = 'w-full',
  height = 'h-4',
  className,
}: {
  width?: string;
  height?: string;
  className?: string;
}) => (
  <div
    className={`${width} ${height} ${className} bg-gray-200 dark:bg-gray-700 rounded animate-pulse`}
  ></div>
);

export const SkeletonImage = () => (
  <div className='w-full h-full bg-gray-200 dark:bg-gray-700 animate-pulse'></div>
);

export const SkeletonCard = ({ children }: any) => (
  <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-4'>
    {children}
  </div>
);
