'use server';

import { buscarManifestoMTR } from "../core/consultaMtr";
import { enviarMtrLote } from "../core/enviarMtr";
import { listarHistorico, salvarHistorico } from "../core/historico";
import { obterListaAcondicionamento, obterListaClasse, obterListaEstadoFisico, obterListaResiduo, obterListaTecnologia, obterListaUnidades, obterTodasListasSafe } from "../core/listas";
import { criarUsuario, excluirUsuario, listarUsuarios } from "../core/usuarios";

export async function consultarMtrServer(numeroMtr: string, user: any) {
  const resultado = await buscarManifestoMTR(numeroMtr, user);
  return resultado;
}

export async function buscarListas() {
  try {
    const [
      unidades,
      residuos,
      classes,
      estadosFisicos,
      acondicionamentos,
      tecnologias
    ] = await Promise.all([
      obterListaUnidades(),
      obterListaResiduo(),
      obterListaClasse(),
      obterListaEstadoFisico(),
      obterListaAcondicionamento(),
      obterListaTecnologia()
    ]);

    return {
      unidades,
      residuos,
      classes,
      estadosFisicos,
      acondicionamentos,
      tecnologias
    };
  } catch (error) {
    console.error("Erro ao buscar listas:", error);
    throw error;
  }
}


export async function enviarMtr(payload: any) {
  try {
    const resultado = await enviarMtrLote(payload);
    return { success: true, data: resultado };
  } catch (error: any) {
    return { success: false, message: error?.response?.data || error.message };
  }
}

export async function buscarListasUnificada(user: any) {
  return await obterTodasListasSafe(user);
}


// 🔹 SALVAR HISTÓRICO DE BAIXAS (suporta 1 ou vários registros)
export async function salvarHistoricoBaixa(dados: 
  | { mtr: string; usuario: string; dataBaixa: string } 
  | { mtr: string; usuario: string; dataBaixa: string }[]
) {
  try {
    const payload = Array.isArray(dados) ? dados : [dados]; // garante array sempre
    const response = await salvarHistorico(payload);
    return response;
  } catch (error) {
    console.error("Erro ao salvar histórico:", error);
    return { success: false, message: "Falha ao registrar histórico" };
  }
}


export async function buscarHistoricoBaixas(pagina = 1, porPagina = 10) {
  try {
    const data = await listarHistorico(pagina, porPagina);

    // 🔹 Garante estrutura consistente
    return {
      success: true,
      data: {
        items: Array.isArray(data.items) ? data.items : [],
        totalPaginas: data.totalPaginas ?? 1,
        total: data.total ?? 0,
      },
    };
  } catch (error: any) {
    console.error("Erro ao buscar histórico:", error);
    return {
      success: false,
      message: error?.message || "Erro ao listar histórico",
      data: { items: [], totalPaginas: 1, total: 0 },
    };
  }
}



export async function cadastrarUsuario(payload: {
  nome: string;
  login: string;
  senha: string;
  cnp: string;
  adm?: boolean;
}) {
  return await criarUsuario(payload);
}

export async function buscarUsuarios() {
  return await listarUsuarios();
}

export async function deletarUsuario(id: number) {
  return await excluirUsuario(id);
}