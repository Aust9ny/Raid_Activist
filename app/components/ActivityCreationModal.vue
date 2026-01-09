<script setup>
import { ref, computed, onMounted } from "vue";
import { useApiFetch } from "~/composables/useApiFetch";

const emit = defineEmits(["close", "activityCreated"]);

// --- State ---
const modalRef = ref(null);
const isPosting = ref(false);
const postError = ref(null);
const shakeModal = ref(false);

const form = ref({
  ArticleTitle: "",
  ArticleContent: "",
  DateTime: "",
  Location: "",
});

// --- Mouse Parallax Logic (Matched to ActivityCard) ---
const rotateX = ref(0);
const rotateY = ref(0);
const glowX = ref(0);
const glowY = ref(0);

const handleMouseMove = (e) => {
  if (!modalRef.value) return;
  const { left, top, width, height } = modalRef.value.getBoundingClientRect();
  const x = e.clientX - left;
  const y = e.clientY - top;
  
  // Calculate subtle rotation
  rotateY.value = ((x / width) - 0.5) * 6;  // Slightly less tilt than card for better usability
  rotateX.value = ((y / height) - 0.5) * -6;
  
  glowX.value = x;
  glowY.value = y;
};

const resetTransform = () => {
  rotateX.value = 0;
  rotateY.value = 0;
};

// --- Submission Logic ---
const triggerShake = () => {
  shakeModal.value = true;
  setTimeout(() => (shakeModal.value = false), 500);
};

const handleSubmit = async () => {
  if (!isFormValid.value) { triggerShake(); return; }
  isPosting.value = true;
  try {
    const response = await useApiFetch("/activities", {
      method: "POST",
      body: { ...form.value },
    });
    emit("activityCreated", response.activityId);
    emit("close");
  } catch (error) {
    triggerShake();
    postError.value = "Post failed. Try again.";
  } finally { isPosting.value = false; }
};

const isFormValid = computed(() => 
  form.value.ArticleTitle.length >= 3 && form.value.ArticleContent.length >= 10
);
const minDateTime = new Date().toISOString().slice(0, 16);
</script>

<template>
  <div
    class="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-slate-950/60"
    @click.self="emit('close')"
  >
    <div
      ref="modalRef"
      class="modal-parallax-container"
      @mousemove="handleMouseMove"
      @mouseleave="resetTransform"
    >
      <div
        class="modal-glass group"
        :style="{ transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)` }"
        :class="{ 'shake-active': shakeModal }"
      >
        <div 
          class="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          :style="{ background: `radial-gradient(800px circle at ${glowX}px ${glowY}px, rgba(236, 72, 153, 0.1), transparent 40%)` }"
        ></div>

        <div class="mb-8 relative z-10">
          <h3 class="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <span class="bg-gradient-to-tr from-pink-500 to-indigo-600 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg">
              ✨
            </span>
            Create New Activity
          </h3>
          <p class="text-slate-400 mt-2 text-sm font-medium uppercase tracking-widest">Broadcast you activity!</p>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-6 relative z-10">
          <div class="group/input">
            <label class="input-label">Activity Title</label>
            <input v-model="form.ArticleTitle" type="text" class="input-premium" required />
          </div>

          <div class="group/input">
            <label class="input-label">Objective</label>
            <textarea v-model="form.ArticleContent" rows="4" class="input-premium resize-none" required></textarea>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="group/input">
              <label class="input-label">Schedule</label>
              <input v-model="form.DateTime" type="datetime-local" :min="minDateTime" class="input-premium" required />
            </div>
            <div class="group/input">
              <label class="input-label">Location</label>
              <input v-model="form.Location" type="text" class="input-premium" required />
            </div>
          </div>

          <div class="pt-6 flex items-center justify-end gap-4">
            <button type="button" @click="emit('close')" class="cancel-btn">Cancel</button>
            <button type="submit" :disabled="!isFormValid" class="create-btn">
              {{ isPosting ? 'Posting...' : 'Launch Activity 🚀' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
/* Entry Animation for the Modal */
.modal-parallax-container {
  @apply w-full max-w-2xl transition-all duration-300 ease-out;
  animation: modal-pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes modal-pop {
  from { opacity: 0; transform: scale(0.9) translateY(20px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.modal-glass {
  @apply relative bg-slate-900/80 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl transition-transform duration-200 ease-out overflow-hidden;
  will-change: transform;
}

.input-label {
  @apply block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-2 transition-colors group-focus-within/input:text-pink-400;
}

.input-premium {
  @apply w-full p-4 rounded-2xl border border-white/5 bg-slate-950/50 text-white outline-none transition-all;
}

.input-premium:focus {
  @apply border-pink-500/50 ring-4 ring-pink-500/10;
}

.create-btn {
  @apply px-10 py-4 font-black text-[10px] uppercase tracking-widest rounded-2xl bg-gradient-to-r from-pink-400 to-indigo-500 text-indigo-950 transition-all hover:scale-105 active:scale-95 disabled:opacity-50;
}

.cancel-btn {
  @apply px-8 py-4 font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-white transition-colors;
}

/* Shake logic */
.shake-active {
  animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
  @apply border-pink-500/50;
}

@keyframes shake {
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
  40%, 60% { transform: translate3d(4px, 0, 0); }
}
</style>