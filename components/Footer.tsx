'use client'

export default function Footer() {
  return (
    <footer className="bg-gray-200 text-center py-3 mt-10">
      <p className="text-sm text-gray-600">
        © {new Date().getFullYear()} Consulta MTR
      </p>
    </footer>
  );
}
