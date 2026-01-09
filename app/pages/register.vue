<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useAnimatedBackground } from "~/composables/useAnimatedBackground";
import { useAuth } from '~/stores/Auth';

const auth = useAuth();
// FIX: Destructure the success/error methods from our upgraded useToast
const { success: toastSuccess, error: toastError } = useToast();
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

// --- Validation Patterns ---
const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const phonePattern = /^[0-9]{10}$/;

const constraints = [
  { text: "At least 8 characters", regex: /.{8,}/ },
  { text: "Uppercase letter (A-Z)", regex: /[A-Z]/ },
  { text: "Lowercase letter (a-z)", regex: /[a-z]/ },
  { text: "Contains a number (0-9)", regex: /[0-9]/ },
  { text: "Special character (@, #, $)", regex: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/ },
];

// --- Computed Checks ---
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
        toastSuccess("Identity Link Established! ⚡");
    } catch (err) {
        toastError(err.message || 'Transmission Error. ⚠️');
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
            :style="{ ...dot.position, animationDelay: dot.delay + 's', opacity: 0.2 }">
        </div>
        <div v-for="ripple in ripples" :key="ripple.id"
            class="ripple-effect absolute rounded-full mix-blend-overlay filter blur-sm z-50"
            :style="ripple.style"></div>
    </div>

    <div class="relative z-10 w-full max-w-lg animate-in">
      <div class="glass-panel p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.4)] border-white/10 space-y-8">
        <div class="text-center space-y-2">
            <h1 class="text-4xl font-black text-white tracking-tighter uppercase italic">
              Fluid<span class="text-pink-500">Registry</span>
            </h1>
            <p class="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">Initialize Digital Identity</p>
        </div>

        <form @submit.prevent="handleRegister" class="space-y-5">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-1">
                <label class="text-[9px] font-black text-pink-300 uppercase ml-2 tracking-widest">Name</label>
                <input v-model="nickname" type="text" placeholder="e.g. Neo" class="input-glass" 
                       :class="{'border-rose-500/50': nickname.length > 0 && !isNicknameValid}" />
            </div>

            <div class="space-y-1">
                <label class="text-[9px] font-black text-pink-300 uppercase ml-2 tracking-widest">Phone</label>
                <input v-model="phoneNumber" type="tel" placeholder="10 Digits" class="input-glass"
                       maxlength="10"
                       :class="{'border-rose-500/50': phoneNumber.length > 0 && !isPhoneValid}" />
            </div>
          </div>

          <div class="space-y-1">
              <label class="text-[9px] font-black text-pink-300 uppercase ml-2 tracking-widest">Access Email</label>
              <input v-model="email" type="email" placeholder="name@transmission.com" class="input-glass"
                     :class="{'border-rose-500/50': email.length > 0 && !isEmailValid}" />
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div class="space-y-4">
                <div class="space-y-1">
                    <label class="text-[9px] font-black text-pink-300 uppercase ml-2 tracking-widest">Password</label>
                    <input v-model="password" type="password" placeholder="••••••••" class="input-glass" />
                </div>
                <div class="space-y-1">
                    <label class="text-[9px] font-black text-pink-300 uppercase ml-2 tracking-widest">Verify Password</label>
                    <input v-model="passwordConfirm" type="password" placeholder="••••••••" class="input-glass"
                           :class="{'border-rose-500/50': passwordConfirm.length > 0 && !doPasswordsMatch}" />
                </div>
            </div>

            <div class="bg-black/20 p-5 rounded-[1.5rem] border border-white/5 space-y-3">
                <p class="text-[8px] font-black text-white/40 uppercase tracking-widest border-b border-white/5 pb-2">Complexity Requirements</p>
                <ul class="space-y-2">
                    <li v-for="check in constraintChecks" :key="check.text" 
                        class="text-[10px] font-bold transition-all duration-300 flex items-center gap-2"
                        :class="check.meets ? 'text-emerald-400' : 'text-white/10'">
                        <div class="w-3 h-3 rounded-full border flex items-center justify-center transition-colors"
                             :class="check.meets ? 'bg-emerald-500 border-emerald-400' : 'border-white/10'">
                            <svg v-if="check.meets" class="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
                        </div>
                        {{ check.text }}
                    </li>
                </ul>
            </div>
            
          </div>

          <button type="submit" :disabled="loading || !isFormValid" 
                  class="w-full relative py-4 bg-white text-indigo-950 font-black rounded-2xl shadow-xl transition-all active:scale-95 disabled:opacity-10 uppercase tracking-[0.2em] text-xs mt-4 group overflow-hidden">
            <div v-if="loading" class="absolute inset-0 bg-indigo-900 flex items-center justify-center">
                <div class="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            </div>
            <span v-else>Construct Profile</span>
          </button>
        </form>

        <div class="text-center pt-4">
            <p class="text-[10px] font-black text-white/30 uppercase tracking-widest">
                Already Synthesized? <NuxtLink to="/login" class="text-pink-400 hover:text-white transition underline decoration-pink-500/30 underline-offset-4">Log In</NuxtLink>
            </p>
        </div>
      </div>
    </div>
  </div>

  <Teleport to="body">
    <Transition name="fade">
      <div v-if="showModal" class="fixed inset-0 bg-indigo-950/90 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
        <div class="glass-panel p-10 max-w-sm text-center border-white/20 animate-in">
          <div class="w-20 h-20 bg-emerald-500/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-emerald-500/30">
              <span class="text-4xl animate-bounce">🌊</span>
          </div>
          <h3 class="text-3xl font-black text-white uppercase tracking-tighter">Profile Active</h3>
          <p class="text-white/60 text-xs mt-3 mb-8 leading-relaxed uppercase tracking-widest font-bold">Your digital fingerprint has been added to the fluid stream.</p>
          <button @click="closeModalAndRedirect" class="w-full py-4 bg-white text-indigo-950 font-black rounded-2xl hover:bg-pink-300 transition-all shadow-xl uppercase text-xs tracking-widest">
            Enter Transmission
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
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

.dot-animation { border-radius: 50%; filter: blur(55px); animation: move-background 15s infinite alternate ease-in-out; }
@keyframes move-background { 0% { transform: translate(0, 0) scale(1); } 50% { transform: translate(40px, 80px) scale(1.3); } 100% { transform: translate(0, 0) scale(1); } }

.ripple-effect { width: 20px; height: 20px; background: rgba(255, 255, 255, 0.1); animation: ripple-grow 1.5s ease-out forwards; pointer-events: none; transform: translate(-50%, -50%); }
@keyframes ripple-grow { 0% { transform: translate(-50%, -50%) scale(0.1); opacity: 0.5; } 100% { transform: translate(-50%, -50%) scale(30); opacity: 0; } }

.fade-enter-active, .fade-leave-active { transition: opacity 0.5s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>