"use server";

import { getSupabaseClient } from "./supabase";

export async function signIn(email: string, password: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function signUp(email: string, password: string, nickname: string) {
  const supabase = getSupabaseClient();
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) return { data: null, error: authError };

  if (authData.user) {
    const { error: profileError } = await supabase.from("users").insert([
      { id: authData.user.id, email, nickname },
    ]);
    if (profileError) return { data: null, error: profileError };
  }

  return { data: authData, error: null };
}

export async function signOut() {
  const supabase = getSupabaseClient();
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getSession() {
  const supabase = getSupabaseClient();
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function getUser() {
  const supabase = getSupabaseClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export async function getUserProfile(userId: string) {
  const supabase = getSupabaseClient();
  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();
  return data;
}
