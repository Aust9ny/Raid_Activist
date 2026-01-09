// /frontend/composables/useToast.js
export const useToast = () => {
  const message = useState('toast_message', () => '')
  const type = useState('toast_type', () => 'info') 
  const isVisible = useState('toast_visible', () => false)
  
  // Use a global-scoped timer reference so we can clear it
  const timer = useState('toast_timer', () => null)

  const show = (msg, toastType = 'info', duration = 3000) => {
    // 1. Clear any existing timer to prevent early hiding
    if (timer.value) clearTimeout(timer.value)
    
    // 2. Set the data
    message.value = msg
    type.value = toastType
    isVisible.value = true

    // 3. Start a new timer
    timer.value = setTimeout(() => {
      isVisible.value = false
      timer.value = null
    }, duration)
  }

  return { 
    message, 
    type, 
    isVisible, 
    // Add these helper methods so toast.success() works!
    success: (msg, dur) => show(msg, 'success', dur),
    error: (msg, dur) => show(msg, 'error', dur),
    info: (msg, dur) => show(msg, 'info', dur)
  }
}