// ~/middleware/auth.global.js
import { useAuth } from '~/stores/Auth'

export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuth()
  const tokenCookie = useCookie('auth_token')

  // 🔑 Restore token into Pinia if missing
  if (tokenCookie.value && !auth.token) {
    auth.token = tokenCookie.value
  }

  const publicRoutes = ['/login', '/register' , '/']
  const isPublicRoute = publicRoutes.includes(to.path)

  // 🚫 Not logged in → redirect to login
  if (!auth.token && !isPublicRoute) {
    return navigateTo('/login')
  }

  // ✅ Logged in → block login/register
  if (auth.token && isPublicRoute) {
    return navigateTo('/dashboard')
  }
})
