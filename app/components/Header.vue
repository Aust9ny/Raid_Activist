<script>
    defineProps({
        titleText: {
            type: String,
            default: "Default Header Title"
        }
        
    })
const title = ref("")



</script>

<template>
    <div class = "header-container bg-blue-350">
        <h1>{{ title }}</h1>
    </div>
</template>