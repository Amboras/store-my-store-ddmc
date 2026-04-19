'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import {
  ArrowRight,
  Truck,
  ShieldCheck,
  Sparkles,
  Scissors,
  PackageCheck,
  Globe2,
  Gem,
  Calendar,
  Send,
} from 'lucide-react'
import CollectionSection from '@/components/marketing/collection-section'
import { useCollections } from '@/hooks/use-collections'
import { trackMetaEvent } from '@/lib/meta-pixel'

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1600&q=85'
const HERO_SECONDARY =
  'https://images.unsplash.com/photo-1571513800374-df1bbe650e56?auto=format&fit=crop&w=1600&q=85'
const LIFESTYLE_IMAGE =
  'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1600&q=85'
const HIJAB_TILE =
  'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=85'
const CASUAL_TILE =
  'https://images.unsplash.com/photo-1589465885857-44edb59bbff2?auto=format&fit=crop&w=1600&q=85'
const HAUTE_TILE =
  'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1600&q=85'
const RENTAL_TILE =
  'https://images.unsplash.com/photo-1596900779744-2bdc4a90509a?auto=format&fit=crop&w=1600&q=85'

export default function HomePage() {
  const { data: collections, isLoading } = useCollections()
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterSent, setNewsletterSent] = useState(false)

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newsletterEmail.trim()) return
    trackMetaEvent('Lead', {
      content_name: 'newsletter_signup',
      status: 'submitted',
    })
    setNewsletterSent(true)
    setNewsletterEmail('')
  }

  return (
    <>
      {/* =========================== HERO =========================== */}
      <section className="relative bg-[#1f1310] text-[#f4e9d3] overflow-hidden">
        {/* Arabesque-style corner ornaments */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, #d9a85c 0, transparent 40%), radial-gradient(circle at 80% 80%, #d9a85c 0, transparent 40%)',
          }}
        />
        <div className="relative container-custom grid lg:grid-cols-12 gap-10 items-center py-20 lg:py-32">
          <div className="lg:col-span-6 space-y-7 animate-fade-in-up">
            <div className="flex items-center gap-3 text-[#d9a85c]">
              <span className="h-px w-10 bg-[#d9a85c]" />
              <p className="text-xs uppercase tracking-[0.28em]">
                Maison of Maghrebian Couture
              </p>
            </div>
            <h1 className="font-heading font-light text-5xl sm:text-6xl lg:text-7xl leading-[1.05] tracking-tight">
              Caftans <span className="italic text-[#d9a85c]">woven</span>
              <br />
              with tradition,
              <br />
              worn with grace.
            </h1>
            <p className="text-base lg:text-lg text-[#f4e9d3]/75 max-w-lg leading-relaxed">
              Heirloom caftans, takchitas, and silk hijabs — hand-finished by
              artisans in Fès and delivered to your door. Own the piece, or
              rent it for your moment.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/collections/haute-couture"
                className="group inline-flex items-center gap-2 bg-[#d9a85c] text-[#1f1310] px-8 py-4 text-xs font-semibold uppercase tracking-[0.18em] hover:bg-[#e8bc72] transition-colors"
              >
                Shop the Collection
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/collections/rentals"
                className="inline-flex items-center gap-2 border border-[#d9a85c]/60 text-[#f4e9d3] px-8 py-4 text-xs font-semibold uppercase tracking-[0.18em] hover:bg-[#d9a85c]/10 transition-colors"
              >
                Rent a Couture Piece
              </Link>
            </div>

            <div className="flex flex-wrap gap-x-8 gap-y-3 pt-6 text-xs uppercase tracking-[0.15em] text-[#f4e9d3]/60">
              <span className="flex items-center gap-2">
                <Scissors className="h-3.5 w-3.5 text-[#d9a85c]" strokeWidth={1.5} />
                Hand-finished
              </span>
              <span className="flex items-center gap-2">
                <Globe2 className="h-3.5 w-3.5 text-[#d9a85c]" strokeWidth={1.5} />
                Ships worldwide
              </span>
              <span className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-[#d9a85c]" strokeWidth={1.5} />
                Fit guaranteed
              </span>
            </div>
          </div>

          {/* Hero image collage */}
          <div className="lg:col-span-6 relative animate-fade-in">
            <div className="grid grid-cols-5 grid-rows-6 gap-3 h-[560px] lg:h-[640px]">
              <div className="col-span-3 row-span-6 relative overflow-hidden rounded-sm">
                <Image
                  src={HERO_IMAGE}
                  alt="Hand-embroidered emerald caftan from our haute couture line"
                  fill
                  sizes="(max-width: 1024px) 60vw, 35vw"
                  className="object-cover"
                  priority
                />
                <div className="absolute bottom-4 left-4 right-4 bg-[#1f1310]/85 backdrop-blur-sm border border-[#d9a85c]/30 px-4 py-3">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-[#d9a85c]">
                    Signature Piece
                  </p>
                  <p className="text-sm mt-1">Lalla Royal · Emerald Brocade</p>
                </div>
              </div>
              <div className="col-span-2 row-span-3 relative overflow-hidden rounded-sm">
                <Image
                  src={HERO_SECONDARY}
                  alt="Takchita rental styled on model"
                  fill
                  sizes="(max-width: 1024px) 40vw, 25vw"
                  className="object-cover"
                />
              </div>
              <div className="col-span-2 row-span-3 relative overflow-hidden rounded-sm bg-[#2a1a1a] flex flex-col justify-between p-5">
                <Gem className="h-5 w-5 text-[#d9a85c]" strokeWidth={1.5} />
                <div>
                  <p className="font-heading text-3xl font-light leading-none">
                    1 of 1
                  </p>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-[#f4e9d3]/60 mt-2">
                    Couture, never mass-made
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================== MARQUEE STRIP =========================== */}
      <div className="bg-[#f4e9d3] border-y border-[#d9a85c]/30">
        <div className="container-custom py-4 flex flex-wrap items-center justify-center gap-x-10 gap-y-2 text-[11px] uppercase tracking-[0.22em] text-[#2a1a1a]/70">
          <span>✦ Fès Atelier</span>
          <span>✦ 1,400+ Happy Clients</span>
          <span>✦ Free Alterations Under 30 Days</span>
          <span>✦ Insured Rentals</span>
        </div>
      </div>

      {/* =========================== SHOP THE CATEGORIES =========================== */}
      <section className="py-section bg-background">
        <div className="container-custom">
          <div className="max-w-2xl mb-12">
            <p className="text-xs uppercase tracking-[0.28em] text-[#b8864a] mb-3">
              The Wardrobe
            </p>
            <h2 className="font-heading text-4xl lg:text-5xl font-light tracking-tight">
              Four silhouettes, <em className="text-[#b8864a]">one maison.</em>
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-5">
            {[
              {
                title: 'Haute Couture',
                sub: 'Hand-embroidered caftans',
                href: '/collections/haute-couture',
                img: HAUTE_TILE,
              },
              {
                title: 'Casual',
                sub: 'Linen caftans for every day',
                href: '/collections/casual',
                img: CASUAL_TILE,
              },
              {
                title: 'Silk Hijabs',
                sub: 'Mulberry silk, hand-rolled',
                href: '/collections/new-collection',
                img: HIJAB_TILE,
              },
              {
                title: 'Rentals',
                sub: 'Couture, for your moment',
                href: '/collections/rentals',
                img: RENTAL_TILE,
              },
            ].map((cat) => (
              <Link
                key={cat.title}
                href={cat.href}
                className="group relative block aspect-[3/4] overflow-hidden rounded-sm"
                prefetch
              >
                <Image
                  src={cat.img}
                  alt={cat.title}
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1f1310]/80 via-[#1f1310]/10 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-end p-5 text-[#f4e9d3]">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-[#d9a85c]">
                    {cat.sub}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <h3 className="font-heading text-xl lg:text-2xl font-light">
                      {cat.title}
                    </h3>
                    <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* =========================== COLLECTIONS (dynamic) =========================== */}
      {isLoading ? (
        <section className="py-section">
          <div className="container-custom">
            <div className="animate-pulse space-y-4 text-center">
              <div className="h-3 w-20 bg-muted rounded mx-auto" />
              <div className="h-8 w-64 bg-muted rounded mx-auto" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
              {[1, 2, 3].map((i) => (
                <div key={i} className="aspect-[3/4] bg-muted rounded animate-pulse" />
              ))}
            </div>
          </div>
        </section>
      ) : collections && collections.length > 0 ? (
        <>
          {collections.map(
            (
              collection: {
                id: string
                handle: string
                title: string
                metadata?: Record<string, unknown>
              },
              index: number,
            ) => (
              <CollectionSection
                key={collection.id}
                collection={collection}
                alternate={index % 2 === 1}
              />
            ),
          )}
        </>
      ) : null}

      {/* =========================== HERITAGE STORY =========================== */}
      <section className="py-section bg-[#1f1310] text-[#f4e9d3]">
        <div className="container-custom grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="relative aspect-[4/5] overflow-hidden rounded-sm order-2 lg:order-1">
            <Image
              src={LIFESTYLE_IMAGE}
              alt="Artisan detail of hand-embroidered caftan"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute top-6 left-6 bg-[#1f1310]/80 backdrop-blur-sm px-4 py-3 border border-[#d9a85c]/30">
              <p className="text-[10px] uppercase tracking-[0.22em] text-[#d9a85c]">
                Atelier, Fès
              </p>
              <p className="text-xs mt-1 text-[#f4e9d3]/80">Est. traditions, modern soul</p>
            </div>
          </div>

          <div className="order-1 lg:order-2 space-y-6 lg:max-w-md">
            <p className="text-xs uppercase tracking-[0.28em] text-[#d9a85c]">
              Our Heritage
            </p>
            <h2 className="font-heading text-4xl lg:text-5xl font-light leading-[1.1]">
              From the <em className="text-[#d9a85c]">medinas</em> of Fès to your wardrobe.
            </h2>
            <p className="text-[#f4e9d3]/75 leading-relaxed">
              Every caftan in our collection is cut, embroidered, and hand-finished
              by a small circle of <em>maâlmat</em> — master seamstresses whose
              craft has been passed down for generations. We pair their
              centuries-old techniques with contemporary silhouettes, so you wear
              a story, not a trend.
            </p>
            <div className="grid grid-cols-3 gap-6 pt-4 border-t border-[#d9a85c]/20">
              <div>
                <p className="font-heading text-3xl font-light text-[#d9a85c]">40+</p>
                <p className="text-[10px] uppercase tracking-[0.18em] text-[#f4e9d3]/60 mt-1">
                  Artisans
                </p>
              </div>
              <div>
                <p className="font-heading text-3xl font-light text-[#d9a85c]">72h</p>
                <p className="text-[10px] uppercase tracking-[0.18em] text-[#f4e9d3]/60 mt-1">
                  Embroidery
                </p>
              </div>
              <div>
                <p className="font-heading text-3xl font-light text-[#d9a85c]">1 of 1</p>
                <p className="text-[10px] uppercase tracking-[0.18em] text-[#f4e9d3]/60 mt-1">
                  Couture pieces
                </p>
              </div>
            </div>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-[#d9a85c] pt-2 hover:text-[#f4e9d3] transition-colors"
            >
              Discover the atelier
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================== HOW RENTALS WORK =========================== */}
      <section className="py-section bg-[#f4e9d3]">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-xs uppercase tracking-[0.28em] text-[#b8864a] mb-3">
              Rent a Takchita
            </p>
            <h2 className="font-heading text-4xl lg:text-5xl font-light tracking-tight text-[#1f1310]">
              Couture, for a night.
            </h2>
            <p className="text-[#1f1310]/70 mt-4 leading-relaxed">
              Wedding, henna, engagement, Eid — wear a 1-of-1 takchita without
              the 1-of-1 price tag. Insured, cleaned, and delivered.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                icon: Calendar,
                step: '01',
                title: 'Reserve your date',
                text: 'Pick your size, style, and event date. Order up to 90 days ahead.',
              },
              {
                icon: PackageCheck,
                step: '02',
                title: 'Delivered 2 days early',
                text: 'Arrives in a garment bag with the belt, care notes, and a free swap if sizing is off.',
              },
              {
                icon: Sparkles,
                step: '03',
                title: 'Return, stress-free',
                text: 'Ship back with the prepaid label within 3 days. We handle the cleaning.',
              },
            ].map((s) => (
              <div
                key={s.step}
                className="relative bg-background p-8 border border-[#d9a85c]/30 group hover:border-[#d9a85c] transition-colors"
              >
                <span className="absolute top-4 right-5 font-heading text-5xl font-light text-[#d9a85c]/25">
                  {s.step}
                </span>
                <s.icon
                  className="h-7 w-7 text-[#b8864a] mb-5"
                  strokeWidth={1.3}
                />
                <h3 className="font-heading text-xl font-medium text-[#1f1310]">
                  {s.title}
                </h3>
                <p className="text-sm text-[#1f1310]/70 mt-2 leading-relaxed">
                  {s.text}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/collections/rentals"
              className="inline-flex items-center gap-2 bg-[#1f1310] text-[#f4e9d3] px-8 py-4 text-xs font-semibold uppercase tracking-[0.18em] hover:bg-[#2a1a1a] transition-colors"
            >
              Browse Rental Pieces
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================== TRUST BAR =========================== */}
      <section className="py-12 border-y bg-background">
        <div className="container-custom">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Truck, title: 'Complimentary Shipping', sub: 'On orders over $150' },
              { icon: ShieldCheck, title: 'Secure Checkout', sub: '256-bit SSL encryption' },
              { icon: Scissors, title: 'Free Alterations', sub: 'Within 30 days of delivery' },
              { icon: Gem, title: '30-Day Returns', sub: 'Unworn, with original tags' },
            ].map((t) => (
              <div
                key={t.title}
                className="flex items-start gap-3 justify-center md:justify-start text-left"
              >
                <t.icon
                  className="h-5 w-5 flex-shrink-0 text-[#b8864a] mt-0.5"
                  strokeWidth={1.5}
                />
                <div>
                  <p className="text-sm font-medium">{t.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{t.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================== NEWSLETTER =========================== */}
      <section className="py-section bg-background">
        <div className="container-custom max-w-2xl text-center">
          <p className="text-xs uppercase tracking-[0.28em] text-[#b8864a] mb-3">
            The Atelier Letter
          </p>
          <h2 className="font-heading text-4xl lg:text-5xl font-light tracking-tight">
            First access. No noise.
          </h2>
          <p className="mt-4 text-muted-foreground max-w-md mx-auto">
            New caftan drops, private rental openings, and behind-the-scenes from
            our Fès atelier — straight to your inbox.
          </p>

          {newsletterSent ? (
            <div className="mt-8 inline-flex items-center gap-2 text-sm text-[#b8864a]">
              <Sparkles className="h-4 w-4" strokeWidth={1.5} />
              You&apos;re on the list. Welcome to the maison.
            </div>
          ) : (
            <form
              className="mt-8 flex gap-2 max-w-md mx-auto"
              onSubmit={handleNewsletterSubmit}
            >
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 border-b border-foreground/30 bg-transparent px-1 py-3 text-sm placeholder:text-muted-foreground focus:border-[#b8864a] focus:outline-none transition-colors"
              />
              <button
                type="submit"
                className="bg-[#1f1310] text-[#f4e9d3] px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] hover:bg-[#2a1a1a] transition-colors inline-flex items-center gap-2"
              >
                Subscribe
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          )}
        </div>
      </section>
    </>
  )
}
