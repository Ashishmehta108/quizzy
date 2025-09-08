"use client";

import { motion, AnimatePresence } from "framer-motion";

export default function StatusUpdates({ text }: { text: string }) {
  return (
    <div className="h-6">
      <AnimatePresence mode="wait">
        <motion.span
          key={text} 
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.4 }}
          className="inline-block"
        >
          {text}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
