import { Layout, Space, Dropdown, Typography, Button } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth';
import { ROLE_LABELS } from '../../utils/constants';
import NotificationDropdown from '../shared/NotificationDropdown';

export default function Header() {
  const { user, logout } = useAuth();

  const userMenuItems = [
    {
      key: 'info',
      label: (
        <div>
          <div>{user?.fullName}</div>
          <Typography.Text type="secondary">{ROLE_LABELS[user?.role || '']}</Typography.Text>
        </div>
      ),
      disabled: true,
    },
    { type: 'divider' as const },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      onClick: logout,
    },
  ];

  return (
    <Layout.Header
      style={{
        background: '#fff',
        padding: '0 24px',
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        borderBottom: '1px solid #f0f0f0',
      }}
    >
      <Space size="large">
        <NotificationDropdown />
        <Dropdown menu={{ items: userMenuItems }} trigger={['click']}>
          <Button type="text" icon={<UserOutlined />}>
            {user?.fullName}
          </Button>
        </Dropdown>
      </Space>
    </Layout.Header>
  );
}
