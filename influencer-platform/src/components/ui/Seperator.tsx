import React from 'react';

function Seperator({
  type = 'influencer',
  className,
  style = 'horizontal',
}: {
  type?: userTypes | 'neutral';
  className?: string;
  style?: 'horizontal' | 'vertical';
}) {
  const bg = className?.includes('bg-')
    ? ''
    : type === 'influencer'
    ? 'influencer-primary-gradient'
    : type === 'brand'
    ? 'bg-brand-primary'
    : 'bg-gray-300';

  if (style === 'vertical')
    return (
      <div
        className={`w-[1px] min-h-[150px] h-[50%] block ${bg}  ${className} `}
      />
    );
  return <div className={`h-[1px] w-[50%] block ${bg}  ${className} `} />;
}
import { userTypes } from '@/types/users';

export default Seperator;
