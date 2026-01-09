<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useAnimatedBackground } from '~/composables/useAnimatedBackground'; 
import { useUserApi } from '~/composables/useUserApi'
import { useAuth } from '~/stores/Auth'

const api = useUserApi()
const authStore = useAuth()
const showToast = useToast()

const isPageLoading = ref(true)
const activeTab = ref('profile')
const avatarPreview = ref('')

// --- Privacy State ---
const isSensitiveVisibleEmail = ref(false);
const isSensitiveVisibleTel = ref(false);

// --- User Data State ---
const userData = ref({
    name: '',
    username: '',
    email: '',
    bio: '',
    location: '',
    joinDate: '',
    profileImageUrl: '',
    phone: '',
});

const settingsForm = ref({ ...userData.value });

// --- Masking Logic ---
const maskedEmail = computed(() => {
  const email = userData.value.email;
  if (!email || isSensitiveVisibleEmail.value) return email;
  const [local, domain] = email.split('@');
  return `${local.substring(0, 3)}••••@${domain}`;
});

const maskedPhone = computed(() => {
  const tel = userData.value.phone;
  if (!tel || isSensitiveVisibleTel.value || tel === 'Not provided') return tel;
  return `••••••${tel.slice(-4)}`;
});

// --- NEW: Password Constraints Logic ---
const passwordConstraints = [
  { text: "At least 8 characters", regex: /.{8,}/ },
  { text: "Uppercase letter (A-Z)", regex: /[A-Z]/ },
  { text: "Lowercase letter (a-z)", regex: /[a-z]/ },
  { text: "Contains a number (0-9)", regex: /[0-9]/ },
  { text: "Special character (@, #, $)", regex: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/ },
];

const newPassword = ref("");
const currentPassword = ref("");
const confirmNewPassword = ref("");

// Check which constraints are met
const constraintStatus = computed(() => {
  return passwordConstraints.map(c => ({
    text: c.text,
    isMet: c.regex.test(newPassword.value)
  }));
});

// Strength is now calculated by percentage of constraints met
const passwordStrength = computed(() => {
  if (!newPassword.value) return 0;
  const metCount = constraintStatus.value.filter(c => c.isMet).length;
  return (metCount / passwordConstraints.length) * 100;
});

const isPasswordFormValid = computed(() => {
  const allConstraintsMet = constraintStatus.value.every(c => c.isMet);
  return allConstraintsMet && newPassword.value === confirmNewPassword.value && currentPassword.value !== "";
});

// --- Background Setup ---
const { dotPositions, ripples, handleBackgroundClick } = useAnimatedBackground();

onMounted(async () => {
  document.addEventListener('click', handleBackgroundClick);
  try {
    const me = await api.fetchMe()
    userData.value = {
      name: `${me.Fname} ${me.Lname}`,
      username: me.nickname,
      email: me.email,
      bio: me.bio || 'Living the fluid life...',
      location: me.location || 'Cyber Space',
      joinDate: `Sync Date: ${new Date(me.created_at).toLocaleDateString()}`,
      profileImageUrl: me.avatar_url || '',
      phone: me.tel || 'Not provided',
    }
    settingsForm.value = { ...userData.value }
  } catch (err) {
    if (showToast) showToast.error('Identity sync failed');
  } finally {
    isPageLoading.value = false
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleBackgroundClick);
})

const config = useRuntimeConfig();
const backendUrl = config.public.apiBaseUrl.replace('/api/v1', ''); 

const getFullAvatarUrl = (path) => {
  if (!path) return 'https://ui-avatars.com/api/?name=' + userData.value.username;
  if (path.startsWith('http')) return path;
  return `${backendUrl}${path}`;
};

const handleAvatarUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  avatarPreview.value = URL.createObjectURL(file);
  const formData = new FormData();
  formData.append('avatar', file);
  try {
    const res = await api.uploadAvatar(formData);
    userData.value.profileImageUrl = res.avatarUrl;
    if (showToast) showToast.success('Avatar Recalibrated! ⚡');
  } catch (err) {
    if (showToast) showToast.error('Upload interrupted');
  }
};

