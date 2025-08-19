'use client'

import Head from "next/head";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import MtrForm from "../../components/EnviarMtr";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('authToken');
      const username = localStorage.getItem('username');

      if (!token || !username) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('username');
        router.push('/login');
        return;
      }

      const isValidToken = /^[a-f0-9]+$/.test(token);
      if (!isValidToken) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('username');
        router.push('/login');
        return;
      }
    };

    checkAuth();
  }, [router]);


  return (
    <>
      <Head>
        <title>Consulta de MTR</title>
      </Head>

      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />

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
