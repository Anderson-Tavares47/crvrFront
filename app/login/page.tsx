'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { loginUser as loginServer } from '../../core/login';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../assets/img/logoLogin.png';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { loginUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Preencha todos os campos');
      return;
    }

    setLoading(true);
    try {
      const data = await loginServer(username, password);

      if (!data.success) {
        setError(data.message || 'Credenciais inválidas');
        return;
      }

      loginUser(data.user); // 🔹 Usa o contexto (que agora já criptografa internamente)
      router.push('/dashboard');
    } catch (err) {
      console.error('Erro no login:', err);
      setError('Erro de conexão com o servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#293f58]">
      <div className="w-full max-w-md p-8 space-y-6 bg-[#9ba7b5] rounded-lg shadow-sm border border-gray-200">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Image src={Logo} alt="Logo do Sistema" priority className="object-contain" />
          </div>
          <p className="text-sm text-gray-600">Sistema de Gerenciamento de MTRs</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded text-sm">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Usuário (Login)
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm focus:ring-2 focus:ring-[#293f58]/50"
              placeholder="Digite seu usuário"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm focus:ring-2 focus:ring-[#293f58]/50"
              placeholder="Digite sua senha"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 px-4 rounded-md text-sm font-medium text-white bg-[#293f58] hover:bg-[#1e2d3f] transition-colors ${loading ? 'opacity-80 cursor-not-allowed' : ''
              }`}
          >
            {loading ? 'Acessando...' : 'Entrar'}
          </button>
        </form>

        <div className="text-center text-xs text-gray-500 mt-4">
          <p>Acesso permitido apenas para usuários cadastrados</p>
        </div>
      </div>
    </div>
  );
}
