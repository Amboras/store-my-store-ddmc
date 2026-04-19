'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

const MESSAGES = [
  'Handcrafted in Fès · Ships worldwide from Canada',
  'Complimentary shipping on orders over $150',
  'Rent couture caftans from $149 — insured & cleaned',
]

export default function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true)
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % MESSAGES.length), 4500)
    return () => clearInterval(t)
  }, [])

  if (!isVisible) return null

  return (
    <div className="relative bg-[#2a1a1a] text-[#f4e9d3]">
      <div className="container-custom flex items-center justify-center py-2.5 text-xs sm:text-sm tracking-[0.08em]">
        <p key={index} className="animate-fade-in text-center px-8">
          {MESSAGES[index]}
        </p>
        <button
          onClick={() => setIsVisible(false)}
          className="absolute right-3 p-1 opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Dismiss announcement"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
