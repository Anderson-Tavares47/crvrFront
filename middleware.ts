import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // const { pathname } = request.nextUrl

  // // Permite acessar a própria página de bloqueio para não criar loop infinito
  // if (pathname === '/bloqueado') {
  //   return NextResponse.next()
  // }

  // return NextResponse.redirect(new URL('/bloqueado', request.url))
}

export const config = {
  matcher: [
    /*
     * Aplica o middleware em todas as rotas, exceto arquivos estáticos e internos do Next.js
     */
    // '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)',
  ],
}
