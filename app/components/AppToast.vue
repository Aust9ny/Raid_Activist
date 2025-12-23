<script setup>
const { message, type, isVisible } = useToast()

const typeClasses = {
  success: 'bg-green-500 border-green-400',
  error: 'bg-red-500 border-red-400',
  info: 'bg-indigo-500 border-indigo-400'
}
</script>

<template>
  <Teleport to="body">
    <Transition name="toast-fade">
      <div v-if="isVisible" 
        class="fixed top-5 right-5 z-[100] flex items-center p-4 rounded-2xl border shadow-2xl text-white backdrop-blur-md bg-opacity-80"
        :class="typeClasses[type]"
      >
        <span class="mr-3 text-xl">
          <span v-if="type === 'success'">✅</span>
          <span v-else-if="type === 'error'">❌</span>
          <span v-else>ℹ️</span>
        </span>
        <p class="font-bold tracking-wide">{{ message }}</p>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.toast-fade-enter-active, .toast-fade-leave-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.toast-fade-enter-from { opacity: 0; transform: translateX(100px); }
.toast-fade-leave-to { opacity: 0; transform: scale(0.9); }
</style>