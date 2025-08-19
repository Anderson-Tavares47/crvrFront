'use client'

export default function Footer() {
  return (
    <footer className="bg-[#293f58] text-white py-4 mt-10">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <p className="text-sm">
          © {new Date().getFullYear()} SIS Resíduos. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  )
}
