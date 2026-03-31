import { Descriptions } from 'antd';
import StatusBadge from '../shared/StatusBadge';
import { CONTRACT_TYPE_LABELS } from '../../utils/constants';
import { formatCurrency, formatDate } from '../../utils/format';

interface Props {
  contract: Record<string, unknown>;
}

export default function ContractInfo({ contract }: Props) {
  const partner = contract.partner as Record<string, string> | undefined;
  const createdBy = contract.createdBy as Record<string, string> | undefined;

  return (
    <Descriptions bordered column={{ xs: 1, sm: 2 }} size="small">
      <Descriptions.Item label="Số hợp đồng">{contract.contractNumber as string}</Descriptions.Item>
      <Descriptions.Item label="Trạng thái">
        <StatusBadge status={contract.status as string} />
      </Descriptions.Item>
      <Descriptions.Item label="Tiêu đề" span={2}>{contract.title as string}</Descriptions.Item>
      <Descriptions.Item label="Loại">
        {CONTRACT_TYPE_LABELS[contract.type as string] || (contract.type as string)}
      </Descriptions.Item>
      <Descriptions.Item label="Đối tác">{partner?.name}</Descriptions.Item>
      <Descriptions.Item label="Giá trị">{formatCurrency(contract.value as string)}</Descriptions.Item>
      <Descriptions.Item label="Phiên bản">v{contract.version as number}</Descriptions.Item>
      <Descriptions.Item label="Ngày ký">{formatDate(contract.signingDate as string)}</Descriptions.Item>
      <Descriptions.Item label="Ngày hiệu lực">{formatDate(contract.effectiveDate as string)}</Descriptions.Item>
      <Descriptions.Item label="Ngày hết hạn">{formatDate(contract.expiryDate as string)}</Descriptions.Item>
      <Descriptions.Item label="Người tạo">{createdBy?.fullName}</Descriptions.Item>
      {contract.description ? (
        <Descriptions.Item label="Mô tả" span={2}>{contract.description as string}</Descriptions.Item>
      ) : null}
    </Descriptions>
  );
}
