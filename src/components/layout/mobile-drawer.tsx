"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Radio, CalendarDays, BarChart3, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDrawerStore } from "@/lib/drawer-store";

const navItems = [
  { label: "Monitor",   href: "/dashboard/monitor",   icon: Radio,        badge: "Live" },
  { label: "Publisher", href: "/dashboard/publisher", icon: CalendarDays              },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3                 },
];

export function MobileDrawer() {
  const { open, setOpen } = useDrawerStore();
  const pathname = usePathname();

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          />

          {/* Drawer panel */}
          <motion.aside
            key="drawer"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 220 }}
            className="fixed left-0 top-0 h-full w-72 bg-[#0f1729] z-50 flex flex-col shadow-2xl md:hidden"
          >
            {/* Logo + close */}
            <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-sky-500 to-sky-700 shadow-lg shadow-sky-500/30">
                  <Search className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold leading-none tracking-wide text-white">MediaWatch</p>
                  <p className="text-[10px] text-sky-400 font-medium mt-0.5 tracking-widest uppercase">Pro</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="h-8 w-8 flex items-center justify-center rounded-lg bg-white/10 text-white/60 hover:text-white hover:bg-white/20 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 space-y-1">
              <p className="px-3 text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-3">Modules</p>
              {navItems.map((item, idx) => {
                const Icon = item.icon;
                const active = pathname.startsWith(item.href);
                return (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.06 + 0.1, duration: 0.25 }}
                  >
                    <Link href={item.href} onClick={() => setOpen(false)}>
                      <motion.div
                        whileTap={{ scale: 0.97 }}
                        className={cn(
                          "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 cursor-pointer",
                          active
                            ? "bg-gradient-to-r from-sky-600/90 to-sky-500/70 text-white shadow-lg shadow-sky-500/20"
                            : "text-white/50 hover:text-white/90 hover:bg-white/5"
                        )}
                      >
                        <Icon className={cn("h-5 w-5 shrink-0", active ? "text-sky-200" : "")} />
                        <span className="flex-1">{item.label}</span>
                        {item.badge && (
                          <span className="flex items-center gap-1.5">
                            <span className="live-dot h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">
                              {item.badge}
                            </span>
                          </span>
                        )}
                      </motion.div>
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            {/* User */}
            <div className="border-t border-white/10 p-3">
              <div className="flex items-center gap-3 rounded-xl px-3 py-2.5">
                <div className="h-10 w-10 rounded-full overflow-hidden shrink-0 ring-2 ring-white/10">
                  <Image src="/avatar3.png" alt="User avatar" width={40} height={40} className="h-full w-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white/90 leading-none truncate">Demo User</p>
                  <p className="text-[10px] text-white/40 mt-0.5 truncate">demo@mediawatch.pro</p>
                </div>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
