import { useRouter } from 'next/navigation';
import { FaArrowLeftLong } from 'react-icons/fa6';

function BackLink({
  userType = 'influencer',
  to,
  className,
}: {
  userType?: 'influencer' | 'brand';
  to?: string;
  className?: string;
}) {
  const router = useRouter();
  const bg =
    userType === 'brand' ? 'text-brand-primary' : 'text-influencer-primary';
  const handleNavigation = () => {
    if (to) {
      router.push(to);
    } else {
      router.back();
    }
  };
  return (
    <FaArrowLeftLong
      className={`size-5 cursor-pointer ${bg} ${className}`}
      onClick={handleNavigation}
    />
  );
}

export default BackLink;
