<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useAnimatedBackground } from '~/composables/useAnimatedBackground'; 
import { useUserApi } from '~/composables/useUserApi'
import { useAuth } from '~/stores/Auth'

const api = useUserApi()
const authStore = useAuth()
const { showToast } = useToast()

const isPageLoading = ref(true)
const activeTab = ref('profile')
const avatarPreview = ref('')

// --- NEW: Privacy State ---
const isSensitiveVisible = ref(false);
const toggleSensitive = () => {
    isSensitiveVisible.value = !isSensitiveVisible.value;
};

// User Data State
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
const secretUserData = computed(() => {
    const data = userData.value;
    // If data is missing or user wants to "Show", return unmasked data
    if (!data.phone || !data.email || isSensitiveVisible.value) return data;

    // 1. Phone: Mask first 6, show last 4
    const maskedPhone = "X".repeat(6) + data.phone.slice(-4);

    // 2. Email: Show first 4, mask until '@' domain
    const atIndex = data.email.indexOf('@');
    let maskedEmail = "";
    if (atIndex > 4) {
        maskedEmail = data.email.substring(0, 4) + "XXXX" + data.email.substring(atIndex);
    } else {
        maskedEmail = data.email.substring(0, 2) + "XXXX" + data.email.substring(atIndex);
    }

    return { ...data, phone: maskedPhone, email: maskedEmail };
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
      bio: me.bio || 'No bio yet...',
      location: me.location || 'Unknown',
      joinDate: `Joined ${new Date(me.created_at).toLocaleDateString()}`,
      profileImageUrl: me.avatar_url || '',
      phone: me.tel || 'Not provided',
    }
    settingsForm.value = { ...userData.value }
  } catch (err) {
    if (showToast) showToast('Failed to load profile', 'error')
  } finally {
    isPageLoading.value = false
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleBackgroundClick);
})

const handleAvatarUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  avatarPreview.value = URL.createObjectURL(file);
  const formData = new FormData();
  formData.append('avatar', file);
  try {
    const res = await api.uploadAvatar(formData);
    userData.value.profileImageUrl = res.avatarUrl;
    if (showToast) showToast('Avatar updated!', 'success');
  } catch (err) {
    if (showToast) showToast('Avatar upload failed', 'error');
  }
};

const handleSaveChanges = async () => {
  try {
    const nameParts = settingsForm.value.name.split(' ');
    await api.updateProfile({
      Fname: nameParts[0],
      Lname: nameParts.slice(1).join(' '),
      nickname: settingsForm.value.username,
      bio: settingsForm.value.bio,
      location: settingsForm.value.location,
    })
    userData.value = { ...settingsForm.value }
    if (showToast) showToast('Profile updated successfully!', 'success')
  } catch (err) {
    if (showToast) showToast(err.message || 'Update failed', 'error')
  }
}

const handleLogout = () => {
  authStore.logout()
  if (showToast) showToast('Logged out safely', 'info')
}

// Password Logic
const currentPassword = ref("");
const newPassword = ref("");
const confirmNewPassword = ref("");
const isPasswordFormValid = computed(() => {
  return currentPassword.value.length >= 8 && newPassword.value === confirmNewPassword.value;
});

const config = useRuntimeConfig();
const backendUrl = config.public.apiBaseUrl.replace('/api/v1', ''); 

const getFullAvatarUrl = (path) => {
  if (!path) return '/default-avatar.png';
  if (path.startsWith('http')) return path;
  return `${backendUrl}${path}`; // Combines http://localhost:3001 + /uploads/...
};

</script>

