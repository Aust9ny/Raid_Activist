// middleware/admin.js
export default defineNuxtRouteMiddleware(() => {
  const auth = useAuth()
  if (auth.user?.roleId !== 1) {
    return navigateTo('/dashboard')
  }
})
