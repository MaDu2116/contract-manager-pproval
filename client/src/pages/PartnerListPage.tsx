import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Button, Table, Input } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { usePartners } from '../api/partners';
import RoleGuard from '../components/shared/RoleGuard';

export default function PartnerListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = usePartners({ search, page, limit: 20 });

  const columns = [
    { title: 'Tên đối tác', dataIndex: 'name', key: 'name' },
    { title: 'Mã số thuế', dataIndex: 'taxCode', key: 'taxCode', width: 150 },
    { title: 'Người liên hệ', dataIndex: 'contactName', key: 'contactName', width: 180 },
    { title: 'Email', dataIndex: 'contactEmail', key: 'contactEmail', width: 200 },
    { title: 'Điện thoại', dataIndex: 'contactPhone', key: 'contactPhone', width: 150 },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Typography.Title level={4} style={{ margin: 0 }}>Đối tác</Typography.Title>
        <RoleGuard roles={['LEGAL_ADMIN', 'MANAGER']}>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/partners/new')}>
            Thêm đối tác
          </Button>
        </RoleGuard>
      </div>

      <Input
        placeholder="Tìm kiếm theo tên hoặc mã số thuế..."
        prefix={<SearchOutlined />}
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        style={{ marginBottom: 16, maxWidth: 400 }}
        allowClear
      />

      <Table
        dataSource={data?.data || []}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        onRow={(record) => ({
          onClick: () => navigate(`/partners/${record.id}/edit`),
          style: { cursor: 'pointer' },
        })}
        pagination={{
          current: page,
          total: data?.total || 0,
          pageSize: 20,
          onChange: setPage,
          showTotal: (total) => `Tổng ${total} đối tác`,
        }}
      />
    </div>
  );
}
