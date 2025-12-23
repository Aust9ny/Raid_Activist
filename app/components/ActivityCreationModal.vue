<script setup>
import { ref, computed } from 'vue';

const emit = defineEmits(['close', 'post-activity']);
import { useApiFetch } from '~/composables/useApiFetch';

const isPosting = ref(false);
const postError = ref(null);
// --- Form State ---
const form = ref({
    ArticleTitle: '',
    ArticleContent: '',
    DateTime: '', // Should be YYYY-MM-DDTHH:MM format for local datetime input
    Location: '',
});


const getMinDateTime = () => {
    // Get current time in ISO format (YYYY-MM-DDTHH:MM)
    const now = new Date();
    
    // Add a few minutes buffer to ensure the user can select the current time
    now.setMinutes(now.getMinutes() + 5); 
    
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const minDateTime = ref(getMinDateTime());




// --- Validation (Unchanged) ---
const isFormValid = computed(() => {
    return (
        form.value.ArticleTitle.trim().length > 3 &&
        form.value.ArticleContent.trim().length > 10 &&
        form.value.DateTime.trim().length > 0 &&
        form.value.Location.trim().length > 0 &&
        // OPTIONAL: Basic check that selected date is not before now (though 'min' attribute handles this visually)
        new Date(form.value.DateTime).getTime() > new Date().getTime() 
    );
});

// --- Submission Handler (Unchanged) ---
const handleSubmit = async () => {
    if (!isFormValid.value) {
        alert("Please fill in all required fields.");
        return;
    }
    
    isPosting.value = true;
    postError.value = null;

    // 1. Prepare data payload (ensure keys match what the Express API expects)
    const payload = {
        ArticleTitle: form.value.ArticleTitle.trim(),
        ArticleContent: form.value.ArticleContent.trim(),
        DateTime: form.value.DateTime.trim(), 
        Location: form.value.Location.trim(),
        // Note: Host ID and Status ID are handled securely by the backend (MOCK_CURRENT_USER_ID)
    };
    
    try {
        // 2. Make the API POST request using the useApiFetch utility
        // This targets: POST http://localhost:3001/api/v1/activities
        const response = await useApiFetch('/activities', {
            method: 'POST',
            body: payload,
        });

        // 3. Success Handling
        console.log("Activity successfully posted:", response.activityId);
        
        // Notify the dashboard/parent component to refresh the activity feed
        emit('activityCreated', response.activityId); 
        
        // Close the modal
        emit('close');
        
    } catch (error) {
        // 4. Error Handling
        console.error("Activity Posting Failed:", error);
        postError.value = 'Failed to create activity. Please check server logs.';
        
    } finally {
        isPosting.value = false;
    }
};
</script>

<template>
    <div class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" @click.self="emit('close')">
        
        <div class="
            bg-white/10 backdrop-blur-xl border border-white/20 
            rounded-2xl shadow-2xl p-8 w-full max-w-2xl relative
        ">
            
            <button @click="emit('close')" class="absolute top-4 right-4 text-white hover:text-pink-300 transition z-10">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>

            <h3 class="text-3xl font-extrabold text-white header-text-shadow mb-6">
                Create New Activity
            </h3>
            
            <form @submit.prevent="handleSubmit" class="space-y-6">
                
                <div>
                    <label class="block text-white/80 font-semibold mb-2 post-text-shadow">Activity Title (What are you doing?)</label>
                    <input v-model="form.ArticleTitle" type="text" placeholder="e.g., Weekend Coding Session"
                        class="w-full p-3 rounded-xl border border-white/30 bg-white/10 text-white placeholder-white/70 focus:ring-pink-300 focus:outline-none focus:ring-2 transition"
                        maxlength="60" required />
                </div>
                
                <div>
                    <label class="block text-white/80 font-semibold mb-2 post-text-shadow">Details / Content</label>
                    <textarea v-model="form.ArticleContent" rows="4" placeholder="Describe the activity, requirements, and goal..."
                        class="w-full p-3 rounded-xl border border-white/30 bg-white/10 text-white placeholder-white/70 focus:ring-pink-300 focus:outline-none focus:ring-2 transition"
                        minlength="10" required></textarea>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-white/80 font-semibold mb-2 post-text-shadow">When is it?</label>
                     <input v-model="form.DateTime" type="datetime-local" required
                            :min="minDateTime"
                            class="w-full p-3 rounded-xl border border-white/30 bg-white/10 text-white placeholder-white/70 focus:ring-pink-300 focus:outline-none focus:ring-2 transition" />
                    </div>
                    
                    <div>
                        <label class="block text-white/80 font-semibold mb-2 post-text-shadow">Where is it?</label>
                        <input v-model="form.Location" type="text" placeholder="Online / Physical Location"
                            class="w-full p-3 rounded-xl border border-white/30 bg-white/10 text-white placeholder-white/70 focus:ring-pink-300 focus:outline-none focus:ring-2 transition"
                            required />
                    </div>
                </div>

                <div class="pt-4 flex justify-end m-2 space-x-4">
                    <button type="button" @click="emit('close')" class="btn-secondary px-8 py-3 font-bold rounded-full shadow-lg transition duration-300 transform bg-slate-600 hover:bg-slate-300">
                        Cancel
                    </button>
                    <button type="submit" :disabled="!isFormValid"
                        :class="[
                            'px-8 py-3 font-bold rounded-full shadow-lg transition duration-300 transform btn-primary',
                            isFormValid || isPosting
                                ? 'bg-pink-300 text-indigo-900 hover:bg-pink-400 hover:scale-[1.02]'
                                : 'bg-gray-400 text-gray-700 cursor-not-allowed'
                        ]"
                    >
                       {{ isPosting ? 'Posting...' : 'Create Activity' }}
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<style scoped>
/* Text Shadows (Important for visibility over the liquid glass) */
.header-text-shadow {
    text-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
}
.post-text-shadow {
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.4); 
}

/* Ensure datetime-local input text is readable */
input[type="datetime-local"] {
    color-scheme: dark; /* Helps standardize input appearance on dark backgrounds */
}
</style>