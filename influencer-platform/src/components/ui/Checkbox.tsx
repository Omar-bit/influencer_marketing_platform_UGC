import React from 'react';

interface CheckboxProps {
  id?: string;
  label: string | React.ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

export default function Checkbox({
  id,
  label,
  checked,
  onChange,
  className = '',
}: CheckboxProps) {
  return (
    <label
      className={`flex items-center space-x-2 text-[12px] md:text-[14px] ${className}`}
    >
      <input
        type='checkbox'
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className='size-4 border border-gray-300 '
      />
      <span className='text-gray-700'>{label}</span>
    </label>
  );
}
