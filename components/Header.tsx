'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Logo from '../assets/img/Logo.png';
import ModalNovoUsuario from './ModalNovoUsuario';

interface HeaderProps {
  user?: { nome: string; adm?: boolean };
}

export default function Header({ user }: HeaderProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleConsultMtr = () => router.push('/dashboard');
  const handleSendMtr = () => router.push('/receberManifesto');
  const handleHistorico = () => router.push('/historico');

  const handleLogout = () => {
    localStorage.removeItem('authUser');
    localStorage.removeItem('username');
    router.push('/login');
  };

  return (
    <>
      <header className="bg-[#293f58] text-white shadow-md">
        <div className="h-16 md:h-20 max-w-6xl mx-auto px-4">
          <div className="h-full flex items-center justify-between">
            {/* Logo */}
            <div
              className="flex items-center space-x-3 cursor-pointer"
              onClick={() => router.push('/dashboard')}
            >
              <Image src={Logo} alt="Logo" className="h-50 md:h-50 w-auto" priority />
            </div>

            {/* Menu principal */}
            <nav>
              <ul className="flex space-x-4 items-center">
                <li>
                  <button
                    onClick={handleConsultMtr}
                    className="font-medium hover:bg-[#d9e5ed] hover:text-[#003B5C] px-3 py-1 rounded-md transition"
                  >
                    Consultar MTR
                  </button>
                </li>
                <li>
                  <button
                    onClick={handleSendMtr}
                    className="font-medium hover:bg-[#d9e5ed] hover:text-[#003B5C] px-3 py-1 rounded-md transition"
                  >
                    Baixar MTR
                  </button>
                </li>

                {/* Apenas administradores veem o histórico */}
                {user?.adm && (
                  <li>
                    <button
                      onClick={handleHistorico}
                      className="font-medium hover:bg-[#d9e5ed] hover:text-[#003B5C] px-3 py-1 rounded-md transition"
                    >
                      Histórico
                    </button>
                  </li>
                )}
              </ul>
            </nav>

            {/* Área do usuário (lado direito) */}
            <div className="flex items-center space-x-3">

              {/* Apenas administradores podem ver o botão Novo Usuário */}
              {user?.adm && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-1 bg-[#3B556E] hover:bg-[#445f7a] text-white px-3 py-1 rounded-md text-sm font-medium transition"
                  title="Cadastrar novo usuário"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Novo Usuário
                </button>
              )}

              <button
                onClick={handleLogout}
                className="text-xs md:text-sm hover:bg-red-600/90 bg-red-600 px-2 py-1 rounded flex items-center transition-colors"
                title="Sair do sistema"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 md:h-5 md:w-5 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Sair
              </button>
              {user && (
                <span className="text-sm font-medium text-gray-200">
                  {user.nome}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Modal de criação de usuário */}
      {isModalOpen && (
        <ModalNovoUsuario
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}
