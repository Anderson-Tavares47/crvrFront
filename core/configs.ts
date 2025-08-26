import { api, ApiOptions } from '../lib/https';

export type Setor = { id: number; setor: string };
export type Pagamento = { id: number; tipo: string }; // Changed: backend sends 'tipo', not 'formasPagamento'
export type Categoria = { id: number; categoria: string };

type Opts = Pick<ApiOptions, 'headers' | 'baseUrl'>;

/* ====================== SETOR ====================== */
export async function getSetores(opts?: Opts): Promise<Setor[]> {
  // back: GET /setor -> [{ id, setor }]
  return api.get<Setor[]>('/setor', opts);
}

export async function upsertSetor(
  input: { id?: number; setor: string },
  opts?: Opts,
): Promise<{ id?: number; message?: string }> {
  const body = { setor: input.setor };
  if (input.id) {
    return api.put(`/setor/${input.id}`, body, opts);
  }
  return api.post('/setor', body, opts);
}

export async function deleteSetor(id: number, opts?: Opts): Promise<unknown> {
  return api.delete(`/setor/${id}`, opts);
}

/* ==================== PAGAMENTO ==================== */
export async function getPagamentos(opts?: Opts): Promise<Pagamento[]> {
  // back: GET /pagamento -> [{ id, tipo }] - keep it as 'tipo'
  return api.get<Pagamento[]>('/pagamento', opts);
}

export async function upsertPagamento(
  input: { id?: number; tipo: string },
  opts?: Opts,
): Promise<{ id?: number; message?: string }> {
  const body = { tipo: input.tipo }; // back expects "tipo"
  if (input.id) {
    return api.put(`/pagamento/${input.id}`, body, opts);
  }
  return api.post('/pagamento', body, opts);
}

export async function deletePagamento(id: number, opts?: Opts): Promise<unknown> {
  return api.delete(`/pagamento/${id}`, opts);
}

/* ==================== CATEGORIA ==================== */
export async function getCategorias(opts?: Opts): Promise<Categoria[]> {
  // back: GET /categoria -> [{ id, categoria }]
  return api.get<Categoria[]>('/categoria', opts);
}

export async function upsertCategoria(
  input: { id?: number; categoria: string },
  opts?: Opts,
): Promise<{ id?: number; message?: string }> {
  const body = { categoria: input.categoria }; // back expects "categoria"
  if (input.id) {
    return api.put(`/categoria/${input.id}`, body, opts);
  }
  return api.post('/categoria', body, opts);
}

export async function deleteCategoria(id: number, opts?: Opts): Promise<unknown> {
  return api.delete(`/categoria/${id}`, opts);
}