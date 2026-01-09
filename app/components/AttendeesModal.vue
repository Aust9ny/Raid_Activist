<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps({
    allAttendees: { type: Array, required: true },
    raffleAttendees: { type: Array, required: true },
    activityTitle: { type: String, required: true }
});

const emit = defineEmits(['close']);
const config = useRuntimeConfig();

const searchQuery = ref("");

// --- Search Logic ---
const filteredAll = computed(() => {
    return props.allAttendees.filter(a => 
        `${a.Fname} ${a.Lname}`.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
});

// --- URL & UI Helpers ---
const getFullUrl = (p) => p ? (p.startsWith("http") ? p : `${config.public.apiBaseUrl.replace("/api/v1", "")}${p}`) : null;
const getInitial = (user) => user.Fname ? user.Fname.charAt(0).toUpperCase() : '?';

// Close on ESC
const handleEsc = (e) => { if (e.key === "Escape") emit('close'); };
onMounted(() => window.addEventListener("keydown", handleEsc));
onUnmounted(() => window.removeEventListener("keydown", handleEsc));
</script>

<template>
    <div class="fixed inset-0 z-[1000] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" @click="emit('close')"></div>
        
        <div class="relative bg-slate-900/50 backdrop-blur-2xl border border-white/10 rounded-[3rem] shadow-2xl w-full max-w-5xl h-[85vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-500">
            
            <div class="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 bg-white/[0.02]">
                <div class="flex items-center gap-6">
                    <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-500 to-indigo-600 flex items-center justify-center text-3xl shadow-lg shadow-pink-500/20">
                        👥
                    </div>
                    <div>
                        <p class="text-[10px] font-black uppercase tracking-[0.4em] text-pink-500 mb-1">Transmission Roster</p>
                        <h3 class="text-3xl font-black text-white tracking-tighter italic">{{ activityTitle }}</h3>
                    </div>
                </div>

                <div class="flex items-center gap-4 w-full md:w-auto">
                    <div class="relative flex-1 md:w-64">
                        <input v-model="searchQuery" placeholder="Search explorer..." class="search-input" />
                        <span class="absolute right-4 top-1/2 -translate-y-1/2 opacity-30 text-xs">🔍</span>
                    </div>
                    <button @click="emit('close')" class="close-btn group">
                        <svg class="w-6 h-6 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">
                
                <div class="lg:col-span-3 p-8 border-r border-white/5 bg-black/20 space-y-6">
                    <div class="stat-card">
                        <span class="stat-val text-white">{{ allAttendees.length }}</span>
                        <span class="stat-lab">Total Confirmed</span>
                    </div>
                    <div class="stat-card border-yellow-500/20">
                        <span class="stat-val text-yellow-400">{{ raffleAttendees.length }}</span>
                        <span class="stat-lab text-yellow-500/60">Raffle Eligible</span>
                    </div>
                    <div class="p-6 bg-white/5 rounded-[2rem] border border-white/5">
                        <p class="text-[9px] font-black text-white/30 uppercase tracking-widest mb-4">Quick Legend</p>
                        <div class="flex items-center gap-3 mb-3">
                            <div class="w-2 h-2 rounded-full bg-green-500"></div>
                            <span class="text-[10px] text-white/60 font-bold uppercase">Online Now</span>
                        </div>
                        <div class="flex items-center gap-3">
                            <div class="w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.5)]"></div>
                            <span class="text-[10px] text-white/60 font-bold uppercase">Qualified</span>
                        </div>
                    </div>
                </div>

                <div class="lg:col-span-9 p-8 overflow-y-auto custom-scrollbar bg-black/10">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div v-for="attendee in filteredAll" :key="attendee.user_id" 
                            class="attendee-card group"
                            :class="{ 'is-qualified': raffleAttendees.some(r => r.user_id === attendee.user_id) }"
                        >
                            <div class="flex items-center gap-4">
                                <div class="relative">
                                    <img v-if="attendee.avatar_url" :src="getFullUrl(attendee.avatar_url)" class="avatar-img" />
                                    <div v-else class="avatar-placeholder">{{ getInitial(attendee) }}</div>
                                    <div class="online-indicator"></div>
                                </div>
                                
                                <div class="flex-1">
                                    <h5 class="text-sm font-black text-white group-hover:text-pink-400 transition-colors">
                                        {{ attendee.Fname }} {{ attendee.Lname }}
                                    </h5>
                                    <p class="text-[9px] text-white/30 font-bold uppercase tracking-widest">Level 1 Explorer</p>
                                </div>

                                <div v-if="raffleAttendees.some(r => r.user_id === attendee.user_id)" class="qualified-tag">
                                    QUALIFIED
                                </div>
                            </div>
                        </div>
                    </div>

                    <div v-if="filteredAll.length === 0" class="flex flex-col items-center justify-center h-64 opacity-20">
                        <span class="text-6xl mb-4">🛰️</span>
                        <p class="font-black uppercase tracking-widest text-xs">No Explorer Found</p>
                    </div>
                </div>
            </div>

            <div class="p-6 bg-slate-950/50 border-t border-white/5 flex justify-center">
                <button @click="emit('close')" class="back-btn">
                    Return to Feed
                </button>
            </div>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.search-input {
    @apply w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-5 text-xs text-white outline-none focus:border-pink-500/50 focus:bg-white/10 transition-all;
}

.close-btn {
    @apply p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all text-white border border-white/10;
}

.stat-card {
    @apply p-6 bg-white/5 rounded-[2rem] border border-white/5 flex flex-col items-center;
}
.stat-val { @apply text-3xl font-black italic; }
.stat-lab { @apply text-[8px] font-black uppercase tracking-[0.2em] mt-1; }

.attendee-card {
    @apply p-4 bg-white/[0.03] border border-white/5 rounded-2xl transition-all hover:bg-white/[0.08] hover:-translate-y-1;
}
.attendee-card.is-qualified {
    @apply border-yellow-400/20 bg-yellow-400/[0.02];
}

.avatar-img {
    @apply w-12 h-12 rounded-xl object-cover border border-white/10 shadow-lg;
}
.avatar-placeholder {
    @apply w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg;
}

.online-indicator {
    @apply absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-slate-900 rounded-full;
}

.qualified-tag {
    @apply text-[7px] font-black bg-yellow-400 text-indigo-950 px-2 py-1 rounded-md shadow-[0_0_10px_rgba(250,204,21,0.4)];
}

.back-btn {
    @apply px-12 py-4 bg-white text-slate-950 font-black rounded-2xl hover:scale-105 active:scale-95 transition-all uppercase text-[10px] tracking-widest shadow-xl;
}

.custom-scrollbar::-webkit-scrollbar { width: 5px; }
.custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-white/10 rounded-full; }


</style>