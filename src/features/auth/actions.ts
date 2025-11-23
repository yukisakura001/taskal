"use server";

import { signIn, signOut } from "@/auth";

export const login = async (): Promise<void> => {
  await signIn("google", { redirectTo: "/" });
};

export const loginGithub = async (): Promise<void> => {
  await signIn("github", { redirectTo: "/" });
};

export const logout = async (): Promise<void> => {
  await signOut();
};
