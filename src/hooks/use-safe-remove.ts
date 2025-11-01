import { MutableRefObject, useEffect } from "react";

/**
 * Ensures that dynamically appended DOM nodes are removed safely when the owner component unmounts.
 * Prevents removeChild errors by checking the node's parent before attempting to remove it.
 */
export function useSafeRemove<T extends Node>(nodeRef: MutableRefObject<T | null>) {
  useEffect(() => {
    return () => {
      const node = nodeRef.current;
      if (node && node.parentNode) {
        try {
          node.parentNode.removeChild(node);
        } catch (error) {
          console.warn("Safe removal failed", error);
        }
      }
      nodeRef.current = null;
    };
  }, [nodeRef]);
}

export function safeRemoveNode<T extends Node | null | undefined>(node: T) {
  if (!node) {
    return;
  }
  const parent = node.parentNode;
  if (parent) {
    try {
      parent.removeChild(node);
    } catch (error) {
      console.warn("Safe removal failed", error);
    }
  }
}
