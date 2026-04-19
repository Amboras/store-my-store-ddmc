'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { useCart } from '@/hooks/use-cart'
import { Minus, Plus, Check, Loader2, Flame, Lock, BadgeCheck, Scissors, Clock, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import ProductPrice, { type VariantExtension } from './product-price'
import { trackAddToCart } from '@/lib/analytics'
import { trackMetaEvent, toMetaCurrencyValue } from '@/lib/meta-pixel'
import { formatPrice } from '@/lib/utils/format-price'
import type { Product } from '@/types'

interface VariantOption {
  option_id?: string
  option?: { id: string }
  value: string
}

interface ProductVariantWithPrice {
  id: string
  options?: VariantOption[]
  calculated_price?:
    | {
        calculated_amount?: number
        currency_code?: string
      }
    | number
  [key: string]: unknown
}

interface ProductOptionValue {
  id?: string
  value: string
}

interface ProductOptionWithValues {
  id: string
  title: string
  values?: (string | ProductOptionValue)[]
}

export interface BundleCompanion {
  productTitle: string
  productHandle: string
  image: string
  variantId: string
  variantLabel: string // e.g. "Silk Hijab · Champagne"
  individualPriceCents: number
  bundlePriceCents: number // discounted price when part of bundle
  currency: string
}

interface Props {
  product: Product
  variantExtensions?: Record<string, VariantExtension>
  bundle: BundleCompanion
  /** How many units of the primary product remain (for urgency). */
  urgencyStockTotal?: number
  /** Sale end date for countdown urgency. */
  saleEndsAt?: string // ISO
}

function getVariantPriceAmount(v: ProductVariantWithPrice | undefined): number | null {
  const cp = v?.calculated_price
  if (!cp) return null
  return typeof cp === 'number' ? cp : cp.calculated_amount ?? null
}

function useCountdown(target?: string) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!target) return
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [target])

  if (!target) return null
  const ms = Math.max(0, new Date(target).getTime() - now)
  const days = Math.floor(ms / 86400000)
  const hours = Math.floor((ms % 86400000) / 3600000)
  const minutes = Math.floor((ms % 3600000) / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  return { days, hours, minutes, seconds, totalMs: ms }
}

