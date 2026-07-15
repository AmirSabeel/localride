import { useState, useEffect, useRef } from "react";

export interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  importance: number;
}

interface UseNominatimSearchReturn {
  results: NominatimResult[];
  isLoading: boolean;
}

export function useNominatimSearch(
  query: string,
  debounceMs = 350
): UseNominatimSearchReturn {
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length < 3) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      // Cancel any in-flight request
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          q: trimmed,
          format: "json",
          addressdetails: "1",
          limit: "8",
          countrycodes: "in",
        });

        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?${params}`,
          {
            signal: controller.signal,
            headers: { "Accept-Language": "en" },
          }
        );
        const data: NominatimResult[] = await res.json();
        setResults(data);
      } catch (err: unknown) {
        if ((err as { name?: string }).name !== "AbortError") {
          setResults([]);
        }
      } finally {
        setIsLoading(false);
      }
    }, debounceMs);

    return () => {
      clearTimeout(timer);
      abortRef.current?.abort();
    };
  }, [query, debounceMs]);

  return { results, isLoading };
}
