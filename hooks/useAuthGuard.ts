// hooks/useAuthGuard.ts
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CryptoJS from "crypto-js";

export function useAuthGuard() {
  const router = useRouter();
  const SECRET_KEY = 'crvr_app_2025_secret';
  const [isReady, setIsReady] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem("authUser");
    if (!stored) {
      router.push("/login");
      return;
    }

    try {
      const bytes = CryptoJS.AES.decrypt(stored, SECRET_KEY);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      const parsed = JSON.parse(decrypted);
      if (!parsed?.login) throw new Error();
      setUser(parsed);
    } catch {
      localStorage.removeItem("authUser");
      router.push("/login");
    } finally {
      setIsReady(true);
    }
  }, [router]);

  return { user, isReady };
}
