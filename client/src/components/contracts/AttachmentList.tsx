import { List, Button, Space, Popconfirm } from 'antd';
import { FileOutlined, DownloadOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth';
import { useUploadAttachment, useDeleteAttachment } from '../../api/contracts';
import FileUpload from '../shared/FileUpload';

interface Attachment {
  id: string;
  fileName: string;
  fileSize: number;
  uploadedBy: { fullName: string };
  createdAt: string;
}

interface Props {
  contractId: string;
  attachments: Attachment[];
  contractStatus: string;
}

export default function AttachmentList({ contractId, attachments, contractStatus }: Props) {
  const { user } = useAuth();
  const uploadMutation = useUploadAttachment();
  const deleteMutation = useDeleteAttachment();

  const canUpload = user?.role === 'LEGAL_ADMIN' && contractStatus === 'DRAFT';

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div>
      {canUpload && (
        <div style={{ marginBottom: 16 }}>
          <FileUpload
            onUpload={async (file) => {
              await uploadMutation.mutateAsync({ contractId, file });
            }}
            loading={uploadMutation.isPending}
          />
        </div>
      )}
      <List
        size="small"
        dataSource={attachments}
        locale={{ emptyText: 'Chưa có file đính kèm' }}
        renderItem={(item) => (
          <List.Item
            actions={[
              <Button
                key="view"
                type="link"
                icon={<EyeOutlined />}
                onClick={() => window.open(`/api/attachments/${item.id}/view`, '_blank')}
              >
                Xem
              </Button>,
              <Button
                key="download"
                type="link"
                icon={<DownloadOutlined />}
                href={`/api/attachments/${item.id}/download`}
              >
                Tải
              </Button>,
              ...(user?.role === 'LEGAL_ADMIN'
                ? [
                    <Popconfirm
                      key="delete"
                      title="Xóa file này?"
                      onConfirm={() => deleteMutation.mutate(item.id)}
                    >
                      <Button type="link" danger icon={<DeleteOutlined />}>
                        Xóa
                      </Button>
                    </Popconfirm>,
                  ]
                : []),
            ]}
          >
            <List.Item.Meta
              avatar={<FileOutlined style={{ fontSize: 24, color: '#ff4d4f' }} />}
              title={item.fileName}
              description={`${formatFileSize(item.fileSize)} - ${item.uploadedBy.fullName}`}
            />
          </List.Item>
        )}
      />
    </div>
  );
}
