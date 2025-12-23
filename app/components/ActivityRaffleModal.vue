<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
    attendees: {
        type: Array,
        required: true,
        default: () => [],
    },
    activityTitle: {
        type: String,
        required: true,
    }
});

const emit = defineEmits(['close']);

// --- State ---
const availableAttendees = ref([]); 
const winner = ref(null);
const isSpinning = ref(false);
const showConfetti = ref(false); // NEW: State to control the celebration effect
const rotationDegree = ref(0); 
const WINNER_INDEX = ref(null); 

const SEGMENT_COLORS = ['#F9A8D4', '#818CF8', '#4ADE80', '#FCD34D', '#A78BFA', '#2DD4BF', '#FBBF24', '#D8B4FE', '#6EE7B7', '#FECACA']; 

// --- NEW FUNCTION: Shuffle and Assign Colors ---
const shuffleAndAssignColors = (list) => {
    const shuffledList = [...list].sort(() => Math.random() - 0.5);
    return shuffledList.map((attendee, index) => ({
        ...attendee,
        segmentColor: SEGMENT_COLORS[index % SEGMENT_COLORS.length]
    }));
};

// --- Initialization ---
availableAttendees.value = shuffleAndAssignColors(props.attendees);

// --- Computed: Dynamic Wheel Styling (Unchanged) ---
const wheelSegments = computed(() => {
    const count = availableAttendees.value.length;
    if (count === 0) return { gradient: `conic-gradient(#555 360deg)`, segments: [] };

    const segmentAngle = 360 / count;
    let gradientString = '';
    
    for (let i = 0; i < count; i++) {
        const attendee = availableAttendees.value[i];
        const color = attendee.segmentColor;
        const start = i * segmentAngle;
        
        gradientString += `${color} ${start}deg ${(i + 1) * segmentAngle}deg${i < count - 1 ? ',' : ''}`;
    }

    return { 
        gradient: `conic-gradient(${gradientString})`, 
    };
});

const wheelStyle = computed(() => ({
    background: wheelSegments.value.gradient,
    transform: `rotate(${rotationDegree.value}deg)`,
    // Adjusting timing function for smooth slow-down/inertia:
    transition: isSpinning.value ? 'transform 4s cubic-bezier(0.1, 0.7, 0.1, 1)' : 'none',
}));


// --- Functions ---

const pickWinner = () => {
    if (availableAttendees.value.length === 0) {
        return { winner: { name: 'No attendees available!' }, index: -1 };
    }

    const randomIndex = Math.floor(Math.random() * availableAttendees.value.length);
    const chosenWinner = availableAttendees.value[randomIndex];
    
    return { winner: chosenWinner, index: randomIndex };
};


const spinRaffle = () => {
    if (isSpinning.value || availableAttendees.value.length === 0) return;

    isSpinning.value = true;
    winner.value = null; 
    showConfetti.value = false; // Reset confetti

    const result = pickWinner();
    WINNER_INDEX.value = result.index;
    
    const count = availableAttendees.value.length;
    const segmentAngle = 360 / count;
    
    // Calculate the final stop angle
    const winningAngle = (WINNER_INDEX.value * segmentAngle) + (segmentAngle / 2);
    const fullSpins = 5 * 360; // Increased full spins slightly for more inertia feel
    const finalStopAngle = fullSpins + (360 - winningAngle) + Math.random() * 5; 

    rotationDegree.value = finalStopAngle;
    
    // --- CRITICAL FIX: DELAY WINNER REVEAL AND 'CUT OUT' UNTIL SPIN ENDS ---
    setTimeout(() => {
        // 1. Reveal the winner
        winner.value = result.winner; 
        
        // 2. Perform the cut-out
        availableAttendees.value.splice(WINNER_INDEX.value, 1);
        
        // 3. Trigger the celebration effect
        showConfetti.value = true;

        // 4. End the spinning state
        isSpinning.value = false;
        
        // Normalize rotation for next spin (optional)
        rotationDegree.value = rotationDegree.value % 360; 

    }, 4000); // Wait for the full 4s CSS transition
};

const resetRaffle = () => {
    availableAttendees.value = shuffleAndAssignColors(props.attendees);
    winner.value = null;
    isSpinning.value = false;
    showConfetti.value = false; // Reset confetti
    rotationDegree.value = 0; 
    WINNER_INDEX.value = null;
};
</script>