export default function ProductConversionPanel({
  product,
  variantExtensions,
  bundle,
  urgencyStockTotal,
  saleEndsAt,
}: Props) {
  const variants = useMemo(
    () => (product.variants || []) as unknown as ProductVariantWithPrice[],
    [product.variants],
  )
  const options = useMemo(() => product.options || [], [product.options])

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const defaults: Record<string, string> = {}
    const first = variants[0]
    if (first?.options) {
      for (const o of first.options) {
        const id = o.option_id || o.option?.id
        if (id && o.value) defaults[id] = o.value
      }
    }
    return defaults
  })

  const [quantity, setQuantity] = useState(1)
  const [offerMode, setOfferMode] = useState<'single' | 'bundle'>('bundle') // default to the value offer
  const [justAdded, setJustAdded] = useState(false)
  const { addItem, isAddingItem } = useCart()

  const selectedVariant = useMemo(() => {
    if (variants.length <= 1) return variants[0]
    return (
      variants.find((v) => {
        if (!v.options) return false
        return v.options.every((o) => {
          const id = o.option_id || o.option?.id
          if (!id) return false
          return selectedOptions[id] === o.value
        })
      }) || variants[0]
    )
  }, [variants, selectedOptions])

  const ext = selectedVariant?.id ? variantExtensions?.[selectedVariant.id] : null
  const currentPriceCents = getVariantPriceAmount(selectedVariant)
  const cp = selectedVariant?.calculated_price
  const currency =
    (cp && typeof cp !== 'number' ? cp.currency_code : undefined) || bundle.currency || 'usd'

  const allowBackorder = ext?.allow_backorder ?? false
  const inventoryQuantity = ext?.inventory_quantity
  const isOutOfStock = !allowBackorder && inventoryQuantity != null && inventoryQuantity <= 0
  const isLowStock = inventoryQuantity != null && inventoryQuantity > 0 && inventoryQuantity <= 5

  // Total inventory across all variants (for urgency bar).
  const totalRemaining = useMemo(() => {
    if (urgencyStockTotal != null) return urgencyStockTotal
    if (!variantExtensions) return null
    return variants.reduce((sum, v) => {
      const q = variantExtensions[v.id]?.inventory_quantity
      return typeof q === 'number' ? sum + Math.max(0, q) : sum
    }, 0)
  }, [variants, variantExtensions, urgencyStockTotal])

  const countdown = useCountdown(saleEndsAt)

  // Pricing math for bundle
  const bundleSavings = Math.max(
    0,
    bundle.individualPriceCents - bundle.bundlePriceCents,
  )
  const bundleTotalCents =
    (currentPriceCents ?? 0) + bundle.bundlePriceCents
  const singleTotalCents = currentPriceCents ?? 0

  const handleOptionChange = (optionId: string, value: string) => {
    setSelectedOptions((prev) => ({ ...prev, [optionId]: value }))
    setQuantity(1)
  }

  const handleAddToCart = () => {
    if (!selectedVariant?.id || isOutOfStock) return

    // Primary item
    addItem(
      { variantId: selectedVariant.id, quantity },
      {
        onSuccess: () => {
          // Bundle add-on
          if (offerMode === 'bundle') {
            addItem({ variantId: bundle.variantId, quantity }, {
              onError: () => {
                // Silent fallback — primary already added
              },
            })
          }

          setJustAdded(true)
          toast.success(
            offerMode === 'bundle'
              ? `Added to bag — bundle saves ${formatPrice(bundleSavings, currency)}`
              : 'Added to bag',
          )
          const metaValue = toMetaCurrencyValue(currentPriceCents)
          trackAddToCart(product?.id || '', selectedVariant.id, quantity, currentPriceCents ?? undefined)
          trackMetaEvent('AddToCart', {
            content_ids: [selectedVariant.id],
            content_type: 'product',
            content_name: product?.title,
            value: metaValue,
            currency,
            contents: [{ id: selectedVariant.id, quantity, item_price: metaValue }],
            num_items: quantity,
          })
          setTimeout(() => setJustAdded(false), 2000)
        },
        onError: (err: Error) => {
          toast.error(err.message || 'Failed to add to bag')
        },
      },
    )
  }

  const hasMultipleVariants = variants.length > 1

  return (
    <div className="space-y-6">
      {/* ============ URGENCY STRIP ============ */}
      {(totalRemaining != null && totalRemaining <= 25) || countdown ? (
        <div className="border border-[#d9a85c]/40 bg-[#fbf2e0] px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          {totalRemaining != null && totalRemaining > 0 && totalRemaining <= 25 && (
            <div className="flex items-center gap-2 text-sm text-[#5a3a1a]">
              <Flame className="h-4 w-4 text-[#b8864a]" strokeWidth={1.5} />
              <span>
                <strong className="font-semibold">{totalRemaining} left</strong> —
                hand-embroidered, no restocks until next season
              </span>
            </div>
          )}
          {countdown && countdown.totalMs > 0 && (
            <div className="flex items-center gap-2 text-sm text-[#5a3a1a] tabular-nums">
              <Clock className="h-4 w-4 text-[#b8864a]" strokeWidth={1.5} />
              <span className="font-medium">
                Launch price ends in {countdown.days}d {String(countdown.hours).padStart(2, '0')}:
                {String(countdown.minutes).padStart(2, '0')}:
                {String(countdown.seconds).padStart(2, '0')}
              </span>
            </div>
          )}
        </div>
      ) : null}

      {/* ============ PRICE ============ */}
      <ProductPrice
        amount={currentPriceCents}
        currency={currency}
        compareAtPrice={ext?.compare_at_price}
        soldOut={isOutOfStock}
        size="detail"
      />

      {/* ============ OPTION SELECTORS ============ */}
      {hasMultipleVariants &&
        options.map((option: ProductOptionWithValues) => {
          const values = (option.values || [])
            .map((v) => (typeof v === 'string' ? v : v.value))
            .filter(Boolean) as string[]
          if (values.length <= 1 && (values[0] === 'One Size' || values[0] === 'Default')) {
            return null
          }

          const optionId = option.id
          const selectedValue = selectedOptions[optionId]

          return (
            <div key={optionId}>
              <h3 className="text-xs uppercase tracking-[0.22em] font-semibold mb-3">
                {option.title}
                {selectedValue && (
                  <span className="ml-2 normal-case tracking-normal font-normal text-muted-foreground">
                    — {selectedValue}
                  </span>
                )}
              </h3>
              <div className="flex flex-wrap gap-2">
                {values.map((value) => {
                  const isSelected = selectedValue === value
                  const isAvailable = variants.some((v) => {
                    const hasValue = v.options?.some(
                      (o) =>
                        (o.option_id === optionId || o.option?.id === optionId) &&
                        o.value === value,
                    )
                    if (!hasValue) return false
                    const vExt = variantExtensions?.[v.id]
                    if (!vExt) return true
                    if (vExt.allow_backorder) return true
                    return vExt.inventory_quantity == null || vExt.inventory_quantity > 0
                  })
                  return (
                    <button
                      key={value}
                      onClick={() => handleOptionChange(optionId, value)}
                      disabled={!isAvailable}
                      className={`min-w-[52px] px-4 py-2.5 text-sm border transition-all ${
                        isSelected
                          ? 'border-[#1f1310] bg-[#1f1310] text-[#f4e9d3]'
                          : isAvailable
                          ? 'border-border hover:border-[#1f1310]'
                          : 'border-border text-muted-foreground/40 line-through cursor-not-allowed'
                      }`}
                    >
                      {value}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}

      {/* ============ BUNDLE OFFER ============ */}
      <div>
        <h3 className="text-xs uppercase tracking-[0.22em] font-semibold mb-3">
          Your offer
        </h3>
        <div className="space-y-2.5">
          {/* Bundle option — recommended */}
          <button
            type="button"
            onClick={() => setOfferMode('bundle')}
            className={`w-full text-left relative flex gap-3 p-3 border transition-all ${
              offerMode === 'bundle'
                ? 'border-[#b8864a] bg-[#fbf2e0]'
                : 'border-border hover:border-[#b8864a]/60'
            }`}
          >
            <span
              className={`mt-1 h-4 w-4 rounded-full border flex-shrink-0 flex items-center justify-center ${
                offerMode === 'bundle' ? 'border-[#b8864a] bg-[#b8864a]' : 'border-muted-foreground/40'
              }`}
            >
              {offerMode === 'bundle' && (
                <span className="h-1.5 w-1.5 rounded-full bg-[#fbf2e0]" />
              )}
            </span>
            <div className="relative w-14 h-16 flex-shrink-0 overflow-hidden bg-muted rounded-sm">
              <Image
                src={bundle.image}
                alt={bundle.productTitle}
                fill
                sizes="56px"
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold">The Maison Set</p>
                <span className="text-[10px] uppercase tracking-[0.18em] px-1.5 py-0.5 bg-[#1f1310] text-[#d9a85c]">
                  Save {formatPrice(bundleSavings, currency)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Caftan + {bundle.variantLabel} at a member-only price
              </p>
              <div className="flex items-baseline gap-2 mt-1.5">
                <span className="text-sm font-semibold">
                  {formatPrice(bundleTotalCents, currency)}
                </span>
                <span className="text-xs text-muted-foreground line-through">
                  {formatPrice(
                    (currentPriceCents ?? 0) + bundle.individualPriceCents,
                    currency,
                  )}
                </span>
              </div>
            </div>
          </button>

          {/* Single option */}
          <button
            type="button"
            onClick={() => setOfferMode('single')}
            className={`w-full text-left flex gap-3 p-3 border transition-all ${
              offerMode === 'single'
                ? 'border-[#1f1310] bg-muted/40'
                : 'border-border hover:border-[#1f1310]/60'
            }`}
          >
            <span
              className={`mt-1 h-4 w-4 rounded-full border flex-shrink-0 flex items-center justify-center ${
                offerMode === 'single' ? 'border-[#1f1310] bg-[#1f1310]' : 'border-muted-foreground/40'
              }`}
            >
              {offerMode === 'single' && <span className="h-1.5 w-1.5 rounded-full bg-background" />}
            </span>
            <div className="flex-1">
              <p className="text-sm font-semibold">Just the caftan</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {product.title}
              </p>
              <p className="text-sm font-semibold mt-1.5">
                {formatPrice(singleTotalCents, currency)}
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* ============ LOW STOCK ON SELECTED ============ */}
      {isLowStock && (
        <p className="text-sm text-[#b8864a] font-medium flex items-center gap-2">
          <Flame className="h-4 w-4" strokeWidth={1.5} />
          Only {inventoryQuantity} left in this size
        </p>
      )}

      {/* ============ QUANTITY + ADD TO CART ============ */}
      <div className="flex gap-3">
        <div className="flex items-center border">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="p-3 hover:bg-muted transition-colors"
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-12 text-center text-sm font-medium tabular-nums">{quantity}</span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="p-3 hover:bg-muted transition-colors"
            disabled={
              isOutOfStock ||
              (!allowBackorder && inventoryQuantity != null && quantity >= inventoryQuantity)
            }
            aria-label="Increase quantity"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock || isAddingItem}
          className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-xs font-semibold uppercase tracking-[0.18em] transition-all ${
            isOutOfStock
              ? 'bg-muted text-muted-foreground cursor-not-allowed'
              : justAdded
              ? 'bg-[#2d5a3d] text-[#f4e9d3]'
              : 'bg-[#1f1310] text-[#f4e9d3] hover:bg-[#2a1a1a]'
          }`}
        >
          {isAddingItem ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : justAdded ? (
            <>
              <Check className="h-4 w-4" />
              Added to Bag
            </>
          ) : isOutOfStock ? (
            'Sold Out'
          ) : offerMode === 'bundle' ? (
            <>
              <Sparkles className="h-3.5 w-3.5" strokeWidth={1.8} />
              Add the Set · {formatPrice(bundleTotalCents, currency)}
            </>
          ) : (
            <>Add to Bag · {formatPrice(singleTotalCents, currency)}</>
          )}
        </button>
      </div>

      {/* ============ MINI TRUST ============ */}
      <ul className="text-xs text-muted-foreground space-y-1.5 pt-1">
        <li className="flex items-center gap-2">
          <BadgeCheck className="h-3.5 w-3.5 text-[#b8864a]" strokeWidth={1.8} />
          Couture guarantee — full refund if you&apos;re not in love
        </li>
        <li className="flex items-center gap-2">
          <Scissors className="h-3.5 w-3.5 text-[#b8864a]" strokeWidth={1.8} />
          Complimentary alterations within 30 days
        </li>
        <li className="flex items-center gap-2">
          <Lock className="h-3.5 w-3.5 text-[#b8864a]" strokeWidth={1.8} />
          Secure checkout · Encrypted at every step
        </li>
      </ul>
    </div>
  )
}
