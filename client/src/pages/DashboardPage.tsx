import { Typography, Spin } from 'antd';
import { useDashboardSummary, useDashboardByType, useDashboardByStatus, useDashboardExpiring } from '../api/dashboard';
import SummaryCards from '../components/dashboard/SummaryCards';
import ValueByTypeChart from '../components/dashboard/ValueByTypeChart';
import ExpiringTable from '../components/dashboard/ExpiringTable';

export default function DashboardPage() {
  const { data: summary, isLoading: summaryLoading } = useDashboardSummary();
  const { data: byType } = useDashboardByType();
  const { data: byStatus } = useDashboardByStatus();
  const { data: expiring } = useDashboardExpiring();

  if (summaryLoading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;

  return (
    <div>
      <Typography.Title level={4} style={{ marginBottom: 24 }}>Dashboard</Typography.Title>

      <SummaryCards
        totalContracts={summary?.totalContracts || 0}
        totalValue={summary?.totalValue || 0}
        pendingApprovals={summary?.pendingApprovals || 0}
      />

      <ValueByTypeChart
        byType={byType || []}
        byStatus={byStatus || []}
      />

      <ExpiringTable data={expiring || []} />
    </div>
  );
}
