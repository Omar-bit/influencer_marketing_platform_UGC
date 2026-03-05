import React, { ReactNode } from 'react';

type CardSelectorProps = {
  options: { id: string; disabled: boolean; content: string | ReactNode }[];
  value: null | string | string[];
  setValue: (value: string | string[] | null) => void;
  isMultiSelect: boolean;
  userType?: 'brand' | 'influencer';
};

export default function CardSelector({
  options,
  value,
  setValue,
  isMultiSelect,
  userType = 'brand',
}: CardSelectorProps) {
  const selectedBgColor =
    userType === 'brand'
      ? 'bg-brand-primary_10 dark:bg-brand-primary dark:bg-opacity-20'
      : 'influencer-primary-gradient';
  const selectedBorderColor =
    userType === 'brand' ? 'border-brand-primary' : '';
  const selectedTextColor =
    userType === 'brand' ? '!text-black dark:!text-white' : '!text-white';

  if (!options || options.length === 0) {
    return <div>No options available</div>;
  }

  const handleSelect = (cardId: string) => {
    if (isMultiSelect) {
      if (Array.isArray(value)) {
        if (value.includes(cardId)) {
          const newValue = value.filter((id) => id !== cardId);
          setValue(newValue.length ? newValue : []);
        } else {
          setValue([...value, cardId]);
        }
      } else {
        setValue([cardId]);
      }
    } else {
      setValue(cardId === value ? null : cardId);
    }
  };

  return (
    <div className='grid grid-cols-2 gap-1'>
      {options.map((option) => {
        const isSelected = Array.isArray(value)
          ? value.includes(option.id)
          : value === option.id;
        return (
          <div
            key={option.id}
            className={`cursor-pointer rounded p-1 ${
              isSelected
                ? `${selectedTextColor} border-2 ${selectedBgColor} ${selectedBorderColor}`
                : 'border border-brand-primary dark:border-brand-primary'
            }`}
            onClick={() => !option.disabled && handleSelect(option.id)}
          >
            {option.content}
          </div>
        );
      })}
    </div>
  );
}
type CardProps = {
  header: string | ReactNode;
  body: string | ReactNode;
  children?: ReactNode;
  disabled?: boolean;
  className?: {
    container: string;
  };
};
export function Card({
  header,
  body,
  children,
  className,
  disabled = false,
}: CardProps) {
  return (
    <section
      className={`flex flex-col p-1 dark:text-gray-200 ${
        className?.container
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <header className='font-bold text-sm'>{header}</header>
      <main className='text-xs dark:text-gray-300'>{body}</main>
      <div> {children}</div>
    </section>
  );
}
