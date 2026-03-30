import { Tag } from 'antd';
import { CONTRACT_STATUS_LABELS, CONTRACT_STATUS_COLORS } from '../../utils/constants';

interface Props {
  status: string;
}

export default function StatusBadge({ status }: Props) {
  return (
    <Tag color={CONTRACT_STATUS_COLORS[status] || 'default'}>
      {CONTRACT_STATUS_LABELS[status] || status}
    </Tag>
  );
}
