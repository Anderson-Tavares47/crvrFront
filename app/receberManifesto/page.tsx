'use client';

import Head from "next/head";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import MtrForm from "../../components/EnviarMtr";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import CryptoJS from 'crypto-js';
import { useAuthGuard } from "../../hooks/useAuthGuard";

export default function Home() {
  const router = useRouter();
  const SECRET_KEY = 'crvr_app_2025_secret'; // mesmo valor do AuthContext
  const { user, isReady } = useAuthGuard();

  useEffect(() => {
    const checkAuth = () => {
      const storedUser = localStorage.getItem('authUser');
      if (!storedUser) {
        router.push('/login');
        return;
      }

      try {
        // 🔹 Descriptografa antes de validar
        const bytes = CryptoJS.AES.decrypt(storedUser, SECRET_KEY);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        const user = JSON.parse(decrypted);

        // Validação mínima de integridade
        if (!user?.login || !user?.nome) {
          localStorage.removeItem('authUser');
          router.push('/login');
          return;
        }
      } catch (err) {
        console.error("Erro ao validar usuário:", err);
        localStorage.removeItem('authUser');
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  if (!isReady) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        Validando sessão...
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Envio de MTR</title>
      </Head>

      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header user={user} />

        <main className="flex-1">
          <section className="max-w-6xl mx-auto px-4 py-10">
            <MtrForm />
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}
