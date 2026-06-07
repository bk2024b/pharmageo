// app/pharmacie/inscription/succes/page.tsx

import Link from 'next/link'

export default function SuccesPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="flex flex-col items-center gap-6 max-w-sm text-center">

        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-green-100">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-bold text-gray-900">Demande envoyée !</h1>
          <p className="text-sm text-gray-500">
            Votre demande d'inscription a été reçue. Elle sera examinée par notre équipe
            sous 24h. Vous recevrez un email de confirmation une fois votre pharmacie activée.
          </p>
        </div>

        <div className="flex flex-col gap-3 w-full">
          <Link
            href="/pharmacie/login"
            className="px-4 py-3 rounded-xl bg-green-600 text-white text-sm font-medium text-center hover:bg-green-700 transition-colors"
          >
            Se connecter
          </Link>
          <Link
            href="/"
            className="px-4 py-3 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium text-center hover:bg-gray-50 transition-colors"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  )
}