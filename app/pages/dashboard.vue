<script setup>
import { ref, computed, onMounted, onUnmounted, watch, Teleport } from "vue";
import { useActivities } from "~/composables/useActivities";
import { useAnimatedBackground } from "~/composables/useAnimatedBackground";
import { useApiFetch } from "~/composables/useApiFetch";
import ActivityPost from "~/components/ActivityPost.vue";
import ActivityCreationModal from "~/components/ActivityCreationModal.vue";
import { useAuth } from "~/stores/Auth";

const auth = useAuth();
const config = useRuntimeConfig();

const userData = ref({
  name: "",
  profileImageUrl: "",
});

// ---------- Fetch Me (FIXED) ----------
onMounted(async () => {
  const me = await useApiFetch("/me");
  userData.value.name = me.nickname;
  userData.value.profileImageUrl = me.avatar_url;
});

// ---------- Avatar ----------
const backendUrl = config.public.apiBaseUrl.replace("/api/v1", "");
const getFullAvatarUrl = (path) =>
  !path ? "/default-avatar.png" :
  path.startsWith("http") ? path : `${backendUrl}${path}`;

// ---------- Feed ----------
const searchQuery = ref("");
const debouncedSearch = ref("");
const activeFilter = ref("all");

watch(searchQuery, (v) => {
  clearTimeout(window._t);
  window._t = setTimeout(() => debouncedSearch.value = v, 400);
});

const queryParams = computed(() => {
  const p = {};
  // Only add search if there is actually text
  if (debouncedSearch.value && debouncedSearch.value.trim() !== "") {
    p.search = debouncedSearch.value;
  }
  // Only add filter if it's not "all"
  if (activeFilter.value !== "all") {
    p.filter = activeFilter.value;
  }
  return p;
});



// ---------- Fetch Me ----------
onMounted(async () => {
  try {
    const me = await useApiFetch("/users/me"); // 🛠️ Updated to match your backend route
    const data = Array.isArray(me) ? me[0] : me; // 🛠️ Handle potential array response
    userData.value.name = data.nickname;
    userData.value.profileImageUrl = data.avatar_url;
  } catch (e) {
    console.error("Auth fetch failed", e);
  }
});



// ---------- Feed ----------

const handleActivityCreated = () => {
    showCreationModal.value = false;
    refreshActivities();
};

const { activities, loading, error, refreshActivities } = useActivities(queryParams);

// ---------- Background ----------
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

// ---------- Modal ----------
const showCreationModal = ref(false);
</script>


