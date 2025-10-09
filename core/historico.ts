const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export async function listarHistorico(pagina = 1, porPagina = 10) {
  try {
    const response = await fetch(`${API_BASE}/api/mtr/listar?pagina=${pagina}&porPagina=${porPagina}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    const data = await response.json();
    if (!data?.success) throw new Error(data?.message || 'Erro ao listar histórico');
    return data.data;
  } catch (error: any) {
    console.error('❌ Erro ao buscar histórico:', error.message);
    return { items: [], total: 0, totalPaginas: 1 };
  }
}


// export async function salvarHistorico(payload: {
//   mtr: string;
//   usuario: string;
//   dataBaixa: string;
// }) {
//   try {
//     const response = await fetch(`${API_BASE}/api/mtr/salvar`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(payload),
//     });

//     const data = await response.json();
//     return data;
//   } catch (error: any) {
//     console.error('❌ Erro ao salvar histórico:', error.message);
//     return { success: false, message: error.message };
//   }
// }

export async function salvarHistorico(dados: {
  mtr: string;
  usuario: string;
  dataBaixa: string;
} | {
  mtr: string;
  usuario: string;
  dataBaixa: string;
}[]) {
  try {
    const response = await fetch(`${API_BASE}/api/mtr/salvar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao salvar histórico:", error);
    return { success: false, message: "Falha ao registrar histórico" };
  }
}

