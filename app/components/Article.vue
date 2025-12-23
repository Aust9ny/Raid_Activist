<script setup>
// Define the new, expanded set of props for an activity post
const props = defineProps({
    // Core Content
    Name: {
        type: String,
        default: "Host Name"
    },
    ArticleTitle: {
        type: String,
        default: "Weekend Hike & Picnic"
    },
    ArticleContent: {
        type: String,
        default: "Join us for a relaxing hike this Saturday at Bear Mountain! We'll meet at the trailhead at 9 AM and enjoy a picnic lunch with a view."
    },

    // Activity Details (New)
    DateTime: {
        type: String,
        default: 'Dec 31, 2025 at 7:00 PM' // Example: Pass a formatted string or use a computed property
    },
    Location: {
        type: String,
        default: 'Bear Mountain Trailhead'
    },
    
    // Engagement Data (New)
    AttendingCount: {
        type: Number,
        default: 42
    },
    CommentCount: {
        type: Number,
        default: 10
    },
    UserHasJoined: {
        type: Boolean,
        default: false // Whether the current user has already joined
    },
})

// Define a reactive state for the button feedback
const isJoining = ref(false)

// Function to handle the join action
const joinActivity = () => {
    if (props.UserHasJoined) {
        // Optional: Implement logic to un-join/cancel RSVP
        console.log(`User is already joined. Un-join logic could go here.`)
        return
    }

    isJoining.value = true
    console.log(`Attempting to join activity: ${props.ArticleTitle}`)

    // --- API Call Simulation ---
    // In a real Nuxt app, you would make an API call here to register the user.
    // Use an async function, `await $fetch('/api/join-activity', { method: 'POST', ... })`

    setTimeout(() => {
        // After successful API call, you would typically emit an event 
        // to the parent component to update the UserHasJoined prop and AttendingCount.
        
        // For demonstration:
        console.log("Successfully joined! (Simulated)")
        // isJoining.value = false // Reset loading state
        // emit('update:joined', true) // Example of how to communicate back to parent
    }, 1500)
}
</script>

<template>
  <div class="max-w-xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden p-6 mb-8 border border-gray-100">

    <div class="flex items-start justify-between border-b pb-4 mb-4">
      
      <div class="flex items-center">
        <div class="w-10 h-10 bg-indigo-200 rounded-full mr-3 flex items-center justify-center text-sm font-semibold text-indigo-700">
          {{ Name.charAt(0) }}
        </div>
        <div>
          <h2 class="text-lg font-bold text-gray-900">{{ ArticleTitle }}</h2>
          <p class="text-sm text-gray-500">Hosted by {{ Name }}</p>
        </div>
      </div>
      
      <button class="text-gray-400 hover:text-gray-700 p-1">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"></path></svg>
      </button>
    </div>

    <div class="space-y-4">
      
      <p class="text-gray-700 leading-relaxed">{{ ArticleContent }}</p>

      <div class="flex flex-col sm:flex-row sm:space-x-8 space-y-2 sm:space-y-0 text-sm font-medium text-gray-600 border p-3 rounded-lg bg-gray-50">
        
        <div class="flex items-center">
          <span class="mr-2 text-indigo-500">🗓️</span>
          <span>{{ DateTime }}</span>
        </div>

        <div class="flex items-center">
          <span class="mr-2 text-indigo-500">📍</span>
          <span>{{ Location }}</span>
        </div>

      </div>

    </div>

    <hr class="my-5 border-gray-200" />

    <div class="flex items-center justify-between">

      <div class="text-sm text-gray-500">
        <span class="font-bold text-indigo-600">{{ AttendingCount }}</span> attending • <span class="text-gray-400">{{ CommentCount }} comments</span>
      </div>

      <button 
        :disabled="isJoining"
        @click="joinActivity"
        :class="[
            'px-6 py-2 font-semibold rounded-full shadow-md transition duration-300 ease-in-out',
            isJoining || UserHasJoined 
                ? 'bg-gray-400 text-white cursor-not-allowed' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 transform hover:scale-105'
        ]"
      >
        <span v-if="isJoining">Processing...</span>
        <span v-else-if="UserHasJoined">Joined</span>
        <span v-else>Join Activity</span>
      </button>

    </div>

  </div>
</template>