const handleSaveChanges = async () => {
  try {
    const [fname, ...lname] = settingsForm.value.name.split(' ');
    await api.updateProfile({
      Fname: fname,
      Lname: lname.join(' '),
      nickname: settingsForm.value.username,
      bio: settingsForm.value.bio,
      location: settingsForm.value.location,
    })
    userData.value = { ...settingsForm.value }
    if (showToast) showToast.success('Profile Synchronized! 🌊')
  } catch (err) {
    if (showToast) showToast.error(err.message || 'Update failed')
  }
}

const handleLogout = () => {
  authStore.logout()
  if (showToast) showToast.info('Safe logout complete')
  navigateTo('/login') 
}
</script>

<template>
  <div class="profile-root min-h-screen relative flex flex-col p-4 md:p-8 overflow-x-hidden">
    <div class="fixed inset-0 z-0 pointer-events-none">
      <span v-for="dot in dotPositions" :key="dot.id"
        class="dot-animation rounded-full filter blur-3xl opacity-20 absolute transition-all duration-1000"
        :class="`bg-${dot.color}`"
        :style="{ ...dot.position, animationDelay: dot.delay + 's', width: dot.size, height: dot.size }"
      ></span>
    </div>

    <div v-for="ripple in ripples" :key="ripple.id"
      class="ripple-effect absolute rounded-full mix-blend-overlay opacity-40 filter blur-sm z-50"
      :style="ripple.style"
    ></div>

    <div class="w-full max-w-5xl mx-auto space-y-6 relative z-10">
        
        <header class="glass-panel flex items-center justify-between p-5 px-8 shadow-2xl border-white/20">
          <div class="flex items-center gap-4">
            <div class="p-2.5 bg-gradient-to-br from-pink-500 to-indigo-600 rounded-2xl shadow-lg">
              <span class="text-2xl">🧬</span>
            </div>
            <h1 class="text-2xl font-black text-white tracking-tighter uppercase italic">
              Fluid<span class="text-pink-400">Profile</span>
            </h1>
          </div>
          <NuxtLink to="/dashboard" class="group flex items-center gap-2 text-white/60 hover:text-white transition-all font-bold uppercase text-xs tracking-widest">
            <span class="group-hover:-translate-x-1 transition-transform">←</span> Return to Feed
          </NuxtLink>
        </header>

        <nav class="flex p-1.5 bg-black/20 backdrop-blur-md rounded-[2rem] border border-white/5 shadow-inner">
          <button @click="activeTab = 'profile'"
            :class="['flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all', activeTab === 'profile' ? 'bg-white text-indigo-900 shadow-xl scale-[0.98]' : 'text-white/40 hover:text-white']"
          >
            Identity
          </button>
          <button @click="activeTab = 'settings'"
            :class="['flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all', activeTab === 'settings' ? 'bg-white text-indigo-900 shadow-xl scale-[0.98]' : 'text-white/40 hover:text-white']"
          >
            Terminal
          </button>
        </nav>

        <main>
          <div class="glass-panel p-8 md:p-16 shadow-2xl relative overflow-hidden">
            <div class="absolute -top-24 -right-24 w-64 h-64 bg-pink-500/10 rounded-full blur-[100px]"></div>

            <div v-if="isPageLoading" class="flex flex-col items-center py-20">
              <div class="w-16 h-16 border-4 border-white/5 border-t-pink-500 rounded-full animate-spin mb-6"></div>
              <p class="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Synchronizing Identity...</p>
            </div>

            <div v-else-if="activeTab === 'profile'" class="animate-in space-y-12">
              <div class="flex flex-col md:flex-row items-center gap-10">
                <div class="relative group">
                  <div class="absolute inset-0 bg-pink-500 rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity"></div>
                  <img 
                    :src="avatarPreview || getFullAvatarUrl(userData.profileImageUrl)"
                    class="w-44 h-44 object-cover border-4 border-white/20 shadow-2xl rounded-[3rem] group-hover:rotate-3 transition-transform duration-500" 
                    />
                  <label class="absolute -bottom-2 -right-2 bg-white p-3 rounded-2xl cursor-pointer shadow-xl hover:scale-110 active:scale-90 transition-all">
                    <svg class="w-5 h-5 text-indigo-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    <input type="file" accept="image/*" class="hidden" @change="handleAvatarUpload" />
                  </label>
                </div>
                <div class="text-center md:text-left">
                  <h2 class="text-6xl font-black text-white tracking-tighter mb-2">{{ userData.name }}</h2>
                  <div class="flex items-center gap-3 justify-center md:justify-start">
                    <p class="text-xl font-bold text-pink-400">@{{ userData.username }}</p>
                    <span class="h-1 w-1 bg-white/20 rounded-full"></span>
                    <p class="text-[10px] font-black text-white/30 uppercase tracking-widest">{{ userData.joinDate }}</p>
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="md:col-span-2 glass-panel p-8 bg-white/5 border-white/10 group">
                  <h3 class="text-[10px] font-black uppercase tracking-widest text-pink-400 mb-4 flex items-center gap-2">
                    <span class="w-2 h-2 bg-pink-500 rounded-full"></span> Core Bio
                  </h3>
                  <p class="text-xl text-white/80 leading-relaxed font-medium italic">"{{ userData.bio }}"</p>
                </div>

                <div class="space-y-4">
                  <div class="glass-panel p-5 bg-white/5 border-white/10">
                    <p class="text-[9px] font-black text-white/30 uppercase tracking-widest mb-2">Location Node</p>
                    <p class="text-white font-bold flex items-center gap-2"><span>📍</span> {{ userData.location }}</p>
                  </div>
                  
                  <div class="glass-panel p-5 bg-white/5 border-white/10 group">
                    <div class="flex justify-between items-start mb-2">
                      <p class="text-[9px] font-black text-white/30 uppercase tracking-widest">Secure Email</p>
                      <button @click="isSensitiveVisibleEmail = !isSensitiveVisibleEmail" class="text-[9px] font-black text-pink-500 uppercase tracking-tighter hover:underline">
                        {{ isSensitiveVisibleEmail ? 'Encrypt' : 'Decrypt' }}
                      </button>
                    </div>
                    <p class="text-white font-bold truncate">{{ maskedEmail }}</p>
                  </div>

                  <div class="glass-panel p-5 bg-white/5 border-white/10">
                    <div class="flex justify-between items-start mb-2">
                      <p class="text-[9px] font-black text-white/30 uppercase tracking-widest">Comm Link</p>
                      <button @click="isSensitiveVisibleTel = !isSensitiveVisibleTel" class="text-[9px] font-black text-pink-500 uppercase tracking-tighter hover:underline">
                        {{ isSensitiveVisibleTel ? 'Encrypt' : 'Decrypt' }}
                      </button>
                    </div>
                    <p class="text-white font-bold">{{ maskedPhone }}</p>
                  </div>
                </div>
              </div>

              <div class="pt-8 flex flex-col items-center">
                <button @click="handleLogout" class="group px-12 py-4 rounded-2xl bg-rose-500/10 text-rose-500 font-black text-[10px] tracking-[0.3em] uppercase border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all duration-500">
                  Disconnect Account
                </button>
              </div>
            </div>

            <div v-else class="animate-in space-y-16">
              <section class="space-y-8">
                <div class="flex items-center gap-4">
                  <div class="h-px flex-1 bg-white/10"></div>
                  <h3 class="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">Personal Data</h3>
                  <div class="h-px flex-1 bg-white/10"></div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div class="space-y-3">
                    <label class="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Full Legal Name</label>
                    <input v-model="settingsForm.name" class="input-glass" placeholder="Enter name..." />
                  </div>
                  <div class="space-y-3">
                    <label class="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Public Alias</label>
                    <input v-model="settingsForm.username" class="input-glass" placeholder="Enter username..." />
                  </div>
                </div>
                <div class="space-y-3">
                  <label class="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Identity Bio</label>
                  <textarea v-model="settingsForm.bio" class="input-glass min-h-[120px] resize-none" placeholder="Who are you?"></textarea>
                </div>
                
                <div class="flex justify-end">
                  <button @click="handleSaveChanges" class="px-10 py-4 bg-white text-indigo-900 font-black text-[10px] tracking-widest uppercase rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-2xl">
                    Push Changes
                  </button>
                </div>
              </section>

              <section class="space-y-8">
                <div class="flex items-center gap-4">
                  <div class="h-px flex-1 bg-white/10"></div>
                  <h3 class="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">Security </h3>
                  <div class="h-px flex-1 bg-white/10"></div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div class="space-y-6">
                    <div class="space-y-3">
                        <label class="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Current Password</label>
                        <input v-model="currentPassword" type="password" placeholder="Confirm existing Password" class="input-glass" />
                    </div>
                    <div class="space-y-3">
                        <label class="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">New Password</label>
                        <input v-model="newPassword" type="password" placeholder="Enter new Password" class="input-glass" />
                    </div>
                    <div class="space-y-3">
                        <label class="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Verify Password</label>
                        <input v-model="confirmNewPassword" type="password" placeholder="Re-enter new Password" class="input-glass" />
                    </div>
                  </div>

                  <div class="glass-panel p-6 bg-white/5 border-white/5 space-y-4">
                    <p class="text-[10px] font-black text-pink-400 uppercase tracking-widest mb-2">Complexity Requirements</p>
                    
                    <div class="space-y-3">
                        <div v-for="constraint in constraintStatus" :key="constraint.text" 
                             class="flex items-center gap-3 transition-all duration-300"
                             :class="constraint.isMet ? 'opacity-100' : 'opacity-40'">
                            <div class="w-4 h-4 rounded-md flex items-center justify-center border transition-colors"
                                 :class="constraint.isMet ? 'bg-emerald-500 border-emerald-400' : 'border-white/20'">
                                <svg v-if="constraint.isMet" class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
                            </div>
                            <span class="text-xs font-bold text-white">{{ constraint.text }}</span>
                        </div>
                    </div>

                    <div class="pt-4 space-y-2">
                        <div class="flex justify-between text-[9px] font-black uppercase tracking-tighter">
                            <span class="text-white/40">Entropy Level</span>
                            <span :class="passwordStrength === 100 ? 'text-emerald-400' : 'text-pink-400'">{{ Math.round(passwordStrength) }}%</span>
                        </div>
                        <div class="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <div class="h-full transition-all duration-700 ease-out" 
                                 :class="passwordStrength === 100 ? 'bg-emerald-500' : 'bg-pink-500'"
                                 :style="{ width: passwordStrength + '%' }"></div>
                        </div>
                    </div>
                  </div>
                </div>

                <button :disabled="!isPasswordFormValid" 
                        class="w-full py-5 bg-indigo-500/10 text-indigo-400 font-black text-[10px] tracking-[0.3em] uppercase rounded-2xl border border-indigo-500/20 hover:bg-indigo-500 hover:text-white transition-all disabled:opacity-10 shadow-lg">
                  Update Security
                </button>
              </section>
            </div>
          </div>
        </main>
    </div>
  </div>
</template>

<style scoped>
.profile-root {
  background: radial-gradient(circle at top right, #312e81, #1e1b4b, #020617);
  background-attachment: fixed;
}

.glass-panel {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(30px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 2.5rem;
}

.input-glass {
  width: 100%;
  padding: 1.2rem 1.5rem;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 1.25rem;
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

.input-glass:focus {
  border-color: #f472b6;
  background: rgba(255, 255, 255, 0.05);
  box-shadow: 0 0 20px rgba(244, 114, 182, 0.1);
  outline: none;
}

.animate-in {
  animation: fadeInUp 0.8s cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
}

.dot-animation {
  animation: move-background 20s infinite alternate ease-in-out;
}

@keyframes move-background {
  to { transform: translate(50px, 50px) rotate(10deg); }
}
</style>