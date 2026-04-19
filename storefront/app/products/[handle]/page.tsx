import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

export const revalidate = 3600 // ISR: revalidate every hour
import { medusaServerClient } from '@/lib/medusa-client'
import Image from 'next/image'
import Link from 'next/link'
import { Truck, RotateCcw, Shield, ChevronRight } from 'lucide-react'
import ProductActions from '@/components/product/product-actions'
import ProductConversionPanel, { type BundleCompanion } from '@/components/product/product-conversion-panel'
import ProductAccordion from '@/components/product/product-accordion'
import { ProductViewTracker } from '@/components/product/product-view-tracker'
import { getProductPlaceholder } from '@/lib/utils/placeholder-images'
import { type VariantExtension } from '@/components/product/product-price'

/**
 * Products that get the conversion-optimized panel (bundle + urgency + trust).
 * Keyed by product handle. The companion is fetched at render time.
 */
const CRO_BUNDLES: Record<string, { companionHandle: string; companionVariantSku: string; bundleDiscountCents: number; saleEndsInDays: number }> = {
  'lalla-royal-caftan-emerald-brocade': {
    companionHandle: 'sahara-silk-hijab-signature-collection',
    companionVariantSku: 'SAH-CH', // Champagne — pairs beautifully with emerald
    bundleDiscountCents: 2000, // $20 off the hijab when bundled
    saleEndsInDays: 3,
  },
}

async function getCompanionProduct(handle: string) {
  try {
    const regionsResponse = await medusaServerClient.store.region.list()
    const regionId = regionsResponse.regions[0]?.id
    if (!regionId) return null
    const response = await medusaServerClient.store.product.list({
      handle,
      region_id: regionId,
      fields: '*variants.calculated_price',
    })
    return response.products?.[0] || null
  } catch {
    return null
  }
}

async function getProduct(handle: string) {
  try {
    const regionsResponse = await medusaServerClient.store.region.list()
    const regionId = regionsResponse.regions[0]?.id
    if (!regionId) throw new Error('No region found')

    const response = await medusaServerClient.store.product.list({
      handle,
      region_id: regionId,
      fields: '*variants.calculated_price',
    })
    return response.products?.[0] || null
  } catch (error) {
    console.error('Error fetching product:', error)
    return null
  }
}

