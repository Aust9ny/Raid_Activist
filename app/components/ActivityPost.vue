<script setup>
import { ref, computed, watch, onMounted, onUnmounted, Teleport } from "vue";
import { useApiFetch } from "~/composables/useApiFetch";
import { useAuth } from "~/stores/Auth";
import ActivityRaffleModal from "./ActivityRaffleModal.vue";
import AttendeesModal from "./AttendeesModal.vue";

const optionsMenuRef = ref(null);

const handleClickOutside = (e) => {
  if (!optionsMenuRef.value) return;
  if (!optionsMenuRef.value.contains(e.target)) {
    showOptionsMenu.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});

const auth = useAuth();
const config = useRuntimeConfig();

const props = defineProps({
  id: Number,
  owner_id: [Number, String],
  avatar_url: String,
  Name: String,
  ArticleTitle: String,
  ArticleContent: String,
  DateTime: String,
  Location: String,
  ActivityImg: String,
  CreatedAt: String,
  AttendingCount: Number,
  CommentCount: Number,
  UserHasJoined: [Boolean, Number],
});

const emit = defineEmits(["refresh-feed"]);

// ---------- State ----------
const userIsJoined = ref(!!props.UserHasJoined);
const liveAttendingCount = ref(props.AttendingCount);
const liveCommentCount = ref(props.CommentCount);

const showRaffleModal = ref(false);
const showAttendeesModal = ref(false); // Modal for all attendees
const showCommentsSection = ref(false); // Inline section for comments
const showOptionsMenu = ref(false);

const attendees = ref([]);
const comments = ref([]);
const newCommentText = ref("");
const isJoining = ref(false);

const toggleJoin = async () => {
  if (isJoining.value) return;
  isJoining.value = true;

  // optimistic update
  const previous = userIsJoined.value;
  userIsJoined.value = !previous;
  liveAttendingCount.value += userIsJoined.value ? 1 : -1;

  try {
    await useApiFetch(`/activities/${props.id}/join`, {
      method: userIsJoined.value ? "POST" : "DELETE",
    });
  } catch (err) {
    // rollback on failure
    userIsJoined.value = previous;
    liveAttendingCount.value += previous ? 1 : -1;
  } finally {
    isJoining.value = false;
  }
};

// ---------- Countdown Timer ----------
const now = ref(new Date());
let timer = null;
onMounted(() => {
  timer = setInterval(() => {
    now.value = new Date();
  }, 1000);
});
onUnmounted(() => clearInterval(timer));

const countdownText = computed(() => {
  const target = new Date(props.DateTime);
  const diff = target - now.value;
  if (diff <= 0) return "Happening Now";
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor((diff / (1000 * 60)) % 60);
  return `${hours}h ${mins}m left`;
});

// ---------- Handlers (Connected to your Backend) ----------

const handleToggleAttendees = async () => {
  showAttendeesModal.value = true;
  // Calls GET /api/v1/activities/:id/attendees
  const data = await useApiFetch(`/activities/${props.id}/attendees`);
  attendees.value = data || [];
};

const handleToggleComments = async () => {
  showCommentsSection.value = !showCommentsSection.value;
  if (showCommentsSection.value) {
    // Calls GET /api/v1/activities/:id/comments
    const res = await useApiFetch(`/activities/${props.id}/comments`);
    comments.value = res.data || [];
  }
};

const postComment = async () => {
  if (!newCommentText.value.trim()) return;
  const res = await useApiFetch(`/activities/${props.id}/comments`, {
    method: "POST",
    body: { content: newCommentText.value },
  });
  if (res.success) {
    comments.value.unshift({
      id: res.commentId,
      user: auth.user?.nickname || "Me",
      content: newCommentText.value,
      avatar_url: auth.user?.avatar_url,
      created_at: new Date().toISOString(),
    });
    liveCommentCount.value++;
    newCommentText.value = "";
  }
};

