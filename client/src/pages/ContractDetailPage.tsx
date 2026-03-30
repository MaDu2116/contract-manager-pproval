import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Card, Tabs, Button, Space, Spin, message } from 'antd';
import { EditOutlined, CopyOutlined } from '@ant-design/icons';
import { useContract, useContractVersions, useRenewContract } from '../api/contracts';
import ContractInfo from '../components/contracts/ContractInfo';
import ApprovalActions from '../components/contracts/ApprovalActions';
import ApprovalHistory from '../components/contracts/ApprovalHistory';
import AttachmentList from '../components/contracts/AttachmentList';
import RenewalChain from '../components/contracts/RenewalChain';
import RoleGuard from '../components/shared/RoleGuard';

export default function ContractDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: contract, isLoading } = useContract(id!);
  const { data: versions } = useContractVersions(id!);
  const renewMutation = useRenewContract();

  if (isLoading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;
  if (!contract) return <Typography.Text>Hợp đồng không tồn tại</Typography.Text>;

  const handleRenew = async () => {
    try {
      const renewed = await renewMutation.mutateAsync(id!);
      message.success('Đã tạo phiên bản gia hạn');
      navigate(`/contracts/${renewed.id}`);
    } catch (error: unknown) {
      const msg = (error as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Gia hạn thất bại';
      message.error(msg);
    }
  };

  const tabItems = [
    {
      key: 'info',
      label: 'Thông tin',
      children: (
        <>
          <ContractInfo contract={contract} />
          <ApprovalActions contractId={id!} status={contract.status} />
        </>
      ),
    },
    {
      key: 'attachments',
      label: `File đính kèm (${contract.attachments?.length || 0})`,
      children: (
        <AttachmentList
          contractId={id!}
          attachments={contract.attachments || []}
          contractStatus={contract.status}
        />
      ),
    },
    {
      key: 'history',
      label: 'Lịch sử phê duyệt',
      children: <ApprovalHistory history={contract.approvals || []} />,
    },
    {
      key: 'versions',
      label: 'Phiên bản',
      children: versions && versions.length > 1
        ? <RenewalChain versions={versions} currentId={id!} />
        : <Typography.Text type="secondary">Đây là phiên bản gốc</Typography.Text>,
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Typography.Title level={4} style={{ margin: 0 }}>
          {contract.contractNumber} - {contract.title}
        </Typography.Title>
        <Space>
          <RoleGuard roles={['LEGAL_ADMIN']}>
            {contract.status === 'DRAFT' && (
              <Button icon={<EditOutlined />} onClick={() => navigate(`/contracts/${id}/edit`)}>
                Sửa
              </Button>
            )}
            {(contract.status === 'SIGNED' || contract.status === 'EXPIRED') && (
              <Button icon={<CopyOutlined />} onClick={handleRenew} loading={renewMutation.isPending}>
                Gia hạn
              </Button>
            )}
          </RoleGuard>
          <Button onClick={() => navigate('/contracts')}>Quay lại</Button>
        </Space>
      </div>

      <Card>
        <Tabs items={tabItems} />
      </Card>
    </div>
  );
}
