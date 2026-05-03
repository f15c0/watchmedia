import { Header } from "@/components/layout/header";
import { PublisherCalendar } from "@/components/publisher/publisher-calendar";

export default function PublisherPage() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title="Social Publisher"
        description="Schedule & publish content across platforms with AI-powered gap filling"
      />
      <div className="flex-1 overflow-auto p-6">
        <PublisherCalendar />
      </div>
    </div>
  );
}
