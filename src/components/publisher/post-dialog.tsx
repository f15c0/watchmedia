"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Post {
  id: string;
  content: string;
  platform: string[];
  scheduledAt: string;
  status: string;
  aiGenerated: boolean;
}

interface PostDialogProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  defaultDate: Date;
  post?: Post | null;
}

const PLATFORMS = ["TWITTER", "FACEBOOK", "INSTAGRAM", "LINKEDIN"];

export function PostDialog({ open, onClose, onSaved, defaultDate, post }: PostDialogProps) {
  const [content, setContent] = useState(post?.content ?? "");
  const [platforms, setPlatforms] = useState<string[]>(post?.platform ?? ["TWITTER"]);
  const [scheduledAt, setScheduledAt] = useState(
    post ? format(new Date(post.scheduledAt), "yyyy-MM-dd'T'HH:mm") : format(defaultDate, "yyyy-MM-dd'T'09:00")
  );
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function togglePlatform(p: string) {
    setPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  }

  async function handleSave() {
    if (!content.trim() || platforms.length === 0) {
      toast.error("Add content and select at least one platform");
      return;
    }
    setSaving(true);
    try {
      if (post) {
        await fetch("/api/posts", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: post.id, content, platform: platforms, scheduledAt }),
        });
        toast.success("Post updated");
      } else {
        await fetch("/api/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content, platform: platforms, scheduledAt }),
        });
        toast.success("Post scheduled");
      }
      onSaved();
      onClose();
    } catch {
      toast.error("Failed to save post");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!post) return;
    setDeleting(true);
    await fetch("/api/posts", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: post.id }),
    });
    toast.success("Post deleted");
    onSaved();
    onClose();
    setDeleting(false);
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{post ? "Edit Post" : "Schedule New Post"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Platforms</Label>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map((p) => (
                <button
                  key={p}
                  onClick={() => togglePlatform(p)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                    platforms.includes(p)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What do you want to post?"
              className="resize-none h-28"
            />
            <p className="text-xs text-muted-foreground text-right">{content.length} chars</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="scheduled">Scheduled Date & Time</Label>
            <Input
              id="scheduled"
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between">
          {post ? (
            <Button variant="ghost" size="sm" onClick={handleDelete} disabled={deleting} className="text-destructive hover:text-destructive">
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            </Button>
          ) : (
            <div />
          )}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
              {post ? "Update" : "Schedule"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
