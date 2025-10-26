import { useMemo } from "react";

export interface VirtualizerOptions {
  count: number;
  estimateSize: () => number;
  overscan?: number;
  getScrollElement?: () => HTMLElement | null;
}

export interface VirtualItem {
  key: number;
  index: number;
  size: number;
  start: number;
  end: number;
}

export const useVirtualizer = (options: VirtualizerOptions) => {
  const size = Math.max(0, options.count);
  const estimatedSize = Math.max(1, Math.floor(options.estimateSize?.() ?? 56));

  const virtualItems = useMemo<VirtualItem[]>(() => {
    return Array.from({ length: size }, (_, index) => {
      const start = index * estimatedSize;
      return {
        key: index,
        index,
        size: estimatedSize,
        start,
        end: start + estimatedSize,
      } satisfies VirtualItem;
    });
  }, [estimatedSize, size]);

  return {
    getVirtualItems: () => virtualItems,
    getTotalSize: () => virtualItems.length * estimatedSize,
    scrollToIndex: (index: number) => {
      const element = options.getScrollElement?.();
      if (!element) {
        return;
      }

      element.scrollTo({ top: index * estimatedSize, behavior: "smooth" });
    },
  };
};
