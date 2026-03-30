import { formatCurrency } from '../../utils/format';

interface Props {
  value: number | string;
}

export default function CurrencyDisplay({ value }: Props) {
  return <span>{formatCurrency(value)}</span>;
}
