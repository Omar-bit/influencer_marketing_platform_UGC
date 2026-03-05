import { formatDate } from '@/utils/date';
import { format } from 'date-fns';

type Props = {
  startDate: any;
  endDate: any;
  className?: string;
};
export default function DurationTimeline({
  startDate,
  endDate,
  className = '',
}: Props) {
  endDate = formatDate(new Date(endDate));
  startDate = formatDate(new Date(startDate));
  return (
    <div className={`flex flex-col items-start ${className}`}>
      {/* First Event */}
      <div className='flex items-start space-x-3'>
        <div className='relative flex flex-col items-center'>
          <div className='w-4 h-4 rounded-full influencer-primary-gradient'></div>
          <div className='w-[2px] h-11 timeline-gradient'></div>{' '}
          {/* Connector line */}
        </div>
        <p className='text-[#909090] text-sm leading-tight'>
          Campaign starts on <br />
          <span className='font-normal text-[#909090]'>{startDate}</span>
        </p>
      </div>

      {/* Second Event */}
      <div className='flex items-start space-x-3 -mt-4'>
        <div className='relative flex flex-col items-center'>
          <div className='w-4 h-4 rounded-full bg-white border-4 border-[#909090]'></div>
        </div>
        <p className='text-[#909090] text-sm leading-tight'>
          Apply and submit content by / Campaign ends on <br />
          <span className='font-normal text-[#909090]'>
            {endDate.toString()}
          </span>
        </p>
      </div>
    </div>
  );
}
