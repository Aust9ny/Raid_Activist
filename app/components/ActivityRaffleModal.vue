<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps({
    attendees: {
        type: Array,
        required: true,
        default: () => [],
    },
    activityTitle: {
        type: String,
        required: true,
    },
    // Changed from raffleattendees to match standard naming
    raffleAttendees: { 
        type: Array,
        required: false,
        default: () => [],
    }
});
const emit = defineEmits(['close']);
const config = useRuntimeConfig();

// --- State ---
const availableAttendees = ref([]); 
const winner = ref(null);
const isSpinning = ref(false);
const showConfetti = ref(false); 
const rotationDegree = ref(0); 
const WINNER_INDEX = ref(null); 

const SEGMENT_COLORS = ['#F9A8D4', '#818CF8', '#4ADE80', '#FCD34D', '#A78BFA', '#2DD4BF', '#FBBF24', '#D8B4FE', '#6EE7B7', '#FECACA']; 

// --- Helper: Get Full Image URL ---
const getFullUrl = (p) =>
  p ? (p.startsWith("http") ? p : `${config.public.apiBaseUrl.replace("/api/v1", "")}${p}`) : null;

// --- Helper: Get Initial ---
const getInitial = (user) => {
    return user.Fname ? user.Fname.charAt(0).toUpperCase() : '?';
};

// --- Initialization ---
const shuffleAndAssignColors = (list) => {
    return [...list]
        .sort(() => Math.random() - 0.5)
        .map((attendee, index) => ({
            ...attendee,
            segmentColor: SEGMENT_COLORS[index % SEGMENT_COLORS.length]
        }));
};

onMounted(() => {
    availableAttendees.value = shuffleAndAssignColors(props.attendees);
});

// --- Computed: Wheel Styling ---
const wheelStyle = computed(() => {
    const count = availableAttendees.value.length;
    if (count === 0) return { background: '#333' };

    const segmentAngle = 360 / count;
    let gradientString = '';
    
    availableAttendees.value.forEach((attendee, i) => {
        const color = attendee.segmentColor;
        const start = i * segmentAngle;
        gradientString += `${color} ${start}deg ${(i + 1) * segmentAngle}deg${i < count - 1 ? ',' : ''}`;
    });

    return { 
        background: `conic-gradient(${gradientString})`,
        transform: `rotate(${rotationDegree.value}deg)`,
        transition: isSpinning.value ? 'transform 4s cubic-bezier(0.15, 0, 0.15, 1)' : 'none',
    };
});

// --- Functions ---
const spinRaffle = () => {
    if (isSpinning.value || availableAttendees.value.length === 0) return;

    isSpinning.value = true;
    winner.value = null; 
    showConfetti.value = false;

    const randomIndex = Math.floor(Math.random() * availableAttendees.value.length);
    WINNER_INDEX.value = randomIndex;
    
    const segmentAngle = 360 / availableAttendees.value.length;
    const winningAngle = (randomIndex * segmentAngle) + (segmentAngle / 2);
    const fullSpins = 8 * 360; 
    const finalStopAngle = fullSpins + (360 - winningAngle); 

    rotationDegree.value = finalStopAngle;
    
    setTimeout(() => {
        winner.value = availableAttendees.value[WINNER_INDEX.value]; 
        availableAttendees.value.splice(WINNER_INDEX.value, 1);
        showConfetti.value = true;
        isSpinning.value = false;
        rotationDegree.value = rotationDegree.value % 360; 
    }, 4000);
};

const resetRaffle = () => {
    availableAttendees.value = shuffleAndAssignColors(props.attendees);
    winner.value = null;
    isSpinning.value = false;
    showConfetti.value = false;
    rotationDegree.value = 0; 
};
</script>

