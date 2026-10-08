import { useEffect, useRef } from "react";

/** Keeps a ref pointing at the latest value, so stable callbacks can read current state. */
export function useLatest<T>(value: T) {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  });
  return ref;
}
