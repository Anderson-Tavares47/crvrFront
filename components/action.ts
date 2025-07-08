'use server';

import { buscarManifestoMTR } from "../core/consultaMtr";
import { obterListaAcondicionamento, obterListaClasse, obterListaEstadoFisico, obterListaResiduo, obterListaTecnologia, obterListaUnidades } from "../core/listas";

export async function consultarMtrServer(numeroMtr: string) {

  const resultado = await buscarManifestoMTR(numeroMtr);
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