import { Timeline, Typography } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, SendOutlined } from '@ant-design/icons';
import { CONTRACT_STATUS_LABELS, APPROVAL_ACTION_LABELS } from '../../utils/constants';
import { formatDateTime } from '../../utils/format';

interface ApprovalRecord {
  id: string;
  fromStatus: string;
  toStatus: string;
  action: string;
  comment?: string;
  actedBy: { fullName: string };
  createdAt: string;
}

interface Props {
  history: ApprovalRecord[];
}

const actionIcons: Record<string, JSX.Element> = {
  SUBMIT: <SendOutlined style={{ color: '#1890ff' }} />,
  APPROVE: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
  REJECT: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
};

export default function ApprovalHistory({ history }: Props) {
  if (!history || history.length === 0) {
    return <Typography.Text type="secondary">Chưa có lịch sử phê duyệt</Typography.Text>;
  }

  return (
    <Timeline
      items={history.map((item) => ({
        dot: actionIcons[item.action],
        children: (
          <div>
            <Typography.Text strong>
              {APPROVAL_ACTION_LABELS[item.action] || item.action}
            </Typography.Text>
            <span> - {item.actedBy.fullName}</span>
            <br />
            <Typography.Text type="secondary">
              {CONTRACT_STATUS_LABELS[item.fromStatus]} → {CONTRACT_STATUS_LABELS[item.toStatus]}
            </Typography.Text>
            <br />
            {item.comment && (
              <Typography.Text italic>"{item.comment}"</Typography.Text>
            )}
            <br />
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {formatDateTime(item.createdAt)}
            </Typography.Text>
          </div>
        ),
      }))}
    />
  );
}
