<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useAnimatedBackground } from "~/composables/useAnimatedBackground";
import { useAuth } from '~/stores/Auth';

const auth = useAuth();
const { showToast } = useToast();
const { dotPositions, ripples, handleBackgroundClick, startAmbientGlow, stopAmbientGlow } = useAnimatedBackground();

// --- State ---
const loading = ref(false);
const nickname = ref("");
const email = ref("");
const phoneNumber = ref("");
const password = ref("");
const passwordConfirm = ref("");
const showModal = ref(false);

// --- Background Effects ---
onMounted(() => {
  document.addEventListener("click", handleBackgroundClick);
  startAmbientGlow();
});

onUnmounted(() => {
  document.removeEventListener("click", handleBackgroundClick);
  stopAmbientGlow();
});

definePageMeta({ middleware: 'guest' });

// --- RESTORED LOGIC: Validation Patterns ---
const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const phonePattern = /^[0-9]{10}$/;

const constraints = [
  { text: "At least 8 characters", regex: /.{8,}/ },
  { text: "Uppercase letter (A-Z)", regex: /[A-Z]/ },
  { text: "Lowercase letter (a-z)", regex: /[a-z]/ },
  { text: "Contains a number (0-9)", regex: /[0-9]/ },
  { text: "Special character (@, #, $)", regex: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/ },
];

// --- RESTORED LOGIC: Computed Checks ---
const isEmailValid = computed(() => email.value.length === 0 || emailPattern.test(email.value));
const isPhoneValid = computed(() => phoneNumber.value.length === 0 || phonePattern.test(phoneNumber.value));
const isNicknameValid = computed(() => nickname.value.length === 0 || nickname.value.trim().length > 2);

const constraintChecks = computed(() => {
  return constraints.map((c) => ({ ...c, meets: c.regex.test(password.value) }));
});

const isPasswordStrong = computed(() => constraintChecks.value.every((c) => c.meets));
const doPasswordsMatch = computed(() => passwordConfirm.value.length > 0 && password.value === passwordConfirm.value);

const isFormValid = computed(() => {
    return email.value.length > 0 && isEmailValid.value &&
           phoneNumber.value.length === 10 && isPhoneValid.value &&
           isNicknameValid.value && isPasswordStrong.value && doPasswordsMatch.value;
});

const allFieldsFilled = computed(() => {
  return email.value.length > 0 && nickname.value.length > 0 && phoneNumber.value.length > 0 && password.value.length > 0 && passwordConfirm.value.length > 0;
});

// --- Handlers ---
const handleRegister = async () => {
    if (!isFormValid.value) return;
    loading.value = true;
    try {
        await auth.register({
            email: email.value,
            password: password.value,
            nickname: nickname.value,
            tel: phoneNumber.value,
            Fname: nickname.value, 
            Lname: "User",        
        });
        showModal.value = true;
    } catch (err) {
        showToast(err.message || 'Registration failed.', 'error');
    } finally {
        loading.value = false;
    }
};

const closeModalAndRedirect = () => { navigateTo("/login"); };
</script>

