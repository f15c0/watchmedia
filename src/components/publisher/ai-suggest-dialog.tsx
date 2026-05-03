"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Suggestion {
  date: string;
  content: string;
  platform: string;
}

interface AiSuggestDialogProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  month: string;
}

export function AiSuggestDialog({ open, onClose, onSaved, month }: AiSuggestDialogProps) {
  const [platform, setPlatform] = useState("TWITTER");
  const [topic, setTopic] = useState("");
  const [generating, setGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);

  async function handleGenerate() {
    setGenerating(true);
    setSuggestions([]);
    setSelected(new Set());
    try {
      const res = await fetch("/api/posts/ai-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month, platform, topic }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        toast.error(data.error ?? "AI generation failed");
        return;
      }
      if (data.message) {
        toast.info(data.message);
        return;
      }
      const list: Suggestion[] = data.suggestions ?? [];
      setSuggestions(list);
      setSelected(new Set(list.map((_: Suggestion, i: number) => i)));
    } catch {
      toast.error("AI generation failed");
    } finally {
      setGenerating(false);
    }
  }

  async function handleSave() {
    const toSave = suggestions.filter((_, i) => selected.has(i));
    if (toSave.length === 0) return;
    setSaving(true);
    try {
      await Promise.all(
        toSave.map((s) =>
          fetch("/api/posts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              content: s.content,
              platform: [s.platform],
              scheduledAt: `${s.date}T09:00`,
              aiGenerated: true,
            }),
          })
        )
      );
      toast.success(`${toSave.length} AI post${toSave.length > 1 ? "s" : ""} scheduled`);
      onSaved();
      onClose();
    } catch {
      toast.error("Failed to save posts");
    } finally {
      setSaving(false);
    }
  }

  function toggleSelect(i: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet-500" />
            AI Gap Filling
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Platform</Label>
              <Select value={platform} onValueChange={(v) => v && setPlatform(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TWITTER">Twitter</SelectItem>
                  <SelectItem value="FACEBOOK">Facebook</SelectItem>
                  <SelectItem value="INSTAGRAM">Instagram</SelectItem>
                  <SelectItem value="LINKEDIN">LinkedIn</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Topic (optional)</Label>
              <Input
                placeholder="e.g. media monitoring"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>
          </div>

          <Button onClick={handleGenerate} disabled={generating} className="w-full" variant="outline">
            {generating ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating…</>
            ) : (
              <><Sparkles className="h-4 w-4 mr-2 text-violet-500" /> Generate Suggestions</>
            )}
          </Button>

          {suggestions.length > 0 && (
            <ScrollArea className="h-64 rounded-md border">
              <div className="p-3 space-y-2">
                {suggestions.map((s, i) => (
                  <div
                    key={i}
                    onClick={() => toggleSelect(i)}
                    className={cn(
                      "rounded-lg border p-3 cursor-pointer transition-colors",
                      selected.has(i) ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs h-5">{s.date}</Badge>
                          <Badge variant="secondary" className="text-xs h-5">{s.platform}</Badge>
                        </div>
                        <p className="text-sm text-foreground/90">{s.content}</p>
                      </div>
                      {selected.has(i) && (
                        <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          {suggestions.length > 0 && (
            <Button size="sm" onClick={handleSave} disabled={saving || selected.size === 0}>
              {saving && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
              Schedule {selected.size} Post{selected.size !== 1 ? "s" : ""}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
