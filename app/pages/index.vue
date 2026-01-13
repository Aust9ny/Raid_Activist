<script setup>
import { onMounted, onUnmounted } from "vue";
import { navigateTo } from "#app";
import { useAnimatedBackground } from "~/composables/useAnimatedBackground";

const {
  dotPositions,
  ripples,
  handleBackgroundClick,
  startAmbientGlow,
  stopAmbientGlow,
} = useAnimatedBackground();

onMounted(() => {
  document.addEventListener("click", handleBackgroundClick);
  startAmbientGlow();
});

onUnmounted(() => {
  document.removeEventListener("click", handleBackgroundClick);
  stopAmbientGlow();
});

const goToLogin = () => navigateTo("/login");
const goToSignup = () => navigateTo("/register");
</script>

<template>
  <div class="page-root min-h-screen relative overflow-hidden flex flex-col">
    <div class="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <div
        v-for="dot in dotPositions"
        :key="dot.id"
        :class="[
          'dot-animation',
          `bg-${dot.color}`,
          `w-${dot.size}`,
          `h-${dot.size}`,
        ]"
        :style="{
          ...dot.position,
          animationDelay: dot.delay + 's',
          opacity: 0.3,
        }"
      ></div>
      <div
        v-for="ripple in ripples"
        :key="ripple.id"
        class="ripple-effect absolute rounded-full mix-blend-overlay filter blur-sm z-50"
        :style="ripple.style"
      ></div>
    </div>

    <header
      class="relative z-50 w-full max-w-7xl mx-auto py-10 px-6 flex justify-between items-center"
    >
      <div class="flex items-center gap-3 group cursor-default">
        <div
          class="p-2 bg-white/10 rounded-xl backdrop-blur-md border border-white/20 group-hover:rotate-12 transition-transform"
        >
          <span class="text-2xl">🌊</span>
        </div>
        <div
          class="text-3xl font-black text-white tracking-tighter italic uppercase"
        >
          FLUID<span class="text-pink-400">FEED</span>
        </div>
      </div>

      <nav
        class="flex items-center gap-8 glass-panel p-2 px-6 border-white/10 shadow-2xl"
      >
        <button
          @click="goToLogin"
          class="text-[10px] text-white/50 hover:text-white transition font-black uppercase tracking-[0.2em]"
        >
          Access
        </button>
        <button
          @click="goToSignup"
          class="px-6 py-2 bg-white text-indigo-950 text-[10px] font-black rounded-xl shadow-xl hover:scale-105 transition active:scale-95 uppercase tracking-widest"
        >
          Initialize Identity
        </button>
      </nav>
    </header>

    <main
      class="relative z-10 w-full max-w-7xl mx-auto px-6 flex-grow flex flex-col justify-center items-center text-center"
    >
      <section class="max-w-5xl space-y-12 animate-in">
        <div
          class="inline-flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-md"
        >
          <span class="relative flex h-2 w-2">
            <span
              class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"
            ></span>
            <span
              class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"
            ></span>
          </span>
          <span
            class="text-[10px] font-black text-white/60 uppercase tracking-[0.3em]"
            >Network Live: 1,204 Nodes Active</span
          >
        </div>

        <h1
          class="text-7xl md:text-9xl font-black text-white tracking-tighter leading-[0.85] uppercase italic"
        >
          Dive into <br />
          <span
            class="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400"
            >Experiences.</span
          >
        </h1>

        <p
          class="text-lg md:text-xl text-white/40 max-w-2xl mx-auto leading-relaxed font-bold uppercase tracking-wide"
        >
          Connect with hyper-local activities in real-time. Discover, join, and
          create what moves you in a
          <span class="text-white">fluid transmission.</span>
        </p>

        <div
          class="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6"
        >
          <button
            @click="goToSignup"
            class="group relative px-12 py-5 font-black text-xs bg-pink-500 text-white rounded-2xl shadow-[0_20px_40px_rgba(236,72,153,0.3)] hover:bg-pink-400 transition transform hover:scale-105 active:scale-95 uppercase tracking-[0.3em] overflow-hidden"
          >
            <span class="relative z-10">Join the Movement</span>
            <div
              class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[scan_2s_infinite]"
            ></div>
          </button>

          <button
            @click="goToLogin"
            class="px-10 py-5 font-black text-xs bg-white/5 text-white border border-white/10 rounded-2xl hover:bg-white/10 transition uppercase tracking-[0.3em]"
          >
            View Transmission
          </button>
        </div>
      </section>

      <div
        class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32 w-full animate-in"
        style="animation-delay: 0.2s"
      >
        <div
          v-for="(feat, i) in features"
          :key="i"
          class="glass-panel p-8 text-left border-white/5 hover:border-pink-500/30 transition-all duration-500 group"
        >
          <div class="text-3xl mb-4 group-hover:scale-110 transition-transform">
            {{ feat.icon }}
          </div>
          <h3
            class="text-white font-black uppercase text-xs tracking-widest mb-2"
          >
            {{ feat.title }}
          </h3>
          <p
            class="text-white/40 text-xs leading-relaxed font-bold uppercase tracking-tighter"
          >
            {{ feat.desc }}
          </p>
        </div>
      </div>
    </main>

    <footer class="relative z-10 py-10 text-center">
      <p class="text-[9px] font-black text-white/20 uppercase tracking-[0.5em]">
        FluidFeed Protocol © 2026 // v2.0.4
      </p>
    </footer>
  </div>
</template>

<script>
export default {
  data() {
    return {
      features: [
        {
          icon: "🛰️",
          title: "Real-Time Sync",
          desc: "Every activity is broadcast instantly across the local network.",
        },
        {
          icon: "🎲",
          title: "Fair Raffles",
          desc: "Proprietary draw algorithm ensures total transparency for prizes.",
        },
        {
          icon: "💬",
          title: "Fluid Chat",
          desc: "Connect with attendees in a seamless conversation stream.",
        },
      ],
    };
  },
};
</script>

<style scoped>
.page-root {
  background: radial-gradient(
    circle at center,
    #312e81 0%,
    #1e1b4b 70%,
    #020617 100%
  );
}

.glass-panel {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1.5rem;
}

.dot-animation {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  animation: move-background 20s infinite alternate ease-in-out;
}

@keyframes move-background {
  0% {
    transform: translate(0, 0) scale(1);
  }
  100% {
    transform: translate(100px, 100px) scale(1.3);
  }
}

@keyframes scan {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(200%);
  }
}

.animate-in {
  animation: fadeInUp 1.2s cubic-bezier(0.22, 1, 0.36, 1) backwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(60px);
    filter: blur(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }
}
</style>
