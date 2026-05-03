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
        <button
          onClick={() => setKeywordsOpen(true)}
          className="md:hidden w-full flex items-center gap-3 rounded-2xl px-4 py-3 shadow-md active:scale-[0.98] transition-transform duration-100 overflow-hidden relative"
          style={{ background: "linear-gradient(135deg, #1e2d4a 0%, #0f1729 100%)" }}
        >
          <div className="h-9 w-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0">
            <Hash className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-[13px] font-bold text-white leading-none">Manage Keywords</p>
            <p className="text-[10px] text-sky-300/80 mt-0.5">Add, remove &amp; scrape</p>
          </div>
          <ChevronUp className="h-4 w-4 text-white/40 shrink-0" />
        </button>

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
