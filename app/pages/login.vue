<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useAnimatedBackground } from "~/composables/useAnimatedBackground";
import { useAuth } from "~/stores/Auth";

const router = useRouter();
const authStore = useAuth(); // Initialize the store
const { dotPositions, ripples, handleBackgroundClick , startAmbientGlow , stopAmbientGlow } =
  useAnimatedBackground();
const { showToast } = useToast(); // Import the composable

// Attach the listener to the entire body on mount for background effects
onMounted(() => {
  document.addEventListener("click", handleBackgroundClick);
  startAmbientGlow();
});


onUnmounted(() => {
  document.removeEventListener("click", handleBackgroundClick);
  stopAmbientGlow();
});

definePageMeta({
  middleware: "guest",
});

const title = "Log In";

const email = ref("");
const password = ref("");

const loginError = ref(null); // New state for API errors
const isLoggingIn = ref(false); // New state for loading indicator

// Simple email pattern check for immediate feedback
const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const isEmailValid = computed(() => {
  return email.value.length === 0 || emailPattern.test(email.value);
});

// Check if inputs are filled to enable the button
const isFormValid = computed(() => {
  return (
    email.value.length > 0 && password.value.length > 0 && isEmailValid.value
  );
});

const handleLogin = async () => {
  isLoggingIn.value = true;
  loginError.value = null;

  try {
    await authStore.login(email.value, password.value);

    showToast("Welcome back, " + authStore.user.email + "!", "success");
    router.replace("/dashboard");
  } catch (error) {
    loginError.value = error.message;
    showToast(error.message, "error"); // <--- Instant feedback!
  } finally {
    isLoggingIn.value = false;
  }
};
</script>

<template>


  <div class="auth-root min-h-screen flex items-center justify-center relative overflow-hidden p-4">
            <div class="fixed inset-0 z-0 pointer-events-none overflow-hidden">
            <div v-for="dot in dotPositions" :key="dot.id"
                :class="['polka-dot', `bg-${dot.color}`, `w-${dot.size}`, `h-${dot.size}`]"
                :style="{ 
                    ...dot.position, 
                    animationDelay: dot.delay + 's',
                    opacity: 0.4
                }">
            </div>
                    <div v-for="ripple in ripples" :key="ripple.id"
             class="ripple-effect absolute rounded-full mix-blend-overlay filter blur-sm z-50"
             :style="ripple.style"></div>
        </div>
    <div class="relative z-10 w-full max-w-md animate-in">
      <div class="glass-panel p-10 shadow-2xl space-y-8">
        <div class="text-center space-y-2">
            <h1 class="text-4xl font-black text-white tracking-tighter">WELCOME BACK</h1>
            <p class="text-white/50 font-bold text-sm uppercase tracking-widest">Identity Verification Required</p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-6">
          <div class="space-y-2">
            <label class="text-xs font-black text-pink-300 uppercase ml-4">Email Address</label>
            <input v-model="email" type="email" placeholder="name@domain.com" class="input-glass" />
          </div>

          <div class="space-y-2">
            <label class="text-xs font-black text-pink-300 uppercase ml-4">Password</label>
            <input v-model="password" type="password" placeholder="Enter your password" class="input-glass" />
          </div>

          <button type="submit" :disabled="!isFormValid" class="w-full py-4 bg-white text-indigo-900 font-black rounded-full shadow-xl hover:bg-pink-300 transition active:scale-95 disabled:opacity-30 uppercase tracking-widest">
            sign in
          </button>
        </form>

        <p class="text-center text-sm font-bold text-white/40 uppercase tracking-tight">
          New to the feed? 
          <NuxtLink to="/register" class="text-pink-300 hover:text-white transition">Create Profile</NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>

.auth-root { background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%); }
.glass-panel {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 40px;
}
.input-glass {
    width: 100%;
    padding: 16px 24px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    color: white;
    font-weight: 700;
}
.input-glass:focus { border-color: #f472b6; outline: none; background: rgba(255,255,255,0.1); }
/* Define the custom animation for the background polka dots */
@keyframes move-background {
  0% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(calc(100vw - 100%), calc(100vh - 100%)) scale(1.1);
  }
  66% {
    transform: translate(calc(50vw - 50%), calc(100vh - 100%)) scale(0.9);
  }
  100% {
    transform: translate(0, 0) scale(1);
  }
}

.dot-animation {
  animation: move-background 15s infinite alternate ease-in-out;
}

/* --- NEW CSS FOR CLICK RIPPLE EFFECT --- */
@keyframes ripple-grow {
  0% {
    transform: translate(-50%, -50%) scale(0.1);
    opacity: 0.7;
  }
  100% {
    transform: translate(-50%, -50%) scale(15); /* Scale up significantly */
    opacity: 0;
  }
}

.ripple-effect {
  /* Set initial size and animation properties */
  width: 20px;
  height: 20px;
  animation: ripple-grow 2s ease-out forwards;
  pointer-events: none; /* Crucial: ensures the ripples don't capture future clicks */

  /* Used to position the center of the ripple exactly at the click point */
  transform: translate(-50%, -50%);
}

h1 {
  text-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
</style>
