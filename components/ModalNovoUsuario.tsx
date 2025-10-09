'use client';

import { useState, useEffect } from "react";
import { cadastrarUsuario } from "./action";
import CryptoJS from "crypto-js";

interface ModalNovoUsuarioProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ModalNovoUsuario({ isOpen, onClose }: ModalNovoUsuarioProps) {
  const [form, setForm] = useState({
    nome: "",
    login: "",
    senha: "",
    cnp: "", // será travado com o CNP do admin
    adm: false,
  });
  const [loading, setLoading] = useState(false);
  const SECRET_KEY = "crvr_app_2025_secret";

  useEffect(() => {
    // 🔹 Ao abrir, busca o CNP do admin logado no localStorage
    const stored = localStorage.getItem("authUser");
    if (stored) {
      try {
        const bytes = CryptoJS.AES.decrypt(stored, SECRET_KEY);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        const user = JSON.parse(decrypted);

        if (user?.cnp) {
          setForm((prev) => ({ ...prev, cnp: user.cnp }));
        }
      } catch (err) {
        console.error("Erro ao recuperar CNP do admin:", err);
      }
    }
  }, []);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await cadastrarUsuario(form);
    setLoading(false);

    if (result.success) {
      alert("✅ Usuário criado com sucesso!");
      onClose();
    } else {
      alert(result.message || "❌ Erro ao criar usuário.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
        <h2 className="text-xl font-semibold mb-4 text-[#293f58]">
          Cadastrar Novo Usuário
        </h2>

        {/* ⚠️ Aviso importante */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 text-sm p-3 rounded-md mb-4">
          <strong>Atenção:</strong> os dados de <strong>login</strong> e <strong>senha </strong> 
          devem ser exatamente os mesmos utilizados para acessar o portal da <strong>FEPAM</strong>.
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nome</label>
            <input
              type="text"
              name="nome"
              value={form.nome}
              onChange={handleChange}
              placeholder="Nome completo"
              required
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#293f58]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Login</label>
            <input
              type="text"
              name="login"
              value={form.login}
              onChange={handleChange}
              placeholder="Ex: 02661308016"
              required
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#293f58]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Senha</label>
            <input
              type="password"
              name="senha"
              value={form.senha}
              onChange={handleChange}
              placeholder="Digite a senha"
              required
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#293f58]"
            />
          </div>

          {/* Campo CNP travado */}
          <div>
            <label className="block text-sm font-medium text-gray-700">CNP</label>
            <input
              type="text"
              name="cnp"
              value={form.cnp}
              readOnly
              className="w-full border border-gray-200 bg-gray-100 rounded-md p-2 text-gray-600 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">
              (CNPJ vinculado automaticamente ao administrador)
            </p>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              name="adm"
              checked={form.adm}
              onChange={handleChange}
              className="rounded text-[#293f58]"
            />
            Usuário administrador
          </label>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-[#293f58] text-white rounded-md hover:bg-[#1f3146] transition disabled:opacity-50"
            >
              {loading ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
