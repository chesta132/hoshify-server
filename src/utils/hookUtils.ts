export function createMergeState<S, Z extends Partial<S> = S>(
  setState: React.Dispatch<React.SetStateAction<S>>
): React.Dispatch<React.SetStateAction<Z>> {
  return (updater) => {
    setState((prev) => {
      const next = typeof updater === "function" ? (updater as (prev: Z) => Z)(prev as any) : updater;

      if (Array.isArray(prev) && Array.isArray(next)) {
        return [...prev, ...next] as S;
      }

      if (prev && next && typeof prev === "object" && typeof next === "object") {
        return { ...prev, ...next } as S;
      }

      return next as any;
    });
  };
}
