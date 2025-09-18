const API_BASE = process.env.NEXT_PUBLIC_API_URL as string

export async function obterListaUnidades() {
  const response = await fetch(`${API_BASE}/api/mtr/unidades`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.json();
}

export async function obterListaResiduo() {
  const response = await fetch(`${API_BASE}/api/mtr/residuo`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.json();
}

export async function obterListaClasse() {
  const response = await fetch(`${API_BASE}/api/mtr/classe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.json();
}

export async function obterListaEstadoFisico() {
  const response = await fetch(`${API_BASE}/api/mtr/estado-fisico`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.json();
}

export async function obterListaAcondicionamento() {
  const response = await fetch(`${API_BASE}/api/mtr/acondicionamento`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.json();
}

export async function obterListaTecnologia() {
  const response = await fetch(`${API_BASE}/api/mtr/tecnologia`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.json();

}


export async function obterTodasListasSafe() {
  try {
    const res = await fetch(`${API_BASE}/api/mtr/todas-listas`, {
      method: "POST", // 👈 corrigido
    });

    console.log(res, '=============')

    if (!res.ok) {
      throw new Error("Erro ao buscar todas as listas");
    }


    return await res.json();
  } catch (error) {
    console.error("❌ Erro em obterTodasListasSafe:", error);
    throw error;
  }
}
