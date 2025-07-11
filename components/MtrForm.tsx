'use client';

import { useState, useRef, useEffect } from "react";
import { consultarMtrServer } from "./action";
import jsPDF from "jspdf";
import Logo from "../assets/img/logoCRVR.jpeg";

export default function MtrForm() {
  const [mtr, setMtr] = useState("");
  const [resultados, setResultados] = useState<any[]>([]);
  const [erroInput, setErroInput] = useState("");
  const [gerandoPDF, setGerandoPDF] = useState(false);

  const filaRef = useRef<string[]>([]);
  const processandoRef = useRef(false);
  const emProcessamentoRef = useRef<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null); // Ref para foco automático

  useEffect(() => {
    inputRef.current?.focus(); // Focar o input ao carregar
  }, []);

  const processarFila = async () => {
    if (processandoRef.current || filaRef.current.length === 0) return;
    processandoRef.current = true;

    const proximo = filaRef.current.shift();
    if (proximo) {
      try {
        const res = await consultarMtrServer(proximo);

        if (res?.erro && !res.data) {
          setResultados((prev) => [
            ...prev,
            {
              data: { numeroMTR: proximo },
              validation: { code: 999, message: res.mensagem },
            },
          ]);
        } else {
          const numeroMTR = res.data?.numeroMTR;
          const jaExiste = resultados.some(
            (item) => item?.data?.numeroMTR === numeroMTR
          );

          if (!jaExiste) {
            const dataEmissao = res.data?.dataEmissao;
            let validacaoData = null;

            function formatarDataBR(data: Date): string {
              const dia = String(data.getDate()).padStart(2, '0');
              const mes = String(data.getMonth() + 1).padStart(2, '0');
              const ano = data.getFullYear();
              return `${dia}/${mes}/${ano}`;
            }

            if (dataEmissao) {
              const [dia, mes, ano] = dataEmissao.split("/").map(Number);
              const dataEmissaoDate = new Date(ano, mes - 1, dia);
              const hoje = new Date();
              const hojeNormalizado = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
              const diffDias = Math.floor(
                (hoje.getTime() - dataEmissaoDate.getTime()) / (1000 * 60 * 60 * 24)
              );
              
              const dataEmissaoFormatada = formatarDataBR(dataEmissaoDate);
              const hojeFormatado = formatarDataBR(hojeNormalizado);

              if (dataEmissaoFormatada > hojeFormatado) {
                validacaoData = {
                  code: 1001,
                  message: "Data de emissão no futuro",
                };
              } else if (diffDias > 30) {
                validacaoData = {
                  code: 1002,
                  message: "Data de emissão superior a 30 dias",
                };
              }
            }

            setResultados((prev) => [
              ...prev,
              {
                ...res,
                validacaoData,
              },
            ]);
          }
        }
      } catch (error) {
        console.error("Erro ao consultar MTR:", error);
        setResultados((prev) => [
          ...prev,
          {
            data: { numeroMTR: proximo },
            validation: {
              code: 998,
              message: "Erro ao consultar MTR",
            },
          },
        ]);
      } finally {
        emProcessamentoRef.current.delete(proximo);
        processandoRef.current = false;
        setTimeout(processarFila, 100);
      }
    } else {
      processandoRef.current = false;
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

  const limparResultados = () => {
    setResultados([]);
  };


  const gerarPDF = () => {
    setGerandoPDF(true);

    const doc = new jsPDF();
    const mtrsValidos = resultados.filter(
      (r) => r.validation?.code === 200 && !r.validacaoData
    );

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
    const horaFormatada = hoje.getHours().toLocaleString('pt-BR')
    const minutosFormatado = hoje.getMinutes().toLocaleString('pt-BR')
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
    let footerY = pageHeight - margin - 15;
    if (yPosition > footerY - 20) {
      doc.addPage();
      footerY = pageHeight - margin - 15;
    }

    doc.setDrawColor(200, 200, 200);
    doc.line(margin, footerY, pageWidth - margin, footerY);
    footerY += lineHeight;

    doc.setFontSize(10);
    doc.text("Assinatura do Motorista: _______________________________________________________________________________________________________", margin, footerY);
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
          className={`w-full p-3 mb-[5px] border rounded-md focus:outline-none focus:ring-2 ${erroInput ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-600"}`}
        />
        {erroInput && <p className="text-red-500 text-sm mt-1">{erroInput}</p>}

        <div className="flex flex-wrap gap-4">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition"
          >
            Adicionar
          </button>
          <button
            type="button"
            onClick={limparResultados}
            disabled={resultados.length === 0}
            className={`flex-1 py-3 rounded-md transition ${resultados.length > 0
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
          >
            Limpar Lista
          </button>


          <button
            type="button"
            onClick={gerarPDF}
            disabled={resultados.filter(r => r.validation?.code === 200 && !r.validacaoData).length === 0 || gerandoPDF}
            className={`flex-1 py-3 rounded-md transition flex items-center justify-center ${resultados.filter(r => r.validation?.code === 200 && !r.validacaoData).length > 0
              ? 'bg-green-600 text-white hover:bg-green-700'
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
        </div>
      </form>

      <div className="mt-8 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {resultados.map((resultado, index) => (
          resultado?.data && resultado?.validation && (
            <div
              key={index}
              className={`bg-white border rounded-lg shadow-sm p-5 w-full hover:shadow-md transition ${resultado.validation.code === 200
                  ? resultado.validacaoData
                    ? 'border-yellow-200'
                    : 'border-green-200'
                  : 'border-red-200'
                }`}
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-base font-bold text-gray-800">
                  Manifesto #{resultado.data.numeroMTR ?? "N/A"}
                </h3>

                <div className="flex flex-col gap-1 items-end">
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
                    <p>
                      <span className="font-medium">Gerador:</span>{" "}
                      {resultado.data.gerador?.nome ?? "Desconhecido"}
                    </p>
                    <p>
                      <span className="font-medium">Município:</span>{" "}
                      {resultado.data.gerador?.municipio ?? "Desconhecido"}
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
