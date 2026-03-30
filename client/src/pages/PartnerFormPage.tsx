import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Form, Input, Button, Space, Spin, message } from 'antd';
import { usePartner, useCreatePartner, useUpdatePartner } from '../api/partners';

export default function PartnerFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const { data: partner, isLoading } = usePartner(id || '');
  const createMutation = useCreatePartner();
  const updateMutation = useUpdatePartner();

  if (isEdit && isLoading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;

  const handleSubmit = async (values: Record<string, unknown>) => {
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id, ...values });
        message.success('Cập nhật đối tác thành công');
      } else {
        await createMutation.mutateAsync(values);
        message.success('Thêm đối tác thành công');
      }
      navigate('/partners');
    } catch (error: unknown) {
      const msg = (error as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Thao tác thất bại';
      message.error(msg);
    }
  };

  return (
    <div>
      <Typography.Title level={4}>{isEdit ? 'Sửa đối tác' : 'Thêm đối tác mới'}</Typography.Title>
      <Form
        layout="vertical"
        initialValues={isEdit ? partner : {}}
        onFinish={handleSubmit}
        style={{ maxWidth: 600 }}
      >
        <Form.Item name="name" label="Tên đối tác" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
          <Input placeholder="Nhập tên đối tác" />
        </Form.Item>
        <Form.Item name="taxCode" label="Mã số thuế">
          <Input placeholder="Nhập mã số thuế" />
        </Form.Item>
        <Form.Item name="address" label="Địa chỉ">
          <Input.TextArea rows={2} placeholder="Nhập địa chỉ" />
        </Form.Item>
        <Form.Item name="contactName" label="Người liên hệ">
          <Input placeholder="Nhập tên người liên hệ" />
        </Form.Item>
        <Form.Item name="contactEmail" label="Email liên hệ" rules={[{ type: 'email', message: 'Email không hợp lệ' }]}>
          <Input placeholder="Nhập email" />
        </Form.Item>
        <Form.Item name="contactPhone" label="Số điện thoại">
          <Input placeholder="Nhập số điện thoại" />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={createMutation.isPending || updateMutation.isPending}>
              {isEdit ? 'Cập nhật' : 'Thêm đối tác'}
            </Button>
            <Button onClick={() => navigate('/partners')}>Hủy</Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
}
