'use server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL as string;

export async function loginUser(login: string, senha: string) {
  try {
    const response = await fetch(`${API_BASE}/api/mtr/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ login, senha }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro na autenticação:', error);
    throw new Error('Erro ao acessar o servidor');
  }
}
