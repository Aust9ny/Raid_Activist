export const useActivities = (params) => {
  const auth = useAuth()

  const { data, pending, error, refresh } = useAsyncData(
    // 🛠️ FIX: Join the array into a unique string key
    `activities-${auth.token}-${JSON.stringify(params.value)}`, 
    async () => {
      if (!auth.token) return []
      const queryString = new URLSearchParams(params.value || {}).toString()
      return await useApiFetch(`/activities?${queryString}`)
    },
    {
      server: false,
      immediate: true,
      default: () => [],
      // Nuxt will re-run this function when these reactive dependencies change
      watch: [params, () => auth.token],
    }
  )

  return {
    activities: data,
    loading: pending,
    error,
    refreshActivities: refresh,
  }
}