export const useApiFetch = (path, options = {}) => {
  const auth = useAuth()
  const config = useRuntimeConfig()

  return $fetch(`${config.public.apiBaseUrl}${path}`, {
    ...options,
    headers: {
      ...options.headers,
      // If this is missing, the backend returns 401 and activities will be empty
      Authorization: auth.token ? `Bearer ${auth.token}` : '',
    },
  })
}