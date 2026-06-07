// app/admin/login/page.tsx

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signInPharmacist } from '@/lib/auth'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export default function AdminLoginPage() {
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
    router.push('/admin/dashboard')
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 px-4">
      <div className="w-full max-w-sm flex flex-col gap-6">

        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-green-600">
            <span className="text-2xl">💊</span>
          </div>
          <h1 className="text-xl font-bold text-white">PharmaGéo Admin</h1>
          <p className="text-sm text-gray-400">Accès réservé aux administrateurs</p>
        </div>

        {error && (
          <div className="px-4 py-3 rounded-xl bg-red-900/50 border border-red-700">
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <input
            type="email"
            value={form.email}
            onChange={set('email')}
            placeholder="Email admin"
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            className="px-4 py-3 rounded-xl border border-gray-700 bg-gray-800 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <input
            type="password"
            value={form.password}
            onChange={set('password')}
            placeholder="Mot de passe"
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            className="px-4 py-3 rounded-xl border border-gray-700 bg-gray-800 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-60"
        >
          {loading && <LoadingSpinner size="sm" label="" />}
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </div>
    </div>
  )
}