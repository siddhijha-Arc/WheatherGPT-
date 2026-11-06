import { createClient } from "@supabase/supabase-js";
const envUrl = import.meta.env?.VITE_SUPABASE_URL || "";
const envAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || "";
function getStoredCredentials() {
  try {
    const storedUrl = localStorage.getItem("weathergpt_supabase_url");
    const storedKey = localStorage.getItem("weathergpt_supabase_anon_key");
    return {
      url: storedUrl || envUrl || "",
      anonKey: storedKey || envAnonKey || ""
    };
  } catch {
    return { url: envUrl || "", anonKey: envAnonKey || "" };
  }
}
let supabaseInstance = null;
export function getSupabaseClient() {
  const { url, anonKey } = getStoredCredentials();
  if (!url || !anonKey || !url.startsWith("http")) {
    return null;
  }
  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(url, anonKey);
    } catch (err) {
      console.warn("Failed to initialize Supabase client:", err);
      return null;
    }
  }
  return supabaseInstance;
}
export function saveSupabaseCredentials(url, anonKey) {
  try {
    localStorage.setItem("weathergpt_supabase_url", url);
    localStorage.setItem("weathergpt_supabase_anon_key", anonKey);
    supabaseInstance = null;
    return getSupabaseClient();
  } catch (err) {
    console.error("Failed to store Supabase credentials:", err);
    return null;
  }
}
export function clearSupabaseCredentials() {
  try {
    localStorage.removeItem("weathergpt_supabase_url");
    localStorage.removeItem("weathergpt_supabase_anon_key");
    supabaseInstance = null;
  } catch (err) {
    console.error("Failed to clear Supabase credentials:", err);
  }
}
export function isSupabaseConfigured() {
  const { url, anonKey } = getStoredCredentials();
  return Boolean(url && anonKey && url.startsWith("http"));
}
export function getSupabaseCredentials() {
  return getStoredCredentials();
}
export async function getCurrentUser() {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data } = await client.auth.getUser();
      if (data?.user) return data.user;
    } catch {
    }
  }
  return localDb.getAuthUser();
}
export async function signInUser(email, password) {
  const client = getSupabaseClient();
  if (client) {
    try {
      const res = await client.auth.signInWithPassword({ email, password });
      if (!res.error && res.data.user) {
        localDb.setAuthUser({
          email: res.data.user.email || email,
          name: res.data.user.user_metadata?.name || email.split("@")[0]
        });
      }
      return res;
    } catch (err) {
      return { data: null, error: { message: err.message || "Login failed" } };
    }
  }
  const fallbackUser = { email, name: email.split("@")[0] };
  localDb.setAuthUser(fallbackUser);
  return { data: { user: { email, user_metadata: { name: fallbackUser.name } } }, error: null };
}
export async function signUpUser(email, password, name) {
  const client = getSupabaseClient();
  if (client) {
    try {
      const res = await client.auth.signUp({
        email,
        password,
        options: { data: { name: name || email.split("@")[0] } }
      });
      if (!res.error && res.data.user) {
        localDb.setAuthUser({
          email: res.data.user.email || email,
          name: name || email.split("@")[0]
        });
      }
      return res;
    } catch (err) {
      return { data: null, error: { message: err.message || "Sign up failed" } };
    }
  }
  const fallbackUser = { email, name: name || email.split("@")[0] };
  localDb.setAuthUser(fallbackUser);
  return { data: { user: { email, user_metadata: { name: fallbackUser.name } } }, error: null };
}
export async function signOutUser() {
  const client = getSupabaseClient();
  if (client) {
    try {
      await client.auth.signOut();
    } catch {
    }
  }
  localDb.setAuthUser(null);
}
export const localDb = {
  getSavedLocations: () => {
    try {
      const stored = localStorage.getItem("weathergpt_saved_locations");
      if (stored) return JSON.parse(stored);
    } catch {
    }
    return [
      { id: "1", name: "New Delhi", state: "Delhi NCR", lat: 28.6139, lng: 77.209 },
      { id: "2", name: "Mumbai", state: "Maharashtra", lat: 19.076, lng: 72.8777 },
      { id: "3", name: "Bengaluru", state: "Karnataka", lat: 12.9716, lng: 77.5946 }
    ];
  },
  saveLocation: (location) => {
    const list = localDb.getSavedLocations();
    const targetName = (location?.name || location?.city || "").toLowerCase();
    const exists = list.some((l) => (l?.name || l?.city || "").toLowerCase() === targetName);
    if (!exists) {
      const updated = [...list, { ...location, id: Date.now().toString() }];
      localStorage.setItem("weathergpt_saved_locations", JSON.stringify(updated));
      return updated;
    }
    return list;
  },
  removeLocation: (id) => {
    const list = localDb.getSavedLocations().filter((l) => l.id !== id);
    localStorage.setItem("weathergpt_saved_locations", JSON.stringify(list));
    return list;
  },
  getAuthUser: () => {
    try {
      const u = localStorage.getItem("weathergpt_user_session");
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  },
  setAuthUser: (user) => {
    if (user) {
      localStorage.setItem("weathergpt_user_session", JSON.stringify(user));
    } else {
      localStorage.removeItem("weathergpt_user_session");
    }
  }
};
