<script setup>
import { onMounted, onUnmounted } from "vue";
import { navigateTo } from "#app";
import { useAnimatedBackground } from "~/composables/useAnimatedBackground";

const { dotPositions, ripples, handleBackgroundClick, startAmbientGlow, stopAmbientGlow } = useAnimatedBackground();

onMounted(() => {
    document.addEventListener("click", handleBackgroundClick);
    startAmbientGlow(); // Start the ambient rainfall effect
});

onUnmounted(() => {
    document.removeEventListener("click", handleBackgroundClick);
    stopAmbientGlow();
});

const goToLogin = () => navigateTo('/login');
const goToSignup = () => navigateTo('/register');
</script>

<template>
    <div class="page-root min-h-screen relative overflow-hidden flex flex-col">
        <div class="fixed inset-0 z-0 pointer-events-none overflow-hidden">
            <div v-for="dot in dotPositions" :key="dot.id"
                :class="['dot-animation', `bg-${dot.color}`, `w-${dot.size}`, `h-${dot.size}`]"
                :style="{ ...dot.position, animationDelay: dot.delay + 's', opacity: 0.4 }">
            </div>
            <div v-for="ripple in ripples" :key="ripple.id"
                class="ripple-effect absolute rounded-full mix-blend-overlay filter blur-sm z-50"
                :style="ripple.style"></div>
        </div>

        <header class="relative z-20 w-full max-w-7xl mx-auto py-8 px-6 flex justify-between items-center">
            <div class="text-3xl font-black text-white tracking-tighter">
                FLUID<span class="text-pink-300">FEED</span>
            </div>
            <nav class="flex items-center gap-6">
                <button @click="goToLogin" class="text-white/70 hover:text-white transition font-bold uppercase text-sm tracking-widest">Log In</button>
                <button @click="goToSignup" class="px-8 py-2.5 bg-white text-indigo-900 font-black rounded-full shadow-2xl hover:scale-105 transition active:scale-95">GET STARTED</button>
            </nav>
        </header>

        <main class="relative z-10 w-full max-w-7xl mx-auto px-6 pt-20 pb-20 text-center flex-grow flex flex-col justify-center">
            <section class="max-w-4xl mx-auto space-y-10 animate-in">
                <h1 class="text-7xl md:text-8xl font-black text-white tracking-tighter leading-none header-text-shadow">
                    DIVE INTO <br/> <span class="text-pink-300">EXPERIENCES.</span>
                </h1>
                <p class="text-xl text-white/60 max-w-2xl mx-auto leading-relaxed post-text-shadow">
                    Connect with hyper-local activities happening right now. Discover, join, and create what moves you in a fluid, real-time feed.
                </p>
                <button @click="goToSignup" class="px-12 py-5 font-black text-lg bg-pink-400 text-white rounded-full shadow-2xl hover:bg-pink-300 transition transform hover:scale-105 active:scale-95 uppercase tracking-widest">
                    Join the Movement &rarr;
                </button>
            </section>
        </main>
    </div>
</template>

<style scoped>
.page-root { background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%); }
.header-text-shadow { text-shadow: 0 10px 30px rgba(0,0,0,0.5); }
.dot-animation { position: absolute; border-radius: 50%; filter: blur(40px); animation: move-background 15s infinite alternate ease-in-out; }
@keyframes move-background {
  0% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(30px, 60px) scale(1.2); }
  100% { transform: translate(0, 0) scale(1); }
}
.ripple-effect { width: 20px; height: 20px; background: white; animation: ripple-grow 1.5s ease-out forwards; pointer-events: none; transform: translate(-50%, -50%); }
@keyframes ripple-grow { 0% { transform: translate(-50%, -50%) scale(0.1); opacity: 0.5; } 100% { transform: translate(-50%, -50%) scale(25); opacity: 0; } }
.animate-in { animation: fadeInUp 0.8s cubic-bezier(0.23, 1, 0.32, 1); }
@keyframes fadeInUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
</style>