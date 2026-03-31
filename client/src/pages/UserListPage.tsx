import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Button, Table, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import { ROLE_LABELS } from '../utils/constants';
import { formatDate } from '../utils/format';

export default function UserListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['users', page],
    queryFn: async () => {
      const { data } = await apiClient.get('/users', { params: { page, limit: 20 } });
      return data;
    },
  });

  const columns = [
    { title: 'Họ tên', dataIndex: 'fullName', key: 'fullName' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      width: 140,
      render: (role: string) => <Tag>{ROLE_LABELS[role] || role}</Tag>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 120,
      render: (active: boolean) => <Tag color={active ? 'green' : 'red'}>{active ? 'Hoạt động' : 'Khóa'}</Tag>,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date: string) => formatDate(date),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Typography.Title level={4} style={{ margin: 0 }}>Người dùng</Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/users/new')}>
          Thêm người dùng
        </Button>
      </div>

      <Table
        dataSource={data?.data || []}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        onRow={(record: Record<string, unknown>) => ({
          onClick: () => navigate(`/users/${record.id}/edit`),
          style: { cursor: 'pointer' },
        })}
        pagination={{
          current: page,
          total: data?.total || 0,
          pageSize: 20,
          onChange: setPage,
          showTotal: (total) => `Tổng ${total} người dùng`,
        }}
      />
    </div>
  );
}
