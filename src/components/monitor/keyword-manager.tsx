"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X, Loader2, Hash, Zap, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
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

export function KeywordManager({ onClose }: { onClose?: () => void } = {}) {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [deletePopover, setDeletePopover] = useState<string | null>(null);
  const [animating, setAnimating] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const newDataRef = useRef<{ x: number; y: number; r: number; color: string }[]>([]);

  async function fetchKeywords() {
    const res = await fetch("/api/keywords");
    const data = await res.json();
    setKeywords(data);
  }

  useEffect(() => { fetchKeywords(); }, []);

  const draw = useCallback(() => {
    if (!inputRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 800;
    ctx.clearRect(0, 0, 800, 800);

    const computedStyles = getComputedStyle(inputRef.current);
    const fontSize = parseFloat(computedStyles.getPropertyValue("font-size"));
    ctx.font = `${fontSize * 2}px ${computedStyles.fontFamily}`;
    ctx.fillStyle = "#FFF";
    ctx.fillText(input, 16, 40);

    const imageData = ctx.getImageData(0, 0, 800, 800);
    const pixelData = imageData.data;
    const newData: { x: number; y: number; color: number[] }[] = [];

    for (let t = 0; t < 800; t++) {
      const i = 4 * t * 800;
      for (let n = 0; n < 800; n++) {
        const e = i + 4 * n;
        if (pixelData[e] !== 0 && pixelData[e + 1] !== 0 && pixelData[e + 2] !== 0) {
          newData.push({ x: n, y: t, color: [pixelData[e], pixelData[e + 1], pixelData[e + 2], pixelData[e + 3]] });
        }
      }
    }

    newDataRef.current = newData.map(({ x, y, color }) => ({
      x, y, r: 1,
      color: `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3]})`,
    }));
  }, [input]);

  useEffect(() => { draw(); }, [input, draw]);

  const vanishAnimate = (start: number) => {
    const animateFrame = (pos: number = 0) => {
      requestAnimationFrame(() => {
        const newArr: typeof newDataRef.current = [];
        for (let i = 0; i < newDataRef.current.length; i++) {
          const current = newDataRef.current[i];
          if (current.x < pos) {
            newArr.push(current);
          } else {
            if (current.r <= 0) { current.r = 0; continue; }
            current.x += Math.random() > 0.5 ? 1 : -1;
            current.y += Math.random() > 0.5 ? 1 : -1;
            current.r -= 0.05 * Math.random();
            newArr.push(current);
          }
        }
        newDataRef.current = newArr;
        const ctx = canvasRef.current?.getContext("2d");
        if (ctx) {
          ctx.clearRect(pos, 0, 800, 800);
          newDataRef.current.forEach(({ x: n, y: i, r: s, color }) => {
            if (n > pos) {
              ctx.beginPath();
              ctx.rect(n, i, s, s);
              ctx.fillStyle = color;
              ctx.strokeStyle = color;
              ctx.stroke();
            }
          });
        }
        if (newDataRef.current.length > 0) {
          animateFrame(pos - 8);
        } else {
          setAnimating(false);
        }
      });
    };
    animateFrame(start);
  };

  const isValid = input.trim().length >= 3;

  async function addKeyword(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || animating) return;

    // Trigger vanish animation
    setAnimating(true);
    draw();
    const maxX = newDataRef.current.reduce((prev, cur) => (cur.x > prev ? cur.x : prev), 0);
    vanishAnimate(maxX);

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
      {/* Header */}
      <div
        className="relative px-5 py-5 border-b border-white/5 overflow-hidden"
        style={{ backgroundImage: "url('/card.png')", backgroundSize: "280px" }}
      >
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
          <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={triggerScrape}
            disabled={scraping || keywords.length === 0}
            className="flex items-center gap-1.5 rounded-lg bg-white/15 hover:bg-white/25 border border-white/20 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 backdrop-blur-sm shadow-sm"
          >
            {scraping ? <Loader2 className="h-3 w-3 animate-spin" /> : <Zap className="h-3 w-3" />}
            {scraping ? "Scraping…" : "Scrape Now"}
          </motion.button>
          {onClose && (
            <button
              onClick={onClose}
              className="h-7 w-7 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/25 text-white/60 hover:text-white transition-colors"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          )}
          </div>
        </div>
      </div>

      {/* Add form */}
      <div className="px-4 py-3 border-b border-border/40">
        <form onSubmit={addKeyword} className="flex gap-2">
          <div className="relative flex-1">
            <canvas
              ref={canvasRef}
              className={cn(
                "absolute pointer-events-none text-base transform scale-50 top-[20%] left-2 origin-top-left filter invert pr-20 transition-opacity",
                animating ? "opacity-100" : "opacity-0"
              )}
            />
            <Input
              ref={inputRef}
              placeholder="Add keyword…"
              value={input}
              onChange={(e) => { if (!animating) setInput(e.target.value); }}
              className={cn(
                "h-11 text-sm bg-white border border-slate-200 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-slate-300 placeholder:text-slate-400 rounded-lg py-3 px-4",
                animating && "text-transparent caret-transparent"
              )}
            />
          </div>
          <motion.button
            whileTap={isValid && !loading && !animating ? { scale: 0.95 } : {}}
            type="submit"
            disabled={!isValid || loading || animating}
            className="h-11 w-11 flex items-center justify-center rounded-full bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-30 disabled:cursor-not-allowed disabled:scale-100 transition-all duration-200 shrink-0 shadow-sm"
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
                    onClick={(e) => { e.stopPropagation(); setDeletePopover(kw.id); }}
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
                          onClick={(e) => { e.stopPropagation(); setDeletePopover(null); }}
                          className="flex-1 h-8 text-xs"
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); removeKeyword(kw.id); }}
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
        <p className="text-[10px] text-muted-foreground text-center">Auto-scrapes every 5 min</p>
      </div>
    </div>
  );
}
