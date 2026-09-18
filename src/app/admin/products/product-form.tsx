"use client"

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */

import { useState } from "react"
import { createProduct, updateProduct } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ImageUploader } from "@/components/ui/image-uploader"
import { useRouter } from "next/navigation"

export function ProductForm({ categories, tags, initialData }: { categories: any[], tags: any[], initialData?: any }) {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  
  const [selectedTags, setSelectedTags] = useState<string[]>(
    initialData?.tags?.map((t: any) => t.tagId) || []
  )
  const [name, setName] = useState(initialData?.name || "")
  const [slug, setSlug] = useState(initialData?.slug || "")
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || "")
  
  // Media (Images) state with color assignment
  const [images, setImages] = useState<{ url: string, color: string | null }[]>(
    initialData?.images?.map((i: any) => ({ url: i.url, color: i.color })) || []
  )
  
  // Variants (Colors) state
  const [variants, setVariants] = useState<{ id?: string, name: string, color: string, sku: string, stock: number }[]>(
    initialData?.variants?.map((v: any) => ({ id: v.id, name: v.name, color: v.color || v.name, sku: v.sku, stock: v.stock })) || []
  )

  const generateSlug = (text: string) => {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
  }

  const generateSkuForColor = (colorName: string) => {
    const parts = []
    if (categoryId) {
      const cat = categories.find(c => c.id === categoryId)
      if (cat) parts.push(cat.name.substring(0, 3).toUpperCase())
    }
    if (selectedTags.length > 0) {
      const tag = tags.find(t => t.id === selectedTags[0])
      if (tag) parts.push(tag.name.substring(0, 3).toUpperCase())
    }
    if (colorName) parts.push(colorName.substring(0, 3).toUpperCase())
    parts.push(Math.random().toString(36).substring(2, 6).toUpperCase())
    return parts.join("-")
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value
    setName(newName)
    const oldSlug = generateSlug(name)
    if (slug === "" || slug === oldSlug) {
      setSlug(generateSlug(newName))
    }
  }

  const addVariant = () => {
    setVariants([...variants, { name: "", color: "", sku: generateSkuForColor(""), stock: 0 }])
  }

  const updateVariant = (index: number, field: string, value: string | number) => {
    const newVariants = [...variants]
    newVariants[index] = { ...newVariants[index], [field]: value }
    
    // Auto-generate SKU if color changes and SKU is untouched/empty
    if (field === 'color' && typeof value === 'string') {
      newVariants[index].name = value // keep name synced with color for simplicity
      newVariants[index].sku = generateSkuForColor(value)
    }
    setVariants(newVariants)
  }

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index))
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsPending(true)
    
    const formData = new FormData(e.currentTarget)
    formData.set("slug", slug)
    // Send complex data as JSON strings
    formData.set("variantsData", JSON.stringify(variants))
    formData.set("imagesData", JSON.stringify(images))
    
    let result;
    if (initialData) {
      result = await updateProduct(initialData.id, formData, [], selectedTags)
    } else {
      result = await createProduct(formData, [], selectedTags)
    }
    
    if (result.error) {
      alert(result.error)
      setIsPending(false)
    } else {
      router.push("/admin/products")
      router.refresh()
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6 md:col-span-2 p-6 bg-card border border-border rounded-xl">
          <h2 className="text-lg font-semibold">Basic Information</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input id="name" name="name" required value={name} onChange={handleNameChange} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="slug">Slug (URL) *</Label>
              <Input id="slug" name="slug" required value={slug} onChange={(e) => setSlug(e.target.value)} />
            </div>
            <div className="flex flex-col gap-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <textarea 
                id="description" 
                name="description" 
                rows={4}
                defaultValue={initialData?.description || ""}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              />
            </div>
          </div>
        </div>

        <div className="space-y-6 md:col-span-2 p-6 bg-card border border-border rounded-xl">
          <h2 className="text-lg font-semibold">Base Pricing & Specs</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="basePrice">Base Price (৳) *</Label>
              <Input id="basePrice" name="basePrice" type="number" step="0.01" required defaultValue={initialData?.basePrice || ""} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="compareAtPrice">Compare At Price (৳)</Label>
              <Input id="compareAtPrice" name="compareAtPrice" type="number" step="0.01" defaultValue={initialData?.compareAtPrice || ""} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="weightGrams">Weight (Grams) *</Label>
              <Input id="weightGrams" name="weightGrams" type="number" required defaultValue={initialData?.weightGrams || 0} />
            </div>
          </div>
        </div>

        <div className="space-y-6 md:col-span-2 p-6 bg-card border border-border rounded-xl">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Colors & Variants</h2>
            <Button type="button" variant="outline" size="sm" onClick={addVariant}>Add Color Option</Button>
          </div>
          
          {variants.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No color variants added. You can still add standard stock below.</p>
          )}

          {variants.map((variant, i) => (
            <div key={i} className="flex items-center gap-4 p-4 border rounded-lg bg-muted/30">
              <div className="flex-1">
                <Label>Color Name</Label>
                <Input placeholder="e.g. Pink" value={variant.color} onChange={e => updateVariant(i, 'color', e.target.value)} required />
              </div>
              <div className="flex-1">
                <Label>SKU</Label>
                <Input value={variant.sku} onChange={e => updateVariant(i, 'sku', e.target.value)} required />
              </div>
              <div className="flex-1">
                <Label>Stock</Label>
                <Input type="number" value={variant.stock} onChange={e => updateVariant(i, 'stock', parseInt(e.target.value) || 0)} required />
              </div>
              <div className="pt-6">
                <Button type="button" variant="ghost" className="text-destructive" onClick={() => removeVariant(i)}>Remove</Button>
              </div>
            </div>
          ))}

          {variants.length === 0 && (
            <div className="grid gap-4 md:grid-cols-2 p-4 border rounded-lg bg-muted/30 mt-4">
               <div className="flex flex-col gap-2">
                <Label htmlFor="sku">Standard SKU *</Label>
                <div className="flex gap-2">
                  <Input id="sku" name="sku" defaultValue={initialData?.sku || generateSkuForColor("")} />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="stock">Standard Stock Quantity *</Label>
                <Input id="stock" name="stock" type="number" defaultValue={initialData?.stock || 0} />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6 p-6 bg-card border border-border rounded-xl h-fit">
          <h2 className="text-lg font-semibold">Organization</h2>
          <div className="grid gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="status">Status *</Label>
              <select 
                id="status" 
                name="status" 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" 
                required
                defaultValue={initialData?.status || "draft"}
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="categoryId">Category</Label>
              <select 
                id="categoryId" 
                name="categoryId" 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">Select Category...</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => {
                      setSelectedTags(prev => 
                        prev.includes(tag.id) ? prev.filter(id => id !== tag.id) : [...prev, tag.id]
                      )
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                      selectedTags.includes(tag.id) 
                        ? 'bg-primary text-primary-foreground border-primary' 
                        : 'bg-background hover:bg-muted'
                    }`}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 p-6 bg-card border border-border rounded-xl">
          <h2 className="text-lg font-semibold">Media</h2>
          <div className="grid gap-4">
            <div className="flex flex-col gap-4 mb-4">
              {images.map((img, i) => (
                <div key={i} className="flex gap-4 p-3 border rounded-lg items-center">
                  <div className="relative w-16 h-16 rounded-md overflow-hidden shrink-0">
                    <img src={img.url} alt={`Upload ${i}`} className="object-cover w-full h-full" />
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs">Assign to Color</Label>
                    <select 
                      className="flex h-8 w-full mt-1 rounded-md border border-input bg-background px-2 py-1 text-xs"
                      value={img.color || ""}
                      onChange={(e) => {
                        const newImages = [...images]
                        newImages[i].color = e.target.value || null
                        setImages(newImages)
                      }}
                    >
                      <option value="">Default (All Colors)</option>
                      {variants.map((v, idx) => (
                        <option key={idx} value={v.color}>{v.color}</option>
                      ))}
                    </select>
                  </div>
                  <Button type="button" variant="ghost" size="icon" className="text-destructive shrink-0" onClick={() => setImages(prev => prev.filter((_, index) => index !== i))}>×</Button>
                </div>
              ))}
            </div>
            <ImageUploader onUpload={(url) => setImages(prev => [...prev, { url, color: null }])} />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save Product"}
        </Button>
      </div>
    </form>
  )
}
