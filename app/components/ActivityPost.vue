<script setup>
import { ref, computed, watch, Teleport } from "vue";
import { useApiFetch } from "~/composables/useApiFetch";
import { useAuth } from "~/stores/Auth";
import ActivityRaffleModal from "./ActivityRaffleModal.vue";
import AttendeesModal from "./AttendeesModal.vue";

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
  ActivityImg: String, // 🛠️ Added to match SQL: a.Activity_img AS ActivityImg
  CreatedAt: String,   // 🛠️ Added to match SQL
  AttendingCount: Number,
  CommentCount: Number,
  UserHasJoined: [Boolean, Number], // Handle SQL EXISTS returning 0/1
});

const emit = defineEmits(["refresh-feed"]);

// ---------- Avatar & Banner Helpers ----------
const backendBase = config.public.apiBaseUrl.replace("/api/v1", "");
const getFullUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${backendBase}${path}`;
};

// ---------- State ----------
// Convert numeric 0/1 from SQL EXISTS to Boolean
const userIsJoined = ref(!!props.UserHasJoined);
const liveAttendingCount = ref(props.AttendingCount);
const liveCommentCount = ref(props.CommentCount);

watch(() => props.UserHasJoined, v => userIsJoined.value = !!v);
watch(() => props.AttendingCount, v => liveAttendingCount.value = v);

const isJoining = ref(false);
const showComments = ref(false);
const showAttendees = ref(false);
const showOptionsMenu = ref(false);
const attendees = ref([]);
const comments = ref([]);
const newCommentText = ref("");

// ---------- Handlers ----------
const toggleAttendees = async () => {
  showAttendees.value = !showAttendees.value;
  if (showAttendees.value) attendees.value = await useApiFetch(`/activities/${props.id}/attendees`);
};

const toggleComments = async () => {
  showComments.value = !showComments.value;
  if (showComments.value && !comments.value.length) {
    comments.value = (await useApiFetch(`/activities/${props.id}/comments`)).reverse();
  }
};

const joinActivity = async () => {
  if (userIsJoined.value || isJoining.value) return;
  isJoining.value = true;
  try {
    const res = await useApiFetch(`/activities/${props.id}/join`, { method: "POST" });
    if (res.status === "success") {
      userIsJoined.value = true;
      liveAttendingCount.value++;
    }
  } finally { isJoining.value = false; }
};

const leaveActivity = async () => {
  if (!userIsJoined.value) return;
  // 🛠️ Matches your new backend DELETE /join route
  await useApiFetch(`/activities/${props.id}/join`, { method: "DELETE" });
  userIsJoined.value = false;
  liveAttendingCount.value = Math.max(0, liveAttendingCount.value - 1);
};

const handleHostAction = async () => {
  if (!confirm("Are you sure you want to delete this activity?")) return;
  try {
    // 🛠️ Matches your backend DELETE /:id route
    await useApiFetch(`/activities/${props.id}`, { method: "DELETE" });
    emit("refresh-feed");
  } catch (e) {
    alert("Failed to delete activity");
  }
};

const postComment = async () => {
  if (!newCommentText.value.trim()) return;
  const res = await useApiFetch(`/activities/${props.id}/comment`, {
    method: "POST",
    body: { content: newCommentText.value },
  });
  comments.value.unshift({
    id: res.commentId,
    user: auth.user?.nickname || "Me",
    text: newCommentText.value,
    avatar: getFullUrl(auth.user?.avatar_url),
    time: "Just now",
  });
  liveCommentCount.value++;
  newCommentText.value = "";
};

const formatDateTime = (iso) => new Date(iso).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
</script>

<template>
  <div class="w-full relative overflow-hidden bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl shadow-2xl mb-8 text-white">
    
    <div v-if="ActivityImg" class="w-full h-48 overflow-hidden">
        <img :src="getFullUrl(ActivityImg)" class="w-full h-full object-cover opacity-80" />
    </div>

    <div class="p-6 space-y-4">
      <div class="flex items-start justify-between border-b border-white/30 pb-4 mb-4">
        <div class="flex items-center">
          <div class="w-12 h-12 mr-3 overflow-hidden rounded-full border-2 border-white/20 shadow-lg bg-white/10">
            <img v-if="getFullUrl(avatar_url)" :src="getFullUrl(avatar_url)" class="w-full h-full object-cover" />
            <div v-else class="w-full h-full flex items-center justify-center font-bold">{{ Name?.charAt(0) }}</div>
          </div>
          <div>
            <h2 class="text-xl font-bold">{{ ArticleTitle }}</h2>
            <p class="text-sm text-white/70">Hosted by {{ Name }} • {{ formatDateTime(CreatedAt) }}</p>
          </div>
        </div>

        <div class="relative">
          <button @click="showOptionsMenu = !showOptionsMenu" class="p-2 hover:bg-white/10 rounded-full transition">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
          </button>

          <div v-if="showOptionsMenu" class="absolute right-0 mt-2 w-48 bg-indigo-900/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl py-2 z-50">
            <button @click="showRaffleModal = true; showOptionsMenu = false" class="w-full text-left px-4 py-2 hover:bg-white/10 text-pink-300 font-bold">🎲 Open Raffle</button>
            <button
              v-if="Number(auth.user?.userId) === Number(owner_id)"
              @click="handleHostAction"
              class="w-full text-left px-4 py-2 text-red-400 hover:bg-red-500/10 font-bold"
            >🗑️ Delete Post</button>
          </div>
        </div>
      </div>

      <p class="text-white/90 leading-relaxed">{{ ArticleContent }}</p>

      <div class="flex flex-col sm:flex-row gap-4 text-sm font-semibold text-white/80 border border-white/20 p-3 rounded-lg bg-white/10">
          <div class="flex items-center"><span class="mr-2 text-pink-300">🗓️</span><span>{{ formatDateTime(DateTime) }}</span></div>
          <div class="flex items-center"><span class="mr-2 text-pink-300">📍</span><span>{{ Location }}</span></div>
      </div>

      <div class="flex items-center justify-between mt-5">
        <div class="flex space-x-3">
          <button @click="toggleAttendees" class="flex items-center space-x-2 text-sm border border-white/20 rounded-full p-2 px-4 hover:bg-white/20 transition">
            <span class="font-bold text-pink-300">{{ liveAttendingCount }}</span><span>attending</span>
          </button>
          <button @click="toggleComments" class="flex items-center space-x-2 text-sm border border-white/20 rounded-full p-2 px-4 hover:bg-white/20 transition">
            <span class="font-bold text-pink-300">{{ liveCommentCount }}</span><span>comments</span>
          </button>
        </div>

        <button 
          v-if="Number(auth.user?.userId) !== Number(owner_id)"
          @click="userIsJoined ? leaveActivity() : joinActivity()"
          :class="['px-6 py-2 font-semibold rounded-full shadow-md transition',
            userIsJoined ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-600 hover:bg-gray-200']"
        >
          {{ userIsJoined ? 'Leave Activity' : 'Join Activity' }}
        </button>
      </div>
        
      </div>
  </div>
</template>

<style scoped>
.slide-fade-enter-active, .slide-fade-leave-active { transition: all 0.3s ease; max-height: 500px; }
.slide-fade-enter-from, .slide-fade-leave-to { opacity: 0; transform: translateY(-10px); max-height: 0; }
</style>