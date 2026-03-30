import { Upload, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';

interface Props {
  onUpload: (file: File) => Promise<void>;
  loading?: boolean;
}

export default function FileUpload({ onUpload, loading }: Props) {
  const props: UploadProps = {
    accept: '.pdf',
    showUploadList: false,
    beforeUpload: async (file) => {
      if (file.type !== 'application/pdf') {
        message.error('Chỉ chấp nhận file PDF');
        return false;
      }
      if (file.size > 20 * 1024 * 1024) {
        message.error('File không được vượt quá 20MB');
        return false;
      }
      try {
        await onUpload(file);
        message.success('Upload thành công');
      } catch {
        message.error('Upload thất bại');
      }
      return false;
    },
  };

  return (
    <Upload {...props}>
      <Button icon={<UploadOutlined />} loading={loading}>
        Upload PDF
      </Button>
    </Upload>
  );
}
