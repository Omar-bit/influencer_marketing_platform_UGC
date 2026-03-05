import { Profile } from 'next-auth';
type ProfilePictureProps = {
  src: string | null | undefined;
  alt: string;
  size?: 'small' | 'medium' | 'large';
  rounded?: 'none' | 'medium' | 'full';
  className?: {
    container?: string;
    image?: string;
  };
};
export default function ProfilePicture({
  src,
  alt = '',
  size = 'medium',
  rounded = 'full',
  className = {},
}: ProfilePictureProps) {
  const sizeClass = {
    small: 'size-10',
    medium: 'size-12',
    large: 'size-16',
  }[size];
  const roundedClass = {
    none: 'rounded-none',
    medium: 'rounded-md',
    full: 'rounded-full',
  }[rounded];
  return (
    <div
      className={`bg-gray-600 ${sizeClass} ${roundedClass} ${className.container}`}
    >
      {src && (
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover ${roundedClass} ${className.image} ${className.image}`}
        />
      )}
    </div>
  );
}
