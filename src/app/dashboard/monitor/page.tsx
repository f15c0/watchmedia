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

      {/* Mobile: scrollable. Desktop: fixed panels. */}
      <div className="flex-1 overflow-y-auto md:overflow-hidden px-4 md:px-6 pb-6 pt-0 flex flex-col gap-4 min-h-0">
        <AlertBanner />
        <FilterDock activeFilter={filter} onFilterChange={setFilter} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:flex-1 md:min-h-0">
          {/* Keyword panel — capped height on mobile so feed is visible */}
          <div className="md:col-span-1 md:min-h-0 max-h-80 md:max-h-none">
            <KeywordManager />
          </div>

          {/* Feed — fixed height on mobile, fills space on desktop */}
          <div className="md:col-span-2 md:min-h-0 md:flex md:flex-col h-[60vh] md:h-auto">
            <MentionsFeed filter={filter} />
          </div>
        </div>
      </div>
    </div>
  );
}