<template>
  <div class="auth-root min-h-screen flex items-center justify-center relative overflow-hidden p-4">
    <div class="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div v-for="dot in dotPositions" :key="dot.id"
            class="dot-animation rounded-full absolute"
            :class="[`bg-${dot.color}`, `w-${dot.size}`, `h-${dot.size}`]"
            :style="{ ...dot.position, animationDelay: dot.delay + 's', opacity: 0.4 }">
        </div>
        <div v-for="ripple in ripples" :key="ripple.id"
            class="ripple-effect absolute rounded-full mix-blend-overlay filter blur-sm z-50"
            :style="ripple.style"></div>
    </div>

    <div class="relative z-10 w-full max-w-md animate-in">
      <div class="glass-panel p-8 md:p-10 shadow-2xl space-y-6">
        <div class="text-center">
            <h1 class="text-4xl font-black text-white tracking-tighter uppercase">Join FluidFeed</h1>
            <p class="text-white/40 text-xs uppercase tracking-widest mt-1">Create your digital identity</p>
        </div>

        <form @submit.prevent="handleRegister" class="space-y-4">
          <div class="space-y-1">
              <input v-model="nickname" type="text" placeholder="Username" class="input-glass" 
                     :class="{'border-red-500/50': nickname.length > 0 && !isNicknameValid}" required />
              <p v-if="nickname.length > 0 && !isNicknameValid" class="text-[10px] text-red-400 ml-4 font-bold uppercase">Minimum 3 characters required</p>
          </div>

          <div class="space-y-1">
              <input v-model="email" type="email" placeholder="Email Address" class="input-glass"
                     :class="{'border-red-500/50': email.length > 0 && !isEmailValid}" required />
              <p v-if="email.length > 0 && !isEmailValid" class="text-[10px] text-red-400 ml-4 font-bold uppercase">Invalid email format</p>
          </div>

          <div class="space-y-1">
              <input v-model="phoneNumber" type="tel" placeholder="Phone Number (10 digits)" class="input-glass"
                     oninput="javascript: this.value = this.value.replace(/[^0-9]/g, ''); if (this.value.length > 10) this.value = this.value.slice(0, 10);"
                     :class="{'border-red-500/50': phoneNumber.length > 0 && !isPhoneValid}" required />
              <p v-if="phoneNumber.length > 0 && !isPhoneValid" class="text-[10px] text-red-400 ml-4 font-bold uppercase">Must be exactly 10 digits</p>
          </div>
          
          <div class="space-y-3">
            <input v-model="password" type="password" placeholder="Password" class="input-glass" required />
            <ul class="grid grid-cols-1 gap-1.5 px-4">
                <li v-for="check in constraintChecks" :key="check.text" 
                    class="text-[11px] font-bold transition-all duration-300 flex items-center gap-2"
                    :class="check.meets ? 'text-green-400' : 'text-white/20'">
                    <span class="w-1.5 h-1.5 rounded-full" :class="check.meets ? 'bg-green-400' : 'bg-white/20'"></span>
                    {{ check.text }}
                </li>
            </ul>
          </div>

          <div class="space-y-1">
              <input v-model="passwordConfirm" type="password" placeholder="Confirm Password" class="input-glass"
                     :class="{'border-red-500/50': passwordConfirm.length > 0 && !doPasswordsMatch}" required />
              <p v-if="passwordConfirm.length > 0 && !doPasswordsMatch" class="text-[10px] text-red-400 ml-4 font-bold uppercase">Passwords do not match</p>
              <p v-if="passwordConfirm.length > 0 && doPasswordsMatch" class="text-[10px] text-green-400 ml-4 font-bold uppercase">Passwords match!</p>
          </div>

          <button type="submit" :disabled="loading || !isFormValid || !allFieldsFilled" 
                  class="w-full py-4 bg-white text-indigo-900 font-black rounded-full shadow-xl hover:bg-pink-300 transition active:scale-95 disabled:opacity-20 uppercase tracking-widest mt-4">
            {{ loading ? 'Synchronizing...' : 'Create Account' }}
          </button>
        </form>

        <p class="text-center text-sm font-bold text-white/40 uppercase">
        Already have an account? <NuxtLink to="/login" class="text-pink-300 hover:text-white transition">Log In</NuxtLink>
        </p>
      </div>
    </div>
  </div>

  <Teleport to="body">
    <Transition name="fade">
      <div v-if="showModal" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="glass-panel p-8 max-w-sm text-center border-white/20">
          <div class="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/50">
              <span class="text-3xl">✅</span>
          </div>
          <h3 class="text-2xl font-black text-white uppercase tracking-tighter">Registration Success</h3>
          <p class="text-white/60 text-sm mt-2 mb-6">Your identity has been verified. Welcome to the feed.</p>
          <button @click="closeModalAndRedirect" class="w-full py-3 bg-pink-400 text-white font-black rounded-full hover:bg-pink-300 transition">
            Proceed to Login
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.auth-root { background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%); }
.glass-panel { background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 40px; }
.input-glass { width: 100%; padding: 14px 24px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 18px; color: white; font-weight: 700; transition: all 0.3s; outline: none; }
.input-glass:focus { border-color: #f472b6; background: rgba(255,255,255,0.1); }
.dot-animation { border-radius: 50%; filter: blur(45px); animation: move-background 15s infinite alternate ease-in-out; }
@keyframes move-background { 0% { transform: translate(0, 0) scale(1); } 50% { transform: translate(30px, 60px) scale(1.2); } 100% { transform: translate(0, 0) scale(1); } }
.ripple-effect { width: 20px; height: 20px; background: white; animation: ripple-grow 1.5s ease-out forwards; pointer-events: none; transform: translate(-50%, -50%); }
@keyframes ripple-grow { 0% { transform: translate(-50%, -50%) scale(0.1); opacity: 0.5; } 100% { transform: translate(-50%, -50%) scale(25); opacity: 0; } }
.fade-enter-active, .fade-leave-active { transition: opacity 0.5s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>