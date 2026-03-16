export function validateWebhookUrl(url: string): { valid: boolean; reason?: string } {
  try {
    const parsed = new URL(url)
    
    if (parsed.protocol !== 'https:') {
      return { valid: false, reason: 'Only HTTPS URLs are allowed' }
    }
    
    const hostname = parsed.hostname.toLowerCase()
    
    const blocked = [
      'localhost', '127.0.0.1', '0.0.0.0', '::1',
      'metadata.google.internal', '169.254.169.254',
    ]
    if (blocked.includes(hostname)) {
      return { valid: false, reason: 'Blocked hostname' }
    }
    
    // Block private IP ranges
    const privateRanges = [
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
      /^192\.168\./,
      /^fc00:/i,
      /^fd/i,
    ]
    if (privateRanges.some(r => r.test(hostname))) {
      return { valid: false, reason: 'Private IP addresses are not allowed' }
    }
    
    return { valid: true }
  } catch {
    return { valid: false, reason: 'Invalid URL format' }
  }
}
