/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export function ProductCard({ product }: { product: any /* eslint-disable-line @typescript-eslint/no-explicit-any */ }) {
  const primaryImage = product.images?.[0]?.url || "/placeholder.png" // Assume placeholder exists
  
  return (
    <Link href={`/product/${product.slug}`} className="group flex flex-col gap-3">
      <div className="relative aspect-[4/5] bg-muted rounded-2xl overflow-hidden shadow-sm">
        <img 
          src={primaryImage} 
          alt={product.name} 
          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
        />
        {product.compareAtPrice && Number(product.compareAtPrice) > Number(product.basePrice) && (
          <Badge className="absolute top-3 left-3 bg-destructive text-destructive-foreground pointer-events-none">
            Sale
          </Badge>
        )}
      </div>
      <div className="flex flex-col gap-1 px-1">
        <h3 className="font-semibold text-foreground truncate">{product.name}</h3>
        <div className="flex items-center gap-2">
          <span className="font-bold text-primary">৳{product.basePrice}</span>
          {product.compareAtPrice && Number(product.compareAtPrice) > Number(product.basePrice) && (
            <span className="text-sm text-muted-foreground line-through">৳{product.compareAtPrice}</span>
          )}
        </div>
        
        {/* Colors Preview */}
        {product.variants && product.variants.length > 0 && (
          <div className="flex gap-1 mt-1">
            {product.variants.slice(0, 4).map((v: any) => (
               <div key={v.id} className="text-[10px] px-1.5 py-0.5 rounded-sm bg-muted text-muted-foreground border">
                 {v.color || v.name}
               </div>
            ))}
            {product.variants.length > 4 && (
              <div className="text-[10px] px-1.5 py-0.5 rounded-sm text-muted-foreground">
                +{product.variants.length - 4}
              </div>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}
