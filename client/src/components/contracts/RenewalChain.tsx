import { Steps } from 'antd';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../shared/StatusBadge';

interface Version {
  id: string;
  contractNumber: string;
  version: number;
  status: string;
  createdAt: string;
}

interface Props {
  versions: Version[];
  currentId: string;
}

export default function RenewalChain({ versions, currentId }: Props) {
  const navigate = useNavigate();

  if (!versions || versions.length <= 1) return null;

  const currentIndex = versions.findIndex((v) => v.id === currentId);

  return (
    <Steps
      current={currentIndex}
      size="small"
      items={versions.map((v) => ({
        title: (
          <span
            style={{ cursor: v.id !== currentId ? 'pointer' : 'default' }}
            onClick={() => v.id !== currentId && navigate(`/contracts/${v.id}`)}
          >
            {v.contractNumber}
          </span>
        ),
        description: <StatusBadge status={v.status} />,
      }))}
    />
  );
}
