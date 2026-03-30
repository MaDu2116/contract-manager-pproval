import { Table } from 'antd';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../shared/StatusBadge';
import { CONTRACT_TYPE_LABELS } from '../../utils/constants';
import { formatCurrency, formatDate } from '../../utils/format';

interface Props {
  data: Record<string, unknown>[];
  total: number;
  page: number;
  limit: number;
  loading: boolean;
  onPageChange: (page: number, limit: number) => void;
}

export default function ContractTable({ data, total, page, limit, loading, onPageChange }: Props) {
  const navigate = useNavigate();

  const columns = [
    {
      title: 'Số HĐ',
      dataIndex: 'contractNumber',
      key: 'contractNumber',
      width: 140,
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => CONTRACT_TYPE_LABELS[type] || type,
    },
    {
      title: 'Đối tác',
      dataIndex: ['partner', 'name'],
      key: 'partner',
      width: 180,
      ellipsis: true,
    },
    {
      title: 'Giá trị',
      dataIndex: 'value',
      key: 'value',
      width: 160,
      align: 'right' as const,
      render: (value: string) => formatCurrency(value),
    },
    {
      title: 'Hết hạn',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      width: 120,
      render: (date: string) => formatDate(date),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status: string) => <StatusBadge status={status} />,
    },
  ];

  return (
    <Table
      dataSource={data}
      columns={columns}
      rowKey="id"
      loading={loading}
      onRow={(record) => ({
        onClick: () => navigate(`/contracts/${record.id}`),
        style: { cursor: 'pointer' },
      })}
      pagination={{
        current: page,
        pageSize: limit,
        total,
        showSizeChanger: true,
        showTotal: (total) => `Tổng ${total} hợp đồng`,
        onChange: onPageChange,
      }}
    />
  );
}
