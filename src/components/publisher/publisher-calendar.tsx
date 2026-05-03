"use client";

import { useState, useEffect, useCallback } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek, addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight, Sparkles, Plus, Loader2 } from "lucide-react";
import { PostDialog } from "./post-dialog";
import { AiSuggestDialog } from "./ai-suggest-dialog";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface Post {
  id: string;
  content: string;
  platform: string[];
  scheduledAt: string;
  status: string;
  aiGenerated: boolean;
}

const PLATFORM_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  TWITTER:   { color: "bg-sky-500",    bg: "bg-sky-50",    label: "TW" },
  FACEBOOK:  { color: "bg-indigo-500", bg: "bg-indigo-50", label: "FB" },
  INSTAGRAM: { color: "bg-pink-500",   bg: "bg-pink-50",   label: "IG" },
  LINKEDIN:  { color: "bg-blue-700",   bg: "bg-blue-50",   label: "LI" },
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function PublisherCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [showPostDialog, setShowPostDialog] = useState(false);
  const [showAiDialog, setShowAiDialog] = useState(false);
  const [editPost, setEditPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(false);

  const monthKey = format(currentMonth, "yyyy-MM");

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/posts?month=${monthKey}`);
    const data = await res.json();
    setPosts(data);
    setLoading(false);
  }, [monthKey]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 }),
  });

  const getPostsForDay = (day: Date) =>
    posts.filter((p) => isSameDay(new Date(p.scheduledAt), day));

  function openNewPost(day: Date) {
    setSelectedDay(day);
    setEditPost(null);
    setShowPostDialog(true);
  }

  function openEditPost(post: Post) {
    setEditPost(post);
    setShowPostDialog(true);
  }

  const totalScheduled = posts.length;
  const aiGenerated = posts.filter((p) => p.aiGenerated).length;

  return (
    <div className="flex flex-col gap-5">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="h-8 w-8 flex items-center justify-center rounded-lg border border-border/60 bg-white hover:bg-muted/60 transition-colors shadow-sm"
          >
            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          </button>
          <h2 className="text-base font-bold text-foreground w-36 text-center tracking-tight">
            {format(currentMonth, "MMMM yyyy")}
          </h2>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="h-8 w-8 flex items-center justify-center rounded-lg border border-border/60 bg-white hover:bg-muted/60 transition-colors shadow-sm"
          >
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>

          {/* Stats pills */}
          {totalScheduled > 0 && (
            <div className="flex items-center gap-2 ml-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                {totalScheduled} scheduled
              </span>
              {aiGenerated > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 border border-violet-100 px-2.5 py-1 text-[11px] font-semibold text-violet-600">
                  <Sparkles className="h-3 w-3" /> {aiGenerated} AI
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowAiDialog(true)}
            className="flex items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 hover:bg-violet-100 px-3 py-1.5 text-xs font-semibold text-violet-700 transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5" />
            AI Fill Gaps
          </button>
          <button
            onClick={() => { setSelectedDay(new Date()); setEditPost(null); setShowPostDialog(true); }}
            className="flex items-center gap-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 px-3 py-1.5 text-xs font-semibold text-white transition-colors shadow-sm shadow-sky-500/20"
          >
            <Plus className="h-3.5 w-3.5" />
            New Post
          </button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="rounded-2xl border border-border/60 bg-white shadow-sm overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-border/60 bg-slate-50/80">
          {DAYS.map((d, i) => (
            <div
              key={d}
              className={cn(
                "py-2.5 text-center text-[11px] font-semibold text-slate-400 tracking-widest uppercase",
                i === 5 || i === 6 ? "text-slate-300" : ""
              )}
            >
              {d}
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground/40" />
          </div>
        ) : (
          <div className="grid grid-cols-7">
            {days.map((day, i) => {
              const dayPosts = getPostsForDay(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isToday = isSameDay(day, new Date());
              const isWeekend = i % 7 === 5 || i % 7 === 6;
              const isLastCol = i % 7 === 6;

              return (
                <div
                  key={day.toISOString()}
                  onClick={() => isCurrentMonth && openNewPost(day)}
                  className={cn(
                    "group relative min-h-28 border-b border-r border-border/40 p-2 transition-colors duration-150",
                    isLastCol && "border-r-0",
                    !isCurrentMonth && "bg-slate-50/50",
                    isCurrentMonth && "hover:bg-sky-50/30 cursor-pointer",
                    isWeekend && isCurrentMonth && "bg-slate-50/40",
                  )}
                >
                  {/* Day number */}
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={cn(
                      "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                      isToday
                        ? "bg-sky-600 text-white shadow-sm shadow-sky-500/30"
                        : isCurrentMonth
                          ? "text-slate-700"
                          : "text-slate-300"
                    )}>
                      {format(day, "d")}
                    </span>

                    {/* Hover add button */}
                    {isCurrentMonth && (
                      <span className="opacity-0 group-hover:opacity-100 h-5 w-5 flex items-center justify-center rounded-md bg-sky-100 text-sky-600 transition-opacity duration-150">
                        <Plus className="h-3 w-3" />
                      </span>
                    )}
                  </div>

                  {/* Posts */}
                  <div className="space-y-1">
                    {dayPosts.slice(0, 3).map((post) => {
                      const platform = post.platform[0] ?? "TWITTER";
                      const cfg = PLATFORM_CONFIG[platform] ?? PLATFORM_CONFIG.TWITTER;
                      return (
                        <motion.div
                          key={post.id}
                          layout
                          onClick={(e) => { e.stopPropagation(); openEditPost(post); }}
                          className={cn(
                            "group/post relative flex items-start gap-1.5 rounded-md px-1.5 py-1 cursor-pointer transition-all duration-150",
                            "hover:shadow-sm",
                            post.aiGenerated
                              ? "bg-violet-50 hover:bg-violet-100 border border-violet-100"
                              : `${cfg.bg} hover:brightness-95 border border-transparent hover:border-slate-200`
                          )}
                        >
                          <span className={cn("mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full", cfg.color)} />
                          <span className="text-[10px] leading-snug line-clamp-2 text-slate-600 font-medium">
                            {post.aiGenerated && <span className="text-violet-500 mr-0.5">✦</span>}
                            {post.content}
                          </span>
                        </motion.div>
                      );
                    })}
                    {dayPosts.length > 3 && (
                      <p className="text-[10px] font-medium text-muted-foreground pl-1">
                        +{dayPosts.length - 3} more
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-1">
        {Object.entries(PLATFORM_CONFIG).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-1.5">
            <span className={cn("h-2 w-2 rounded-full", cfg.color)} />
            <span className="text-[11px] text-muted-foreground font-medium">{key.charAt(0) + key.slice(1).toLowerCase()}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <span className="text-violet-500 text-[11px]">✦</span>
          <span className="text-[11px] text-muted-foreground font-medium">AI generated</span>
        </div>
      </div>

      {showPostDialog && (
        <PostDialog
          key={editPost?.id ?? "new"}
          open={showPostDialog}
          onClose={() => setShowPostDialog(false)}
          onSaved={fetchPosts}
          defaultDate={selectedDay ?? new Date()}
          post={editPost}
        />
      )}

      {showAiDialog && (
        <AiSuggestDialog
          open={showAiDialog}
          onClose={() => setShowAiDialog(false)}
          onSaved={fetchPosts}
          month={monthKey}
        />
      )}
    </div>
  );
}
