import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "./api";
import { toast } from "react-toastify";
import type { UserModel } from "../../models/models";

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  userId: string;
};

export const useLogin = () => {
  return useMutation({
    mutationKey: ["post", "login"],
    mutationFn: (req: LoginRequest) =>
      api.url("/auth/login").post(req).json<LoginResponse>(),
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      window.location.replace("/");
    },
    onError: (error: any) => {
      console.error("Login error:", error);
      if (error.message === "Invalid email or password") {
        toast.error(
          "Login failed. Please check your credentials and try again.",
        );
      } else {
        toast.error("An unexpected error occurred. Please try again later.");
      }
    },
  });
};

export type RegisterRequest = {
  email: string;
  name: string;
  password: string;
  returnToken?: boolean;
};

export type RegisterResponse = {
  token: string;
  user: UserModel;
};

export const useRegister = () => {
  return useMutation({
    mutationKey: ["post", "register"],
    mutationFn: (req: RegisterRequest) =>
      api.url("/auth/register").post(req).json<RegisterResponse>(),
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      window.location.replace("/");
    },
    onError: (error) => {
      console.error("Registration error:", error);

      if (error.message.includes("Email already registered")) {
        toast.error("This email is already registered.");
        return;
      }
      toast.error(
        "Registration failed. Please check your details and try again.",
      );
    },
  });
};

export const useGetUserInfo = () => {
  const token = localStorage.getItem("token");

  const query = useQuery({
    queryKey: ["get", "user", "info"],
    queryFn: () => {
      if (!token) {
        throw new Error("No authentication token found");
      }
      return api
        .auth(`Bearer ${token}`)
        .url("/user/userinfo")
        .get()
        .json<UserModel>((res) => res);
    },
    enabled: !!token, // Only run the query if there's a token
    staleTime: 20 * 60 * 1000, // 20 minutes
  });
  return query;
};

export type UserGetInfoResponseModel = {
  user: UserModel;
};
