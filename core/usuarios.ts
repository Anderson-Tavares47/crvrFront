const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export async function criarUsuario(payload: {
  nome: string;
  login: string;
  senha: string;
  cnp: string;
  adm?: boolean;
}) {
  try {
    const res = await fetch(`${API_BASE}/api/mtr/usuarios/criar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (error: any) {
    console.error("❌ Erro ao criar usuário:", error.message);
    return { success: false, message: error.message };
  }
}

export async function listarUsuarios() {
  try {
    const res = await fetch(`${API_BASE}/api/mtr/usuarios/listar`, {
      cache: "no-store",
    });
    const data = await res.json();
    return data.data || [];
  } catch (error: any) {
    console.error("❌ Erro ao listar usuários:", error.message);
    return [];
  }
}

export async function excluirUsuario(id: number) {
  try {
    const res = await fetch(`${API_BASE}/api/mtr/usuarios/${id}`, {
      method: "DELETE",
    });
    return await res.json();
  } catch (error: any) {
    console.error("❌ Erro ao excluir usuário:", error.message);
    return { success: false, message: error.message };
  }
}
