<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "~/stores/Auth";
import { useAnimatedBackground } from "~/composables/useAnimatedBackground";

// Router & Store
const router = useRouter();
const authStore = useAuth();
const { success: toastSuccess, error: toastError } = useToast();

// Animated Background
const { dotPositions, ripples, handleBackgroundClick, startAmbientGlow, stopAmbientGlow } = useAnimatedBackground();

onMounted(() => {
  document.addEventListener("click", handleBackgroundClick);
  startAmbientGlow();
});
onUnmounted(() => {
  document.removeEventListener("click", handleBackgroundClick);
  stopAmbientGlow();
});

// Page meta
definePageMeta({ middleware: "guest" });

// Form state
const email = ref("");
const password = ref("");
const showPassword = ref(false);
const isLoading = ref(false);
const isSuccess = ref(false);

// Validation
const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const isEmailValid = computed(() => email.value === "" || emailPattern.test(email.value));
const isFormValid = computed(() => email.value && password.value && isEmailValid.value);

// Login handler
const handleLogin = async () => {
  if (isLoading.value || isSuccess.value) return;

  isLoading.value = true;
  try {
    await authStore.login(email.value.trim(), password.value.trim());
    
    isSuccess.value = true;
    toastSuccess("Welcome back, Commander! 🚀");

    setTimeout(() => {
      router.push("/dashboard");
    }, 1200);
  } catch (error) {
    toastError(error.message || "Identity Verification Failed");
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="auth-root min-h-screen flex items-center justify-center relative overflow-hidden p-4">
    <div class="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div v-for="dot in dotPositions" :key="dot.id"
            class="dot-animation rounded-full absolute"
            :class="[`bg-${dot.color}`, `w-${dot.size}`, `h-${dot.size}`]"
            :style="{ ...dot.position, animationDelay: dot.delay + 's', opacity: 0.2 }">
        </div>
        <div v-for="ripple in ripples" :key="ripple.id"
            class="ripple-effect absolute rounded-full mix-blend-overlay filter blur-sm z-50"
            :style="ripple.style"></div>
    </div>

    <div class="relative z-10 w-full max-w-md animate-in">
      <transition name="fade">
        <div v-if="isSuccess" class="absolute inset-0 z-50 flex flex-col items-center justify-center bg-indigo-950/80 backdrop-blur-2xl rounded-[3rem] border border-emerald-500/30">
          <span class="text-6xl animate-bounce mb-4">🚀</span>
          <h2 class="text-white font-black text-2xl uppercase italic tracking-tighter">Identity Verified</h2>
          <p class="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Opening Data Stream...</p>
        </div>
      </transition>

      <div class="glass-panel p-10 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.4)] border-white/10 space-y-8" 
           :class="{'opacity-20 scale-95 pointer-events-none transition-all duration-700': isSuccess}">
        
        <div class="text-center space-y-2">
            <h1 class="text-4xl font-black text-white tracking-tighter uppercase italic">
              Fluid<span class="text-pink-500">Access</span>
            </h1>
            <p class="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">Authorize Login Sequence</p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-6">
          <div class="space-y-1">
              <label class="text-[9px] font-black text-pink-300 uppercase ml-4 tracking-widest">Access Email</label>
              <input v-model="email" type="email" placeholder="name@transmission.com" class="input-glass"
                     :class="{'border-rose-500/50': email.length > 0 && !isEmailValid}" required />
          </div>

          <div class="space-y-1">
              <div class="flex justify-between items-center px-4">
                  <label class="text-[9px] font-black text-pink-300 uppercase tracking-widest">Access Key</label>
                  <button type="button" @click="showPassword = !showPassword" class="text-[9px] font-black text-white/20 hover:text-white transition-colors uppercase">
                      {{ showPassword ? 'Hide' : 'Show' }}
                  </button>
              </div>
              <input v-model="password" :type="showPassword ? 'text' : 'password'" placeholder="••••••••" class="input-glass" required />
          </div>

          <button type="submit" :disabled="isLoading || !isFormValid" 
                  class="w-full relative py-4 bg-white text-indigo-950 font-black rounded-2xl shadow-xl transition-all active:scale-95 disabled:opacity-10 uppercase tracking-[0.2em] text-xs mt-4 group overflow-hidden">
            <div v-if="isLoading" class="absolute inset-0 bg-indigo-900 flex items-center justify-center">
                <div class="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            </div>
            <span v-else>Authorize Terminal</span>
          </button>
        </form>

        <div class="text-center pt-4">
            <p class="text-[10px] font-black text-white/30 uppercase tracking-widest">
                New Explorer? <NuxtLink to="/register" class="text-pink-400 hover:text-white transition underline decoration-pink-500/30 underline-offset-4">Establish Identity</NuxtLink>
            </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Reusing your high-fidelity styles from Register */
.auth-root { background: radial-gradient(circle at top right, #1e1b4b, #020617); }

.glass-panel { 
    background: rgba(255, 255, 255, 0.02); 
    backdrop-filter: blur(30px); 
    border: 1px solid rgba(255, 255, 255, 0.08); 
    border-radius: 3rem; 
}

.input-glass { 
    width: 100%; 
    padding: 1.1rem 1.5rem; 
    background: rgba(0, 0, 0, 0.3); 
    border: 1px solid rgba(255, 255, 255, 0.05); 
    border-radius: 1.25rem; 
    color: white; 
    font-size: 0.8rem;
    font-weight: 700; 
    transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1); 
    outline: none; 
}

.input-glass:focus { 
    border-color: #f472b6; 
    background: rgba(255,255,255,0.05); 
    box-shadow: 0 0 20px rgba(244, 114, 182, 0.1);
}

.animate-in {
  animation: cardEnter 0.8s cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes cardEnter {
  from { opacity: 0; transform: translateY(40px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

/* Background Effects */
.dot-animation { border-radius: 50%; filter: blur(55px); animation: move-background 15s infinite alternate ease-in-out; }
@keyframes move-background { 0% { transform: translate(0, 0) scale(1); } 50% { transform: translate(40px, 80px) scale(1.3); } 100% { transform: translate(0, 0) scale(1); } }

.ripple-effect { width: 20px; height: 20px; background: rgba(255, 255, 255, 0.1); animation: ripple-grow 1.5s ease-out forwards; pointer-events: none; transform: translate(-50%, -50%); }
@keyframes ripple-grow { 0% { transform: translate(-50%, -50%) scale(0.1); opacity: 0.5; } 100% { transform: translate(-50%, -50%) scale(30); opacity: 0; } }

.fade-enter-active, .fade-leave-active { transition: opacity 0.5s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>