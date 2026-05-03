"use client";

import { motion, AnimatePresence } from "framer-motion";
import { KeywordManager } from "./keyword-manager";

interface KeywordsSheetProps {
  open: boolean;
  onClose: () => void;
}

export function KeywordsSheet({ open, onClose }: KeywordsSheetProps) {
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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            onClick={onClose}
          />

          {/* Bottom sheet */}
          <motion.div
            key="sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 240 }}
            className="fixed bottom-0 left-0 right-0 z-50 flex flex-col bg-white rounded-t-3xl shadow-2xl md:hidden overflow-hidden"
            style={{ maxHeight: "82vh" }}
          >
            {/* Drag handle only — no extra header */}
            <div className="flex justify-center pt-2.5 pb-1 shrink-0">
              <div className="h-1 w-10 rounded-full bg-white/40" />
            </div>

            {/* KeywordManager owns its header + close button */}
            <div className="flex-1 overflow-hidden min-h-0">
              <KeywordManager onClose={onClose} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
