/**
 * Compresses an image client-side to a maximum file size in WebP format
 * while preserving aspect ratio.
 */
export async function compressImage(file: File, maxSizeKB: number = 200): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target?.result as string
      img.onload = () => {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        if (!ctx) {
          reject(new Error("Could not get canvas context"))
          return
        }

        // Calculate new dimensions (max 1920x1080 bounding box roughly, but maintaining aspect)
        let width = img.width
        let height = img.height
        const maxDim = 1920
        
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width)
            width = maxDim
          } else {
            width = Math.round((width * maxDim) / height)
            height = maxDim
          }
        }

        canvas.width = width
        canvas.height = height
        ctx.drawImage(img, 0, 0, width, height)

        // Try different quality settings to hit the target file size
        let quality = 0.9
        const targetBytes = maxSizeKB * 1024

        const attemptCompression = () => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("Canvas toBlob failed"))
                return
              }

              if (blob.size > targetBytes && quality > 0.1) {
                quality -= 0.1
                attemptCompression()
              } else {
                // Convert blob back to file
                const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".webp"), {
                  type: "image/webp",
                  lastModified: Date.now(),
                })
                resolve(newFile)
              }
            },
            "image/webp",
            quality
          )
        }

        attemptCompression()
      }
      img.onerror = (e) => reject(e)
    }
    reader.onerror = (e) => reject(e)
  })
}
