<script lang="ts" setup>
const { target } = defineProps({
  target: {
    type: String,
    required: false,
  },
})

const props = computed(() => target ? ` data-turbo-frame="${target}"` : '')
</script>

<template>
  <form :data-turbo-frame="target">
    <button type="submit">&lt;form{{ props }}&gt;</button>
  </form>
</template>