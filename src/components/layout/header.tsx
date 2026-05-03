"use client";

import { Bell, Menu } from "lucide-react";
import { motion } from "framer-motion";
import { useDrawerStore } from "@/lib/drawer-store";

interface HeaderProps {
  title: string;
  description?: string;
}

export function Header({ title, description }: HeaderProps) {
  const { setOpen } = useDrawerStore();

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex h-16 items-center justify-between border-b border-border/60 bg-white/80 backdrop-blur-sm px-4 md:px-6 shrink-0"
    >
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => setOpen(true)}
          className="md:hidden h-9 w-9 flex items-center justify-center rounded-xl border border-border/60 bg-white hover:bg-muted/60 transition-colors shrink-0"
        >
          <Menu className="h-4 w-4 text-muted-foreground" />
        </button>
        <div className="min-w-0">
          <h1 className="text-base font-bold text-foreground tracking-tight truncate">{title}</h1>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block truncate">{description}</p>
          )}
        </div>
      </div>

      <button className="relative h-9 w-9 flex items-center justify-center rounded-xl border border-border/60 bg-white hover:bg-muted/60 transition-colors shrink-0">
        <Bell className="h-4 w-4 text-muted-foreground" />
      </button>
    </motion.header>
  );
}
