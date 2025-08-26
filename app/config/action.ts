// app/config/action.ts
'use server';

import { cookies } from 'next/headers';
import {
  getSetores, upsertSetor, deleteSetor,
  getPagamentos, upsertPagamento, deletePagamento,
  getCategorias, upsertCategoria, deleteCategoria,
  Setor, Pagamento, Categoria,
} from '../../core/configs';

type Ok<T> = { ok: true; data: T };
type Err = { ok: false; message: string };

async function authHeaderFromCookie() {
  const cookieStore = await cookies();
  const token = cookieStore.get('authToken')?.value;
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

/* ============ CARREGAR AS 3 LISTAS (para a page) ============ */
export async function getConfigListsAction(): Promise<
  Ok<{ setores: Setor[]; pagamentos: Pagamento[]; categorias: Categoria[] }> | Err
> {
  try {
    const headers = await authHeaderFromCookie();
    const [setores, pagamentos, categorias] = await Promise.all([
      getSetores({ headers }),
      getPagamentos({ headers }),
      getCategorias({ headers }),
    ]);
    return { ok: true, data: { setores, pagamentos, categorias } };
  } catch (e: any) {
    console.error('Error loading config lists:', e);
    return { ok: false, message: e?.message ?? 'Erro ao carregar configurações' };
  }
}

/* ===================== SETOR ===================== */
export async function upsertSetorAction(
  input: { id?: number; setor: string },
): Promise<Ok<{ id?: number; message?: string }> | Err> {
  try {
    const headers = await authHeaderFromCookie();
    const data = await upsertSetor(input, { headers });
    return { ok: true, data };
  } catch (e: any) {
    console.error('Error upserting setor:', e);
    return { ok: false, message: e?.message ?? 'Erro ao salvar setor' };
  }
}

export async function deleteSetorAction(id: number): Promise<Ok<{}> | Err> {
  try {
    const headers = await authHeaderFromCookie();
    await deleteSetor(id, { headers });
    return { ok: true, data: {} };
  } catch (e: any) {
    console.error('Error deleting setor:', e);
    return { ok: false, message: e?.message ?? 'Erro ao deletar setor' };
  }
}

/* =================== PAGAMENTO =================== */
export async function upsertPagamentoAction(
  input: { id?: number; tipo: string },
): Promise<Ok<{ id?: number; message?: string }> | Err> {
  try {
    const headers = await authHeaderFromCookie();
    const data = await upsertPagamento(input, { headers });
    return { ok: true, data };
  } catch (e: any) {
    console.error('Error upserting pagamento:', e);
    return { ok: false, message: e?.message ?? 'Erro ao salvar pagamento' };
  }
}

export async function deletePagamentoAction(id: number): Promise<Ok<{}> | Err> {
  try {
    const headers = await authHeaderFromCookie();
    await deletePagamento(id, { headers });
    return { ok: true, data: {} };
  } catch (e: any) {
    console.error('Error deleting pagamento:', e);
    return { ok: false, message: e?.message ?? 'Erro ao deletar pagamento' };
  }
}

/* =================== CATEGORIA =================== */
export async function upsertCategoriaAction(
  input: { id?: number; categoria: string },
): Promise<Ok<{ id?: number; message?: string }> | Err> {
  try {
    const headers = await authHeaderFromCookie();
    const data = await upsertCategoria(input, { headers });
    return { ok: true, data };
  } catch (e: any) {
    console.error('Error upserting categoria:', e);
    return { ok: false, message: e?.message ?? 'Erro ao salvar categoria' };
  }
}

export async function deleteCategoriaAction(id: number): Promise<Ok<{}> | Err> {
  try {
    const headers = await authHeaderFromCookie();
    await deleteCategoria(id, { headers });
    return { ok: true, data: {} };
  } catch (e: any) {
    console.error('Error deleting categoria:', e);
    return { ok: false, message: e?.message ?? 'Erro ao deletar categoria' };
  }
}