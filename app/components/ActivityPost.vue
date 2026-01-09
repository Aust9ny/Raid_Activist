<script setup>
import { ref, computed, onMounted, onUnmounted, Teleport } from "vue";
import { useApiFetch } from "~/composables/useApiFetch";
import { useAuth } from "~/stores/Auth";

// --- Props & Emits ---
const props = defineProps({
  id: Number,
  owner_id: [Number, String],
  avatar_url: String,
  Name: String,
  ArticleTitle: String,
  ArticleContent: String,
  DateTime: String,
  Location: String,
  Activity_img: String,
  CreatedAt: String,
  AttendingCount: Number,
  CommentCount: Number,
  UserHasJoined: [Boolean, Number],
});
const emit = defineEmits(["refresh-feed"]);

// --- State ---
const auth = useAuth();
const config = useRuntimeConfig();
const cardRef = ref(null);
const optionsMenuRef = ref(null);

const userIsJoined = ref(!!props.UserHasJoined);
const liveAttendingCount = ref(props.AttendingCount);
const liveCommentCount = ref(props.CommentCount);

// Visibility States
const showRaffleModal = ref(false);
const showAttendeesModal = ref(false);
const showCommentsSection = ref(false);
const showOptionsMenu = ref(false);

// Data States
const attendees = ref([]);
const raffleAttendees = ref([]);
const comments = ref([]);
const isJoining = ref(false);

const newCommentText = ref("");
const isSubmitting = ref(false);

// --- Mouse Parallax ---
const rotateX = ref(0);
const rotateY = ref(0);
const glowX = ref(0);
const glowY = ref(0);

const handleMouseMove = (e) => {
  if (!cardRef.value) return;
  const { left, top, width, height } = cardRef.value.getBoundingClientRect();
  const x = e.clientX - left;
  const y = e.clientY - top;
  rotateY.value = (x / width - 0.5) * 8;
  rotateX.value = (y / height - 0.5) * -8;
  glowX.value = x;
  glowY.value = y;
};

// --- Countdown ---
const now = ref(new Date());
let timer = null;
const countdownText = computed(() => {
  const target = new Date(props.DateTime);
  const diff = target - now.value;
  if (diff <= 0) return "Happening Now";
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const day = Math.floor(hours / 24);
  if (day > 0) return `${day}d ${hours % 24}h left`;
  const mins = Math.floor((diff / (1000 * 60)) % 60);
  return hours > 0
    ? `${hours}h ${mins}m left`
    : `${Math.floor((diff / 1000) % 60)}s left`;
});

onMounted(() => {
  timer = setInterval(() => {
    now.value = new Date();
  }, 1000);
});
onUnmounted(() => {
  clearInterval(timer);
});

// --- API Logic ---
const fetchData = async () => {
  try {
    const response = await useApiFetch(`/activities/${props.id}/attendees`);
    const data = response.data?.value || response;
    attendees.value = Array.isArray(data) ? data : data.all || [];
    raffleAttendees.value = Array.isArray(data) ? data : data.raffle || [];
  } catch (err) {
    console.error(err);
  }
};

// --- API Logic for Comments ---
const handleToggleComments = async () => {
  showCommentsSection.value = !showCommentsSection.value;

  // Only fetch if we are opening the section and don't have data yet
  if (showCommentsSection.value && comments.value.length === 0) {
    try {
      const response = await useApiFetch(`/activities/${props.id}/comments`);

      // Your Express API returns { data: [...], hasMore: boolean }
      // We need to access .data specifically
      const result = response.data?.value || response;
      comments.value = result.data || [];

      console.log(`Transmission received: ${comments.value.length} nodes.`);
    } catch (err) {
      console.error("Signal Lost:", err);
      comments.value = []; // Ensure it's an empty array on error
    }
  }
};

const submitComment = async () => {
  if (!newCommentText.value.trim() || isSubmitting.value) return;

  isSubmitting.value = true;
  const textToSend = newCommentText.value.trim();

  try {
    await useApiFetch(`/activities/${props.id}/comments`, {
      method: "POST",
      body: { content: textToSend },
    });

    // Instant UI Update: Add to the beginning of the local list
    comments.value.unshift({
      id: Date.now(),
      user: auth.user?.nickname || "You", // Matches 'user' key in your SQL
      avatar_url: auth.user?.avatar_url,
      content: textToSend,
      created_at: new Date().toISOString(),
    });

    newCommentText.value = "";
    liveCommentCount.value++;
  } catch (err) {
    console.error("Broadcast failed:", err);
  } finally {
    isSubmitting.value = false;
  }
};

const toggleJoin = async () => {
  if (isJoining.value) return;
  isJoining.value = true;
  const previous = userIsJoined.value;
  userIsJoined.value = !previous;
  liveAttendingCount.value += userIsJoined.value ? 1 : -1;
  try {
    await useApiFetch(`/activities/${props.id}/join`, {
      method: userIsJoined.value ? "POST" : "DELETE",
    });
  } catch (err) {
    userIsJoined.value = previous;
    liveAttendingCount.value += previous ? 1 : -1;
  } finally {
    isJoining.value = false;
  }
};

