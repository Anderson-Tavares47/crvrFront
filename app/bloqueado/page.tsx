export default function Bloqueado() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white rounded-2xl shadow-lg p-10 flex flex-col items-center gap-4 max-w-md w-full text-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-16 h-16 text-red-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
          />
        </svg>
        <h1 className="text-2xl font-bold text-gray-800">Sistema Indisponível</h1>
        <p className="text-gray-500">
          Por favor, avise sua gestão ou entre em contato com o suporte.
        </p>
      </div>
    </div>
  )
}
