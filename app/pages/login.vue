<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "~/stores/Auth";
import { useAnimatedBackground } from "~/composables/useAnimatedBackground";

// Router & Store
const router = useRouter();
const authStore = useAuth();
const { showToast } = useToast();

// Animated Background
const {
  dotPositions,
  ripples,
  handleBackgroundClick,
  startAmbientGlow,
  stopAmbientGlow,
} = useAnimatedBackground();

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
const isError = ref(false);
const isSuccess = ref(false);

// Validation
const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const isEmailValid = computed(
  () => email.value === "" || emailPattern.test(email.value)
);
const isFormValid = computed(
  () => email.value && password.value && isEmailValid.value
);

// Login handler
const handleLogin = async () => {
  if (isLoading.value || isSuccess.value) return;

  isLoading.value = true;
  isError.value = false;

  try {
    // Main Login
    await authStore.login(email.value.trim(), password.value.trim());

    // Success UI
    isLoading.value = false;
    isSuccess.value = true;

    showToast(
      "Welcome back, " + (authStore.user?.email || "Commander") + "!",
      "success"
    );

    // Navigate after short animation
    setTimeout(() => {
      router.push("/dashboard");
    }, 1000);
  } catch (error) {
    isLoading.value = false;
    isError.value = true;

    showToast(error.message || "Identity Verification Failed", "error");

    setTimeout(() => {
      isError.value = false;
    }, 500);
  }
};
</script>

<template>
  <div
    class="login-page flex items-center justify-center min-h-screen bg-[#0f172a] px-4 overflow-hidden relative"
  >
    <!-- Background -->
    <div class="fixed inset-0 z-0 pointer-events-none">
      <div
        v-for="dot in dotPositions"
        :key="dot.id"
        :class="['polka-dot absolute rounded-full', `bg-${dot.color}`]"
        :style="{
          ...dot.position,
          width: dot.size + 'px',
          height: dot.size + 'px',
          animationDelay: dot.delay + 's',
          opacity: 0.2,
        }"
      ></div>
      <div
        v-for="ripple in ripples"
        :key="ripple.id"
        class="ripple-effect absolute rounded-full mix-blend-overlay filter blur-sm"
        :style="ripple.style"
      ></div>
    </div>

    <div class="relative z-10 w-full max-w-md">
      <!-- Success overlay -->
      <transition name="zoom-in">
        <div
          v-if="isSuccess"
          class="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-2xl rounded-[2.5rem] border border-green-500/30"
        >
          <div class="success-checkmark">
            <div class="check-icon">
              <span class="icon-line line-tip"></span>
              <span class="icon-line line-long"></span>
              <div class="icon-circle"></div>
              <div class="icon-fix"></div>
            </div>
          </div>
          <h2
            class="text-white font-black text-2xl mt-4 tracking-tight animate-pulse uppercase"
          >
            Identity Verified
          </h2>
          <p
            class="text-slate-400 text-sm mt-1 uppercase tracking-widest font-bold"
          >
            Initiating Dashboard...
          </p>
        </div>
      </transition>

      <!-- Login card -->
      <div
        class="login-card"
        :class="{
          'shake-active': isError,
          'opacity-20 pointer-events-none scale-95': isSuccess,
        }"
      >
        <div class="text-center mb-8">
          <div
            class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-500 to-indigo-600 mb-4 shadow-xl shadow-pink-500/20"
          >
            <span class="text-2xl">🚀</span>
          </div>
          <h1 class="text-3xl font-black text-white tracking-tighter uppercase">
            Welcome Back
          </h1>
          <p
            class="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2"
          >
            Nuxt Secure Access Terminal
          </p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-4">
          <!-- Email -->
          <div class="space-y-1">
            <label
              class="text-[10px] font-black uppercase tracking-widest text-pink-400/80 ml-4"
            >
              Email Address
            </label>
            <input
              v-model="email"
              type="email"
              placeholder="name@domain.com"
              class="input-field"
              :class="{ 'border-red-500/50': email && !isEmailValid }"
              required
            />
          </div>

          <!-- Password -->
          <div class="space-y-1">
            <div class="flex justify-between items-center px-4">
              <label
                class="text-[10px] font-black uppercase tracking-widest text-pink-400/80"
              >
                Password
              </label>

              <button
                type="button"
                @click="showPassword = !showPassword"
                class="text-[10px] text-slate-500 font-black uppercase tracking-widest hover:text-pink-400 transition-colors"
              >
                {{ showPassword ? "Hide" : "Show" }}
              </button>
            </div>

            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
              class="input-field"
              required
            />
          </div>

          <!-- Submit -->
          <button
            type="submit"
            class="submit-btn"
            :disabled="isLoading || !isFormValid"
          >
            <span v-if="!isLoading">AUTHORIZE LOGIN</span>
            <div v-else class="spinner"></div>
          </button>
        </form>

        <!-- Register -->
        <p
          class="text-center text-[10px] font-black mt-8 text-slate-500 uppercase tracking-widest"
        >
          New Explorer?
          <NuxtLink
            to="/register"
            class="text-pink-500 hover:text-pink-400 transition ml-1"
          >
            Establish Identity
          </NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
/* (same CSS, unchanged — only logic was fixed) */
</style>