const openAttendees = async () => {
  await fetchData();
  showAttendeesModal.value = true;
};
const openRaffle = async () => {
  await fetchData();
  showOptionsMenu.value = false;
  showRaffleModal.value = true;
};

// --- Helpers ---
const getFullUrl = (p) =>
  p
    ? p.startsWith("http")
      ? p
      : `${config.public.apiBaseUrl.replace("/api/v1", "")}${p}`
    : null;
const formatDateTime = (iso) =>
  new Date(iso).toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });
</script>

<template>
  <div
    ref="cardRef"
    class="activity-card-container"
    @mousemove="handleMouseMove"
    @mouseleave="
      rotateX = 0;
      rotateY = 0;
    "
  >
    <div
      class="activity-card group"
      :style="{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
      }"
    >
      <div
        class="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        :style="{
          background: `radial-gradient(600px circle at ${glowX}px ${glowY}px, rgba(236, 72, 153, 0.15), transparent 40%)`,
        }"
      ></div>

      <div v-if="Activity_img" class="relative h-64 w-full overflow-hidden">
        <img
          :src="getFullUrl(Activity_img)"
          class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div class="glass-gradient-overlay"></div>
        <div
          class="absolute top-4 left-4 bg-pink-500/90 backdrop-blur-md px-4 py-2 rounded-full text-[10px] font-black text-white uppercase tracking-widest shadow-xl flex items-center gap-2"
        >
          <span class="pulse-dot"></span>
          {{ countdownText }}
        </div>
      </div>

      <div class="p-8 relative">
        <div class="flex justify-between items-start mb-6">
          <div class="flex items-center gap-4">
            <div class="relative group/avatar">
              <img
                :src="getFullUrl(avatar_url)"
                class="w-12 h-12 rounded-2xl border-2 border-white/10 object-cover shadow-2xl transition-transform group-hover/avatar:scale-110"
              />
              <div
                class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-slate-900 rounded-full"
              ></div>
            </div>
            <div>
              <h2
                class="text-2xl font-black text-white group-hover:text-pink-400 transition-colors drop-shadow-md"
              >
                {{ ArticleTitle }}
              </h2>
              <p
                class="text-[10px] text-white/40 font-black uppercase tracking-[0.2em]"
              >
                by {{ Name }}
              </p>
            </div>
          </div>

          <div class="relative" ref="optionsMenuRef">
            <button
              @click="showOptionsMenu = !showOptionsMenu"
              class="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all"
            >
              <svg
                class="w-5 h-5 text-white/60"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
                />
              </svg>
            </button>
            <div
              v-if="showOptionsMenu"
              class="absolute right-0 mt-3 w-48 glass-panel-dark z-50 animate-in fade-in slide-in-from-top-2"
            >
              <button
                @click="openRaffle"
                class="w-full text-left px-5 py-4 text-[10px] font-black text-pink-400 hover:bg-pink-500 hover:text-white flex items-center gap-3 transition-all rounded-2xl"
              >
                <span>🎲</span> OPEN RAFFLE
              </button>
            </div>
          </div>
        </div>

        <p
          class="text-white/80 leading-relaxed mb-8 text-lg font-medium tracking-tight drop-shadow-sm"
        >
          {{ ArticleContent }}
        </p>

        <div class="flex flex-wrap gap-4 mb-8">
          <div class="info-badge group/badge">
            <span class="group-hover/badge:animate-bounce">📍</span>
            <span class="info-text">{{ Location }}</span>
          </div>
          <div class="info-badge group/badge">
            <span class="group-hover/badge:rotate-12 transition-transform"
              >📅</span
            >
            <span class="info-text">{{ formatDateTime(DateTime) }}</span>
          </div>
        </div>

        <div
          class="flex items-center justify-between border-t border-white/10 pt-8"
        >
          <div class="flex gap-4">
            <button class="stat-btn group/stat" @click="openAttendees">
              <span
                class="stat-number text-pink-500 group-hover/stat:scale-110"
                >{{ liveAttendingCount }}</span
              >
              <span class="stat-label">Going</span>
            </button>
            <button @click="handleToggleComments" class="stat-btn group/stat">
              <span
                class="stat-number text-indigo-400 group-hover/stat:scale-110"
                >{{ liveCommentCount }}</span
              >
              <span class="stat-label">Chat</span>
            </button>
          </div>

          <button
            v-if="Number(auth.user?.userId) !== Number(owner_id)"
            @click="toggleJoin"
            :disabled="isJoining"
            class="join-btn"
            :class="{ joined: userIsJoined }"
          >
            {{ userIsJoined ? "LEAVE" : "JOIN NOW" }}
          </button>
        </div>

        <Transition name="slide">
          <div
            v-if="showCommentsSection"
            class="mt-8 pt-8 border-t border-white/10 relative"
          >
            <div class="flex items-center justify-between mb-6">
              <h4
                class="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400"
              >
                Live Transmission
              </h4>
              <div
                class="h-[1px] flex-1 mx-4 bg-gradient-to-r from-indigo-500/50 to-transparent"
              ></div>
            </div>

            <div
              class="space-y-4 max-h-72 overflow-y-auto pr-3 custom-scrollbar mb-6"
            >
              <div
                v-for="comment in comments"
                :key="comment.id"
                class="flex gap-4 group/msg animate-in slide-in-from-left-4 duration-300"
              >
                <img
                  :src="getFullUrl(comment.avatar_url)"
                  class="w-9 h-9 rounded-xl border border-white/10 object-cover shadow-lg"
                />
                <div
                  class="flex-1 glass-panel-dark p-4 group-hover/msg:border-pink-500/30 transition-colors"
                >
                  <div class="flex justify-between items-center mb-1">
                    <p
                      class="text-[10px] font-black text-pink-500 uppercase tracking-tighter"
                    >
                      {{ comment.user }}
                    </p>
                    <span
                      class="text-[8px] text-white/20 font-bold uppercase"
                      >{{ formatDateTime(comment.created_at) || "Now" }}</span
                    >
                  </div>
                  <p class="text-sm text-white/90 font-medium leading-relaxed">
                    {{ comment.content }}
                  </p>
                </div>
              </div>
            </div>

            <div class="relative group/input mt-4">
              <textarea
                v-model="newCommentText"
                placeholder="Send a transmission..."
                rows="1"
                @keydown.enter.prevent="submitComment"
                class="comment-input"
              ></textarea>
              <button
                @click="submitComment"
                :disabled="!newCommentText.trim() || isSubmitting"
                class="send-btn"
              >
                <span v-if="!isSubmitting" class="flex items-center gap-2">
                  SEND <span class="text-xs">📡</span>
                </span>
                <div
                  v-else
                  class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                ></div>
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <Teleport to="body">
      <AttendeesModal
        v-if="showAttendeesModal"
        :allAttendees="attendees"
        :raffleAttendees="raffleAttendees"
        :activityTitle="ArticleTitle"
        @close="showAttendeesModal = false"
      />
      <ActivityRaffleModal
        v-if="showRaffleModal"
        :attendees="raffleAttendees"
        :activityTitle="ArticleTitle"
        @close="showRaffleModal = false"
      />
    </Teleport>
  </div>
