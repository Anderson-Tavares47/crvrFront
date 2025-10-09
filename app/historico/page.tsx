'use client';

import Head from "next/head";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import HistoricoBaixas from "../../components/HistoricoBaixas";
import { useAuthGuard } from "../../hooks/useAuthGuard";

export default function HistoricoPage() {
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
                <title>Histórico de Baixas - CRVR</title>
            </Head>

            <div className="flex flex-col min-h-screen">
                <Header user={user} />

                <main className="flex-1 p-6 flex flex-col items-center justify-center w-full">
                    <h2 className="text-2xl font-semibold text-center mb-4">
                        Histórico de Baixas de MTRs
                    </h2>
                    <HistoricoBaixas user={user} />
                </main>

                <Footer />
            </div>
        </>
    );
}
