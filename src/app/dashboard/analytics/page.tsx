import { Header } from "@/components/layout/header";
import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard";

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title="Sentiment Analytics"
        description="Insights and trends across all monitored keywords"
      />
      <div className="flex-1 overflow-auto p-6">
        <AnalyticsDashboard />
      </div>
    </div>
  );
}
