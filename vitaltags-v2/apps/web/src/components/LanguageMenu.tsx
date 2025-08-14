"use client"
import { useMemo, useState, useEffect, useRef } from 'react'
import { languages, type Lang } from '../lib/i18n'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'

export default function LanguageMenu({ current }: { current: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const sp = useSearchParams()
  const [open, setOpen] = useState(false)
  const lang: Lang = (current as Lang) || 'en'
  const currentLang = useMemo(() => languages.find((l) => l.code === lang) || languages[0], [lang])
  const panelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!panelRef.current) return
      if (!panelRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  function select(code: string) {
    const params = new URLSearchParams(sp?.toString())
    params.set('lang', code)
    router.replace(`${pathname}?${params.toString()}`)
    setOpen(false)
  }

  return (
    <div className="lang-menu" ref={panelRef}>
      <button className="menu-button" onClick={() => setOpen((v) => !v)} aria-haspopup="menu" aria-expanded={open} title={currentLang.label}>
        <span role="img" aria-hidden style={{ fontSize: 18 }}>{currentLang.flag}</span>
      </button>
      {open && (
        <div className="menu-panel" role="menu">
          {languages.map((l) => (
            <button key={l.code} className="menu-item" role="menuitem" onClick={() => select(l.code)}>
              <span style={{ fontSize: 18 }} aria-hidden>{l.flag}</span>
              <span>{l.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}


