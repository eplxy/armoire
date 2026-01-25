import { useEffect, useState } from "react";
import useUserStore from "../stores/userStore";
import { useGetUserInfo } from "./queries/userQueries";
import { isTokenExpired } from "../utils/authUtils";

export const useAuthentication = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return !isTokenExpired(localStorage.getItem("token"));
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem("token");
      const loggedIn = token !== null && !isTokenExpired(token);
      setIsLoggedIn(loggedIn);
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const setToken = (token: string) => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
    setIsLoggedIn(isTokenExpired(token));
  };

  return { isLoggedIn, setToken };
};

export function logout(reload: boolean = true) {
  localStorage.removeItem("token");
  if (reload) {
    window.location.reload();
  }
}

export const useLoadUserData = () => {
  const query = useGetUserInfo();
  const { setUser } = useUserStore();

  useEffect(() => {
    if (query.isSuccess && query.data) {
      setUser(query.data);
    }
  }, [
    query.isSuccess,
    query.data,
    setUser,
  ]);
};
