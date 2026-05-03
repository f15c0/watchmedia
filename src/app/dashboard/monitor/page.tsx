"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { KeywordManager } from "@/components/monitor/keyword-manager";
import { MentionsFeed } from "@/components/monitor/mentions-feed";
import { AlertBanner } from "@/components/monitor/alert-banner";
import { FilterDock } from "@/components/monitor/filter-dock";
import { KeywordsSheet } from "@/components/monitor/keywords-sheet";
import { Hash, ChevronUp } from "lucide-react";

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
        <div className="md:hidden flex justify-center -mt-1">
          <button
            onClick={() => setKeywordsOpen(true)}
            className="inline-flex items-center gap-2.5 rounded-2xl bg-[#0f1729] px-5 py-2.5 shadow-lg shadow-slate-900/20 active:scale-95 transition-transform duration-100"
          >
            <div className="h-7 w-7 rounded-lg bg-white/15 border border-white/20 flex items-center justify-center shrink-0">
              <Hash className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-[13px] font-semibold text-white">Manage Keywords</span>
            <ChevronUp className="h-3.5 w-3.5 text-white/50 shrink-0" />
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
