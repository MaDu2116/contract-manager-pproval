import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Spin, message } from 'antd';
import { useContract, useCreateContract, useUpdateContract } from '../api/contracts';
import ContractForm from '../components/contracts/ContractForm';

export default function ContractFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const { data: contract, isLoading } = useContract(id || '');
  const createMutation = useCreateContract();
  const updateMutation = useUpdateContract();

  if (isEdit && isLoading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;

  const handleSubmit = async (values: Record<string, unknown>) => {
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id, ...values });
        message.success('Cập nhật hợp đồng thành công');
        navigate(`/contracts/${id}`);
      } else {
        const created = await createMutation.mutateAsync(values);
        message.success('Tạo hợp đồng thành công');
        navigate(`/contracts/${created.id}`);
      }
    } catch (error: unknown) {
      const msg = (error as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Thao tác thất bại';
      message.error(msg);
    }
  };

  return (
    <div>
      <Typography.Title level={4}>
        {isEdit ? 'Sửa hợp đồng' : 'Tạo hợp đồng mới'}
      </Typography.Title>
      <ContractForm
        initialValues={isEdit ? contract : undefined}
        onSubmit={handleSubmit}
        loading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
