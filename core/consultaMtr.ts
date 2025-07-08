
const API_BASE = process.env.NEXT_PUBLIC_API_URL as string
 
console.log(API_BASE)

export async function buscarManifestoMTR(numeroMtr: string) {
  try {
    const response = await fetch(`${API_BASE}/api/mtr/manifesto-pdf`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ manifestoCodigo: numeroMtr }),
    });

    const data = await response.json();

    // Lógica de "erro funcional" via código de validação
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
    return {
      erro: true,
      mensagem: error?.message || "Erro ao consultar MTR",
    };
  }
}
