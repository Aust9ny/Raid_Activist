// /frontend/composables/useToast.js
export const useToast = () => {
  const message = useState('toast_message', () => '')
  const type = useState('toast_type', () => 'info') // 'success', 'error', 'info'
  const isVisible = useState('toast_visible', () => false)

  const showToast = (msg, toastType = 'info', duration = 3000) => {
    message.value = msg
    type.value = toastType
    isVisible.value = true

    setTimeout(() => {
      isVisible.value = false
    }, duration)
  }

  return { message, type, isVisible, showToast }
}