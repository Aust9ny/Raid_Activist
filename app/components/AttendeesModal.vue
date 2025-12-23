<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
    allAttendees: {
        type: Array,
        required: true,
    },
    raffleAttendees: {
        type: Array,
        required: true,
    },
    activityTitle: {
        type: String,
        required: true,
    }
});

const emit = defineEmits(['close']);

const listsAreIdentical = computed(() => props.allAttendees.length === props.raffleAttendees.length);

const getAvatar = (name) => name.charAt(0);
</script>

<template>
    <div class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center" @click.self="emit('close')">
        
        <div class="
            bg-white/10 backdrop-blur-xl border border-white/20 
            rounded-2xl shadow-2xl p-6 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto
        ">
            
            <div class="flex justify-between items-center border-b border-white/20 pb-3 mb-4">
                <h3 class="text-3xl font-extrabold text-white header-text-shadow">{{ activityTitle }} Attendees</h3>
                <button @click="emit('close')" class="text-white hover:text-pink-300 transition">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 text-white">
                
                <div>
                    <h4 class="text-xl font-bold mb-3 header-text-shadow">All Confirmed Attendees ({{ allAttendees.length }})</h4>
                    <div class="space-y-2 max-h-80 overflow-y-auto pr-2">
                        <div v-for="attendee in allAttendees" :key="attendee.id"
                             class="flex items-center space-x-3 bg-white/5 p-2 rounded-lg border border-white/10 post-text-shadow"
                        >
                            <div class="w-8 h-8 bg-pink-300 rounded-full flex items-center justify-center text-sm font-semibold text-indigo-900">
                                {{ getAvatar(attendee.name) }}
                            </div>
                            <span class="font-semibold">{{ attendee.name }}</span>
                        </div>
                    </div>
                </div>
                
                <div v-if="!listsAreIdentical">
                    <h4 class="text-xl font-bold mb-3 header-text-shadow text-yellow-300">Raffle Pool Status ({{ raffleAttendees.length }})</h4>
                    <p class="text-sm mb-3 text-white/80">These users are still eligible for the raffle draw.</p>
                    <div class="space-y-2 max-h-80 overflow-y-auto pr-2">
                        <div v-for="attendee in raffleAttendees" :key="attendee.id"
                             class="flex items-center space-x-3 bg-white/5 p-2 rounded-lg border border-white/10 post-text-shadow"
                        >
                            <div class="w-8 h-8 bg-yellow-300 rounded-full flex items-center justify-center text-sm font-semibold text-indigo-900">
                                {{ getAvatar(attendee.name) }}
                            </div>
                            <span class="font-semibold">{{ attendee.name }}</span>
                        </div>
                    </div>
                </div>
                
                <div v-else class="sm:col-span-1">
                    <div class="bg-white/5 p-4 rounded-lg border border-white/10 mt-10">
                        <p class="text-sm text-white/80 post-text-shadow">
                            The raffle pool is currently identical to the full attendance list. No winners have been "cut out" yet!
                        </p>
                    </div>
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
</style>