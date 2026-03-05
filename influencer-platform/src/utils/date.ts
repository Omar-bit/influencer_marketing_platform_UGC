import { format } from 'date-fns';
export function formatDate(date: Date | number | string) {
  //   let year = date.getFullYear();

  //   let month: string | number = date.getMonth() + 1;
  //   month = month < 10 ? `0${month}` : month;
  //   let day: string | number = date.getDate();
  //   day = day < 10 ? `0${day}` : day;
  //   return `${year} ${month} ${day}`;
  try {
    return format(date, 'yyyy MMM dd');
  } catch (error) {
    console.log('Error formatting date:', error);
    return '';
  }
}
export function timeSince(date: Date | number | string) {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  if (typeof date === 'number') {
    date = new Date(date);
  }
  date = date.getTime();

  const seconds = Math.floor((new Date().getTime() - date) / 1000);

  const intervals = [
    { label: 'year', seconds: 60 * 60 * 24 * 365 },
    { label: 'month', seconds: 60 * 60 * 24 * 30 },
    { label: 'day', seconds: 60 * 60 * 24 },
    { label: 'hour', seconds: 60 * 60 },
    { label: 'minute', seconds: 60 },
    { label: 'second', seconds: 1 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count > 0) {
      return count === 1
        ? `${count} ${interval.label}`
        : `${count} ${interval.label}s`;
    }
  }

  return 'just now';
}
