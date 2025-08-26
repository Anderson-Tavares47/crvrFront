// app/config/page.tsx
'use client';

import { useEffect, useState } from 'react';
import {
  getConfigListsAction,
  upsertSetorAction, deleteSetorAction,
  upsertPagamentoAction, deletePagamentoAction,
  upsertCategoriaAction, deleteCategoriaAction,
} from './action';

type Setor = { id: number; setor: string };
type Pagamento = { id: number; tipo: string }; // Changed: backend sends 'tipo'
type Categoria = { id: number; categoria: string };

export default function ConfigPage() {
  // listas
  const [setores, setSetores] = useState<Setor[]>([]);
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  // carregamento inicial
  const [loading, setLoading] = useState(true);

  // inputs
  const [setorInput, setSetorInput] = useState('');
  const [pagamentoInput, setPagamentoInput] = useState('');
  const [categoriaInput, setCategoriaInput] = useState('');

  // erros por cartão
  const [errSetor, setErrSetor] = useState('');
  const [errPagamento, setErrPagamento] = useState('');
  const [errCategoria, setErrCategoria] = useState('');

  // loading por ação
  const [savingSetor, setSavingSetor] = useState(false);
  const [savingPagamento, setSavingPagamento] = useState(false);
  const [savingCategoria, setSavingCategoria] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await getConfigListsAction();
      if (res.ok) {
        setSetores(res.data.setores ?? []);
        setPagamentos(res.data.pagamentos ?? []);
        setCategorias(res.data.categorias ?? []);
      } else {
        // espalhar o erro nos 3 cartões (ux mais simples)
        setErrSetor(res.message);
        setErrPagamento(res.message);
        setErrCategoria(res.message);
      }
      setLoading(false);
    })();
  }, []);

  /* ------------- Ações: SETOR ------------- */
  const onCreateSetor = async () => {
    setErrSetor('');
    const nome = setorInput.trim();
    if (!nome) {
      setErrSetor('Informe o nome do setor.');
      return;
    }
    setSavingSetor(true);
    const res = await upsertSetorAction({ setor: nome });
    setSavingSetor(false);
    if (!res.ok) {
      setErrSetor(res.message || 'Erro ao salvar setor.');
      return;
    }
    // UI otimista: adiciona na lista local
    const newSetor = { 
      id: (res.data as any)?.id ?? Date.now(), 
      setor: nome 
    };
    setSetores(prev => [...prev, newSetor]);
    setSetorInput('');
  };

  const onDeleteSetor = async (id: number) => {
    setErrSetor('');
    const res = await deleteSetorAction(id);
    if (!res.ok) {
      setErrSetor(res.message || 'Erro ao deletar setor.');
      return;
    }
    setSetores(prev => prev.filter(s => s.id !== id));
  };

  /* ----------- Ações: PAGAMENTO ----------- */
  const onCreatePagamento = async () => {
    setErrPagamento('');
    const tipo = pagamentoInput.trim();
    if (!tipo) {
      setErrPagamento('Informe a forma de pagamento.');
      return;
    }
    setSavingPagamento(true);
    const res = await upsertPagamentoAction({ tipo }); // sends "tipo"
    setSavingPagamento(false);
    if (!res.ok) {
      setErrPagamento(res.message || 'Erro ao salvar pagamento.');
      return;
    }
    // UI otimista: adiciona na lista local
    const newPagamento = { 
      id: (res.data as any)?.id ?? Date.now(), 
      tipo: tipo // backend field name
    };
    setPagamentos(prev => [...prev, newPagamento]);
    setPagamentoInput('');
  };

  const onDeletePagamento = async (id: number) => {
    setErrPagamento('');
    const res = await deletePagamentoAction(id);
    if (!res.ok) {
      setErrPagamento(res.message || 'Erro ao deletar pagamento.');
      return;
    }
    setPagamentos(prev => prev.filter(p => p.id !== id));
  };

  /* ------------- Ações: CATEGORIA ------------- */
  const onCreateCategoria = async () => {
    setErrCategoria('');
    const categoria = categoriaInput.trim();
    if (!categoria) {
      setErrCategoria('Informe a categoria.');
      return;
    }
    setSavingCategoria(true);
    const res = await upsertCategoriaAction({ categoria }); // sends "categoria"
    setSavingCategoria(false);
    if (!res.ok) {
      setErrCategoria(res.message || 'Erro ao salvar categoria.');
      return;
    }
    // UI otimista: adiciona na lista local
    const newCategoria = { 
      id: (res.data as any)?.id ?? Date.now(), 
      categoria: categoria 
    };
    setCategorias(prev => [...prev, newCategoria]);
    setCategoriaInput('');
  };

  const onDeleteCategoria = async (id: number) => {
    setErrCategoria('');
    const res = await deleteCategoriaAction(id);
    if (!res.ok) {
      setErrCategoria(res.message || 'Erro ao deletar categoria.');
      return;
    }
    setCategorias(prev => prev.filter(c => c.id !== id));
  };

  /* ----------------- UI ----------------- */
  return (
    <div className="min-h-screen bg-[#e9f3f6]">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-extrabold text-[#17686f] mb-4">Configuração</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ---------- SETORES ---------- */}
          <Card title="Setores" error={errSetor}>
            <div className="flex gap-3 mb-3">
              <input
                value={setorInput}
                onChange={(e) => setSetorInput(e.target.value)}
                placeholder="Nome do setor"
                className="flex-1 border border-[#0c6b77] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0c6b77]"
                onKeyPress={(e) => e.key === 'Enter' && onCreateSetor()}
              />
              <button
                onClick={onCreateSetor}
                disabled={savingSetor}
                className="bg-[#0c6b77] text-white px-4 py-2 rounded hover:bg-[#095761] disabled:opacity-60"
              >
                {savingSetor ? 'Salvando...' : 'Cadastrar'}
              </button>
            </div>

            <Table
              headers={['Setor', 'Ações']}
              rows={setores.map(s => ({
                key: `setor-${s.id}`,
                cols: [
                  <span className="font-medium" key="n">{s.setor}</span>,
                  <Actions
                    key="a"
                    onEdit={() => {
                      setSetorInput(s.setor);
                      onDeleteSetor(s.id);
                    }}
                    onDelete={() => onDeleteSetor(s.id)}
                  />,
                ],
              }))}
              loading={loading}
              empty="Nenhum setor cadastrado."
            />

            <div className="flex justify-end mt-3">
              <button
                onClick={() => setSetorInput('')}
                className="bg-[#0c6b77] text-white px-5 py-2 rounded hover:bg-[#095761]"
              >
                Novo
              </button>
            </div>
          </Card>

          {/* ------ FORMAS DE PAGAMENTO ------ */}
          <Card title="Pagamentos" error={errPagamento}>
            <div className="flex gap-3 mb-3">
              <input
                value={pagamentoInput}
                onChange={(e) => setPagamentoInput(e.target.value)}
                placeholder="Ex.: PIX, Cartão..."
                className="flex-1 border border-[#0c6b77] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0c6b77]"
                onKeyPress={(e) => e.key === 'Enter' && onCreatePagamento()}
              />
              <button
                onClick={onCreatePagamento}
                disabled={savingPagamento}
                className="bg-[#0c6b77] text-white px-4 py-2 rounded hover:bg-[#095761] disabled:opacity-60"
              >
                {savingPagamento ? 'Salvando...' : 'Cadastrar'}
              </button>
            </div>

            <Table
              headers={['Setor', 'Ações']}
              rows={pagamentos.map(p => ({
                key: `pay-${p.id}`,
                cols: [
                  <span className="font-medium" key="n">{p.tipo}</span>, {/* Fixed: display 'tipo' field */}
                  <Actions
                    key="a"
                    onEdit={() => {
                      setPagamentoInput(p.tipo);
                      onDeletePagamento(p.id);
                    }}
                    onDelete={() => onDeletePagamento(p.id)}
                  />,
                ],
              }))}
              loading={loading}
              empty="Nenhuma forma de pagamento."
            />

            <div className="flex justify-end mt-3">
              <button
                onClick={() => setPagamentoInput('')}
                className="bg-[#0c6b77] text-white px-5 py-2 rounded hover:bg-[#095761]"
              >
                Novo
              </button>
            </div>
          </Card>

          {/* ---------- CATEGORIAS ---------- */}
          <Card title="Categorias" error={errCategoria}>
            <div className="flex gap-3 mb-3">
              <input
                value={categoriaInput}
                onChange={(e) => setCategoriaInput(e.target.value)}
                placeholder="Ex.: Luz, Água..."
                className="flex-1 border border-[#0c6b77] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0c6b77]"
                onKeyPress={(e) => e.key === 'Enter' && onCreateCategoria()}
              />
              <button
                onClick={onCreateCategoria}
                disabled={savingCategoria}
                className="bg-[#0c6b77] text-white px-4 py-2 rounded hover:bg-[#095761] disabled:opacity-60"
              >
                {savingCategoria ? 'Salvando...' : 'Cadastrar'}
              </button>
            </div>

            <Table
              headers={['Categoria', 'Ações']}
              rows={categorias.map(c => ({
                key: `cat-${c.id}`,
                cols: [
                  <span className="font-medium" key="n">{c.categoria}</span>,
                  <Actions
                    key="a"
                    onEdit={() => {
                      setCategoriaInput(c.categoria);
                      onDeleteCategoria(c.id);
                    }}
                    onDelete={() => onDeleteCategoria(c.id)}
                  />,
                ],
              }))}
              loading={loading}
              empty="Nenhuma categoria."
            />

            <div className="flex justify-end mt-3">
              <button
                onClick={() => setCategoriaInput('')}
                className="bg-[#0c6b77] text-white px-5 py-2 rounded hover:bg-[#095761]"
              >
                Novo
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ==================== UI helpers ==================== */

function Card({
  title, children, error,
}: { title: string; children: React.ReactNode; error?: string }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-4">
      <h2 className="text-xl font-semibold text-[#17686f] mb-3">{title}</h2>
      {error ? (
        <div className="mb-3 border border-red-200 text-red-700 bg-red-50 px-3 py-2 rounded">{error}</div>
      ) : null}
      {children}
    </div>
  );
}

function Table({
  headers,
  rows,
  loading,
  empty,
}: {
  headers: string[];
  rows: { key: string | number; cols: React.ReactNode[] }[];
  loading?: boolean;
  empty?: string;
}) {
  return (
    <div className="overflow-x-auto rounded-md">
      <table className="min-w-full text-sm text-left border-collapse">
        <thead className="bg-[#1c7d87] text-white">
          <tr>
            {headers.map((h, i) => (
              <th key={`h-${i}`} className="px-3 py-2">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={headers.length} className="px-3 py-3 text-gray-500">Carregando...</td></tr>
          ) : rows.length === 0 ? (
            <tr><td colSpan={headers.length} className="px-3 py-3 text-gray-500">{empty}</td></tr>
          ) : (
            rows.map(r => (
              <tr key={r.key} className="even:bg-[#c4f9ff]">
                {r.cols.map((c, i) => (
                  <td key={`${r.key}-${i}`} className="px-3 py-2">{c}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function Actions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="space-x-3">
      <button onClick={onEdit} className="text-[#007cb2] hover:underline">Editar</button>
      <button onClick={onDelete} className="text-red-600 hover:underline">Deletar</button>
    </div>
  );
}