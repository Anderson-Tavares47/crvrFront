'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Logo from '../../assets/img/logoLogin.png';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const authorizedUsers = [
    { username: 'operador1', password: 'senhaSegura123' },
    { username: 'operador2', password: 'outraSenha456' },
    { username: '02661308016', password: 'saoleopoldo2021' },
  ];

  // Função para gerar hash SHA-256
  const generateSHA256Hash = async (str: string): Promise<string> => {
    // Converte a string para um ArrayBuffer
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return hashHex;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username.trim() || !password.trim()) {
      setError('Preencha todos os campos');
      return;
    }

    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 800)); 

      const userExists = authorizedUsers.some(
        user => user.username === username && user.password === password
      );

      if (userExists) {
        const token = await generateSHA256Hash(`${username}-${Date.now()}`);
        
        localStorage.setItem('authToken', token);
        
        localStorage.setItem('username', username);
        
        router.push('/dashboard');
      } else {
        setError('Credenciais inválidas ou usuário não autorizado');
      }
    } catch (err) {
      setError('Erro durante o acesso. Tente novamente.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#293f58]">
      <div className="w-full max-w-md p-8 space-y-6 bg-[#9ba7b5] rounded-lg shadow-sm border border-gray-200">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Image 
              src={Logo} 
              alt="Logo do Sistema" 
              priority
              className="object-contain"
            />
          </div>
          <p className="text-sm text-gray-600">
            Sistema de Gerenciamento de MTRs
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded text-sm">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-600 mb-1">
              Usuário
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#293f58]/50 focus:border-[#293f58]/70 bg-white/70"
              placeholder="Digite seu usuário"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-600 mb-1">
              Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#293f58]/50 focus:border-[#293f58]/70 bg-white/70"
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#293f58] hover:bg-[#1e2d3f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#293f58]/50 transition-colors ${
                loading ? 'opacity-80 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Acessando...
                </>
              ) : 'Entrar'}
            </button>
          </div>
        </form>

        <div className="text-center text-xs text-gray-500 mt-4">
          <p>Acesso permitido apenas para usuários cadastrados</p>
        </div>
      </div>
    </div>
  );
}
