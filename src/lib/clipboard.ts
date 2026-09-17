import { toBlob } from 'html-to-image'

export interface CopyImageResult {
  ok: boolean
  message: string
}

/**
 * Renders the given DOM node to a PNG blob and writes it to the clipboard.
 * Falls back to triggering a download if the Clipboard API (or permission)
 * is unavailable, e.g. non-secure contexts or older browsers.
 */
export async function copyNodeAsImage(node: HTMLElement, filename = 'fulbini.png'): Promise<CopyImageResult> {
  try {
    const bgColor = getComputedStyle(document.body).backgroundColor || '#0a0d12'
    const blob = await toBlob(node, { backgroundColor: bgColor, pixelRatio: 2 })
    if (!blob) return { ok: false, message: 'Could not render image' }

    if (navigator.clipboard && 'write' in navigator.clipboard && typeof ClipboardItem !== 'undefined') {
      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })])
      return { ok: true, message: 'Copied to clipboard' }
    }

    downloadBlob(blob, filename)
    return { ok: true, message: 'Clipboard unsupported — downloaded instead' }
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : 'Copy failed' }
  }
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
