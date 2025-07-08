'use client'

import Head from "next/head";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import MtrForm from "../../components/EnviarMtr";

export default function Home() {
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
