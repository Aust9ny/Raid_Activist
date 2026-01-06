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

// ---------- Fetch Me ----------
onMounted(async () => {
  try {
    const me = await useApiFetch("/users/me");
    userData.value.name = me.nickname;
    userData.value.profileImageUrl = me.avatar_url;
  } catch (e) {
    console.error("Auth fetch failed", e);
  }
});

// ---------- Avatar ----------
const backendUrl = config.public.apiBaseUrl.replace("/api/v1", "");
const getFullAvatarUrl = (path) =>
  !path ? undefined : path.startsWith("http") ? path : `${backendUrl}${path}`;

// ---------- Feed ----------
const searchQuery = ref("");
const debouncedSearch = ref("");
const activeFilter = ref("all");

/* FIX #2: local debounce timer (no globals) */
const searchTimer = ref(null);

watch(searchQuery, (v) => {
  clearTimeout(searchTimer.value);
  searchTimer.value = setTimeout(() => {
    debouncedSearch.value = v;
  }, 400);
});

onUnmounted(() => {
  clearTimeout(searchTimer.value);
});

const queryParams = computed(() => {
  const p = {};
  if (debouncedSearch.value?.trim()) p.search = debouncedSearch.value;
  if (activeFilter.value !== "all") p.filter = activeFilter.value;
  return p;
});

// ---------- Feed Data ----------
const { activities, loading, error, refreshActivities } =
  useActivities(queryParams);

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

const openCreationModal = () => {
  showCreationModal.value = true;
};

const handleActivityCreated = () => {
  showCreationModal.value = false;
  refreshActivities();
};
</script>

<template>
  <div class="dashboard-root min-h-screen relative overflow-hidden">
    <!-- Background -->
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
      <!-- Header -->
      <header
        class="glass-panel sticky top-6 z-40 flex items-center justify-between p-4 px-8 mb-12 shadow-2xl"
      >
        <div class="flex items-center gap-3">
          <div class="p-2 bg-white/20 rounded-xl">
            <span class="text-2xl">🌊</span>
          </div>
          <h1 class="text-2xl font-black text-white tracking-tighter">
            FLUID<span class="text-pink-300">FEED</span>
          </h1>
        </div>

        <div class="flex items-center gap-6">
          <button
            @click.stop="openCreationModal"
            class="bg-white text-indigo-600 px-6 py-2.5 rounded-full font-bold shadow-xl transition-all hover:scale-105 active:scale-95"
          >
            + Post Activity
          </button>

          <NuxtLink to="/profile" class="rounded-full overflow-hidden">
            <img
              :src="getFullAvatarUrl(userData.profileImageUrl)"
              class="w-12 h-12 rounded-full object-cover border-4 border-white/20 shadow-2xl"
            />
          </NuxtLink>
        </div>
      </header>

      <main class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <!-- Left -->
        <section class="lg:col-span-4 space-y-6">
          <div class="glass-panel p-8">
            <h2 class="text-3xl font-bold text-white mb-2">
              Hello, {{ userData.name || "User" }}!
            </h2>
            <p class="text-white/70">
              There are
              <span class="text-pink-300 font-bold">
                {{ activities?.data?.length || 0 }}
              </span>
              activities waiting for you.
            </p>
          </div>
        </section>

        <!-- Feed -->
        <section class="lg:col-span-8">
          <div class="glass-panel p-4 mb-8 flex flex-col md:flex-row gap-4">
            <input
              v-model="searchQuery"
              placeholder="Search activities..."
              class="flex-1 bg-white/10 border border-white/20 rounded-full py-2 px-6 text-white"
            />

            <div class="flex bg-white/5 p-1 rounded-full">
              <button
                @click="activeFilter = 'all'"
                :class="activeFilter === 'all'
                  ? 'bg-pink-300 text-indigo-900'
                  : 'text-white'"
                class="px-4 py-1.5 rounded-full text-xs font-bold"
              >
                All
              </button>
              <button
                @click="activeFilter = 'joined'"
                :class="activeFilter === 'joined'
                  ? 'bg-pink-300 text-indigo-900'
                  : 'text-white'"
                class="px-4 py-1.5 rounded-full text-xs font-bold"
              >
                Joined
              </button>
              <button
                @click="activeFilter = 'not_joined'"
                :class="activeFilter === 'not_joined'
                  ? 'bg-pink-300 text-indigo-900'
                  : 'text-white'"
                class="px-4 py-1.5 rounded-full text-xs font-bold"
              >
                Not Joined
              </button>
            </div>
          </div>

          <div class="space-y-6">
            <div v-if="loading" class="text-center py-20">
              <div
                class="w-12 h-12 border-4 border-white/20 border-t-pink-300 rounded-full animate-spin mx-auto mb-4"
              ></div>
              <p class="text-white/60">Loading activities…</p>
            </div>

            <div
              v-else-if="error"
              class="glass-panel p-8 text-center text-red-300"
            >
              {{ error.message }}
            </div>

            <ActivityPost
              v-for="activity in activities?.data"
              :key="activity.id"
              v-bind="activity"
              :owner_id="activity.owner_id"
              :UserHasJoined="!!activity.UserHasJoined"
              @refresh-feed="refreshActivities"
            />

            <!-- FIX #3: correct empty state -->
            <div
              v-if="!loading && activities?.data?.length === 0"
              class="glass-panel p-20 text-center opacity-60"
            >
              <p class="text-4xl mb-4">🏜️</p>
              <p class="text-white">
                The feed is quiet… create the first spark!
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
  background: linear-gradient(135deg, #38a6f5 0%, #312e81 50%, #1e1b4b 100%);
  background-attachment: fixed;
}

.glass-panel {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 24px;
}

.polka-dot {
  position: absolute;
  border-radius: 50%;
  filter: blur(40px);
  animation: move-background 18s infinite alternate ease-in-out;
}

@keyframes move-background {
  0% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(30px, -20px) scale(1.1); }
  100% { transform: translate(0, 0) scale(1); }
}

.ripple-effect {
  width: 20px;
  height: 20px;
  background: white;
  animation: ripple-grow 1.5s ease-out forwards;
  pointer-events: none;
}

@keyframes ripple-grow {
  from { transform: scale(0.1); opacity: 0.5; }
  to { transform: scale(25); opacity: 0; }
}
</style>
