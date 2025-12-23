import { useAuth } from '~/stores/Auth'

export const useUserApi = () => {
  const config = useRuntimeConfig()
  const base = config.public.apiBaseUrl
  const auth = useAuth()

  const authFetch = (url, options = {}) =>
    $fetch(`${base}${url}`, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: auth.token ? `Bearer ${auth.token}` : '',
      },
    })

  return {
    fetchMe: () => authFetch('/users/me'),

    updateProfile: (data) =>
      authFetch('/users/me', {
        method: 'PUT',
        body: data,
      }),

    changePassword: (data) =>
      authFetch('/users/me/password', {
        method: 'PUT',
        body: data,
      }),

    uploadAvatar: (formData) =>
      authFetch('/users/me/avatar', {
        method: 'POST',
        body: formData,
      }),
  }
}
