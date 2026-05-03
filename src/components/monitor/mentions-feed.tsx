"use client";

import { useEffect, useState, useCallback } from "react";
import { getPusherClient } from "@/lib/pusher-client";
import { formatDistanceToNow } from "date-fns";
import { ArrowUpRight, Wifi, WifiOff, Rss } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { LinkPreview } from "@/components/ui/link-preview";

interface Mention {
  id: string;
  title: string;
  content: string;
  source: string;
  sentiment: string;
  sentimentScore: number | null;
  publishedAt: string;
  url: string | null;
  author: string | null;
  keyword: { term: string };
}

const SOURCE_CONFIG: Record<string, { label: string; bg: string; text: string; border: string }> = {
  NEWS:      { label: "News",      bg: "bg-blue-500/10",   text: "text-blue-700",   border: "border-blue-200" },
  TWITTER:   { label: "Twitter",   bg: "bg-sky-500/10",    text: "text-sky-700",    border: "border-sky-200" },
  FACEBOOK:  { label: "Facebook",  bg: "bg-indigo-500/10", text: "text-indigo-700", border: "border-indigo-200" },
  INSTAGRAM: { label: "Instagram", bg: "bg-rose-500/10",   text: "text-rose-700",   border: "border-rose-200" },
  RADIO:     { label: "Radio",     bg: "bg-orange-500/10", text: "text-orange-700", border: "border-orange-200" },
  TV:        { label: "TV",        bg: "bg-purple-500/10", text: "text-purple-700", border: "border-purple-200" },
};

