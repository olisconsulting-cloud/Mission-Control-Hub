import { auth } from '@/lib/auth'

export default auth(() => {
  // Protected routes
})

export const config = { matcher: ['/dashboard/:path*'] }
