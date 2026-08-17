import { useCallback, useMemo, useState } from 'react';

export interface ExpandableListOptions {
  collapsedItemCount?: number;
  maxItemsWithoutExpand?: number;
}

export interface ExpandableList<T> {
  expandable: boolean;
  expanded: boolean;
  forceExpandable: () => void;
  toggleExpanded: () => void;
  visibleItems: T[];
}

export const useExpandableList = <T>(
  items: T[],
  {
    collapsedItemCount = 2,
    maxItemsWithoutExpand = 2,
  }: ExpandableListOptions = {},
): ExpandableList<T> => {
  const [expanded, setExpanded] = useState(false);
  const [forcedExpandable, setForcedExpandable] = useState(false);

  const expandable = forcedExpandable || items.length > maxItemsWithoutExpand;

  const visibleItems = useMemo(() => {
    if (expanded) {
      return items;
    }
    return items.slice(
      0,
      items.length <= maxItemsWithoutExpand ? items.length : collapsedItemCount,
    );
  }, [collapsedItemCount, expanded, items, maxItemsWithoutExpand]);

  const forceExpandable = useCallback(() => {
    setForcedExpandable(true);
  }, []);

  const toggleExpanded = useCallback(() => {
    setExpanded((previousValue) => !previousValue);
  }, []);

  return {
    expandable,
    expanded,
    forceExpandable,
    toggleExpanded,
    visibleItems,
  };
};
