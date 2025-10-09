'use client';

import { useEffect, useState } from 'react';
import { buscarHistoricoBaixas } from './action';

interface HistoricoItem {
  id: number;
  mtr: string;
  usuario: string;
  data_baixa: string;
}

interface Props {
  user: any;
}

export default function HistoricoBaixas({ user }: Props) {
  const [historico, setHistorico] = useState<HistoricoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [porPagina] = useState(10); // registros por página

  async function carregar(pag = 1) {
    setLoading(true);
    const res = await buscarHistoricoBaixas(pag, porPagina);

    if (res.success && res.data) {
      setHistorico(Array.isArray(res.data.items) ? res.data.items : []);
      setTotalPaginas(res.data.totalPaginas ?? 1);
    } else {
      setHistorico([]);
      setTotalPaginas(1);
    }

    setLoading(false);
  }

  useEffect(() => {
    if (user?.adm) carregar(pagina);
    else setLoading(false);
  }, [user, pagina]);

  if (!user?.adm) {
    return (
      <div className="flex flex-col items-center justify-center h-80 text-center">
        <p className="text-gray-600 text-lg font-medium">
          🚫 Acesso restrito — apenas administradores podem visualizar o histórico.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#293f58]"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto bg-white border border-gray-200 rounded-lg shadow-sm p-6">
      {!Array.isArray(historico) || historico.length === 0 ? (
        <p className="text-gray-600 text-center">Nenhum registro encontrado.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-gray-700">
              <thead className="bg-[#293f58] text-white">
                <tr>
                  <th className="px-4 py-2 text-left">#</th>
                  <th className="px-4 py-2 text-left">MTR</th>
                  <th className="px-4 py-2 text-left">Usuário</th>
                  <th className="px-4 py-2 text-left">Data da Baixa</th>
                </tr>
              </thead>
              <tbody>
                {historico.map((item, index) => (
                  <tr
                    key={item.id}
                    className={`border-t ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
                  >
                    <td className="px-4 py-2">{(pagina - 1) * porPagina + index + 1}</td>
                    <td className="px-4 py-2 font-mono">{item.mtr}</td>
                    <td className="px-4 py-2">{item.usuario}</td>
                    <td className="px-4 py-2">
                      {new Date(item.data_baixa).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 🔹 Controles de Paginação Centralizados e Compactos */}
          <div className="flex justify-center items-center mt-6 space-x-3">
            <button
              onClick={() => setPagina((prev) => Math.max(prev - 1, 1))}
              disabled={pagina === 1}
              className="px-3 py-1.5 bg-gray-200 rounded-md text-gray-700 hover:bg-gray-300 disabled:opacity-50"
            >
              ←
            </button>

            <span className="text-sm text-gray-700 font-medium">
              Página <span className="text-[#293f58]">{pagina}</span> de{' '}
              <span className="text-[#293f58]">{totalPaginas}</span>
            </span>

            <button
              onClick={() => setPagina((prev) => Math.min(prev + 1, totalPaginas))}
              disabled={pagina === totalPaginas}
              className="px-3 py-1.5 bg-gray-200 rounded-md text-gray-700 hover:bg-gray-300 disabled:opacity-50"
            >
              →
            </button>
          </div>
        </>
      )}
    </div>
  );
}
