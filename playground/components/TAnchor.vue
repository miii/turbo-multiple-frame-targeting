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
  <a :href="$route.path" :data-turbo-frame="target">
    &lt;a{{ props }}&gt;
  </a>
</template>