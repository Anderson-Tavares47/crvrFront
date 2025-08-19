'use client';

import Image from 'next/image';
import Logo from '../assets/img/Logo.png';

export default function Header() {

  const handleSendMtr = async () => {
    window.location.href = '/receberManifesto';
    };

    const handleConsultMtr = async () => {
      window.location.href = '/'; 
    }

  return (
    <header className="bg-[#293f58] text-white shadow-md">
      {/* altura fixa do header */}
      <div className="h-16 md:h-20 max-w-6xl mx-auto flex items-center justify-between px-4">
        <div className="flex items-center space-x-3">
          {/* o logo nunca passa da altura do header */}
          <Image
            src={Logo}
            alt="Logo"
            className="h-50 md:h-50 w-auto"
            priority
          />
        </div>

        <nav>
          <ul className="flex space-x-4">
            <li>
              <button onClick={handleConsultMtr} className="font-bold hover:bg-[#d9e5ed] hover:text-[#003B5C] px-3 py-1 rounded-md transition">
                Consultar MTR
              </button>
            </li>
             <li>
              <button  onClick={handleSendMtr} className="font-bold hover:bg-[#d9e5ed] hover:text-[#003B5C] px-3 py-1 rounded-md transition">
               Baixar MTR
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
