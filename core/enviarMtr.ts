// const API_BASE = process.env.NEXT_PUBLIC_API_URL as string;

// export async function enviarMtrLote(payload: any) {
//   try {
//     const response = await fetch(`${API_BASE}/api/mtr/enviar-mtr`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(payload)
//     });

//     const data = await response.json();

//     if (!response.ok) {
//       throw new Error(data?.message || 'Erro ao enviar para backend');
//     }

//     return data;
//   } catch (error: any) {
//     console.error('Erro ao enviar MTR para o backend:', error);
//     throw error;
//   }
// }

const API_BASE = process.env.NEXT_PUBLIC_API_URL as string;

export async function enviarMtrLote(payload: any) {
  try {
    const response = await fetch(`${API_BASE}/api/mtr/enviar-mtr`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || 'Erro ao enviar para backend');
    }

    return data;
  } catch (error: any) {
    console.error('Erro ao enviar MTR para o backend:', error);
    throw error;
  }
}
