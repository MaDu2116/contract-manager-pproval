import { Row, Col, Card, Statistic } from 'antd';
import { FileTextOutlined, DollarOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { formatCurrency } from '../../utils/format';

interface Props {
  totalContracts: number;
  totalValue: number | string;
  pendingApprovals: number;
}

export default function SummaryCards({ totalContracts, totalValue, pendingApprovals }: Props) {
  return (
    <Row gutter={16} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={8}>
        <Card>
          <Statistic
            title="Tổng hợp đồng"
            value={totalContracts}
            prefix={<FileTextOutlined />}
          />
        </Card>
      </Col>
      <Col xs={24} sm={8}>
        <Card>
          <Statistic
            title="Tổng giá trị"
            value={formatCurrency(totalValue)}
            prefix={<DollarOutlined />}
          />
        </Card>
      </Col>
      <Col xs={24} sm={8}>
        <Card>
          <Statistic
            title="Chờ phê duyệt"
            value={pendingApprovals}
            prefix={<ClockCircleOutlined />}
            valueStyle={{ color: pendingApprovals > 0 ? '#faad14' : undefined }}
          />
        </Card>
      </Col>
    </Row>
  );
}
