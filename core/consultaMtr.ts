// core/consultaMtr.ts

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export async function buscarManifestoMTR(numeroMtr: string, user: any) {
  try {
    const response = await fetch(`${API_BASE}/api/mtr/manifesto-pdf`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        manifestoCodigo: numeroMtr,
        cnp: user?.cnp,
        login: user?.login,
        senha: user?.senha
      }),
    });

    const data = await response.json();

    if (response.status === 429) {
      return {
        erro: true,
        status: 429,
        mensagem: data?.message || "Servidor ocupado. Tente novamente.",
      };
    }
    
    if (!data?.success || data?.validation?.code >= 400) {
      return {
        erro: true,
        mensagem: data?.validation?.message || "MTR inválido",
        data: data?.data ?? null,
        validation: data?.validation ?? null,
      };
    }
    return data;
  } catch (error: any) {
    return { erro: true, mensagem: error?.message || "Erro ao consultar MTR" };
  }
}

