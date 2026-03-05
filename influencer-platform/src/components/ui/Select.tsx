'use client';
import RSelect from 'react-select';
type SelectProps = {
  placeholder?: string;
  labelPosition?: 'top' | 'left';
  label?: string;
  options: { label: string; value: string }[];
  value: any;
  setValue: (value: any) => void;
  className?: {
    label?: string;
    select?: string;
    container?: string;
  };
  isDisabled?: boolean;
  isMulti?: boolean;
  styles?: any;
  instanceId?: string;
};

function Select({
  placeholder = 'Select...',
  labelPosition = 'top',
  label,
  options,
  value,
  setValue,
  className = {},
  isDisabled = false,
  isMulti = false,
  styles,
  instanceId,
}: SelectProps) {
  const customStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      width: '100% !important',
      borderRadius: '8px',
      border: '1px solid var(--brand-secondary)',
      padding: '2px',
      background: 'var(--input-bg)',
      boxShadow: 'none',
      fontSize: '14px',
      '&:hover': {
        borderColor: '',
      },
      ...(styles?.control || {}),
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      fontSize: '14px',
      backgroundColor: state.isSelected
        ? 'var(--brand-primary_10)'
        : state.isFocused
        ? 'var(--hover-bg)'
        : 'var(--card-bg)',
      color: 'var(--text)',
      '&:hover': {
        backgroundColor: 'var(--hover-bg)',
      },
    }),
    menu: (provided: any) => ({
      ...provided,
      borderRadius: '8px',
      overflow: 'hidden',
      backgroundColor: 'var(--card-bg)',
      border: '1px solid var(--card-border)',
    }),
    menuList: (provided: any) => ({
      ...provided,
      backgroundColor: 'var(--card-bg)',
    }),
    multiValue: (provided: any) => ({
      ...provided,
      backgroundColor: 'var(--brand-primary_10)',
    }),
    multiValueLabel: (provided: any) => ({
      ...provided,
      color: 'var(--text)',
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: 'var(--text)',
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: 'var(--text)',
      opacity: 0.5,
    }),
    indicatorSeparator: () => ({
      display: 'none',
    }),
  };

  return (
    <div
      className={` flex   md:gap-1  w-full ${
        labelPosition === 'left' ? ' flex-row gap-2 items-center' : 'flex-col'
      } ${className.container} `}
    >
      {label && (
        <label
          className={`block w-auto text-xs font-semibold text-[#374151] dark:text-slate-200 ${className.label}`}
          htmlFor=''
        >
          {label}
        </label>
      )}{' '}
      <RSelect
        isDisabled={isDisabled}
        isMulti={isMulti}
        options={options}
        value={value}
        onChange={setValue}
        styles={customStyles}
        placeholder={placeholder}
        className='flex-1'
        classNamePrefix='react-select'
        instanceId={instanceId}
      />
    </div>
  );
}

export default Select;