async function getVariantExtensions(productId: string): Promise<Record<string, VariantExtension>> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'
    const storeId = process.env.NEXT_PUBLIC_STORE_ID
    const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
    const headers: Record<string, string> = {}
    if (storeId) headers['X-Store-Environment-ID'] = storeId
    if (publishableKey) headers['x-publishable-api-key'] = publishableKey

    const res = await fetch(
      `${baseUrl}/store/product-extensions/products/${productId}/variants`,
      { headers, next: { revalidate: 30 } },
    )
    if (!res.ok) return {}

    const data = await res.json()
    const map: Record<string, VariantExtension> = {}
    for (const v of data.variants || []) {
      map[v.id] = {
        compare_at_price: v.compare_at_price,
        allow_backorder: v.allow_backorder ?? false,
        inventory_quantity: v.inventory_quantity,
      }
    }
    return map
  } catch {
    return {}
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>
}): Promise<Metadata> {
  const { handle } = await params
  const product = await getProduct(handle)

  if (!product) {
    return { title: 'Product Not Found' }
  }

  return {
    title: product.title,
    description: product.description || `Shop ${product.title}`,
    openGraph: {
      title: product.title,
      description: product.description || `Shop ${product.title}`,
      ...(product.thumbnail ? { images: [{ url: product.thumbnail }] } : {}),
    },
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>
}) {
  const { handle } = await params
  const product = await getProduct(handle)

  if (!product) {
    notFound()
  }

  const variantExtensions = await getVariantExtensions(product.id)

  // ---- Build CRO bundle offer (if applicable) ----
  const croConfig = CRO_BUNDLES[handle]
  let bundleCompanion: BundleCompanion | null = null
  let urgencyStockTotal: number | null = null
  let saleEndsAt: string | undefined = undefined

  if (croConfig) {
    const companion = await getCompanionProduct(croConfig.companionHandle)
    if (companion) {
      const companionVariant =
        (companion.variants as Array<{ id: string; sku?: string | null; title?: string; calculated_price?: { calculated_amount?: number; currency_code?: string } }> | undefined)?.find(
          (v) => v.sku === croConfig.companionVariantSku,
        ) || companion.variants?.[0]
      if (companionVariant) {
        const cp = (companionVariant as { calculated_price?: { calculated_amount?: number; currency_code?: string } }).calculated_price
        const indiv = cp?.calculated_amount ?? 0
        bundleCompanion = {
          productTitle: companion.title,
          productHandle: companion.handle,
          image: companion.thumbnail || companion.images?.[0]?.url || '',
          variantId: companionVariant.id,
          variantLabel: `Silk Hijab · ${companionVariant.title || 'Champagne'}`,
          individualPriceCents: indiv,
          bundlePriceCents: Math.max(0, indiv - croConfig.bundleDiscountCents),
          currency: cp?.currency_code || 'usd',
        }
      }
    }

    // Urgency: count total remaining across all variants
    urgencyStockTotal = Object.values(variantExtensions).reduce((sum, ext) => {
      const q = ext.inventory_quantity
      return typeof q === 'number' ? sum + Math.max(0, q) : sum
    }, 0)

    // Sale ends at — 3 days from now (server render time)
    const ends = new Date()
    ends.setDate(ends.getDate() + croConfig.saleEndsInDays)
    saleEndsAt = ends.toISOString()
  }

  const allImages = [
    ...(product.thumbnail ? [{ url: product.thumbnail }] : []),
    ...(product.images || []).filter((img: any) => img.url !== product.thumbnail),
  ]

  // Use placeholder if no images
  const displayImages = allImages.length > 0
    ? allImages
    : [{ url: getProductPlaceholder(product.id) }]

  return (
    <>
      {/* Breadcrumbs */}
      <div className="border-b">
        <div className="container-custom py-3">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/products" className="hover:text-foreground transition-colors">Shop</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">{product.title}</span>
          </nav>
        </div>
      </div>

      <div className="container-custom py-8 lg:py-12">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Product Images */}
          <div className="space-y-3">
            <div className="relative aspect-[3/4] overflow-hidden bg-muted rounded-sm">
              <Image
                src={displayImages[0].url}
                alt={product.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>

            {displayImages.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {displayImages.slice(1, 5).map((image: any, idx: number) => (
                  <div
                    key={idx}
                    className="relative aspect-[3/4] overflow-hidden bg-muted rounded-sm"
                  >
                    <Image
                      src={image.url}
                      alt={`${product.title} ${idx + 2}`}
                      fill
                      sizes="12vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="lg:sticky lg:top-24 lg:self-start space-y-6">
            {/* Title & Subtitle */}
            <div>
              {product.subtitle && (
                <p className="text-sm uppercase tracking-[0.15em] text-muted-foreground mb-2">
                  {product.subtitle}
                </p>
              )}
              <h1 className="text-h2 font-heading font-semibold">{product.title}</h1>
            </div>

            <ProductViewTracker
              productId={product.id}
              productTitle={product.title}
              variantId={product.variants?.[0]?.id || null}
              currency={product.variants?.[0]?.calculated_price?.currency_code || 'usd'}
              value={product.variants?.[0]?.calculated_price?.calculated_amount ?? null}
            />

            {/* Variant Selector + Price + Add to Cart (client component) */}
            {bundleCompanion ? (
              <ProductConversionPanel
                product={product}
                variantExtensions={variantExtensions}
                bundle={bundleCompanion}
                urgencyStockTotal={urgencyStockTotal ?? undefined}
                saleEndsAt={saleEndsAt}
              />
            ) : (
              <ProductActions product={product} variantExtensions={variantExtensions} />
            )}

            {/* Trust Signals */}
            <div className="grid grid-cols-3 gap-4 py-6 border-t">
              <div className="text-center">
                <Truck className="h-5 w-5 mx-auto mb-1.5" strokeWidth={1.5} />
                <p className="text-xs text-muted-foreground">Free Shipping</p>
              </div>
              <div className="text-center">
                <RotateCcw className="h-5 w-5 mx-auto mb-1.5" strokeWidth={1.5} />
                <p className="text-xs text-muted-foreground">30-Day Returns</p>
              </div>
              <div className="text-center">
                <Shield className="h-5 w-5 mx-auto mb-1.5" strokeWidth={1.5} />
                <p className="text-xs text-muted-foreground">Secure Checkout</p>
              </div>
            </div>

            {/* Accordion Sections */}
            <ProductAccordion
              description={product.description}
              details={product.metadata as Record<string, string> | undefined}
            />
          </div>
        </div>
      </div>
    </>
  )
}