const SENTIMENT_CONFIG: Record<string, { label: string; bg: string; text: string; border: string; dot: string }> = {
  POSITIVE: { label: "Positive", bg: "bg-emerald-50",  text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" },
  NEGATIVE: { label: "Negative", bg: "bg-red-50",      text: "text-red-700",     border: "border-red-200",     dot: "bg-red-500" },
  NEUTRAL:  { label: "Neutral",  bg: "bg-slate-100",   text: "text-slate-500",   border: "border-slate-200",   dot: "bg-slate-400" },
};

function MentionSkeleton() {
  return (
    <div className="rounded-xl border border-border/40 bg-white p-4 space-y-3 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          <div className="h-5 w-14 rounded-full bg-slate-100" />
          <div className="h-5 w-16 rounded-full bg-slate-100" />
          <div className="h-5 w-12 rounded-full bg-slate-100" />
        </div>
        <div className="h-4 w-20 rounded bg-slate-100" />
      </div>
      <div className="space-y-1.5">
        <div className="h-3.5 w-full rounded bg-slate-100" />
        <div className="h-3.5 w-3/4 rounded bg-slate-100" />
      </div>
      <div className="flex items-center justify-between">
        <div className="h-3 w-24 rounded bg-slate-100" />
        <div className="h-7 w-16 rounded-lg bg-slate-100" />
      </div>
    </div>
  );
}

export function MentionsFeed({ filter }: { filter: string }) {
  const [mentions, setMentions] = useState<Mention[]>([]);
  const [connected, setConnected] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const fetchMentions = useCallback(async () => {
    const params = filter !== "ALL" ? `?source=${filter}` : "";
    const res = await fetch(`/api/mentions${params}`);
    const data = await res.json();
    setMentions(data);
    setInitialLoading(false);
  }, [filter]);

  useEffect(() => { fetchMentions(); }, [fetchMentions]);

  useEffect(() => {
    const client = getPusherClient();
    const channel = client.subscribe("mentions-feed");
    client.connection.bind("connected", () => setConnected(true));
    client.connection.bind("disconnected", () => setConnected(false));

    channel.bind("new-mentions", (data: { keyword: string; mentions: Omit<Mention, "keyword">[] }) => {
      toast.success(`${data.mentions.length} new mention${data.mentions.length > 1 ? "s" : ""} for "${data.keyword}"`, { icon: "📡" });
      const withKeyword = data.mentions.map((m) => ({ ...m, keyword: { term: data.keyword } }));
      setMentions((prev) => {
        const ids = new Set(prev.map((m) => m.id));
        const fresh = withKeyword.filter((m) => !ids.has(m.id));
        return [...fresh, ...prev].slice(0, 100);
      });
    });

    return () => {
      channel.unbind_all();
      client.unsubscribe("mentions-feed");
    };
  }, []);

  const filtered = filter === "ALL" ? mentions : mentions.filter((m) => m.source === filter);

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5 shrink-0">
        <div className="relative h-9 w-9 rounded-xl bg-sky-600 flex items-center justify-center shadow-md shadow-sky-500/25">
          <Rss className="h-4 w-4 text-white" />
          {connected && (
            <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-white" />
          )}
        </div>
        <div>
          <p className="text-sm font-bold text-foreground tracking-tight">Live Mentions Feed</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            {connected ? (
              <>
                <span className="live-dot h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Live</span>
                <span className="text-[10px] text-slate-400">
                  · {filtered.length} result{filtered.length !== 1 ? "s" : ""}
                </span>
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">Connecting…</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Scrollable feed with bottom gradient fade */}
      <div className="relative flex-1 min-h-0">
        <div className="h-full overflow-y-auto pr-0.5 space-y-2.5 pb-10">
          {initialLoading ? (
            <>
              {Array.from({ length: 5 }).map((_, i) => (
                <MentionSkeleton key={i} />
              ))}
            </>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-20 text-center">
              <div className="h-16 w-16 rounded-2xl bg-sky-50 flex items-center justify-center mb-4">
                <Wifi className="h-7 w-7 text-sky-200" />
              </div>
              <p className="text-sm font-semibold text-foreground">No mentions yet</p>
              <p className="text-xs text-muted-foreground mt-1.5 max-w-50 leading-relaxed">
                Add keywords and click{" "}
                <span className="font-semibold text-sky-600">Scrape Now</span>{" "}
                to start monitoring
              </p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {filtered.map((mention, i) => {
                const src = SOURCE_CONFIG[mention.source] ?? SOURCE_CONFIG.NEWS;
                const snt = SENTIMENT_CONFIG[mention.sentiment] ?? SENTIMENT_CONFIG.NEUTRAL;
                let hostname = "";
                try { hostname = mention.url ? new URL(mention.url).hostname.replace("www.", "") : ""; } catch {}

                return (
                  <motion.div
                    key={`${mention.id}-${i}`}
                    initial={{ opacity: 0, y: -8, scale: 0.99 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.22, delay: Math.min(i * 0.025, 0.3), ease: [0.16, 1, 0.3, 1] }}
                    className="group rounded-xl border border-border/50 bg-white hover:border-sky-200 hover:shadow-lg hover:shadow-sky-500/8 transition-all duration-200"
                  >
                    <div className="p-3">
                      {/* Badges row */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide border ${src.bg} ${src.text} ${src.border}`}>
                            {src.label.toUpperCase()}
                          </span>
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold border ${snt.bg} ${snt.text} ${snt.border}`}>
                            <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${snt.dot}`} />
                            {snt.label}
                          </span>
                          {mention.keyword?.term && (
                            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold bg-sky-50 text-sky-700 border border-sky-100">
                              #{mention.keyword.term}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-muted-foreground/60 whitespace-nowrap shrink-0 font-medium tabular-nums">
                          {formatDistanceToNow(new Date(mention.publishedAt), { addSuffix: true })}
                        </span>
                      </div>

                      {/* Headline */}
                      <p className="text-[13px] font-semibold text-foreground leading-snug line-clamp-2 mb-2">
                        {mention.title}
                      </p>

                      {/* Footer: byline + CTA */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-1.5 min-w-0 text-[11px] text-muted-foreground">
                          {mention.author && (
                            <span className="font-medium truncate">{mention.author}</span>
                          )}
                          {hostname && (
                            <span className="text-muted-foreground/50 shrink-0">
                              {mention.author ? "· " : ""}{hostname}
                            </span>
                          )}
                        </div>
                        {mention.url ? (
                          <LinkPreview
                            url={mention.url}
                            width={280}
                            height={160}
                            className="inline-flex items-center gap-1.5 shrink-0 rounded-lg bg-sky-600 hover:bg-sky-700 px-3 py-1.5 text-[11px] font-bold text-white transition-all duration-150 shadow-sm shadow-sky-500/20 hover:shadow-md hover:shadow-sky-500/30 active:scale-95"
                          >
                            Read
                            <ArrowUpRight className="h-3 w-3" />
                          </LinkPreview>
                        ) : (
                          <div />
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>

        {/* Gradient fade — hints at more content below */}
        {filtered.length > 2 && (
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background via-background/80 to-transparent" />
        )}
      </div>
    </div>
  );
}
