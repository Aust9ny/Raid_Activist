<script setup>
import { ref, computed, onMounted, onUnmounted, watch, Teleport } from "vue";
import { useActivities } from "~/composables/useActivities";
import { useAnimatedBackground } from "~/composables/useAnimatedBackground";
import { useApiFetch } from "~/composables/useApiFetch";
import { useAuth } from "~/stores/Auth";

const auth = useAuth();
const config = useRuntimeConfig();
const showToast = useToast();

const userData = ref({ name: "", profileImageUrl: "" });

// ---------- Scroll Logic ----------
const scrollPercent = ref(0);
const showBackToTop = ref(false);

const updateScrollMetrics = () => {
  const pixels = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  scrollPercent.value = (pixels / docHeight) * 100;

  // Show button after 500px
  showBackToTop.value = pixels > 500;
};

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};

onMounted(async () => {
  window.addEventListener("scroll", updateScrollMetrics);
  try {
    const me = await useApiFetch("/users/me");
    userData.value.name = me.nickname;
    userData.value.profileImageUrl = me.avatar_url;
  } catch (e) {
    console.error("Auth fetch failed", e);
  }
});

onUnmounted(() => window.removeEventListener("scroll", updateScrollMetrics));

// ---------- Search & Filter Logic ----------
const searchQuery = ref("");
const debouncedSearch = ref("");
const activeFilter = ref("all");
const searchTimer = ref(null);

// Debounce search only
watch(searchQuery, (v) => {
  clearTimeout(searchTimer.value);
  searchTimer.value = setTimeout(() => {
    debouncedSearch.value = v;
  }, 400);
});

// queryParams remains reactive; activeFilter triggers it instantly,
// but debouncedSearch only updates after the timeout.
const queryParams = computed(() => {
  const p = {};
  if (debouncedSearch.value?.trim()) p.search = debouncedSearch.value;
  if (activeFilter.value !== "all") p.filter = activeFilter.value;
  return p;
});

const { activities, loading, error, refreshActivities } =
  useActivities(queryParams);

// ---------- Background & Creation ----------
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


const showCreationModal = ref(false);

watch(showCreationModal, (open) => {
  if (open) {
    document.removeEventListener("click", handleBackgroundClick);
  } else {
    document.addEventListener("click", handleBackgroundClick);
  }
});


const handleActivityCreated = () => {
  console.log("Parent received activityCreated event!");
  showCreationModal.value = false; // This closes the modal
  refreshActivities(); // This updates the feed

  if (showToast) {
    showToast.success("Broadcast Live! 📡");
  }
};

const backendUrl = config.public.apiBaseUrl.replace("/api/v1", "");
const getFullAvatarUrl = (path) =>
  !path ? undefined : path.startsWith("http") ? path : `${backendUrl}${path}`;
</script>

<template>
  <div class="dashboard-root min-h-screen relative">
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

    <div class="relative z-10 max-w-7xl mx-auto px-4 py-8">
      <header
        class="glass-panel sticky top-6 z-50 p-2 shadow-2xl overflow-hidden"
      >
        <div
          class="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 transition-all duration-150"
          :style="{ width: scrollPercent + '%' }"
        ></div>

        <div class="flex items-center justify-between gap-4 px-4 py-1">
          <div class="flex items-center gap-3 min-w-fit">
            <div class="p-2 bg-white/10 rounded-xl">
              <span class="text-xl">🌊</span>
            </div>
            <h1
              class="hidden md:block text-xl font-black text-white tracking-tighter italic uppercase"
            >
              FLUID<span class="text-pink-400">FEED</span>
            </h1>
          </div>

          <div class="flex-1 flex items-center gap-3 max-w-2xl">
            <div class="relative flex-1 group">
              <span
                class="absolute left-4 top-1/2 -translate-y-1/2 opacity-20 text-white"
                >🔍</span
              >
              <input
                v-model="searchQuery"
                placeholder="Search transmission..."
                class="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-10 text-xs text-white focus:bg-white/10 focus:outline-none transition-all focus:border-pink-500/50"
              />
            </div>

            <div
              class="hidden sm:flex bg-black/40 p-1 rounded-xl border border-white/5"
            >
              <button
                v-for="f in ['all', 'joined', 'not_joined']"
                :key="f"
                @click="activeFilter = f"
                :class="
                  activeFilter === f
                    ? 'bg-white text-indigo-900 shadow-lg scale-105'
                    : 'text-white/40 hover:text-white'
                "
                class="px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
              >
                {{ f.replace("_", " ") }}
              </button>
            </div>
          </div>

          <div class="flex items-center gap-4">
            <button
              @click="showCreationModal = true"
              class="hidden lg:block bg-pink-500 text-white px-5 py-2.5 rounded-xl font-black shadow-lg hover:scale-105 active:scale-95 uppercase text-[10px] tracking-widest transition-all"
            >
              + Post
            </button>
            <NuxtLink to="/profile">
              <img
                :src="getFullAvatarUrl(userData.profileImageUrl)"
                class="w-10 h-10 rounded-xl object-cover border border-white/20 shadow-xl hover:border-pink-500 transition-colors"
              />
            </NuxtLink>
          </div>
        </div>
      </header>

      <main class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mt-12">
        <aside class="lg:col-span-3 lg:sticky lg:top-32 space-y-4">
          <div class="glass-panel p-6 border-l-4 border-pink-500">
            <p
              class="text-[9px] font-black uppercase text-pink-400 tracking-[0.2em] mb-1"
            >
              Commander
            </p>
            <h2 class="text-2xl font-black text-white truncate">
              {{ userData.name || "Explorer" }}
            </h2>
          </div>
        </aside>

        <section class="lg:col-span-9 space-y-8">
          <div v-if="loading" class="py-20 flex flex-col items-center">
            <div
              class="w-12 h-12 border-2 border-white/10 border-t-pink-500 rounded-full animate-spin"
            ></div>
            <p
              class="mt-4 text-[9px] font-black uppercase tracking-[0.3em] text-white/30 italic"
            >
              Decrypting...
            </p>
          </div>

          <div v-else class="space-y-12">
            <ActivityPost
              v-for="activity in activities?.data"
              :key="activity.id"
              v-bind="activity"
              @refresh-feed="refreshActivities"
            />
          </div>
        </section>
      </main>

      <Transition name="fade-pop">
        <button
          v-if="showBackToTop"
          @click="scrollToTop"
          class="fixed bottom-10 right-10 z-50 p-4 bg-pink-500 text-white rounded-2xl shadow-2xl hover:scale-110 active:scale-95 transition-all"
        >
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="3"
              d="M5 15l7-7 7 7"
            />
          </svg>
        </button>
      </Transition>

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
  background: radial-gradient(circle at top right, #1e1b4b, #020617);
  background-attachment: fixed;
}
.glass-panel {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1.5rem;
}

/* Back to Top Animation */
.fade-pop-enter-active,
.fade-pop-leave-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.fade-pop-enter-from,
.fade-pop-leave-to {
  opacity: 0;
  transform: scale(0.5) translateY(20px);
}

/* Polka dot background animation omitted for length, keep your existing one! */
</style>
