/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client"

import { useState } from "react"
import { useCartStore } from "@/store/cart-store"
import { Badge } from "@/components/ui/badge"

export function ProductView({ product }: { product: any /* eslint-disable-line @typescript-eslint/no-explicit-any */ }) {
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    product.variants?.length > 0 ? product.variants[0].id : null
  )

  const selectedVariant = product.variants?.find((v: any) => v.id === selectedVariantId)
  const selectedColor = selectedVariant?.color || null

  const images = product.images || []
  
  // Filter images
  const visibleImages = images.filter((img: any) => img.color === selectedColor || !img.color)
  const displayImages = visibleImages.length > 0 ? visibleImages : images
  
  const [activeImage, setActiveImage] = useState(displayImages[0]?.url || "/placeholder.png")

  const basePrice = Number(product.basePrice)
  const compareAtPrice = product.compareAtPrice ? Number(product.compareAtPrice) : null

  function handleAddToCart() {
    if (product.variants?.length > 0) {
      if (!selectedVariant) return;
      useCartStore.getState().addItem({
        id: selectedVariant.id,
        productId: product.id,
        variantId: selectedVariant.id,
        name: product.name, 
        color: selectedVariant.color || selectedVariant.name,
        price: basePrice,
        quantity: 1,
        maxStock: selectedVariant.stock,
        image: activeImage
      });
    } else {
      useCartStore.getState().addItem({
        id: product.id,
        productId: product.id,
        variantId: null,
        name: product.name,
        color: null,
        price: basePrice,
        quantity: 1,
        maxStock: product.stock,
        image: activeImage
      });
    }
  }

  const isOutOfStock = product.variants?.length > 0 
    ? (selectedVariant ? selectedVariant.stock <= 0 : true) 
    : product.stock <= 0;

  const currentStock = product.variants?.length > 0 
    ? (selectedVariant?.stock || 0) 
    : product.stock;

  return (
    <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
      {/* Left: Gallery */}
      <div className="flex flex-col gap-4">
        {/* Main Image */}
        <div className="relative aspect-[4/5] bg-muted rounded-3xl overflow-hidden border border-border">
          <img 
            src={activeImage} 
            alt="Product image" 
            className="object-cover w-full h-full"
          />
        </div>
        
        {/* Thumbnail Strip */}
        {displayImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {displayImages.map((img: any, idx: number) => (
              <button 
                key={idx}
                onClick={() => setActiveImage(img.url)}
                className={`relative w-20 h-24 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                  activeImage === img.url ? 'border-primary ring-2 ring-primary/20' : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img.url} alt={`Thumbnail ${idx}`} className="object-cover w-full h-full" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right: Info & Actions */}
      <div className="flex flex-col">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">{product.name}</h1>
          <div className="flex items-center gap-4">
            <span className="text-2xl font-bold text-primary">৳{basePrice.toFixed(2)}</span>
            {compareAtPrice && compareAtPrice > basePrice && (
              <>
                <span className="text-lg text-muted-foreground line-through">৳{compareAtPrice.toFixed(2)}</span>
                <Badge className="bg-destructive text-destructive-foreground pointer-events-none">Sale</Badge>
              </>
            )}
          </div>
        </div>

        <div className="prose prose-sm dark:prose-invert max-w-none mb-8 whitespace-pre-wrap text-muted-foreground">
          {product.description || "No description provided."}
        </div>
        
        {/* Variant Selector */}
        {product.variants?.length > 0 && (
          <div className="mb-8">
            <h3 className="font-semibold text-sm mb-3 uppercase tracking-wider text-muted-foreground">Select Color</h3>
            <div className="flex flex-wrap gap-3">
              {product.variants.map((variant: any) => (
                <button
                  key={variant.id}
                  onClick={() => {
                    setSelectedVariantId(variant.id)
                    const colorImages = images.filter((img: any) => img.color === variant.color)
                    if (colorImages.length > 0) {
                      setActiveImage(colorImages[0].url)
                    } else {
                      const defaultImages = images.filter((img: any) => !img.color)
                      if (defaultImages.length > 0) setActiveImage(defaultImages[0].url)
                    }
                  }}
                  disabled={variant.stock <= 0}
                  className={`relative px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                    selectedVariantId === variant.id 
                      ? 'border-primary bg-primary/5 text-primary ring-2 ring-primary/20' 
                      : variant.stock <= 0
                      ? 'opacity-50 cursor-not-allowed border-dashed bg-muted'
                      : 'border-border hover:border-primary/50 hover:bg-muted/50'
                  }`}
                >
                  {variant.color || variant.name}
                  {variant.stock <= 0 && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="w-full h-[1px] bg-foreground/30 rotate-12 block absolute"></span>
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Add to Cart Section */}
        <div className="mt-auto flex items-center justify-between p-4 bg-muted/40 rounded-2xl border">
          <div>
            <p className="font-semibold text-lg">
              ৳{basePrice.toFixed(2)}
            </p>
            <p className="text-sm text-muted-foreground">
              {currentStock > 0 
                ? <span className="text-green-600 dark:text-green-400 font-medium">In Stock ({currentStock})</span> 
                : <span className="text-destructive font-medium">Out of Stock</span>}
            </p>
          </div>
          
          <button 
            disabled={isOutOfStock}
            onClick={handleAddToCart}
            className="bg-primary text-primary-foreground px-6 py-2.5 rounded-full font-bold shadow-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            Add to Cart
          </button>
        </div>

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="mt-8 pt-8 border-t">
            <h4 className="text-sm font-semibold mb-3">Tags</h4>
            <div className="flex flex-wrap gap-2">
              {product.tags.map((t: any) => (
                t.tag && (
                  <Badge key={t.tag.id} variant="secondary" className="bg-muted/50 hover:bg-muted font-normal">
                    {t.tag.name}
                  </Badge>
                )
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
