'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Head from "next/head";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import MtrForm from "../../components/MtrForm";

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

      <div className="flex flex-col min-h-screen">
        <Header />

        <main className="flex-1 p-6 flex flex-col items-center justify-center">
          <h2 className="text-2xl font-semibold text-center">Buscar Manifesto de Transporte de Resíduos</h2>
          <MtrForm />
        </main>

        <Footer />
      </div>
    </>
  );
}