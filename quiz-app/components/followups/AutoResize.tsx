"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface AutoResizeTextareaProps
  extends React.ComponentPropsWithoutRef<typeof motion.textarea> {}

export const AutoResizeTextarea = React.forwardRef<
  HTMLTextAreaElement,
  AutoResizeTextareaProps
>(({ className, onChange, ...props }, ref) => {
  const innerRef = React.useRef<HTMLTextAreaElement | null>(null);
  const [height, setHeight] = React.useState("2.25rem"); // min-h (36px = h-9)
  const [isExpanded, setIsExpanded] = React.useState(false);

  React.useImperativeHandle(ref, () => innerRef.current!);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const el = e.target;
    el.style.height = "auto";
    const newHeight = `${el.scrollHeight}px`;
    setHeight(newHeight);
    setIsExpanded(el.scrollHeight > 36);
    onChange?.(e);
  };

  React.useEffect(() => {
    if (innerRef.current) {
      innerRef.current.style.height = "auto";
      const newHeight = `${innerRef.current.scrollHeight}px`;
      setHeight(newHeight);
      setIsExpanded(innerRef.current.scrollHeight > 36);
    }
  }, [props.value]);

  return (
    <motion.textarea
      ref={innerRef}
      rows={1}
      style={{ height }}
      animate={{ height }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className={cn(
        "flex-1 max-h-40 min-h-[3.5rem] text-sm dark:bg-zinc-800 px-4 py-2 resize-none focus-visible:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-all ease-in-out rounded-xl",
        className
      )}
      onChange={handleInput}
      {...props}
    />
  );
});

AutoResizeTextarea.displayName = "AutoResizeTextarea";
