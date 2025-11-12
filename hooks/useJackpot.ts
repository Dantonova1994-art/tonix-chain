import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function useJackpot() {
  const { data, error, isLoading } = useSWR("/api/metrics/jackpot", fetcher, {
    refreshInterval: 10000,
    dedupingInterval: 10000,
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
  });

  return {
    jackpot: data?.balance ?? 0,
    ok: data?.ok ?? false,
    loading: isLoading,
    error,
  };
}