</template>

<style lang="postcss" scoped>
/* High-Fidelity Glassmorphism Styles */
.activity-card {
  @apply relative overflow-hidden bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] transition-all duration-300 ease-out;
  box-shadow: 0 20px 50px -15px rgba(0, 0, 0, 0.5);
}

.activity-card:hover {
  @apply border-pink-500/20 shadow-[0_0_80px_-20px_rgba(236,72,153,0.2)];
}

.glass-panel-dark {
  @apply bg-slate-950/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl;
}

.glass-gradient-overlay {
  @apply absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent opacity-80;
}

.info-badge {
  @apply flex items-center gap-2 bg-slate-950/40 px-4 py-2 rounded-xl border border-white/10 backdrop-blur-md transition-all hover:bg-white/10 hover:border-white/20;
}

.info-text {
  @apply text-[10px] text-white font-black uppercase tracking-widest;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.stat-btn {
  @apply flex flex-col items-center justify-center bg-slate-950/40 hover:bg-white/5 border border-white/5 w-24 py-3 rounded-2xl transition-all;
}

.stat-number {
  @apply font-black text-xl;
  text-shadow: 0 0 10px currentColor;
}

.stat-label {
  @apply text-[9px] uppercase font-black text-white/30 tracking-widest mt-1;
}

.join-btn {
  @apply px-10 py-4 rounded-2xl font-black text-[10px] tracking-widest bg-gradient-to-r from-pink-500 to-indigo-600 text-white shadow-xl transition-all hover:scale-105 active:scale-95;
}

.join-btn.joined {
  @apply from-white/10 to-white/10 border border-white/20 text-white/50 shadow-none grayscale hover:grayscale-0;
}

.pulse-dot {
  @apply relative flex h-2 w-2 rounded-full bg-white;
}
.pulse-dot::before {
  content: "";
  @apply absolute inset-0 rounded-full bg-white animate-ping opacity-75;
}

/* Custom Scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, #ec4899, #818cf8);
  border-radius: 10px;
}

/* Glass Comment Input */
.comment-input {
  @apply w-full bg-slate-950/50 border border-white/10 rounded-2xl py-4 pl-5 pr-24 
  text-white text-sm outline-none transition-all resize-none
  focus:border-pink-500/50 focus:bg-slate-950/80 focus:ring-4 focus:ring-pink-500/5;
}

.send-btn {
  @apply absolute right-2 top-2 bottom-2 px-6 bg-gradient-to-r from-pink-500 to-indigo-600 
  rounded-xl text-[10px] font-black text-white uppercase tracking-widest 
  transition-all hover:scale-[1.02] active:scale-75 disabled:opacity-30 disabled:grayscale;
}

/* User Message Entrance Animation */
@keyframes slide-in-from-left-4 {
  from {
    opacity: 0;
    transform: translateX(-16px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Animations */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.98);
}
</style>