<template>
    <div class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center" @click.self="emit('close')">
        
        <div v-if="showConfetti" class="absolute inset-0 overflow-hidden pointer-events-none z-[60]">
            <div class="confetti-stream left-1/4"></div>
            <div class="confetti-stream right-1/4"></div>
            <div class="confetti-stream center-x"></div>
        </div>
        
        <div class="
            bg-white/10 backdrop-blur-xl border border-white/20 
            rounded-2xl shadow-2xl p-6 w-full max-w-lg relative z-50
        ">
            
            <button @click="emit('close')" class="absolute top-3 right-3 text-white hover:text-pink-300 transition z-50">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>

            <h3 class="text-3xl font-extrabold text-white header-text-shadow mb-4">{{ activityTitle }} Raffle</h3>
            <hr class="border-white/20 mb-6" />

            <div class="flex space-x-6 items-start">
                
                <div class="flex-shrink-0 w-40 h-40 relative">
                    
                    <div class="absolute w-full h-full pointer-events-none z-10">
                         <div class="absolute left-1/2 transform -translate-x-1/2 -top-1 w-0 h-0 border-x-[8px] border-x-transparent border-b-[15px] border-b-red-500 shadow-md rotate-[180deg]"></div>
                    </div>

                    <div class="w-40 h-40 rounded-full border-4 border-white/50 shadow-inner overflow-hidden relative" 
                         :style="wheelStyle"
                    >
                        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-black/70 mix-blend-multiply">
                            <span class="text-2xl font-bold">{{ availableAttendees.length }}</span>
                            <span class="text-xs block">left</span>
                         </div>
                    </div>
                </div>

                <div class="flex-grow space-y-4 text-white">
                    <div class="bg-white/10 p-3 rounded-lg border border-white/10 min-h-[80px]">
                        <p class="text-sm font-semibold text-white/70 post-text-shadow">Winning Attendee:</p>
                        <p v-if="winner && !isSpinning" :class="['text-xl font-bold', winner.name === 'No attendees available!' ? 'text-red-300' : 'text-pink-300']">
                            {{ winner.name }}
                        </p>
                        <p v-else-if="isSpinning" class="text-xl font-bold text-yellow-300">
                            Spinning...
                        </p>
                        <p v-else class="text-xl font-bold text-white/50">
                            Ready! ({{ availableAttendees.length }} left)
                        </p>
                    </div>

                    <div class="flex space-x-2">
                        <button 
                            @click="spinRaffle"
                            :disabled="isSpinning || availableAttendees.length === 0"
                            :class="['flex-grow px-4 py-2 font-bold rounded-full transition shadow-lg',
                                isSpinning ? 'bg-gray-400 cursor-not-allowed' : 'bg-pink-300 text-indigo-900 hover:bg-pink-400']"
                        >
                            <span v-if="isSpinning">Drawing...</span>
                            <span v-else>Spin & Cut Out</span>
                        </button>
                        <button 
                            @click="resetRaffle"
                            :disabled="isSpinning"
                            class="px-4 py-2 bg-white/30 text-white font-bold rounded-full transition hover:bg-white/40"
                        >
                            Reset Names
                        </button>
                    </div>
                </div>
            </div>

            <div class="mt-6">
                <p class="text-white/70 text-sm mb-2">Available for Draw ({{ availableAttendees.length }}):</p>
                <div class="flex flex-wrap gap-2 text-xs text-white/90 max-h-24 overflow-y-auto pr-2">
                    <span v-for="attendee in availableAttendees" :key="attendee.id" 
                          class="bg-white/10 backdrop-blur-sm px-2 py-1 rounded-full border border-white/10 flex items-center space-x-1"
                    >
                        <div 
                            class="w-2 h-2 rounded-full shadow-md" 
                            :style="{ backgroundColor: attendee.segmentColor }"
                        ></div>
                        <span>{{ attendee.name }}</span>
                    </span>
                </div>
            </div>
            
        </div>
    </div>
</template>

<style scoped>
.header-text-shadow {
    text-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
}
.post-text-shadow {
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.4); 
}

/* --- NEW: Confetti/Celebration CSS Placeholder --- */
/* This mimics the celebratory effect you requested */
@keyframes fall {
    0% { transform: translateY(-100vh) rotateZ(0deg); opacity: 0; }
    5% { opacity: 1; }
    95% { opacity: 1; }
    100% { transform: translateY(100vh) rotateZ(720deg); opacity: 0; }
}

.confetti-stream {
    position: absolute;
    width: 8px;
    height: 8px;
    background-color: var(--confetti-color, #FCD34D); /* Default color, can be customized */
    border-radius: 50%;
    animation: fall 5s ease-in-out infinite;
}

.confetti-stream.left-1\4 {
    left: 25%;
    animation-delay: 0s;
    --confetti-color: #F9A8D4;
}

.confetti-stream.right-1\4 {
    left: 75%;
    animation-delay: 1s;
    --confetti-color: #4ADE80;
}

.confetti-stream.center-x {
    left: 50%;
    animation-delay: 2s;
    --confetti-color: #818CF8;
}
</style>