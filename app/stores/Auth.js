import { defineStore } from 'pinia'
import { useApiFetch } from '~/composables/useApiFetch'

export const useAuth = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
  }),

  actions: {
    async login(email, password) {
      try {
        const res = await $fetch(
          `${useRuntimeConfig().public.apiBaseUrl}/auth/login`,
          {
            method: 'POST',
            body: { email, password },
          }
        )

        // Save token
        this.token = res.token
        useCookie('auth_token').value = res.token

        // Save user (adjust fields to your backend response)
        this.user = {
          id: res.userId,
          name: res.userName,
          email,
          roleId: res.roleId,
        }

        return res
      } catch (err) {
        throw new Error(
          err?.data?.error || 'Invalid email or password'
        )
      }
    },

    logout() {
      this.token = null
      this.user = null
      useCookie('auth_token').value = null
      navigateTo('/login')
    },
  },
})
