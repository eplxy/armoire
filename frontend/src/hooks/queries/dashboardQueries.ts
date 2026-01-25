import { useQuery } from "@tanstack/react-query";
import { api } from "./api";

export const useGetDashboardStylistMessage = () => {
  return useQuery({
    queryKey: ["dashboard", "stylist"],
    queryFn: () =>
      api
        .auth(`Bearer ${localStorage.getItem("token") || ""}`)
        .get("/dashboard/stylist")
        .json<DashboardStylistResponse>(),
  });
};

export type DashboardStylistResponse = {
  message: string;
};
