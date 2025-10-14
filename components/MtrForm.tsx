'use client';

import { useState, useRef, useEffect } from "react";
import { consultarMtrServer } from "./action";
import jsPDF from "jspdf";
import Logo from "../assets/img/logoCRVR.jpeg";
import { useAuth } from "../context/AuthContext";

export default function MtrForm() {
  const [mtr, setMtr] = useState("");
  const [resultados, setResultados] = useState<any[]>([]);
  const [erroInput, setErroInput] = useState("");
  const [gerandoPDF, setGerandoPDF] = useState(false);
  const [ordenacao, setOrdenacao] = useState<'decrescente' | 'crescente'>('decrescente');
  const { user } = useAuth();

  const filaRef = useRef<string[]>([]);
  const processandoRef = useRef(false);
  const emProcessamentoRef = useRef<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const processarFila = async () => {
    if (processandoRef.current || filaRef.current.length === 0) return;
    processandoRef.current = true;

    const proximo = filaRef.current.shift();
    if (!proximo) {
      processandoRef.current = false;
      return;
    }

    try {
      const res = await consultarMtrServer(proximo, user);

      // Monta o item-base (com ou sem dados válidos)
      let novoItem: any;

      if (res?.erro && !res.data) {
        // Caso de erro de consulta (sem data)
        novoItem = {
          data: { numeroMTR: proximo },
          validation: { code: 999, message: res?.mensagem ?? 'Erro na consulta' },
          validacaoData: null,
        };
      } else {
        // Caso de sucesso (ou retorno com data)
        const numeroMTR = res?.data?.numeroMTR ?? proximo;

        // Validação de data de emissão (dd/mm/yyyy)
        let validacaoData: { code: number; message: string } | null = null;
        const dataEmissao = res?.data?.dataTransporte;
        if (dataEmissao) {
          const [dia, mes, ano] = dataEmissao.split('/').map(Number);
          const dataEmissaoDate = new Date(ano, mes - 1, dia);
          const hoje = new Date();
          const hojeNormalizado = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
          const diffDias = Math.floor(
            (hojeNormalizado.getTime() - dataEmissaoDate.getTime()) / (1000 * 60 * 60 * 24)
          );

          const emissaoISO = new Date(ano, mes - 1, dia).toISOString().split('T')[0];
          const hojeISO = hojeNormalizado.toISOString().split('T')[0];

          console.log(hojeISO)
          console.log(emissaoISO, 'emissao')

          if (emissaoISO > hojeISO) {
            validacaoData = { code: 1001, message: 'Data de emissão no futuro' };
          } else if (diffDias > 30) {
            validacaoData = { code: 1002, message: 'Data de emissão superior a 30 dias' };
          }
        }

        novoItem = {
          ...res,
          data: { ...(res?.data ?? {}), numeroMTR },
          validacaoData,
        };
      }

      // Insere com ordem calculada a partir do estado anterior (sem pular)
      setResultados(prev => {
        // Anti-duplicata por número MTR
        const numero = novoItem?.data?.numeroMTR;
        if (numero && prev.some(i => i?.data?.numeroMTR === numero)) {
          return prev; // já existe → não insere nem mexe na ordem
        }

        const ultimaOrdem = prev.length > 0 ? (prev[prev.length - 1].ordem ?? 0) : 0;
        const ordem = ultimaOrdem + 1;

        return [...prev, { ...novoItem, ordem }];
      });
    } catch (error) {
      console.error('Erro ao consultar MTR:', error);

      // Mesmo no erro, calcula ordem com base no estado atual
      setResultados(prev => {
        const ultimaOrdem = prev.length > 0 ? (prev[prev.length - 1].ordem ?? 0) : 0;
        const ordem = ultimaOrdem + 1;

        return [
          ...prev,
          {
            data: { numeroMTR: proximo },
            validation: { code: 998, message: 'Erro ao consultar MTR' },
            validacaoData: null,
            ordem,
          },
        ];
      });
    } finally {
      emProcessamentoRef.current.delete(proximo);
      processandoRef.current = false;
      setTimeout(processarFila, 100);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErroInput("");

    const codigo = mtr.trim().replace(/\D/g, "").slice(0, 10);
    if (!codigo) {
      setErroInput("O número do MTR é obrigatório.");
      setMtr("");
      return;
    }

    const jaExiste =
      resultados.some((item) => item?.data?.numeroMTR === codigo) ||
      filaRef.current.includes(codigo) ||
      emProcessamentoRef.current.has(codigo);

    if (jaExiste) {
      setErroInput(`O MTR #${codigo} já foi consultado ou está em processamento.`);
      setMtr("");
      return;
    }

    emProcessamentoRef.current.add(codigo);
    filaRef.current.push(codigo);
    setMtr("");
    processarFila();
  };

  const limparResultados = () => setResultados([]);


  const removerMtr = (numeroMTR: string) => {
    setResultados(prev => prev.filter(item => item.data.numeroMTR !== numeroMTR));
    // Não alteramos o contadorOrdemRef para manter a consistência dos itens restantes
  };

  const toggleOrdenacao = () => {
    setOrdenacao(prev => prev === 'decrescente' ? 'crescente' : 'decrescente');
  };

  // Ordenação visual sem alterar a ordem lógica
  const resultadosOrdenados = [...resultados].sort((a, b) => {
    return ordenacao === 'decrescente'
      ? b.ordem - a.ordem // Mais recentes primeiro (maior ordem)
      : a.ordem - b.ordem; // Mais antigos primeiro (menor ordem)
  });


  const gerarPDFCompleto = () => {
  setGerandoPDF(true);

  const doc = new jsPDF();
  const mtrs = [...resultados].sort((a, b) => a.ordem - b.ordem);

  if (mtrs.length === 0) {
    alert("Nenhum MTR disponível para gerar o relatório completo!");
    setGerandoPDF(false);
    return;
  }

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const lineHeight = 7;
  const colWidth = (pageWidth - margin * 2) / 4;
  const maxLinesPerCol = Math.floor((pageHeight - margin * 2 - 30) / lineHeight);

  try {
    if (Logo?.src) {
      doc.saveGraphicsState();
      const gState = new (doc as any).GState({ opacity: 0.1 });
      doc.setGState(gState);
      doc.addImage(
        Logo.src,
        "JPEG",
        (pageWidth - 100) / 2,
        (pageHeight - 100) / 2,
        100,
        100,
        undefined,
        "NONE"
      );
      doc.restoreGraphicsState();
    }
  } catch (error) {
    console.error("Erro ao adicionar logo:", error);
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("RELATÓRIO COMPLETO DE MTRs", pageWidth / 2, margin, { align: "center" });

  const hoje = new Date();
  const dataFormatada = hoje.toLocaleDateString("pt-BR");
  const horaFormatada = hoje.getHours().toString().padStart(2, "0");
  const minutosFormatado = hoje.getMinutes().toString().padStart(2, "0");
  doc.setFontSize(10);

  let currentCol = 0;
  let currentLine = 0;
  let yPosition = margin + 25;
  const colsWithContent = new Set<number>();

  const addHeaders = (y: number) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    for (let c = 0; c < 4; c++) {
      if (colsWithContent.has(c)) {
        const x = margin + c * colWidth;
        doc.text("Nº CÓDIGO MTR", x, y);
      }
    }
    doc.setFont("helvetica", "normal");
  };

  doc.setFontSize(10);
  mtrs.forEach((r, idx) => {
    if (currentLine >= maxLinesPerCol) {
      currentCol++;
      currentLine = 0;
      if (currentCol > 3) {
        doc.addPage();
        currentCol = 0;
        yPosition = margin + 25;
        colsWithContent.clear();
      } else {
        yPosition = margin + 25;
      }
    }

    colsWithContent.add(currentCol);
    const xPosition = margin + currentCol * colWidth;

    if (currentLine === 0) addHeaders(yPosition - lineHeight - 2);

    const status =
      r.validation?.message ??
      (r.validation?.code ? `Erro ${r.validation.code}` : "Desconhecido");
    const dataMsg = r.validacaoData?.message ? ` (${r.validacaoData.message})` : "";

    doc.text(
      `${idx + 1}. ${r.data.numeroMTR} - ${status}${dataMsg}`,
      xPosition,
      yPosition
    );

    yPosition += lineHeight;
    currentLine++;
  });

  doc.text(
    `Emitido em: ${dataFormatada}, ${horaFormatada}:${minutosFormatado}`,
    margin,
    pageHeight - margin
  );

  doc.save(`Relatorio_Completo_MTRs_${dataFormatada.replace(/\//g, "-")}.pdf`);
  setGerandoPDF(false);
};

  

  const gerarPDF = () => {
    setGerandoPDF(true);

    const doc = new jsPDF();
    const mtrsValidos = [...resultados]
      .filter((r) => r.validation?.code === 200 && !r.validacaoData)
      .sort((a, b) => a.ordem - b.ordem); // Ordena por ordem decrescente no PDF

    if (mtrsValidos.length === 0) {
      alert("Não há MTRs válidos para gerar o relatório!");
      setGerandoPDF(false);
      return;
    }

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const lineHeight = 7;
    const colWidth = (pageWidth - margin * 2) / 4;
    const maxLinesPerCol = Math.floor((pageHeight - margin * 2 - 30) / lineHeight);

    try {
      if (Logo?.src) {
        doc.saveGraphicsState();
        const gState = new (doc as any).GState({ opacity: 0.1 });
        doc.setGState(gState);
        doc.addImage(
          Logo.src,
          'JPEG',
          (pageWidth - 100) / 2,
          (pageHeight - 100) / 2,
          100,
          100,
          undefined,
          'NONE'
        );
        doc.restoreGraphicsState();
      }
    } catch (error) {
      console.error("Erro ao adicionar logo:", error);
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(40, 40, 40);
    doc.text("RELATÓRIO DE MTRs", pageWidth / 2, margin, { align: 'center' });

    const hoje = new Date();
    const dataFormatada = hoje.toLocaleDateString('pt-BR');
    const horaFormatada = hoje.getHours().toString().padStart(2, '0');
    const minutosFormatado = hoje.getMinutes().toString().padStart(2, '0');
    doc.setFontSize(10);

    doc.setDrawColor(200, 200, 200);

    let currentPage = 1;
    let currentCol = 0;
    let currentLine = 0;
    const colsWithContent = new Set<number>();

    const addConditionalHeaders = (y: number) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      for (let c = 0; c < 4; c++) {
        if (colsWithContent.has(c)) {
          const x = margin + (c * colWidth);
          doc.text("Nº CÓDIGO MTR", x, y);
        }
      }
      doc.setFont("helvetica", "normal");
    };

    let yPosition = margin + 25;

    doc.setFontSize(10);

    mtrsValidos.forEach((r, idx) => {
      if (currentLine >= maxLinesPerCol) {
        currentCol++;
        currentLine = 0;
        if (currentCol > 3) {
          doc.addPage();
          currentPage++;
          currentCol = 0;
          yPosition = margin + 25;
          colsWithContent.clear();
        } else {
          yPosition = margin + 25;
        }
      }

      colsWithContent.add(currentCol);

      const xPosition = margin + (currentCol * colWidth);
      if (currentLine === 0) {
        addConditionalHeaders(yPosition - lineHeight - 2);
      }

      doc.text(`${idx + 1}. ${r.data.numeroMTR}`, xPosition, yPosition);

      yPosition += lineHeight;
      currentLine++;
    });

    doc.setPage(currentPage);
    let footerY = pageHeight - margin - 8;
    if (yPosition > footerY - 20) {
      doc.addPage();
      footerY = pageHeight - margin - 15;
    }

    doc.setDrawColor(200, 200, 200);
    footerY += lineHeight;

    doc.setFontSize(16);
    doc.text("Assinatura do Motorista: ________________________________________", margin, footerY);
    footerY += lineHeight;
    doc.text(`Data: ${dataFormatada}, ${horaFormatada}:${minutosFormatado}`, margin, footerY);

    doc.save(`Relatorio_MTRs_${dataFormatada.replace(/\//g, '-')}.pdf`);
    setGerandoPDF(false);
  };

  return (
    <div className="w-full px-4 mt-8">
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-4">
        <input
          ref={inputRef}
          type="text"
          placeholder="Digite ou bip o código de barras do MTR"
          value={mtr}
          onChange={(e) => setMtr(e.target.value)}
          className={`w-full p-3 mb-[5px] border rounded-md focus:outline-none focus:ring-2 
            ${erroInput ? "border-red-500 focus:ring-red-500" : "border-gray-300"}`}
          style={
            erroInput
              ? {}
              : {
                ['--tw-ring-color' as any]: '#293f58',
                borderColor: '#293f58',
              }
          }
        />

        {erroInput && <p className="text-red-500 text-sm mt-1">{erroInput}</p>}

        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            className="flex-1 bg-[#293f58] text-white py-3 rounded-md hover:bg-blue-700 transition cursor-pointer"
          >
            Adicionar
          </button>
          <button
            type="button"
            onClick={limparResultados}
            disabled={resultados.length === 0}
            className={`flex-1 py-3 rounded-md transition cursor-pointer ${resultados.length > 0
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
          >
            Limpar Lista
          </button>
          <button
            type="button"
            onClick={toggleOrdenacao}
            disabled={resultados.length === 0}
            className={`flex-1 py-3 rounded-md transition cursor-pointer ${resultados.length > 0
              ? 'bg-[#293f58] text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
          >
            {ordenacao === 'decrescente' ? 'Mais Antigos ↑' : 'Mais Recentes ↓'}
          </button>
          <button
            type="button"
            onClick={gerarPDF}
            disabled={resultados.filter(r => r.validation?.code === 200 && !r.validacaoData).length === 0 || gerandoPDF}
            className={`flex-1 py-3 rounded-md transition flex items-center justify-center cursor-pointer ${resultados.filter(r => r.validation?.code === 200 && !r.validacaoData).length > 0
              ? 'bg-[#293f58] text-white hover:bg-green-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
          >
            {gerandoPDF ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Gerando...
              </>
            ) : (
              'Gerar Relatório (PDF)'
            )}
          </button>
          <button
  type="button"
  onClick={gerarPDFCompleto}
  disabled={resultados.length === 0 || gerandoPDF}
  className={`flex-1 py-3 rounded-md transition flex items-center justify-center cursor-pointer ${
    resultados.length > 0
      ? "bg-[#555555] text-white hover:bg-gray-700"
      : "bg-gray-300 text-gray-500 cursor-not-allowed"
  }`}
>
  {gerandoPDF ? (
    <>
      <svg
        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      Gerando...
    </>
  ) : (
    "Gerar Relatório Completo (com erros)"
  )}
</button>

        </div>
      </form>

      <div className="mt-8 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {resultadosOrdenados.map((resultado) => (
          resultado?.data && resultado?.validation && (
            <div
              key={`${resultado.data.numeroMTR}-${resultado.ordem}`} // Chave única com ordem
              className={`bg-white border rounded-lg shadow-sm p-5 w-full hover:shadow-md transition relative ${resultado.validation.code === 200
                ? resultado.validacaoData
                  ? 'border-yellow-200'
                  : 'border-green-200'
                : 'border-red-200'
                }`}
            >
              <div className="absolute -top-2 -left-2 bg-[#293f58] text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                {resultado.ordem}
              </div>

              <button
                onClick={() => removerMtr(resultado.data.numeroMTR)}
                className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                title="Remover MTR"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>

              <div className="flex items-center justify-between flex-wrap gap-2 mt-1">
                <h3 className="text-base font-bold text-gray-800">
                  Manifesto #{resultado.data.numeroMTR ?? "N/A"}
                </h3>

                <div className="flex flex-col gap-1 items-end mr-6">
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-medium ${resultado.validation.code === 200
                      ? resultado.validacaoData
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-600'
                      }`}
                  >
                    {resultado.validation.message ?? "Status desconhecido"}
                  </span>

                  {resultado.validacaoData && (
                    <span className="text-xs px-3 py-1 bg-orange-100 text-orange-800 rounded-full font-medium">
                      {resultado.validacaoData.message}
                    </span>
                  )}
                </div>
              </div>

              {(resultado.validation.code !== 200 || resultado.validacaoData) && (
                <>
                  <hr className="my-3" />

                  <div className="grid grid-cols-1 gap-1 text-sm text-gray-700">
                    <p>
                      <span className="font-medium">Data de Emissão:</span>{" "}
                      {resultado.data.dataEmissao ?? "Não informada"}
                    </p>
                    <p>
                      <span className="font-medium">Data de Recebimento:</span>{" "}
                      {resultado.data.dataRecebimento ?? "Ainda não recebido"}
                    </p>
                  </div>
                </>
              )}
            </div>
          )
        ))}
      </div>
    </div>
  );
}


