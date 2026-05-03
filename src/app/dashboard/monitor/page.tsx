"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { KeywordManager } from "@/components/monitor/keyword-manager";
import { MentionsFeed } from "@/components/monitor/mentions-feed";
import { AlertBanner } from "@/components/monitor/alert-banner";
import { FilterDock } from "@/components/monitor/filter-dock";
import { KeywordsSheet } from "@/components/monitor/keywords-sheet";
import { Hash } from "lucide-react";

export default function MonitorPage() {
  const [filter, setFilter] = useState("ALL");
  const [keywordsOpen, setKeywordsOpen] = useState(false);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title="Keyword Monitor"
        description="Real-time tracking across news, social media, radio & TV"
      />

      <div className="flex-1 overflow-y-auto md:overflow-hidden px-4 md:px-6 pb-6 pt-0 flex flex-col gap-4 min-h-0">
        <AlertBanner />

        <FilterDock activeFilter={filter} onFilterChange={setFilter} />

        {/* Mobile keywords trigger */}
        <div className="md:hidden flex justify-center -mt-2">
          <button
            onClick={() => setKeywordsOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-[12px] font-semibold text-slate-700 shadow-sm hover:border-sky-200 hover:text-sky-600 transition-all duration-150"
          >
            <Hash className="h-3.5 w-3.5 text-sky-500" />
            Manage Keywords
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:flex-1 md:min-h-0">
          {/* Keyword panel — desktop only */}
          <div className="hidden md:block md:col-span-1 md:min-h-0">
            <KeywordManager />
          </div>

          {/* Feed — full width on mobile */}
          <div className="col-span-1 md:col-span-2 md:min-h-0 md:flex md:flex-col h-[65vh] md:h-auto">
            <MentionsFeed filter={filter} />
          </div>
        </div>
      </div>

      {/* Mobile keywords bottom sheet */}
      <KeywordsSheet open={keywordsOpen} onClose={() => setKeywordsOpen(false)} />
    </div>
  );
}
