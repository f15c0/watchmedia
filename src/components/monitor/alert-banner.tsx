"use client";

import { useEffect, useState } from "react";
import { getPusherClient } from "@/lib/pusher-client";
import { Bell, X, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Alert {
  id: string;
  keyword: string;
  count: number;
  source: string;
  title: string;
}

export function AlertBanner() {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    const client = getPusherClient();
    const channel = client.subscribe("mentions-feed");
    channel.bind("new-mentions", (data: { keyword: string; mentions: { title: string; source: string }[] }) => {
      const alert: Alert = {
        id: Math.random().toString(36).slice(2),
        keyword: data.keyword,
        count: data.mentions.length,
        source: data.mentions[0]?.source ?? "NEWS",
        title: data.mentions[0]?.title ?? "",
      };
      setAlerts((prev) => [alert, ...prev].slice(0, 2));
      setTimeout(() => setAlerts((prev) => prev.filter((a) => a.id !== alert.id)), 7000);
    });
    return () => { channel.unbind_all(); };
  }, []);

  return (
    <div className="space-y-2">
      <AnimatePresence>
        {alerts.map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, y: -16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className="flex items-start gap-3 rounded-xl border border-amber-200/80 bg-linear-to-r from-amber-50 to-orange-50 px-4 py-3 shadow-sm shadow-amber-100"
          >
            <div className="h-7 w-7 rounded-lg bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
              <Zap className="h-3.5 w-3.5 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-amber-900">
                {alert.count} new mention{alert.count > 1 ? "s" : ""} detected
              </p>
              <p className="text-xs text-amber-700/80 mt-0.5 truncate">
                <span className="font-medium capitalize">#{alert.keyword}</span> · {alert.title}
              </p>
            </div>
            <button
              onClick={() => setAlerts((prev) => prev.filter((a) => a.id !== alert.id))}
              className="h-6 w-6 flex items-center justify-center rounded-lg text-amber-500 hover:text-amber-700 hover:bg-amber-100 transition-colors shrink-0"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
