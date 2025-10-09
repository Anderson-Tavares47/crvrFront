'use client'

import Head from "next/head";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import MtrForm from "../../components/MtrForm";
import { useAuthGuard } from "../../hooks/useAuthGuard";

export default function Home() {
  const { user, isReady } = useAuthGuard();

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
        <title>Consulta de MTR</title>
      </Head>

      <div className="flex flex-col min-h-screen">
        <Header user={user} />

        <main className="flex-1 p-6 flex flex-col items-center justify-center">
          <h2 className="text-2xl font-semibold text-center">
            Buscar Manifesto de Transporte de Resíduos
          </h2>
          <MtrForm />
        </main>

        <Footer />
      </div>
    </>
  );
}
