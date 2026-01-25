import { useMutation, useQuery } from "@tanstack/react-query";
import type { ClothingItem } from "../../models/models";
import { api } from "./api";

export type SearchClothingParams = {
  query: string;
  categories: string[];
  colors: string[];
  aiSearch?: boolean;
};

export const useSearchClothing = () => {
  return useMutation({
    mutationKey: ["clothing", "search"],
    mutationFn: (searchParams: SearchClothingParams) =>
      api
        .auth(`Bearer ${localStorage.getItem("token") || ""}`)
        .url("/clothing/search")
        .post(searchParams)
        .json<ClothingItem[]>(),
  });
};

export type ClothingStats = {
  totalItems: number;
  categoryCounts: Record<string, number>;
  colorCounts: Record<string, number>;
};

export const useGetClothingStats = () => {
  return useQuery({
    queryKey: ["clothing", "stats"],
    queryFn: () =>
      api
        .auth(`Bearer ${localStorage.getItem("token") || ""}`)
        .get("/clothing/stats")
        .json<ClothingStats>(),
  });
};
