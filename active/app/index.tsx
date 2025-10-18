import { useEffect } from "react";
import { useRouter } from "expo-router";
import { supabase } from "../src/lib/supabase";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        router.replace("/(tabs)"); // go to main tabs if logged in
      } else {
        router.replace("/login");   // go to login if not
      }
    });
  }, []);

  return null; // nothing to render
}
