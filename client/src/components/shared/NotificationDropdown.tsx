import { Badge, Dropdown, List, Button, Typography, Empty } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useNotifications, useUnreadCount, useMarkAsRead, useMarkAllAsRead } from '../../api/notifications';
import { formatDateTime } from '../../utils/format';

export default function NotificationDropdown() {
  const navigate = useNavigate();
  const { data: count = 0 } = useUnreadCount();
  const { data } = useNotifications({ is_read: 'false', page: 1 });
  const markRead = useMarkAsRead();
  const markAllRead = useMarkAllAsRead();

  const notifications = data?.data || [];

  const items = [
    {
      key: 'notifications',
      label: (
        <div style={{ width: 360, maxHeight: 400, overflow: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px' }}>
            <Typography.Text strong>Thông báo</Typography.Text>
            {count > 0 && (
              <Button type="link" size="small" onClick={() => markAllRead.mutate()}>
                Đánh dấu tất cả đã đọc
              </Button>
            )}
          </div>
          {notifications.length === 0 ? (
            <Empty description="Không có thông báo mới" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          ) : (
            <List
              size="small"
              dataSource={notifications}
              renderItem={(item: Record<string, unknown>) => (
                <List.Item
                  style={{ cursor: 'pointer', padding: '8px 12px' }}
                  onClick={() => {
                    markRead.mutate(item.id as string);
                    if (item.contractId) navigate(`/contracts/${item.contractId}`);
                  }}
                >
                  <List.Item.Meta
                    title={item.title as string}
                    description={
                      <>
                        <div>{item.message as string}</div>
                        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                          {formatDateTime(item.createdAt as string)}
                        </Typography.Text>
                      </>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
      <Badge count={count} size="small" offset={[-2, 2]}>
        <BellOutlined style={{ fontSize: 18, cursor: 'pointer' }} />
      </Badge>
    </Dropdown>
  );
}
