import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { motion, AnimatePresence } from "framer-motion";

const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;
const PopoverAnchor = PopoverPrimitive.Anchor;

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> & {
    matchTriggerWidth?: boolean;
  }
>(({ className, align = "start", sideOffset = 6, matchTriggerWidth = false, ...props }, ref) => {
  const [triggerWidth, setTriggerWidth] = React.useState<number | undefined>();

  React.useEffect(() => {
    if (matchTriggerWidth) {
      const trigger = document.querySelector('[data-state="open"][data-radix-popover-trigger]') as HTMLElement;
      if (trigger) {
        const rect = trigger.getBoundingClientRect();
        setTriggerWidth(rect.width);
      }
    }
  }, [matchTriggerWidth]);

  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        side="bottom"
        collisionPadding={8}
        avoidCollisions
        className={`
          z-50 overflow-hidden rounded-2xl border border-[color:var(--border)]
          bg-surface p-4 shadow-xl backdrop-blur-xl dropdown-scrollbar
          max-h-60 overflow-auto
          data-[state=open]:animate-in data-[state=closed]:animate-out
          data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
          data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95
          data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2
          data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2
          ${className}
        `}
        style={{
          width: matchTriggerWidth && triggerWidth ? `${triggerWidth}px` : undefined,
          minWidth: matchTriggerWidth ? '12rem' : undefined,
        }}
        {...props}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.12, ease: "easeOut" }}
        >
          {props.children}
        </motion.div>
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  );
});
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };