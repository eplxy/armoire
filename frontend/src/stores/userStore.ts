import { create } from "zustand";
import type { UserModel } from "../models/models";
import { checkIsLoggedIn } from "../utils/authUtils";

interface UserStore {
  user: UserModel;
  setUser: (user: UserModel) => void;
  isLoggedIn: boolean;
  logIn: () => void;
  logOut: () => void;
}
const useUserStore = create<UserStore>((set) => ({
  user: {} as UserModel,
  setUser: (user: UserModel) => set({ user }),

  isLoggedIn: checkIsLoggedIn(),

  logIn: () => set({ isLoggedIn: true }),
  logOut: () => set({ isLoggedIn: false }),
}));

export default useUserStore;
