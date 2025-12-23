// ~/composables/useAnimatedBackground.js
import { ref } from 'vue';

const initialDots = [
    { id: 1, color: 'pink-500', size: 80, delay: 0, position: { top: '10%', left: '5%' } },
    { id: 2, color: 'indigo-500', size: 56, delay: -3, position: { bottom: '20%', right: '10%' } },
    { id: 3, color: 'yellow-500', size: 96, delay: -6, position: { top: '50%', left: '30%' } },
];

let dotPositions = ref(initialDots);
let ripples = ref([]);
let ambientInterval = null; // Store the timer for cleanup

export const useAnimatedBackground = () => {

    // Helper to create a ripple (used for both click and random ambient)
    const createRipple = (x, y, isAmbient = false) => {
        const newRipple = {
            id: Date.now() + Math.random(),
            style: {
                left: `${x}px`,
                top: `${y}px`,
                backgroundColor: ['#EC4899', '#6366F1', '#F59E0B', '#2DD4BF'][Math.floor(Math.random() * 4)],
                // Ambient ripples are slower and more subtle (0.2 opacity vs 0.5)
                opacity: isAmbient ? '0.2' : '0.4',
                animationDuration: isAmbient ? '4s' : '2s',
            }
        };
        ripples.value.push(newRipple);
        // Clean up after animation ends
        setTimeout(() => {
            ripples.value = ripples.value.filter(r => r.id !== newRipple.id);
        }, isAmbient ? 4000 : 2000);
    };

    const handleBackgroundClick = (event) => {
        const contentWrapper = document.querySelector('.glass-panel, .form-container');
        if (contentWrapper && contentWrapper.contains(event.target)) return; 
        createRipple(event.pageX, event.pageY, false);
    };

    // --- NEW: Start the 'Light Rain' effect ---
    const startAmbientGlow = () => {
        if (ambientInterval) return; // Prevent duplicate timers

        ambientInterval = setInterval(() => {
            // Generate random coordinates within the window
            const randomX = Math.random() * window.innerWidth;
            const randomY = Math.random() * (window.innerHeight + window.scrollY);
            
            createRipple(randomX, randomY, true);
        }, 1500); // New glow every 1.5 seconds (adjust for more or less "rain")
    };

    const stopAmbientGlow = () => {
        if (ambientInterval) {
            clearInterval(ambientInterval);
            ambientInterval = null;
        }
    };

    return {
        dotPositions,
        ripples,
        handleBackgroundClick,
        startAmbientGlow,
        stopAmbientGlow
    };
};