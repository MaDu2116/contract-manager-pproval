import { Card, Table, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import { formatDate, formatCurrency } from '../../utils/format';

interface ExpiringContract {
  id: string;
  contractNumber: string;
  title: string;
  partner: { name: string };
  value: string;
  expiryDate: string;
  daysLeft: number;
  urgency: 'critical' | 'warning' | 'info';
}

interface Props {
  data: ExpiringContract[];
}

const URGENCY_COLORS = { critical: 'red', warning: 'orange', info: 'blue' };
const URGENCY_LABELS = { critical: 'Khẩn cấp', warning: 'Cảnh báo', info: 'Thông báo' };

export default function ExpiringTable({ data }: Props) {
  const navigate = useNavigate();

  const columns = [
    { title: 'Số HĐ', dataIndex: 'contractNumber', key: 'contractNumber', width: 140 },
    { title: 'Tiêu đề', dataIndex: 'title', key: 'title', ellipsis: true },
    { title: 'Đối tác', dataIndex: ['partner', 'name'], key: 'partner', width: 180 },
    { title: 'Giá trị', dataIndex: 'value', key: 'value', width: 160, align: 'right' as const, render: (v: string) => formatCurrency(v) },
    { title: 'Hết hạn', dataIndex: 'expiryDate', key: 'expiryDate', width: 120, render: (d: string) => formatDate(d) },
    {
      title: 'Còn lại',
      dataIndex: 'daysLeft',
      key: 'daysLeft',
      width: 120,
      render: (days: number, record: ExpiringContract) => (
        <Tag color={URGENCY_COLORS[record.urgency]}>
          {days} ngày - {URGENCY_LABELS[record.urgency]}
        </Tag>
      ),
    },
  ];

  return (
    <Card title="Hợp đồng sắp hết hạn" size="small">
      <Table
        dataSource={data}
        columns={columns}
        rowKey="id"
        size="small"
        pagination={false}
        locale={{ emptyText: 'Không có hợp đồng sắp hết hạn' }}
        onRow={(record) => ({
          onClick: () => navigate(`/contracts/${record.id}`),
          style: { cursor: 'pointer' },
        })}
      />
    </Card>
  );
}
