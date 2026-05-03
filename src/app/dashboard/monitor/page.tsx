"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { KeywordManager } from "@/components/monitor/keyword-manager";
import { MentionsFeed } from "@/components/monitor/mentions-feed";
import { AlertBanner } from "@/components/monitor/alert-banner";
import { FilterDock } from "@/components/monitor/filter-dock";

export default function MonitorPage() {
  const [filter, setFilter] = useState("ALL");

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title="Keyword Monitor"
        description="Real-time tracking across news, social media, radio & TV"
      />
      <div className="flex-1 overflow-hidden pt-0 px-6 pb-6 flex flex-col gap-4 min-h-0">
        <AlertBanner />
        <FilterDock activeFilter={filter} onFilterChange={setFilter} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 flex-1 min-h-0">
          <div className="lg:col-span-1 min-h-0">
            <KeywordManager />
          </div>
          <div className="lg:col-span-2 min-h-0 flex flex-col">
            <MentionsFeed filter={filter} />
          </div>
        </div>
      </div>
    </div>
  );
}
