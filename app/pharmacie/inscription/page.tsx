// app/pharmacie/inscription/page.tsx

'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signUpPharmacist } from '@/lib/auth'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { getUserLocation, COTONOU_CENTER } from '@/lib/geo'

type Step = 1 | 2 | 3

export default function InscriptionPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [locating, setLocating] = useState(false)

  // ── Formulaire ────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    // Compte
    email: '',
    password: '',
    confirm_password: '',
    // Profil
    full_name: '',
    phone: '',
    // Pharmacie
    pharmacy_name: '',
    pharmacy_address: '',
    pharmacy_phone: '',
    lat: 0,
    lng: 0,
  })

  const set = (key: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => setForm((prev) => ({ ...prev, [key]: e.target.value }))

  // ── Géolocalisation ───────────────────────────────────────────────────
  const handleLocate = async () => {
    setLocating(true)
    try {
      const coords = await getUserLocation()
      setForm((prev) => ({
        ...prev,
        lat: coords.latitude,
        lng: coords.longitude,
      }))
    } catch {
      setForm((prev) => ({
        ...prev,
        lat: COTONOU_CENTER.lat,
        lng: COTONOU_CENTER.lng,
      }))
    } finally {
      setLocating(false)
    }
  }

  // ── Validation par étape ──────────────────────────────────────────────
  const validateStep = (s: Step): string | null => {
    if (s === 1) {
      if (!form.email) return 'Email requis'
      if (!/\S+@\S+\.\S+/.test(form.email)) return 'Email invalide'
      if (!form.password) return 'Mot de passe requis'
      if (form.password.length < 8) return 'Minimum 8 caractères'
      if (form.password !== form.confirm_password)
        return 'Les mots de passe ne correspondent pas'
    }
    if (s === 2) {
      if (!form.full_name) return 'Nom complet requis'
      if (!form.phone) return 'Téléphone requis'
    }
    if (s === 3) {
      if (!form.pharmacy_name) return 'Nom de la pharmacie requis'
      if (!form.pharmacy_address) return "Adresse requise"
      if (!form.pharmacy_phone) return 'Téléphone requis'
      if (!form.lat || !form.lng) return 'Position GPS requise'
    }
    return null
  }

  const nextStep = () => {
    const err = validateStep(step)
    if (err) { setError(err); return }
    setError(null)
    setStep((prev) => (prev + 1) as Step)
  }

  // ── Soumission ────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const err = validateStep(3)
    if (err) { setError(err); return }

    setLoading(true)
    setError(null)

    const result = await signUpPharmacist({
      email: form.email,
      password: form.password,
      full_name: form.full_name,
      phone: form.phone,
      pharmacy: {
        name: form.pharmacy_name,
        address: form.pharmacy_address,
        phone: form.pharmacy_phone,
        lat: form.lat,
        lng: form.lng,
      },
    })

    setLoading(false)

    if (!result.success) {
      setError(result.error)
      return
    }

    router.push('/pharmacie/inscription/succes')
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">

      {/* ── Header ───────────────────────────────────────────────────── */}
      <header className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200">
        <Link
          href="/"
          className="flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-sm font-semibold text-gray-900">Inscription pharmacie</h1>
      </header>

      {/* ── Stepper ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-center gap-2 px-4 py-4">
        {([1, 2, 3] as Step[]).map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`
              flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold
              transition-all duration-200
              ${step === s
                ? 'bg-green-600 text-white'
                : step > s
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-400'
              }
            `}>
              {step > s ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : s}
            </div>
            {s < 3 && (
              <div className={`w-12 h-0.5 ${step > s ? 'bg-green-400' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      {/* ── Formulaire ───────────────────────────────────────────────── */}
      <main className="flex-1 px-4 pb-6">
        <div className="max-w-md mx-auto flex flex-col gap-4">

          {/* Erreur */}
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200">
              <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* ── Étape 1 : Compte ─────────────────────────────────────── */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <h2 className="text-base font-semibold text-gray-900">Créer votre compte</h2>
                <p className="text-xs text-gray-400">Ces identifiants vous serviront à vous connecter</p>
              </div>
              <Field label="Email" type="email" value={form.email} onChange={set('email')} placeholder="contact@mapharmacies.bj" />
              <Field label="Mot de passe" type="password" value={form.password} onChange={set('password')} placeholder="Minimum 8 caractères" />
              <Field label="Confirmer le mot de passe" type="password" value={form.confirm_password} onChange={set('confirm_password')} placeholder="Répétez le mot de passe" />
            </div>
          )}

          {/* ── Étape 2 : Profil ─────────────────────────────────────── */}
          {step === 2 && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <h2 className="text-base font-semibold text-gray-900">Votre profil</h2>
                <p className="text-xs text-gray-400">Informations du responsable</p>
              </div>
              <Field label="Nom complet" value={form.full_name} onChange={set('full_name')} placeholder="Dr. Kokou Mensah" />
              <Field label="Téléphone personnel" type="tel" value={form.phone} onChange={set('phone')} placeholder="+229 97 00 00 00" />
            </div>
          )}

          {/* ── Étape 3 : Pharmacie ───────────────────────────────────── */}
          {step === 3 && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <h2 className="text-base font-semibold text-gray-900">Votre pharmacie</h2>
                <p className="text-xs text-gray-400">Ces informations seront visibles par les utilisateurs</p>
              </div>
              <Field label="Nom de la pharmacie" value={form.pharmacy_name} onChange={set('pharmacy_name')} placeholder="Pharmacie Jonquet" />
              <Field label="Adresse" value={form.pharmacy_address} onChange={set('pharmacy_address')} placeholder="Rue du Gouverneur, Cotonou" />
              <Field label="Téléphone de la pharmacie" type="tel" value={form.pharmacy_phone} onChange={set('pharmacy_phone')} placeholder="+229 21 30 00 00" />

              {/* GPS */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-700">
                  Position GPS <span className="text-red-500">*</span>
                </label>
                <button
                  onClick={handleLocate}
                  disabled={locating}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-gray-300 hover:border-green-400 hover:bg-green-50 transition-all text-sm text-gray-600 hover:text-green-700"
                >
                  {locating ? (
                    <LoadingSpinner size="sm" label="" />
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                  )}
                  {form.lat !== 0
                    ? `Position : ${form.lat.toFixed(4)}, ${form.lng.toFixed(4)}`
                    : 'Localiser ma pharmacie'
                  }
                </button>
                {form.lat !== 0 && (
                  <p className="text-xs text-green-600">
                    ✓ Position enregistrée
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ── Navigation ───────────────────────────────────────────── */}
          <div className="flex items-center gap-3 mt-2">
            {step > 1 && (
              <button
                onClick={() => { setError(null); setStep((prev) => (prev - 1) as Step) }}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Retour
              </button>
            )}

            {step < 3 ? (
              <button
                onClick={nextStep}
                className="flex-1 px-4 py-3 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
              >
                Continuer
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-60"
              >
                {loading ? <LoadingSpinner size="sm" label="" /> : null}
                {loading ? 'Envoi en cours...' : 'Soumettre ma demande'}
              </button>
            )}
          </div>

          {step === 1 && (
            <p className="text-center text-xs text-gray-400">
              Déjà un compte ?{' '}
              <Link href="/pharmacie/login" className="text-green-600 hover:underline font-medium">
                Se connecter
              </Link>
            </p>
          )}
        </div>
      </main>
    </div>
  )
}

// ── Composant Field réutilisable ──────────────────────────────────────────
const Field = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
}: {
  label: string
  type?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-medium text-gray-700">
      {label} <span className="text-red-500">*</span>
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all"
    />
  </div>
)