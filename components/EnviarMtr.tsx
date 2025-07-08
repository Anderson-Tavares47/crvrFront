'use client';

import { useState, useEffect } from "react";
import { buscarListas } from "./action";
import { ChevronDown } from 'lucide-react'

interface ListaItem {
  [key: string]: any;
}

interface FormItem {
  codigoSequencial: number;
  justificativa: string | null;
  codigoInterno: string | null;
  qtdRecebida: string;
  residuo: string;
  codigoAcondicionamento: string;
  codigoClasse: string;
  codigoTecnologia: string;
  codigoTipoEstado: string;
  codigoUnidade: string;
  tipoDensidadeValor: string;
  tipoDensidadeUnidade: string | null;
}

interface FormData {
  manifestoCodigo: string;
  cnpGerador: string;
  cnpTransportador: string;
  recebimentoMtrResponsavel: string;
  recebimentoMtrCargo: string;
  recebimentoMtrData: string;
  transporteMtrData: string;
  recebimentoMtrObs: string;
  nomeMotorista: string;
  placaVeiculo: string;
  itemManifestoRecebimentoJSONs: FormItem[];
}

export default function FormularioRecebimentoMTR() {
  const [listas, setListas] = useState({
    unidades: [] as ListaItem[],
    residuos: [] as ListaItem[],
    classes: [] as ListaItem[],
    estadosFisicos: [] as ListaItem[],
    acondicionamentos: [] as ListaItem[],
    tecnologias: [] as ListaItem[]
  });

  const [loading, setLoading] = useState(true);
  const [openSelect, setOpenSelect] = useState<string | null>(null);

  const toggleSelect = (field: string) => {
    setOpenSelect(prev => prev === field ? null : field);
  };

  useEffect(() => {
    async function carregarListas() {
      try {
        const dados = await buscarListas();
        setListas({
          unidades: dados.unidades.unidades || [],
          residuos: dados.residuos.unidades || [],
          classes: dados.classes.unidades || [],
          estadosFisicos: dados.estadosFisicos.unidades || [],
          acondicionamentos: dados.acondicionamentos.unidades || [],
          tecnologias: dados.tecnologias.unidades || [],
        });
      } catch (error) {
        console.error("Erro ao carregar listas:", error);
      } finally {
        setLoading(false);
      }
    }
    carregarListas();
  }, []);

  const initialFormItem: FormItem = {
    codigoSequencial: 1,
    justificativa: null,
    codigoInterno: null,
    qtdRecebida: "",
    residuo: "",
    codigoAcondicionamento: "",
    codigoClasse: "",
    codigoTecnologia: "",
    codigoTipoEstado: "",
    codigoUnidade: "",
    tipoDensidadeValor: "",
    tipoDensidadeUnidade: null
  };

  const [form, setForm] = useState<FormData>({
    manifestoCodigo: "",
    cnpGerador: "",
    cnpTransportador: "",
    recebimentoMtrResponsavel: "",
    recebimentoMtrCargo: "",
    recebimentoMtrData: "",
    transporteMtrData: "",
    recebimentoMtrObs: "",
    nomeMotorista: "",
    placaVeiculo: "",
    itemManifestoRecebimentoJSONs: [initialFormItem]
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Validação dos campos principais
    if (!form.manifestoCodigo.trim()) newErrors.manifestoCodigo = "Código do manifesto é obrigatório";
    if (!form.cnpGerador.trim()) newErrors.cnpGerador = "CNPJ do gerador é obrigatório";
    if (!form.cnpTransportador.trim()) newErrors.cnpTransportador = "CNPJ do transportador é obrigatório";
    if (!form.recebimentoMtrResponsavel.trim()) newErrors.recebimentoMtrResponsavel = "Responsável pelo recebimento é obrigatório";
    if (!form.recebimentoMtrData) newErrors.recebimentoMtrData = "Data de recebimento é obrigatória";
    if (!form.transporteMtrData) newErrors.transporteMtrData = "Data de transporte é obrigatória";
    if (!form.nomeMotorista.trim()) newErrors.nomeMotorista = "Nome do motorista é obrigatório";
    if (!form.placaVeiculo.trim()) newErrors.placaVeiculo = "Placa do veículo é obrigatória";
    
    // Validação dos itens do manifesto
    const item = form.itemManifestoRecebimentoJSONs[0];
    if (!item.residuo) newErrors["item.residuo"] = "Código do resíduo é obrigatório";
    if (!item.codigoTecnologia) newErrors["item.codigoTecnologia"] = "Código da tecnologia é obrigatório";
    if (!item.qtdRecebida) newErrors["item.qtdRecebida"] = "Quantidade recebida é obrigatória";
    if (!item.codigoUnidade) newErrors["item.codigoUnidade"] = "Código da unidade é obrigatório";
    if (!item.codigoTipoEstado) newErrors["item.codigoTipoEstado"] = "Tipo de estado é obrigatório";
    if (!item.codigoClasse) newErrors["item.codigoClasse"] = "Código da classe é obrigatório";
    if (!item.codigoAcondicionamento) newErrors["item.codigoAcondicionamento"] = "Código de acondicionamento é obrigatório";
    
    // Validação condicional da densidade
    if (item.codigoUnidade === "1" || item.codigoUnidade === "2") {
      if (!item.tipoDensidadeValor) {
        newErrors["item.tipoDensidadeValor"] = "Valor da densidade é obrigatório para esta unidade";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name.startsWith("item.")) {
      const key = name.replace("item.", "");
      setForm(prev => ({
        ...prev,
        itemManifestoRecebimentoJSONs: [
          {
            ...prev.itemManifestoRecebimentoJSONs[0],
            [key]: key === 'codigoSequencial' ? Number(value) : 
                   (key === 'justificativa' || key === 'codigoInterno') ? (value || null) : value
          }
        ]
      }));
    } else {
      setForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Limpa o erro quando o campo é alterado
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();

  if (!validateForm()) return;

  const formatDate = (dateString: string) => {
  // Assume o formato YYYY-MM-DD (padrão do input type="date")
  const date = new Date(dateString);
  
  // Ajusta para o fuso horário local antes de extrair os componentes
  date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}${month}${day}`;
};

  // Preparar o payload no formato exato necessário
  const payload = {
    manifestoRecebimentoJSONs: [{
      manifestoCodigo: form.manifestoCodigo,
      cnpGerador: form.cnpGerador,
      cnpTransportador: form.cnpTransportador,
      recebimentoMtrResponsavel: form.recebimentoMtrResponsavel,
      recebimentoMtrCargo: form.recebimentoMtrCargo || null, // Envia null se vazio
      recebimentoMtrData: formatDate(form.recebimentoMtrData),
      transporteMtrData: formatDate(form.transporteMtrData),
      recebimentoMtrObs: form.recebimentoMtrObs || null, // Envia null se vazio
      nomeMotorista: form.nomeMotorista,
      placaVeiculo: form.placaVeiculo,
      itemManifestoRecebimentoJSONs: form.itemManifestoRecebimentoJSONs.map(item => ({
        codigoSequencial: item.codigoSequencial,
        justificativa: item.justificativa || null,
        codigoInterno: item.codigoInterno || null,
        qtdRecebida: Number(item.qtdRecebida),
        residuo: item.residuo,
        codigoAcondicionamento: Number(item.codigoAcondicionamento),
        codigoClasse: Number(item.codigoClasse),
        codigoTecnologia: Number(item.codigoTecnologia),
        codigoTipoEstado: Number(item.codigoTipoEstado),
        codigoUnidade: Number(item.codigoUnidade),
        tipoDensidadeValor: item.tipoDensidadeValor ? Number(item.tipoDensidadeValor) : null,
        tipoDensidadeUnidade: item.codigoUnidade === "1" ? "t/m³" :
                             item.codigoUnidade === "2" ? "g/cm³" : null
      }))
    }]
  };

  console.log("📦 Payload final:", JSON.stringify(payload, null, 2));

  // Exemplo de como enviar para a API:
  // const enviarParaAPI = async () => {
  //   try {
  //     const response = await fetch('/sua-api/recebimento-mtr', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify(payload)
  //     });

  //     if (!response.ok) {
  //       throw new Error('Erro ao enviar os dados');
  //     }

  //     const data = await response.json();
  //     console.log('✅ Resposta da API:', data);
  //     // Adicione aqui qualquer lógica de sucesso (redirecionamento, notificação, etc.)

  //   } catch (error) {
  //     console.error('Erro no envio:', error);
  //     // Adicione aqui tratamento de erro (notificação, etc.)
  //   }
  // };

  // // Chama a função para enviar
  // enviarParaAPI();
};

  if (loading) {
    return <div className="max-w-6xl mx-auto px-4 py-6">Carregando...</div>;
  }

  const renderSelectField = (
    label: string,
    name: string,
    list: ListaItem[],
    keyField: string,
    valueField: string,
    descField?: string
  ) => {
    const fieldKey = name;
    const currentValue = (form.itemManifestoRecebimentoJSONs[0] as any)[name.split('.')[1]];
    const error = errors[name];

    return (
      <div key={fieldKey} className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <div className="relative">
          <select
            name={name}
            value={currentValue}
            onChange={handleChange}
            onClick={() => toggleSelect(name)}
            className={`w-full p-2 pr-10 text-sm border appearance-none ${error ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
          >
            <option value="">Selecione...</option>
            {list.map((item: any) => (
              <option key={item[keyField]} value={item[keyField]}>
                {item[valueField]}{descField && ` - ${item[descField]}`}
              </option>
            ))}
          </select>
          <ChevronDown
            className={`absolute right-2 top-1/2 transform -translate-y-1/2 transition-transform ${openSelect === name ? 'rotate-180' : ''}`}
            size={18}
          />
        </div>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    );
  };

  const renderInputField = (
    label: string,
    name: string,
    type = "text",
    placeholder = "",
    required = false
  ) => {
    const error = errors[name];
    const value = name.startsWith("item.") 
      ? (form.itemManifestoRecebimentoJSONs[0] as any)[name.split('.')[1]]
      : (form as any)[name];

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && '*'}
        </label>
        <input
          name={name}
          type={type}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className={`w-full p-2 text-sm border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
        />
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Preencher Dados do Manifesto</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Seção de informações principais */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Informações do Manifesto</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {renderInputField("Código do Manifesto *", "manifestoCodigo", "text", "", true)}
            {renderInputField("CNPJ do Gerador *", "cnpGerador", "text", "Somente números", true)}
            {renderInputField("CNPJ do Transportador *", "cnpTransportador", "text", "Somente números", true)}
            {renderInputField("Responsável pelo Recebimento *", "recebimentoMtrResponsavel", "text", "", true)}
            {renderInputField("Cargo do Responsável", "recebimentoMtrCargo", "text")}
            {renderInputField("Data de Recebimento *", "recebimentoMtrData", "date", "", true)}
            {renderInputField("Data de Transporte *", "transporteMtrData", "date", "", true)}
            {renderInputField("Nome do Motorista *", "nomeMotorista", "text", "", true)}
            {renderInputField("Placa do Veículo *", "placaVeiculo", "text", "ABC-1234", true)}
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
              <textarea
                name="recebimentoMtrObs"
                value={form.recebimentoMtrObs}
                onChange={handleChange}
                className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={2}
              />
            </div>
          </div>
        </div>

        {/* Seção de itens do manifesto */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 relative">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Item do Manifesto</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Código do Resíduo */}
            <div className="md:col-span-2 relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Código do Resíduo *</label>
              <div className="relative">
                <select
                  name="item.residuo"
                  value={form.itemManifestoRecebimentoJSONs[0].residuo}
                  onChange={handleChange}
                  onClick={() => toggleSelect('residuo')}
                  className={`w-full p-2 pr-10 text-sm border appearance-none ${errors['item.residuo'] ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                >
                  <option value="">Selecione...</option>
                  {listas.residuos.map((residuo: any) => (
                    <option
                      key={residuo.tpre3Numero}
                      value={residuo.tpre3Numero}
                      title={`${residuo.tpre3Numero} - ${residuo.tpre3Descricao}`}
                      className="truncate"
                    >
                      {residuo.tpre3Numero} - {residuo.tpre3Descricao.length > 50
                        ? `${residuo.tpre3Descricao.substring(0, 50)}...`
                        : residuo.tpre3Descricao}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className={`absolute right-2 top-1/2 transform -translate-y-1/2 transition-transform ${openSelect === 'residuo' ? 'rotate-180' : ''}`}
                  size={18}
                />
              </div>
              {errors['item.residuo'] && (
                <p className="text-red-500 text-xs mt-1">{errors['item.residuo']}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">Passe o mouse sobre a opção para ver a descrição completa</p>
            </div>

            {renderInputField("Quantidade Recebida *", "item.qtdRecebida", "number", "", true)}
            
            {renderSelectField(
              "Unidade de Medida *",
              "item.codigoUnidade",
              listas.unidades,
              "tpuniCodigo",
              "tpuniSigla",
              "tpuniDescricao"
            )}
            
            {renderSelectField(
              "Estado Físico *",
              "item.codigoTipoEstado",
              listas.estadosFisicos,
              "tpestCodigo",
              "tpestSigla",
              "tpestDescricao"
            )}
            
            {renderSelectField(
              "Classe *",
              "item.codigoClasse",
              listas.classes,
              "tpclaCodigo",
              "tpclaSigla",
              "tpclaDescricao"
            )}
            
            {renderSelectField(
              "Acondicionamento *",
              "item.codigoAcondicionamento",
              listas.acondicionamentos,
              "tipoCodigo",
              "tipoDescricao"
            )}
            
            {renderSelectField(
              "Tecnologia *",
              "item.codigoTecnologia",
              listas.tecnologias,
              "tipoCodigo",
              "tipoDescricao"
            )}

            {/* Valor da Densidade - Condicional */}
            {(form.itemManifestoRecebimentoJSONs[0].codigoUnidade === "1" || form.itemManifestoRecebimentoJSONs[0].codigoUnidade === "2") && (
              renderInputField(
                "Valor da Densidade *",
                "item.tipoDensidadeValor",
                "number",
                "",
                true
              )
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <button 
            type="submit" 
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Enviar Manifesto
          </button>
        </div>
      </form>
    </div>
  );
}