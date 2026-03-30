import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Form, Input, Select, Switch, Button, Space, Spin, message } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import { ROLE_LABELS } from '../utils/constants';

export default function UserFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const { data: user, isLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/users/${id}`);
      return data;
    },
    enabled: isEdit,
  });

  const mutation = useMutation({
    mutationFn: async (values: Record<string, unknown>) => {
      if (isEdit) {
        const { data } = await apiClient.put(`/users/${id}`, values);
        return data;
      }
      const { data } = await apiClient.post('/users', values);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      message.success(isEdit ? 'Cập nhật thành công' : 'Thêm người dùng thành công');
      navigate('/users');
    },
    onError: (error: unknown) => {
      const msg = (error as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Thao tác thất bại';
      message.error(msg);
    },
  });

  if (isEdit && isLoading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;

  return (
    <div>
      <Typography.Title level={4}>{isEdit ? 'Sửa người dùng' : 'Thêm người dùng mới'}</Typography.Title>
      <Form
        layout="vertical"
        initialValues={isEdit ? user : { isActive: true }}
        onFinish={(values) => mutation.mutate(values)}
        style={{ maxWidth: 500 }}
      >
        <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Vui lòng nhập email' }, { type: 'email', message: 'Email không hợp lệ' }]}>
          <Input placeholder="Nhập email" disabled={isEdit} />
        </Form.Item>
        <Form.Item name="fullName" label="Họ tên" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
          <Input placeholder="Nhập họ tên" />
        </Form.Item>
        <Form.Item name="role" label="Vai trò" rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}>
          <Select
            placeholder="Chọn vai trò"
            options={Object.entries(ROLE_LABELS).map(([value, label]) => ({ value, label }))}
          />
        </Form.Item>
        {!isEdit && (
          <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }, { min: 6, message: 'Tối thiểu 6 ký tự' }]}>
            <Input.Password placeholder="Nhập mật khẩu" />
          </Form.Item>
        )}
        {isEdit && (
          <>
            <Form.Item name="password" label="Mật khẩu mới (để trống nếu không đổi)">
              <Input.Password placeholder="Nhập mật khẩu mới" />
            </Form.Item>
            <Form.Item name="isActive" label="Trạng thái" valuePropName="checked">
              <Switch checkedChildren="Hoạt động" unCheckedChildren="Khóa" />
            </Form.Item>
          </>
        )}
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={mutation.isPending}>
              {isEdit ? 'Cập nhật' : 'Thêm người dùng'}
            </Button>
            <Button onClick={() => navigate('/users')}>Hủy</Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
}
