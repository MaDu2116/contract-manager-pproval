import { Row, Col, Input, Select, DatePicker, Button } from 'antd';
import { SearchOutlined, ClearOutlined } from '@ant-design/icons';
import { CONTRACT_TYPE_LABELS, CONTRACT_STATUS_LABELS } from '../../utils/constants';
import { usePartners } from '../../api/partners';

const { RangePicker } = DatePicker;

interface Filters {
  search?: string;
  type?: string;
  status?: string;
  partner?: string;
  from?: string;
  to?: string;
}

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
  onClear: () => void;
}

export default function FilterBar({ filters, onChange, onClear }: Props) {
  const { data: partnersData } = usePartners({ limit: 100 });
  const partners = partnersData?.data || [];

  return (
    <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
      <Col xs={24} sm={12} md={6}>
        <Input
          placeholder="Tìm kiếm..."
          prefix={<SearchOutlined />}
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          allowClear
        />
      </Col>
      <Col xs={12} sm={6} md={4}>
        <Select
          placeholder="Loại"
          value={filters.type}
          onChange={(value) => onChange({ ...filters, type: value })}
          allowClear
          style={{ width: '100%' }}
          options={Object.entries(CONTRACT_TYPE_LABELS).map(([value, label]) => ({ value, label }))}
        />
      </Col>
      <Col xs={12} sm={6} md={4}>
        <Select
          placeholder="Trạng thái"
          value={filters.status}
          onChange={(value) => onChange({ ...filters, status: value })}
          allowClear
          style={{ width: '100%' }}
          options={Object.entries(CONTRACT_STATUS_LABELS).map(([value, label]) => ({ value, label }))}
        />
      </Col>
      <Col xs={12} sm={6} md={4}>
        <Select
          placeholder="Đối tác"
          value={filters.partner}
          onChange={(value) => onChange({ ...filters, partner: value })}
          allowClear
          showSearch
          optionFilterProp="label"
          style={{ width: '100%' }}
          options={partners.map((p: { id: string; name: string }) => ({ value: p.id, label: p.name }))}
        />
      </Col>
      <Col xs={12} sm={6} md={4}>
        <RangePicker
          style={{ width: '100%' }}
          onChange={(dates) => {
            onChange({
              ...filters,
              from: dates?.[0]?.toISOString(),
              to: dates?.[1]?.toISOString(),
            });
          }}
        />
      </Col>
      <Col>
        <Button icon={<ClearOutlined />} onClick={onClear}>Xóa lọc</Button>
      </Col>
    </Row>
  );
}
