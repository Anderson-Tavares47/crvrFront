'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Logo from '../assets/img/Logo.png';

export default function Header() {
  const router = useRouter();

  const handleSendMtr = () => {
    window.location.href = '/receberManifesto';
  };

  const handleConsultMtr = () => {
    window.location.href = '/';
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    router.push('/login');
  };

  return (
    <header className="bg-[#293f58] text-white shadow-md">
      <div className="h-16 md:h-20 max-w-6xl mx-auto px-4">
        {/* Linha única: logo à esquerda, menu no centro, sair à direita */}
        <div className="h-full flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Image
              src={Logo}
              alt="Logo"
              className="h-50 md:h-50 w-auto"
              priority
            />
          </div>

          {/* Menu */}
          <nav>
            <ul className="flex space-x-4">
              <li>
                <button
                  onClick={handleConsultMtr}
                  className="font-bold hover:bg-[#d9e5ed] hover:text-[#003B5C] px-3 py-1 rounded-md transition"
                >
                  Consultar MTR
                </button>
              </li>
              <li>
                <button
                  onClick={handleSendMtr}
                  className="font-bold hover:bg-[#d9e5ed] hover:text-[#003B5C] px-3 py-1 rounded-md transition"
                >
                  Baixar MTR
                </button>
              </li>
            </ul>
          </nav>

          {/* Botão sair */}
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
        </div>
      </div>
    </header>
  );
}
