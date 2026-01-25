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

export const useUploadClothingItem = () => {
  return useMutation({
    mutationKey: ["clothing", "upload"],
    mutationFn: (formData: FormData) =>
      api
        .auth(`Bearer ${localStorage.getItem("token") || ""}`)
        .url("/clothing/upload")
        .post(formData)
        .json<ClothingItem>(),
  });
};

export const useGetClothingItem = (clothingId: string) => {
  return useQuery({
    queryKey: ["clothing", clothingId],
    queryFn: () =>
      api
        .auth(`Bearer ${localStorage.getItem("token") || ""}`)
        .get(`/clothing/${clothingId}`)
        .json<ClothingItem>(),
  });
};

export const useGetClothingOwnerName = (clothingId: string) => {
  return useQuery({
    queryKey: ["clothing", clothingId, "ownerName"],
    queryFn: () =>
      api
        .get(`/clothing/${clothingId}/owner`)
        .json<{ ownerName: string }>()
        .then((data) => data.ownerName),
  });
};

export type UpdateClothingItemParams = {
  id: string;
  name?: string;
  description?: string;
  isPublic?: boolean;
};

export const useUpdateClothingItem = () => {
  return useMutation({
    mutationKey: ["clothing", "update"],
    mutationFn: ({ id, ...updateData }: UpdateClothingItemParams) =>
      api
        .auth(`Bearer ${localStorage.getItem("token") || ""}`)
        .url(`/clothing/${id}`)
        .patch(updateData)
        .json<ClothingItem>(),
  });
};