<template>
  <div class="profile-root min-h-screen relative overflow-hidden flex flex-col p-4 md:p-8">
    <div class="fixed inset-0 z-0 pointer-events-none">
      <span v-for="dot in dotPositions" :key="dot.id"
        class="dot-animation bg-white/20 w-16 h-16 rounded-full filter blur-3xl opacity-40 absolute"
        :class="`bg-${dot.color}`"
        :style="{ ...dot.position, animationDelay: dot.delay + 's', width: dot.size, height: dot.size }"
      ></span>
    </div>

    <div v-for="ripple in ripples" :key="ripple.id"
      class="ripple-effect absolute rounded-full mix-blend-overlay opacity-40 filter blur-sm z-50"
      :style="ripple.style"
    ></div>

    <div class="w-full max-w-6xl mx-auto space-y-4 relative z-10">
        
        <header class="glass-panel flex items-center justify-between p-4 px-8 shadow-2xl">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-white/20 rounded-xl"><span class="text-2xl">🌊</span></div>
            <h1 class="text-2xl font-black text-white tracking-tighter drop-shadow-md">
              FLUID<span class="text-pink-300">PROFILE</span>
            </h1>
          </div>
          <NuxtLink to="/dashboard" class="action-btn bg-white text-indigo-600 px-6 py-2 rounded-full font-bold shadow-xl transition-all hover:scale-105">
            ← Back to Feed
          </NuxtLink>
        </header>

        <nav class="glass-panel flex p-1 gap-1">
          <button @click="activeTab = 'profile'"
            :class="['flex-1 py-3 font-bold rounded-2xl transition-all', activeTab === 'profile' ? 'bg-white/20 text-pink-300' : 'text-white/60 hover:text-white']"
          >
            View Identity
          </button>
          <button @click="activeTab = 'settings'"
            :class="['flex-1 py-3 font-bold rounded-2xl transition-all', activeTab === 'settings' ? 'bg-white/20 text-pink-300' : 'text-white/60 hover:text-white']"
          >
            Edit Settings
          </button>
        </nav>

        <main class="animate-in">
          <div class="glass-panel p-8 md:p-12 shadow-2xl">
            <div v-if="isPageLoading" class="flex flex-col items-center py-20 animate-pulse">
              <div class="w-12 h-12 border-4 border-white/20 border-t-pink-300 rounded-full animate-spin mb-4"></div>
              <p class="text-white/60 font-medium">Loading identity...</p>
            </div>

            <div v-else-if="activeTab === 'profile'" class="space-y-10">
              <div class="flex flex-col md:flex-row items-center gap-8">
                <div class="relative group">
                  <img 
                    :src="avatarPreview || getFullAvatarUrl(userData.profileImageUrl)"
                    class="w-40 h-40 object-cover border-4 border-white/20 shadow-2xl rounded-full" 
                    />
                  <label class="absolute inset-0 bg-indigo-900/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-all duration-300">
                    <span class="text-white font-bold text-sm uppercase tracking-widest">Update</span>
                    <input type="file" accept="image/*" class="hidden" @change="handleAvatarUpload" />
                  </label>
                </div>
                <div class="text-center md:text-left">
                  <h2 class="text-5xl font-black text-white tracking-tighter mb-2">{{ userData.name }}</h2>
                  <p class="text-2xl font-bold text-pink-300 opacity-90">@{{ userData.username }}</p>
                  <p class="text-white/50 font-medium mt-2">{{ userData.joinDate }}</p>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="glass-panel p-6 bg-white/5">
                  <h3 class="text-xs font-black uppercase tracking-widest text-pink-300 mb-3">Biography</h3>
                  <p class="text-lg text-white/90 leading-relaxed italic">"{{ userData.bio }}"</p>
                </div>

                <div class="space-y-4">
                  <div class="flex items-center gap-4 glass-panel p-4 bg-white/5">
                    <span class="text-2xl">📍</span>
                    <div>
                      <p class="text-xs font-bold text-white/40 uppercase">Location</p>
                      <p class="text-white font-bold">{{ userData.location }}</p>
                    </div>
                  </div>

                  <div class="flex items-center justify-between glass-panel p-4 bg-white/5">
                    <div class="flex items-center gap-4">
                      <span class="text-2xl">📧</span>
                      <div>
                        <p class="text-xs font-bold text-white/40 uppercase">Email</p>
                        <p class="text-white font-bold">{{ secretUserData.email }}</p>
                      </div>
                    </div>
                    <button @click="toggleSensitive" class="text-xs font-black text-pink-300 uppercase hover:underline">
                      {{ isSensitiveVisible ? 'Hide' : 'Show' }}
                    </button>
                  </div>

                  <div class="flex items-center justify-between glass-panel p-4 bg-white/5">
                    <div class="flex items-center gap-4">
                      <span class="text-2xl">📱</span>
                      <div>
                        <p class="text-xs font-bold text-white/40 uppercase">Phone Number</p>
                        <p class="text-white font-bold">{{ secretUserData.phone }}</p>
                      </div>
                    </div>
                    <button @click="toggleSensitive" class="text-xs font-black text-pink-300 uppercase hover:underline">
                      {{ isSensitiveVisible ? 'Hide' : 'Show' }}
                    </button>
                  </div>
                </div>
              </div>

              <button @click="handleLogout" class="w-full py-4 rounded-2xl bg-red-500/10 text-red-400 font-bold border border-red-500/20 hover:bg-red-500/20 transition-all">
                Logout Account
              </button>
            </div>

            <div v-else class="space-y-12">
              <section class="space-y-6">
                <h3 class="text-xl font-bold text-white border-l-4 border-pink-400 pl-4">Personal Details</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="space-y-2">
                    <label class="text-xs font-bold text-white/50 uppercase ml-2">Full Name</label>
                    <input v-model="settingsForm.name" class="input-glass" />
                  </div>
                  <div class="space-y-2">
                    <label class="text-xs font-bold text-white/50 uppercase ml-2">Username</label>
                    <input v-model="settingsForm.username" class="input-glass" />
                  </div>
                </div>
                <div class="space-y-2">
                  <label class="text-xs font-bold text-white/50 uppercase ml-2">Biography</label>
                  <textarea v-model="settingsForm.bio" class="input-glass min-h-[100px]"></textarea>
                </div>
                <div class="space-y-2">
                    <label class="text-xs font-bold text-white/50 uppercase ml-2">Nearby Location</label>
                    <input v-model="settingsForm.location" class="input-glass" />
                </div>
                <button @click="handleSaveChanges" class="bg-pink-400 text-indigo-900 px-8 py-3 rounded-full font-black hover:bg-pink-300 transition-all shadow-lg">
                  Save Changes
                </button>
              </section>

              <section class="space-y-6 pt-10 border-t border-white/10">
                <h3 class="text-xl font-bold text-white border-l-4 border-indigo-400 pl-4">Security</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input v-model="currentPassword" type="password" placeholder="Current Password" class="input-glass" />
                  <input v-model="newPassword" type="password" placeholder="New Password" class="input-glass" />
                </div>
                <button :disabled="!isPasswordFormValid" class="bg-white/10 text-white px-8 py-3 rounded-full font-bold border border-white/20 hover:bg-white/20 disabled:opacity-30">
                  Update Password
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
  background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%);
  background-attachment: fixed;
}

.glass-panel {
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 28px;
}

.input-glass {
  width: 100%;
  padding: 14px 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 18px;
  color: white;
  font-weight: 600;
  transition: all 0.3s;
}

.input-glass:focus {
  border-color: #f472b6;
  background: rgba(255, 255, 255, 0.1);
  outline: none;
}

@keyframes move-background {
  0% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(20px, 40px) scale(1.1); }
  100% { transform: translate(0, 0) scale(1); }
}

.dot-animation {
  animation: move-background 15s infinite alternate ease-in-out;
}

.ripple-effect {
  width: 20px; height: 20px;
  background: white;
  animation: ripple-grow 1.2s ease-out forwards;
  pointer-events: none;
  transform: translate(-50%, -50%);
}

@keyframes ripple-grow {
  0% { transform: translate(-50%, -50%) scale(0.1); opacity: 0.5; }
  100% { transform: translate(-50%, -50%) scale(25); opacity: 0; }
}

.animate-in {
  animation: fadeInUp 0.6s cubic-bezier(0.23, 1, 0.32, 1);
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>