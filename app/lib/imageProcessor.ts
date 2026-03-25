// Client-side image processor, runs entirely in the browser via Canvas API.
// Always outputs JPEG for maximum compression compatibility with the Anthropic API.

export const MAX_LONG_EDGE = 1568 // Anthropic's recommended max for vision tasks
export const JPEG_QUALITY = 0.82

export type ProcessedImage = {
  data: string // raw base64
  mediaType: "image/jpeg"
  originalSize: number // bytes
  processedSize: number // bytes
  width: number
  height: number
  name: string
  previewUrl: string // object URL of the JPEG blob for display
}

export const processImage = (file: File): Promise<ProcessedImage> => {
  return new Promise((resolve, reject) => {
    const originalSize = file.size
    const { name } = file

    const img = new Image()
    const objectUrl = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)

      let w = img.naturalWidth
      let h = img.naturalHeight
      const longEdge = Math.max(w, h)

      if (longEdge > MAX_LONG_EDGE) {
        const scale = MAX_LONG_EDGE / longEdge
        w = Math.round(w * scale)
        h = Math.round(h * scale)
      }

      const canvas = document.createElement("canvas")
      canvas.width = w
      canvas.height = h

      const ctx = canvas.getContext("2d")
      if (!ctx) {
        reject(new Error("Could not get canvas context"))
        return
      }

      // white background for transparent PNGs before JPEG conversion
      ctx.fillStyle = "#000000"
      ctx.fillRect(0, 0, w, h)
      ctx.drawImage(img, 0, 0, w, h)

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Canvas toBlob failed"))
            return
          }

          const previewUrl = URL.createObjectURL(blob)

          const reader = new FileReader()
          reader.onload = () => {
            const dataUrl = reader.result as string
            const data = dataUrl.split(",")[1] // strip "data:image/jpeg;base64,"
            resolve({
              data,
              mediaType: "image/jpeg",
              originalSize,
              processedSize: blob.size,
              width: w,
              height: h,
              name,
              previewUrl,
            })
          }
          reader.onerror = () => reject(reader.error)
          reader.readAsDataURL(blob)
        },
        "image/jpeg",
        JPEG_QUALITY,
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error("Failed to load image"))
    }

    img.src = objectUrl
  })
}

export const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}

export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"]

export const isAcceptedType = (type: string) => ACCEPTED_TYPES.includes(type)
