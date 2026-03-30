import { Row, Col, Card, Table, Tag } from 'antd';
import { CONTRACT_TYPE_LABELS, CONTRACT_STATUS_LABELS, CONTRACT_STATUS_COLORS } from '../../utils/constants';
import { formatCurrency } from '../../utils/format';

interface TypeData {
  type: string;
  count: number;
  value: number | string;
}

interface StatusData {
  status: string;
  count: number;
  value: number | string;
}

interface Props {
  byType: TypeData[];
  byStatus: StatusData[];
}

export default function ValueByTypeChart({ byType, byStatus }: Props) {
  const typeColumns = [
    {
      title: 'Loại hợp đồng',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => CONTRACT_TYPE_LABELS[type] || type,
    },
    { title: 'Số lượng', dataIndex: 'count', key: 'count', width: 100, align: 'center' as const },
    {
      title: 'Giá trị',
      dataIndex: 'value',
      key: 'value',
      width: 200,
      align: 'right' as const,
      render: (v: number | string) => formatCurrency(v),
    },
  ];

  const statusColumns = [
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={CONTRACT_STATUS_COLORS[status]}>{CONTRACT_STATUS_LABELS[status] || status}</Tag>
      ),
    },
    { title: 'Số lượng', dataIndex: 'count', key: 'count', width: 100, align: 'center' as const },
    {
      title: 'Giá trị',
      dataIndex: 'value',
      key: 'value',
      width: 200,
      align: 'right' as const,
      render: (v: number | string) => formatCurrency(v),
    },
  ];

  return (
    <Row gutter={16} style={{ marginBottom: 24 }}>
      <Col xs={24} md={12}>
        <Card title="Theo loại hợp đồng" size="small">
          <Table
            dataSource={byType}
            columns={typeColumns}
            rowKey="type"
            pagination={false}
            size="small"
          />
        </Card>
      </Col>
      <Col xs={24} md={12}>
        <Card title="Theo trạng thái" size="small">
          <Table
            dataSource={byStatus}
            columns={statusColumns}
            rowKey="status"
            pagination={false}
            size="small"
          />
        </Card>
      </Col>
    </Row>
  );
}
