let client;
export const authConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL &&
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
);
export async function authClient() {
  if (!authConfigured) return null;
  if (!client) {
    const { createClient } = await import("@supabase/supabase-js");
    client = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      { auth: { flowType: "pkce", detectSessionInUrl: true } },
    );
  }
  return client;
}
export async function currentUser() {
  const c = await authClient();
  if (!c) return null;
  const { data, error } = await c.auth.getUser();
  if (error) return null;
  return data.user;
}
export async function sendCode(email) {
  const c = await authClient();
  if (!c)
    throw new Error(
      "Cloud sign-in is not available yet. You can use your device workspace.",
    );
  const { error } = await c.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true },
  });
  if (error) throw error;
}
export async function verifyCode(email, token) {
  const c = await authClient();
  const { data, error } = await c.auth.verifyOtp({
    email,
    token,
    type: "email",
  });
  if (error) throw error;
  return data.user;
}
export async function signInGoogle() {
  const c = await authClient();
  if (!c) throw new Error("Google sign-in is not available yet.");
  const { error } = await c.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${location.origin}/auth/callback` },
  });
  if (error) throw error;
}
export async function signOut() {
  const c = await authClient();
  if (c) await c.auth.signOut();
}
export async function loadCloudData(userId) {
  const c = await authClient();
  if (!c) return null;
  const { data, error } = await c
    .from("workspaces")
    .select("payload,revision")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}
export async function saveCloudData(userId, payload, revision) {
  const c = await authClient();
  if (!c) return null;
  if (revision === null) {
    const { data, error } = await c
      .from("workspaces")
      .insert({ user_id: userId, payload, revision: 1 })
      .select("revision")
      .single();
    if (error) throw error;
    return data.revision;
  }
  const { data, error } = await c
    .from("workspaces")
    .update({
      payload,
      revision: revision + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .eq("revision", revision)
    .select("revision")
    .maybeSingle();
  if (error) throw error;
  if (!data)
    throw new Error(
      "This workspace changed on another device. Refresh to review the latest version before syncing.",
    );
  return data.revision;
}
