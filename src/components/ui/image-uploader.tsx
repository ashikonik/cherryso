"use client"

import { useState, useCallback } from "react"
import { compressImage } from "@/lib/image-utils"
import { Button } from "@/components/ui/button"
import { Loader2, UploadCloud, X } from "lucide-react"
import Image from "next/image"

interface ImageUploaderProps {
  onUpload: (url: string) => void
  disabled?: boolean
}

export function ImageUploader({ onUpload, disabled }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setError(null)

    try {
      // 1. Compress Image
      const compressedFile = await compressImage(file, 200) // Max 200KB WebP

      // 2. Upload Image
      const formData = new FormData()
      formData.append("file", compressedFile)

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        throw new Error(await res.text())
      }

      const data = await res.json()
      onUpload(data.url)
    } catch (err: unknown) {
      console.error(err)
      setError((err as Error).message || "Failed to upload image")
    } finally {
      setIsUploading(false)
      // Reset input
      e.target.value = ""
    }
  }, [onUpload])

  return (
    <div className="flex flex-col gap-2">
      <div className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-center bg-muted/20 relative group hover:bg-muted/50 transition-colors">
        <input
          type="file"
          accept="image/*"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          onChange={handleFileChange}
          disabled={disabled || isUploading}
        />
        
        {isUploading ? (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="text-sm">Compressing & Uploading...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground group-hover:text-foreground transition-colors">
            <UploadCloud className="w-8 h-8" />
            <span className="text-sm font-medium">Click or drag image to upload</span>
            <span className="text-xs">Max 200KB • Auto-converts to WebP</span>
          </div>
        )}
      </div>
      
      {error && <div className="text-sm text-destructive font-medium">{error}</div>}
    </div>
  )
}
