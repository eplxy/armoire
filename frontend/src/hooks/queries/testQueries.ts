import { useQuery } from "@tanstack/react-query";
import { api } from "./api";

type PingResponse = {
  message: string;
};

export function useTestQuery() {
  return useQuery({
    queryKey: ["test"],
    queryFn: () => api.get(`/ping`).json<PingResponse>(),
  });
}
