import ProfilePicture from '@/components/shared/ProfilePicture/ProfilePicture';
import useGetUserReviews from '@/hooks/useGetUserReviews';
import { useTheme } from '@/providers/themeContext';
import { BACKEND_URL } from '@/utils/secrets';
import Image from 'next/image';
import { FaStar } from 'react-icons/fa';
import { IoStarOutline } from 'react-icons/io5';

type ReviewProps = {
  userId: string;
  userType: 'influencer' | 'business';
};

type Review = {
  _id: string;
  rater: {
    _id: string;
    name: string;
    profilePicture?: string;
    field?: string | null;
    primaryNiche?: string;
    type: string;
  };
  ratedUser: {
    _id: string;
    name: string;
    profilePicture?: string;
    type: string;
    primaryNiche?: string;
  };
  rating: number;
  feedback: string;
  createdAt: string;
  campaign?: {
    _id: string;
    name: string;
    duration: string;
  };
};

export default function Reviews({
  userId,
  userType = 'influencer',
}: ReviewProps) {
  const { theme } = useTheme();
  const { data: reviews = [] } = useGetUserReviews(userId);
  console.log('reviews', reviews);

  // Calculate average rating
  const averageRating = reviews?.length
    ? (
        reviews?.reduce(
          (acc: number, review: Review) => acc + review.rating,
          0
        ) / reviews?.length
      ).toFixed(1)
    : 0;

  // Function to render star ratings
  const renderStars = (rating: number) => {
    return Array(5)
      .fill(0)
      .map((star, i) =>
        i < rating ? (
          <FaStar key={i} size={16} fill='#FF4D8D' color='#FF4D8D' />
        ) : (
          <IoStarOutline key={i} size={16} fill='#FF4D8D' color='#FF4D8D' />
        )
      );
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className='w-[65%] rounded-lg border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 p-4 shadow-md mb-5'>
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center gap-2'>
          <FaStar size={20} fill='#FF4D8D' color='#FF4D8D' />
          <h2 className='text-lg font-medium dark:text-white'>
            Brands' Reviews
          </h2>
        </div>
        {reviews?.length > 0 && (
          <div className='flex items-center'>
            {renderStars(parseFloat(averageRating || '0'))}
            <span className='ml-2 text-sm text-gray-600 dark:text-gray-300'>
              {averageRating} ({reviews?.length} reviews)
            </span>
          </div>
        )}
      </div>

      <div className='space-y-6'>
        {reviews?.slice(0, 3).map((review: Review) => (
          <div
            key={review._id}
            className='bg-[#F8F8F8] dark:bg-gray-700 rounded-lg p-2'
          >
            <header className='flex justify-between mb-2'>
              <div className='flex items-center'>
                <div className='w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-600 mr-3'>
                  {review.rater.profilePicture ? (
                    <ProfilePicture
                      alt='Profile Picture'
                      src={
                        review.rater.profilePicture
                          ? BACKEND_URL +
                            '/uploads/' +
                            review.rater.profilePicture
                          : ''
                      }
                    />
                  ) : (
                    <div className='w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-300'>
                      {review.rater.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <p className='font-medium dark:text-white'>
                    {review.rater.name}
                  </p>
                  <p className='text-sm text-gray-500 dark:text-gray-300'>
                    {review.rater.field || review.rater.primaryNiche}
                  </p>
                </div>
              </div>
              <div className='flex items-start justify-end'>
                {renderStars(review.rating)}
              </div>
            </header>
            <p className='text-sm my-2 dark:text-gray-200'>{review.feedback}</p>
            <div className='text-xs text-gray-500 dark:text-gray-400 mt-2'>
              {review.campaign?.name} • {formatDate(review.createdAt)}
            </div>
          </div>
        ))}
      </div>

      {reviews?.length > 3 && (
        <button
          className='text-pink-500 hover:text-pink-600 dark:text-pink-400 dark:hover:text-pink-300 font-medium text-center w-full mt-4'
          onClick={() => {
            /* Add logic to view all reviews */
          }}
        >
          View All {reviews?.length} Reviews
        </button>
      )}
    </div>
  );
}
