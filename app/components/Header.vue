<script setup>
defineProps({
    titleText: {
        type: String,
        default: "Default Header Title"
    }
})
</script>

<template>
    <div class="header-container bg-blue-350">
        <h1>{{ titleText }}</h1>
    </div>
</template>