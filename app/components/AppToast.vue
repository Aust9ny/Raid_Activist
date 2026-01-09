<script setup>
const { message, type, isVisible } = useToast()

// Define neon glow colors and glass backgrounds
const themeClasses = {
  success: 'bg-emerald-500/20 border-emerald-500/50 shadow-emerald-500/20 text-emerald-400',
  error: 'bg-rose-500/20 border-rose-500/50 shadow-rose-500/20 text-rose-400',
  info: 'bg-cyan-500/20 border-cyan-500/50 shadow-cyan-500/20 text-cyan-400'
}

const iconColors = {
  success: 'text-emerald-400',
  error: 'text-rose-400',
  info: 'text-cyan-400'
}
</script>

<template>
  <Teleport to="body">
    <Transition name="toast-pop">
      <div v-if="isVisible" 
        class="fixed top-8 right-8 z-[200] flex items-center min-w-[320px] p-1 rounded-[1.5rem] border backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden"
        :class="themeClasses[type]"
      >
        <div class="flex items-center w-full px-5 py-4 bg-white/5 rounded-[1.25rem]">
          
          <div class="relative flex items-center justify-center w-10 h-10 mr-4 rounded-xl bg-white/10 shadow-inner">
            <span class="absolute inset-0 rounded-xl animate-ping opacity-20" :class="iconColors[type]"></span>
            <span class="text-xl relative z-10">
              <span v-if="type === 'success'">⚡</span>
              <span v-else-if="type === 'error'">⚠️</span>
              <span v-else>☄️</span>
            </span>
          </div>

          <div class="flex-1">
            <p class="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 mb-0.5">{{ type }}</p>
            <p class="font-bold text-sm tracking-tight text-white/90">{{ message }}</p>
          </div>

          <div class="ml-4 h-full flex items-center">
            <div class="w-1 h-8 bg-white/10 rounded-full"></div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* High-inertia "Gaming Mouse" animation */
.toast-pop-enter-active {
  transition: all 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}
.toast-pop-leave-active {
  transition: all 0.4s cubic-bezier(0.7, 0, 0.84, 0);
}

.toast-pop-enter-from { 
  opacity: 0; 
  transform: translateX(100%) scale(0.9) rotate(5deg); 
  filter: blur(10px);
}
.toast-pop-leave-to { 
  opacity: 0; 
  transform: translateY(-20px) scale(0.95);
}

/* Add a subtle scanning light effect over the toast */
@keyframes scan {
  from { transform: translateX(-100%); }
  to { transform: translateX(200%); }
}

div::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 50%;
  height: 100%;
  background: linear-gradient(to right, transparent, rgba(255,255,255,0.1), transparent);
  transform: skewX(-25deg);
  animation: scan 3s infinite;
}
</style>