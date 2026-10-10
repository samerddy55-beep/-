```javascript
"use strict";

(() => {
  const config = window.NOVA_CONFIG;

  if (!config?.SUPABASE_URL || !config?.SUPABASE_KEY) {
    console.error("إعدادات Supabase غير موجودة. تحقق من config.js.");
    return;
  }

  if (!window.supabase?.createClient) {
    console.error("مكتبة Supabase لم يتم تحميلها.");
    return;
  }

  const supabase = window.supabase.createClient(
    config.SUPABASE_URL,
    config.SUPABASE_KEY
  );

  window.NOVA = Object.freeze({
    supabase,

    async signUp(email, password, displayName) {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { display_name: displayName.trim() }
        }
      });

      if (error) throw error;

      return {
        user: data.user,
        session: data.session,
        message: data.session
          ? "تم إنشاء الحساب وتسجيل الدخول."
          : "تم إنشاء الحساب. تحقق من بريدك الإلكتروني لتأكيده."
      };
    },

    async signIn(email, password) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (error) throw error;
      return data;
    },

    async signOut() {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },

    async getSession() {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data.session;
    },

    async getProfile() {
      const { data: { user }, error: userError } =
        await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("id, display_name, created_at")
        .eq("id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },

    onAuthChange(callback) {
      const { data } = supabase.auth.onAuthStateChange(
        (event, session) => callback(event, session)
      );

      return () => data.subscription.unsubscribe();
    }
  });

  console.info("تم تهيئة اتصال NOVA مع Supabase.");
})();
```