<template>
  <div
    class="dashboard-root min-h-screen relative overflow-hidden"
    @click="handleBackgroundClick"
  >
    <div class="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <div
        v-for="dot in dotPositions"
        :key="dot.id"
        :class="[
          'polka-dot',
          `bg-${dot.color}`,
          `w-${dot.size}`,
          `h-${dot.size}`,
        ]"
        :style="{
          ...dot.position,
          animationDelay: dot.delay + 's',
          opacity: 0.4,
        }"
      ></div>
    </div>

    <div
      v-for="ripple in ripples"
      :key="ripple.id"
      class="ripple-effect absolute rounded-full mix-blend-overlay filter blur-sm z-50"
      :style="ripple.style"
    ></div>

    <div class="relative z-10 max-w-6xl mx-auto px-4 py-8">
      <header
        class="glass-panel sticky top-6 z-40 flex items-center justify-between p-4 px-8 mb-12 shadow-2xl"
      >
        <div class="flex items-center gap-3">
          <div class="p-2 bg-white/20 rounded-xl">
            <span class="text-2xl">🌊</span>
          </div>
          <h1
            class="text-2xl font-black text-white tracking-tighter drop-shadow-md"
          >
            FLUID<span class="text-pink-300">FEED</span>
          </h1>
        </div>

        <div class="flex items-center gap-6">
          <button
            @click.stop="openCreationModal"
            class="action-btn group flex items-center gap-2 bg-white text-indigo-600 px-6 py-2.5 rounded-full font-bold shadow-xl transition-all hover:scale-105 active:scale-95"
          >
            <span
              class="text-xl group-hover:rotate-90 transition-transform duration-300"
              >+</span
            >
            Post Activity
          </button>

          <NuxtLink
            to="/profile"
            class="profile-link relative group overflow-hidden rounded-full"
          >
            <div class="w-12 h-12 rounded-2xl overflow-hidden">
              <img
                :src="
                   getFullAvatarUrl(userData.profileImageUrl)
                "
                class="w-40 h-40 rounded-full object-cover border-4 border-white/20 shadow-2xl overflow-cut"
              />
            </div>
          </NuxtLink>
        </div>
      </header>

      <main class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <section class="lg:col-span-4 space-y-6">
          <div class="glass-panel p-8">
            <h2 class="text-3xl font-bold text-white mb-2">
              Hello,
              {{ userData.name ? userData.name : "User" }}!
            </h2>
            <p class="text-white/70 leading-relaxed">
              Ready to dive into new experiences? There are
              <span class="text-pink-300 font-bold">{{
                activities?.length || 0
              }}</span>
              activities waiting for you today.
            </p>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <!-- <div class="glass-panel p-4 text-center">
                            <p class="text-xs text-white/50 uppercase font-bold tracking-widest">Attending</p>
                            <p class="text-2xl font-black text-white">12</p>
                        </div> -->
          </div>
        </section>

        <section class="lg:col-span-8">
          <div class="flex items-center justify-between mb-8 px-2">
            <h3
              class="text-xl font-bold text-white uppercase tracking-widest opacity-80"
            >
              Discover Activities
            </h3>
          </div>
          <div
            class="glass-panel p-4 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between"
          >
            <div class="relative w-full md:w-1/2">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search activities..."
                class="w-full bg-white/10 border border-white/20 rounded-full py-2 px-10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-300 transition"
              />
              <span class="absolute left-4 top-2.5 opacity-50">🔍</span>
            </div>

            <div
              class="flex bg-white/5 p-1 rounded-full border border-white/10"
            >
              <button
                @click="activeFilter = 'all'"
                :class="[
                  'px-4 py-1.5 rounded-full text-xs font-bold transition',
                  activeFilter === 'all'
                    ? 'bg-pink-300 text-indigo-900'
                    : 'text-white hover:bg-white/10',
                ]"
              >
                All
              </button>
              <button
                @click="activeFilter = 'joined'"
                :class="[
                  'px-4 py-1.5 rounded-full text-xs font-bold transition',
                  activeFilter === 'joined'
                    ? 'bg-pink-300 text-indigo-900'
                    : 'text-white hover:bg-white/10',
                ]"
              >
                Joined
              </button>
              <button
                @click="activeFilter = 'not_joined'"
                :class="[
                  'px-4 py-1.5 rounded-full text-xs font-bold transition',
                  activeFilter === 'not_joined'
                    ? 'bg-pink-300 text-indigo-900'
                    : 'text-white hover:bg-white/10',
                ]"
              >
                Not Joined
              </button>
            </div>
          </div>

          <div class="space-y-6">
            <div
              v-if="loading"
              class="flex flex-col items-center py-20 animate-pulse"
            >
              <div
                class="w-12 h-12 border-4 border-white/20 border-t-pink-300 rounded-full animate-spin mb-4"
              ></div>
              <p class="text-white/60 font-medium">
                Syncing with FluidFeed Cloud...
              </p>
            </div>

            <div
              v-else-if="error"
              class="glass-panel p-8 border-red-400/30 bg-red-400/10 text-center"
            >
              <p class="text-red-200 font-bold mb-2">Connection Interrupted</p>
              <p class="text-sm text-red-200/70">{{ error.message }}</p>
            </div>

            <ActivityPost
              v-for="activity in activities"
              :key="activity.id"
              v-bind="activity"
              :owner_id="activity.owner_id"
              :UserHasJoined="!!activity.UserHasJoined"
              @refresh-feed="refreshActivities"
            />

            <div
              v-if="!loading && activities?.length === 0"
              class="glass-panel p-20 text-center opacity-60"
            >
              <p class="text-4xl mb-4">🏜️</p>
              <p class="text-white font-medium">
                The feed is quiet... create the first spark!
              </p>
            </div>
          </div>
        </section>
      </main>

      <Teleport to="body">
        <ActivityCreationModal
          v-if="showCreationModal"
          @close="showCreationModal = false"
          @activityCreated="handleActivityCreated"
        />
      </Teleport>
    </div>
  </div>
</template>

<style scoped>
.dashboard-root {
  /* Gradient for the liquid feel */
  background: linear-gradient(135deg, #38a6f5 0%, #312e81 50%, #1e1b4b 100%);
  background-attachment: fixed;
}

.glass-panel {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 24px;
}

/* Polka Dot Animation */
.polka-dot {
  position: absolute;
  border-radius: 50%;
  filter: blur(40px);
  animation: move-background 15s infinite alternate ease-in-out;
}

@keyframes move-background {
  0% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(40px, -20px) scale(1.1);
  } /* Added horizontal drift */
  66% {
    transform: translate(-20px, 40px) scale(0.9);
  }
  100% {
    transform: translate(0, 0) scale(1);
  }
}

.dot-animation {
  /* Mr. Nuxt suggests a longer duration (15s-20s) for a "floating" feel */
  animation: move-background 18s infinite alternate ease-in-out;
  /* Add blur for the 'Liquid Glass' look we discussed earlier */
  filter: blur(45px);
}

/* Ripple Animation */
.ripple-effect {
  width: 20px;
  height: 20px;
  background: white;
  animation: ripple-grow 1.5s ease-out forwards;
  pointer-events: none;
  transform: translate(-50%, -50%);
}

@keyframes ripple-grow {
  0% {
    transform: translate(-50%, -50%) scale(0.1);
    opacity: 0.5;
  }
  100% {
    transform: translate(-50%, -50%) scale(25);
    opacity: 0;
  }
}

::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
}
</style>
