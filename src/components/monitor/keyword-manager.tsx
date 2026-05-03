"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X, RefreshCw, Loader2, Hash, Zap } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Keyword {
  id: string;
  term: string;
  active: boolean;
  _count: { mentions: number };
}

export function KeywordManager() {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [deletePopover, setDeletePopover] = useState<string | null>(null);

  async function fetchKeywords() {
    const res = await fetch("/api/keywords");
    const data = await res.json();
    setKeywords(data);
  }

  useEffect(() => { fetchKeywords(); }, []);

  async function addKeyword(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ term: input.trim() }),
      });
      if (!res.ok) throw new Error();
      setInput("");
      await fetchKeywords();
      toast.success("Keyword added");
    } catch {
      toast.error("Failed to add keyword");
    } finally {
      setLoading(false);
    }
  }

  async function removeKeyword(id: string) {
    await fetch("/api/keywords", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await fetchKeywords();
    setDeletePopover(null);
    toast.success("Keyword removed");
  }

  async function triggerScrape() {
    setScraping(true);
    try {
      const res = await fetch("/api/mentions/scrape", { method: "POST" });
      const data = await res.json();
      toast.success(`Fetched ${data.scraped} new mentions`);
      await fetchKeywords();
    } catch {
      toast.error("Scrape failed");
    } finally {
      setScraping(false);
    }
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl overflow-hidden">
      {/* Header — card.png pattern with gradient overlay */}
      <div
        className="relative px-5 py-5 border-b border-white/5 overflow-hidden"
        style={{ backgroundImage: "url('/card.png')", backgroundSize: "280px" }}
      >
        {/* Gradient overlay — left to right */}
        <div className="absolute inset-0 bg-linear-to-b from-[#1e2d4a] to-[#0f1729] opacity-97" />

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
              <Hash className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-none">Keywords</p>
              <p className="text-[10px] text-sky-300/80 mt-0.5">{keywords.length} tracked</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={triggerScrape}
            disabled={scraping || keywords.length === 0}
            className="flex items-center gap-1.5 rounded-lg bg-white/15 hover:bg-white/25 border border-white/20 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 backdrop-blur-sm shadow-sm"
          >
            {scraping
              ? <Loader2 className="h-3 w-3 animate-spin" />
              : <Zap className="h-3 w-3" />}
            {scraping ? "Scraping…" : "Scrape Now"}
          </motion.button>
        </div>
      </div>

      {/* Add form */}
      <div className="px-4 py-3 border-b border-border/40">
        <form onSubmit={addKeyword} className="flex gap-2">
          <Input
            placeholder="Add keyword…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="h-11 text-sm bg-white border border-slate-200 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-slate-300 placeholder:text-slate-400 rounded-lg py-3 px-4"
          />
          <motion.button
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loading}
            className="h-11 w-11 flex items-center justify-center rounded-full bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-50 transition-colors shrink-0 shadow-sm"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          </motion.button>
        </form>
      </div>

      {/* Keyword list */}
      <div className="flex-1 overflow-auto p-4 space-y-2">
        <AnimatePresence initial={false}>
          {keywords.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <Hash className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No keywords yet</p>
              <p className="text-xs text-muted-foreground/70 mt-0.5">Add one above to start monitoring</p>
            </motion.div>
          )}
          {keywords.map((kw, i) => (
            <motion.div
              key={kw.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.03, duration: 0.2 }}
              className="group relative flex items-center justify-between rounded-md bg-white border border-slate-200/60 px-3.5 py-3 hover:border-slate-300 hover:shadow-sm hover:-translate-y-px transition-all duration-150"
            >
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <div className="h-1.5 w-1.5 rounded-full bg-sky-500 shrink-0" />
                <span className="text-[13px] font-medium capitalize text-slate-700 truncate">
                  {kw.term}
                </span>
              </div>
              
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] font-semibold text-sky-600 bg-sky-50 rounded-md px-2 py-1 tabular-nums">
                  {kw._count.mentions}
                </span>
                <Popover open={deletePopover === kw.id} onOpenChange={(open) => setDeletePopover(open ? kw.id : null)}>
                  <PopoverTrigger
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletePopover(kw.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 h-5 w-5 flex items-center justify-center rounded text-slate-400 hover:text-red-600 transition-all duration-150 cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-3" align="end">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">Remove keyword?</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          This will stop monitoring "<span className="font-medium">{kw.term}</span>"
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletePopover(null);
                          }}
                          className="flex-1 h-8 text-xs"
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeKeyword(kw.id);
                          }}
                          className="flex-1 h-8 text-xs bg-red-600 hover:bg-red-700"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="px-4 py-3 border-t border-border/40">
        <p className="text-[10px] text-muted-foreground text-center">Auto-scrapes every 5 min in production</p>
      </div>
    </div>
  );
}
