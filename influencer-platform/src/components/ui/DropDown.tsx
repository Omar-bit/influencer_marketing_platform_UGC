import { dropDownOption } from '@/types/ui';
import Select from 'react-select';

function DropDown({
  options,
  value,
  setValue,
  label,
}: {
  value?: dropDownOption | null;
  setValue?: (option: any) => void;
  options?: dropDownOption[];
  label?: string;
}) {
  const defaultOptions = [
    { value: 'chocolate', label: 'Chocolate' },
    { value: 'strawberry', label: 'Strawberry' },
    { value: 'vanilla', label: 'Vanilla' },
  ];

  return (
    <div>
      <label htmlFor=''>{label}</label>
      <Select value={value} onChange={setValue} options={defaultOptions} />
    </div>
  );
}

export default DropDown;
