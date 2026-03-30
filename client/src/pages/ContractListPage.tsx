import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useContracts } from '../api/contracts';
import ContractTable from '../components/contracts/ContractTable';
import FilterBar from '../components/contracts/FilterBar';
import RoleGuard from '../components/shared/RoleGuard';

interface Filters {
  search?: string;
  type?: string;
  status?: string;
  partner?: string;
  from?: string;
  to?: string;
}

export default function ContractListPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<Filters>({});
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const { data, isLoading } = useContracts({ ...filters, page, limit });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Typography.Title level={4} style={{ margin: 0 }}>Danh sách hợp đồng</Typography.Title>
        <RoleGuard roles={['LEGAL_ADMIN']}>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/contracts/new')}>
            Tạo hợp đồng
          </Button>
        </RoleGuard>
      </div>

      <FilterBar
        filters={filters}
        onChange={(f) => { setFilters(f); setPage(1); }}
        onClear={() => { setFilters({}); setPage(1); }}
      />

      <ContractTable
        data={data?.data || []}
        total={data?.total || 0}
        page={page}
        limit={limit}
        loading={isLoading}
        onPageChange={(p, l) => { setPage(p); setLimit(l); }}
      />
    </div>
  );
}
