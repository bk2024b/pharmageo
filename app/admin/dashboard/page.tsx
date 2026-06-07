// app/admin/dashboard/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getMyPharmacy, signOut, isAdmin } from '@/lib/auth'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { PharmacyRequests } from '@/components/Admin/PharmacyRequests'
import { MedicationManager } from '@/components/Admin/MedicationManager'
import { GuardOverview } from '@/components/Admin/GuardOverview'

type Tab = 'requests' | 'medications' | 'guards'

export default function AdminDashboardPage() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('requests')
  const [loading, setLoading] = useState(true)
  const [adminName, setAdminName] = useState('')

  useEffect(() => {
    const check = async () => {
      const admin = await isAdmin()
      if (!admin) {
        router.push('/admin/login')
        return
      }
      const data = await getMyPharmacy()
      setAdminName(data?.profile?.full_name ?? 'Admin')
      setLoading(false)
    }
    check()
  }, [router])

  const handleSignOut = async () => {
    await signOut()
    router.push('/admin/login')
  }

  if (loading) return <LoadingSpinner fullscreen label="Chargement..." />

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'requests', label: 'Demandes', icon: '🏥' },
    { key: 'medications', label: 'Médicaments', icon: '💊' },
    { key: 'guards', label: 'Gardes', icon: '🕐' },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">

      {/* ── Header ───────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-10 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">💊</span>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white">PharmaGéo</span>
              <span className="text-xs text-gray-400">Admin · {adminName}</span>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="flex items-center justify-center w-8 h-8 rounded-lg border border-gray-700 hover:bg-gray-800 transition-colors"
          >
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-4 gap-1 pb-0">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`
                flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-all
                ${tab === t.key
                  ? 'border-green-500 text-green-400'
                  : 'border-transparent text-gray-500 hover:text-gray-300'
                }
              `}
            >
              <span>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </header>

      {/* ── Contenu ───────────────────────────────────────────────────── */}
      <main className="flex-1 px-4 py-4">
        {tab === 'requests' && <PharmacyRequests />}
        {tab === 'medications' && <MedicationManager />}
        {tab === 'guards' && <GuardOverview />}
      </main>
    </div>
  )
}