// app/pharmacie/login/page.tsx

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signInPharmacist } from '@/lib/auth'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ email: '', password: '' })

  const set = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const handleSubmit = async () => {
    if (!form.email || !form.password) {
      setError('Email et mot de passe requis')
      return
    }

    setLoading(true)
    setError(null)

    const result = await signInPharmacist(form)

    if (!result.success) {
      setLoading(false)
      setError('Email ou mot de passe incorrect')
      return
    }

    router.refresh()
    router.push('/pharmacie/dashboard')
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">

      <header className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200">
        <Link
          href="/"
          className="flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-sm font-semibold text-gray-900">Connexion pharmacie</h1>
      </header>

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm flex flex-col gap-5">

          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-bold text-gray-900">Bon retour 👋</h2>
            <p className="text-sm text-gray-400">Connectez-vous à votre espace pharmacie</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200">
              <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={set('email')}
                placeholder="contact@mapharmacies.bj"
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                className="px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-700">Mot de passe</label>
              <input
                type="password"
                value={form.password}
                onChange={set('password')}
                placeholder="••••••••"
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                className="px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-60"
          >
            {loading && <LoadingSpinner size="sm" label="" />}
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>

          <p className="text-center text-xs text-gray-400">
            Pas encore de compte ?{' '}
            <Link href="/pharmacie/inscription" className="text-green-600 hover:underline font-medium">
              Inscrire ma pharmacie
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}