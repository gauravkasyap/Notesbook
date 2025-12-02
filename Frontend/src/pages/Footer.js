import { useCallback, useState } from "react";

export function useNavDetailsToggle(initial = false) {
  const [expanded, setExpanded] = useState(initial);

  const toggleExpanded = useCallback(() => {
    setExpanded((v) => !v);
  }, []);

  return { expanded, toggleExpanded };
}