<template>
    <div class="fixed inset-0 z-[1000] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-950/90 backdrop-blur-2xl" @click="emit('close')"></div>
        
        <div v-if="showConfetti" class="absolute inset-0 pointer-events-none z-[110] overflow-hidden">
            <div v-for="n in 30" :key="n" class="confetti-particle" :style="`--c: ${SEGMENT_COLORS[n % 10]}; left: ${Math.random() * 100}%; animation-delay: ${Math.random() * 2}s`"></div>
        </div>

        <div class="relative bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[3.5rem] shadow-[0_0_100px_-20px_rgba(0,0,0,1)] w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-500">
            
            <div class="p-10 pb-0 flex justify-between items-start">
                <div class="relative">
                    <div class="absolute -left-4 top-0 w-1 h-12 bg-pink-500 rounded-full blur-sm"></div>
                    <h3 class="text-5xl font-black text-white tracking-tighter uppercase italic leading-none">
                        Raffle <span class="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-indigo-400">Draw</span>
                    </h3>
                    <p class="text-[10px] text-white/30 font-black uppercase tracking-[0.4em] mt-3 ml-1">{{ activityTitle }}</p>
                </div>
                <button @click="emit('close')" class="close-btn-round">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>

            <div class="p-10 flex flex-col md:flex-row items-center gap-14">
                <div class="relative group">
                    <div class="absolute -top-3 left-1/2 -translate-x-1/2 z-40">
                        <div class="w-6 h-8 bg-white rounded-b-full shadow-[0_0_20px_rgba(255,255,255,0.4)] flex items-center justify-center">
                            <div class="w-2 h-2 bg-pink-600 rounded-full"></div>
                        </div>
                    </div>

                    <div class="w-72 h-72 rounded-full border-[12px] border-white/5 relative flex items-center justify-center shadow-2xl">
                        <div class="w-full h-full rounded-full overflow-hidden" :style="wheelStyle"></div>
                        
                        <div class="absolute inset-0 rounded-full pointer-events-none bg-gradient-to-tr from-black/40 via-transparent to-white/20 mix-blend-overlay"></div>
                        <div class="absolute inset-0 rounded-full pointer-events-none ring-1 ring-inset ring-white/20"></div>

                        <div class="absolute w-20 h-20 bg-slate-900 rounded-full border-[6px] border-white/10 z-30 flex flex-col items-center justify-center text-white shadow-2xl">
                            <span class="text-xl font-black italic">{{ availableAttendees.length }}</span>
                            <span class="text-[7px] opacity-40 uppercase font-black tracking-widest">Remaining</span>
                        </div>
                    </div>
                </div>

                <div class="flex-1 w-full space-y-8">
                    <div class="result-box">
                        <div v-if="winner && !isSpinning" class="text-center animate-in zoom-in fade-in duration-500">
                             <p class="text-[10px] font-black text-pink-500 uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
                                <span class="w-2 h-2 rounded-full bg-pink-500 animate-ping"></span> Access Granted
                             </p>
                             <h4 class="text-3xl font-black text-white tracking-tight drop-shadow-lg">{{ winner.Fname }} {{ winner.Lname }}</h4>
                        </div>
                        <div v-else-if="isSpinning" class="text-center">
                            <p class="text-lg font-black text-white/20 uppercase tracking-[0.3em] animate-pulse">Decrypting...</p>
                        </div>
                        <p v-else class="text-xs font-black text-white/10 uppercase tracking-[0.5em]">Awaiting Draw</p>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <button @click="spinRaffle" :disabled="isSpinning || availableAttendees.length === 0" class="spin-btn">
                            {{ isSpinning ? 'SPINNING...' : 'INITIALIZE DRAW' }}
                        </button>
                        <button @click="resetRaffle" class="secondary-btn">Reset</button>
                        <button @click="emit('close')" class="secondary-btn">Close</button>
                    </div>
                </div>
            </div>

            <div class="px-10 pb-10">
                <div class="flex flex-wrap gap-2 justify-center max-h-28 overflow-y-auto custom-scrollbar p-4 bg-black/20 rounded-[2rem] border border-white/5">
                    <span v-for="attendee in availableAttendees" :key="attendee.user_id" class="attendee-tag">
                        <div class="w-1.5 h-1.5 rounded-full shadow-[0_0_5px_currentColor]" :style="{ backgroundColor: attendee.segmentColor, color: attendee.segmentColor }"></div>
                        {{ attendee.Fname }}
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
/* Glass UI Components */
.close-btn-round {
    @apply p-3 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-all text-white/40 hover:text-white;
}

.result-box {
    @apply bg-black/60 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/5 min-h-[160px] flex items-center justify-center shadow-inner relative overflow-hidden;
}
.result-box::before {
    content: '';
    @apply absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-pink-500/50 to-transparent;
}

.spin-btn {
    @apply col-span-2 py-5 bg-white text-slate-950 font-black rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.1)] 
           hover:scale-105 active:scale-95 transition-all disabled:opacity-10 uppercase text-xs tracking-widest;
}

.secondary-btn {
    @apply py-4 bg-white/5 text-white/40 font-black rounded-2xl text-[9px] uppercase tracking-widest border border-white/5 hover:bg-white/10 hover:text-white transition-all;
}

.attendee-tag {
    @apply bg-white/[0.03] px-3 py-2 rounded-xl border border-white/5 flex items-center gap-2 text-[9px] font-black text-white/50 uppercase tracking-tighter;
}

/* Animations */
.confetti-particle {
    @apply absolute w-1.5 h-1.5 rounded-full;
    background-color: var(--c);
    top: -10px;
    animation: fall 3s linear forwards;
    box-shadow: 0 0 10px var(--c);
}

@keyframes fall {
    to { transform: translateY(110vh) rotate(720deg); opacity: 0; }
}

.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-white/10 rounded-full; }
</style>