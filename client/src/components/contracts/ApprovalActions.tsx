import { Button, Space, Modal, Input, message } from 'antd';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useContractAction } from '../../api/contracts';

interface Props {
  contractId: string;
  status: string;
}

export default function ApprovalActions({ contractId, status }: Props) {
  const { user } = useAuth();
  const contractAction = useContractAction();
  const [commentModal, setCommentModal] = useState<{ action: string; title: string } | null>(null);
  const [comment, setComment] = useState('');

  if (!user) return null;

  const handleAction = async (action: string) => {
    try {
      await contractAction.mutateAsync({ id: contractId, action, comment: comment || undefined });
      message.success('Thao tác thành công');
      setCommentModal(null);
      setComment('');
    } catch (error: unknown) {
      const msg = (error as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Thao tác thất bại';
      message.error(msg);
    }
  };

  const openCommentModal = (action: string, title: string) => {
    setCommentModal({ action, title });
    setComment('');
  };

  const buttons: JSX.Element[] = [];

  if (status === 'DRAFT' && user.role === 'LEGAL_ADMIN') {
    buttons.push(
      <Button key="submit" type="primary" onClick={() => handleAction('submit')} loading={contractAction.isPending}>
        Nộp review
      </Button>,
    );
  }

  if (status === 'LEGAL_REVIEW' && user.role === 'LEGAL_ADMIN') {
    buttons.push(
      <Button key="legal-approve" type="primary" onClick={() => handleAction('legal-approve')} loading={contractAction.isPending}>
        Legal Approve
      </Button>,
      <Button key="legal-reject" danger onClick={() => openCommentModal('legal-reject', 'Từ chối - Legal Review')}>
        Legal Reject
      </Button>,
    );
  }

  if (status === 'MANAGER_APPROVAL' && user.role === 'MANAGER') {
    buttons.push(
      <Button key="manager-approve" type="primary" onClick={() => handleAction('manager-approve')} loading={contractAction.isPending}>
        Phê duyệt
      </Button>,
      <Button key="manager-reject" danger onClick={() => openCommentModal('manager-reject', 'Từ chối - Manager')}>
        Từ chối
      </Button>,
    );
  }

  if (buttons.length === 0) return null;

  return (
    <>
      <Space style={{ marginTop: 16 }}>{buttons}</Space>
      <Modal
        title={commentModal?.title}
        open={!!commentModal}
        onOk={() => handleAction(commentModal!.action)}
        onCancel={() => setCommentModal(null)}
        confirmLoading={contractAction.isPending}
        okText="Xác nhận"
        cancelText="Hủy"
      >
        <Input.TextArea
          rows={3}
          placeholder="Nhập lý do (không bắt buộc)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </Modal>
    </>
  );
}
