import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  FileTextOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const { Sider } = Layout;

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const menuItems = [
    { key: '/', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/contracts', icon: <FileTextOutlined />, label: 'Hợp đồng' },
    { key: '/partners', icon: <TeamOutlined />, label: 'Đối tác' },
  ];

  if (user?.role === 'MANAGER') {
    menuItems.push({ key: '/users', icon: <UserOutlined />, label: 'Người dùng' });
  }

  const selectedKey = menuItems.find((item) =>
    item.key === '/' ? location.pathname === '/' : location.pathname.startsWith(item.key),
  )?.key || '/';

  return (
    <Sider theme="dark" width={220} breakpoint="lg" collapsedWidth={80}>
      <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Contract Manager</span>
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[selectedKey]}
        items={menuItems}
        onClick={({ key }) => navigate(key)}
      />
    </Sider>
  );
}