// ... keep joinActivity / leaveActivity as previously fixed ...

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
    class="activity-card relative overflow-hidden bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2.5rem] mb-8 text-white transition-all hover:shadow-2xl"
  >
    <div v-if="ActivityImg" class="relative h-48 w-full overflow-hidden">
      <img :src="getFullUrl(ActivityImg)" class="w-full h-full object-cover" />
      <div
        class="absolute top-4 left-4 bg-pink-500/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest"
      >
        {{ countdownText }}
      </div>
    </div>

    <div class="p-8">
      <div class="flex justify-between items-start mb-6">
        <div class="flex items-center gap-4">
          <img
            :src="getFullUrl(avatar_url)"
            class="w-12 h-12 rounded-2xl border border-white/20 object-cover"
          />
          <div>
            <h2 class="text-2xl font-black tracking-tight">
              {{ ArticleTitle }}
            </h2>
            <p class="text-xs opacity-60">
              by {{ Name }} • {{ formatDateTime(CreatedAt) }}
            </p>
          </div>
        </div>

        <div class="relative" ref="optionsMenuRef">
          <button
            @click="showOptionsMenu = !showOptionsMenu"
            class="p-2 hover:bg-white/10 rounded-full transition"
          >
            <svg
              class="w-6 h-6 opacity-50"
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
            class="absolute right-0 mt-2 w-48 bg-indigo-950/90 backdrop-blur-2xl border border-white/20 rounded-2xl p-2 z-50"
          >
            <button
              @click="
                showRaffleModal = true;
                showOptionsMenu = false;
              "
              class="w-full text-left px-4 py-3 hover:bg-white/10 text-pink-300 font-bold rounded-xl flex items-center gap-2"
            >
              <span>🎲</span> Open Raffle
            </button>
          </div>
        </div>
      </div>

      <p class="text-white/80 leading-relaxed mb-4">{{ ArticleContent }}</p>
      <div class="flex items-center gap-2 text-sm font-bold opacity-70 mb-4">
        <span>📍</span> {{ Location }}
        <span>•</span>
        <span>🗓️</span> {{ formatDateTime(DateTime) }}
      </div>

      <div
        class="flex items-center justify-between border-t border-white/10 pt-4"
      >
        <div class="flex gap-6 mb-6">
          <button
            @click="handleToggleAttendees"
            class="group flex items-center gap-2 border border-white/10 px-4 py-2 rounded-2xl w-auto h-auto"
          >
            <span
              class="text-pink-400 font-black text-lg group-hover:scale-110 transition"
              >{{ liveAttendingCount }}</span
            >
            <span
              class="text-[10px] uppercase font-bold opacity-40 tracking-widest group-hover:scale-110 transition-transform"
              >Attending</span
            >
          </button>
          <button
            @click="handleToggleComments"
            class="group flex items-center gap-2 border border-white/10 px-4 py-2 rounded-2xl w-auto h-auto"
          >
            <span
              class="text-pink-400 font-black text-lg group-hover:scale-110 transition"
              >{{ liveCommentCount }}</span
            >
            <span
              class="text-[10px] uppercase font-bold opacity-40 tracking-widest group-hover:scale-110 transition-transform"
              >Comments</span
            >
          </button>
        </div>
        <button
          v-if="Number(auth.user?.userId) !== Number(owner_id)"
          @click="toggleJoin"
          :disabled="isJoining"
          :class="[
            'px-8 py-3  rounded-2xl font-black text-xs transition-all active:scale-95 shadow-lg mb-6',
            userIsJoined
              ? 'bg-white/10 border border-white/20'
              : 'bg-white text-indigo-900',
          ]"
        >
          {{ userIsJoined ? "Cancel RSVP" : "Join Activity" }}
        </button>
      </div>

      <transition name="slide-fade">
        <div
          v-if="showCommentsSection"
          class="pt-6 space-y-6 border-t-2 border-white/5"
        >
          <div class="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            <div
              v-for="c in comments"
              :key="c.id"
              class="flex gap-4 animate-in fade-in slide-in-from-bottom-2"
            >
              <img
                :src="getFullUrl(c.avatar_url)"
                class="w-10 h-10 rounded-xl bg-white/10"
              />
              <div
                class="flex-1 bg-white/5 p-4 rounded-2xl border border-white/5"
              >
                <p class="font-black text-pink-300 text-[10px] mb-1 uppercase">
                  {{ c.user }}
                </p>
                <p class="text-sm text-white/80">{{ c.content }}</p>
              </div>
            </div>
          </div>
          <div class="flex gap-3">
            <input
              v-model="newCommentText"
              @keyup.enter="postComment"
              placeholder="Add to the fluid conversation..."
              class="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
            <button
              @click="postComment"
              class="bg-pink-500 px-6 rounded-2xl font-bold text-xs"
            >
              Post
            </button>
          </div>
        </div>
      </transition>
    </div>

    <Teleport to="body">
      <AttendeesModal
        v-if="showAttendeesModal"
        :attendees="attendees"
        @close="showAttendeesModal = false"
      />
      <ActivityRaffleModal
        v-if="showRaffleModal"
        :activityId="id"
        @close="showRaffleModal = false"
      />
    </Teleport>
  </div>
</template>
