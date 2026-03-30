import { Form, Input, Select, InputNumber, DatePicker, Button, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { CONTRACT_TYPE_LABELS } from '../../utils/constants';
import { usePartners } from '../../api/partners';

interface Props {
  initialValues?: Record<string, unknown>;
  onSubmit: (values: Record<string, unknown>) => Promise<void>;
  loading: boolean;
}

export default function ContractForm({ initialValues, onSubmit, loading }: Props) {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { data: partnersData } = usePartners({ limit: 100 });
  const partners = partnersData?.data || [];

  const processedInitialValues = initialValues
    ? {
        ...initialValues,
        signingDate: initialValues.signingDate ? dayjs(initialValues.signingDate as string) : null,
        effectiveDate: initialValues.effectiveDate ? dayjs(initialValues.effectiveDate as string) : null,
        expiryDate: initialValues.expiryDate ? dayjs(initialValues.expiryDate as string) : null,
        value: initialValues.value ? Number(initialValues.value) : undefined,
      }
    : {};

  const handleFinish = async (values: Record<string, unknown>) => {
    const data = {
      ...values,
      signingDate: values.signingDate ? (values.signingDate as dayjs.Dayjs).toISOString() : null,
      effectiveDate: values.effectiveDate ? (values.effectiveDate as dayjs.Dayjs).toISOString() : null,
      expiryDate: values.expiryDate ? (values.expiryDate as dayjs.Dayjs).toISOString() : null,
    };
    await onSubmit(data);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={processedInitialValues}
      onFinish={handleFinish}
      style={{ maxWidth: 800 }}
    >
      <Form.Item name="title" label="Tiêu đề" rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}>
        <Input placeholder="Nhập tiêu đề hợp đồng" />
      </Form.Item>

      <Form.Item name="type" label="Loại hợp đồng" rules={[{ required: true, message: 'Vui lòng chọn loại' }]}>
        <Select
          placeholder="Chọn loại hợp đồng"
          options={Object.entries(CONTRACT_TYPE_LABELS).map(([value, label]) => ({ value, label }))}
        />
      </Form.Item>

      <Form.Item name="partnerId" label="Đối tác" rules={[{ required: true, message: 'Vui lòng chọn đối tác' }]}>
        <Select
          placeholder="Chọn đối tác"
          showSearch
          optionFilterProp="label"
          options={partners.map((p: { id: string; name: string }) => ({ value: p.id, label: p.name }))}
        />
      </Form.Item>

      <Form.Item name="value" label="Giá trị (VND)" rules={[{ required: true, message: 'Vui lòng nhập giá trị' }]}>
        <InputNumber
          style={{ width: '100%' }}
          min={0}
          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={(value) => Number(value!.replace(/,/g, ''))}
          placeholder="Nhập giá trị hợp đồng"
        />
      </Form.Item>

      <Space size="large">
        <Form.Item name="signingDate" label="Ngày ký">
          <DatePicker format="DD/MM/YYYY" placeholder="Chọn ngày ký" />
        </Form.Item>
        <Form.Item name="effectiveDate" label="Ngày hiệu lực">
          <DatePicker format="DD/MM/YYYY" placeholder="Chọn ngày hiệu lực" />
        </Form.Item>
        <Form.Item name="expiryDate" label="Ngày hết hạn">
          <DatePicker format="DD/MM/YYYY" placeholder="Chọn ngày hết hạn" />
        </Form.Item>
      </Space>

      <Form.Item name="description" label="Mô tả">
        <Input.TextArea rows={4} placeholder="Nhập mô tả hợp đồng" />
      </Form.Item>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            {initialValues ? 'Cập nhật' : 'Tạo hợp đồng'}
          </Button>
          <Button onClick={() => navigate(-1)}>Hủy</Button>
        </Space>
      </Form.Item>
    </Form>
  );
}
