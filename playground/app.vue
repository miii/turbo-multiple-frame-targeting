<script lang="ts" setup>
import { enable, disable } from '@miii/turbo-multiple-frame-targeting'

// Use latest version of Turbo from CDN
declare const Turbo: typeof import('@hotwired/turbo')
if (process.client)
  Turbo.start()

// Enable module
const enabled = ref(false)
watch(enabled, value => value ? enable() : disable())

if (process.client)
  // @ts-ignore
  window.$module = { enable, disable }

// Create random hash
const randomHash = () => (Math.random() + 1).toString(36).substring(7, 12).toUpperCase()

// Create random state
const valueStatic = useState('v1', randomHash)
const valueDynamic = useState('v2', randomHash)
const valueForm = useState('v3', randomHash)
</script>

<template>
  <div>
    <input type="checkbox" v-model="enabled" data-testid="checkbox" /> Enable module

    <div class="container">
      <span>Static:</span>
      <turbo-frame id="static-frame">
        <span data-testid="static-value" v-text="valueStatic" />
      </turbo-frame>
    </div>
    <div class="container">
      <span>Dynamic:</span>
      <turbo-frame id="dynamic-frame">
        <span data-testid="dynamic-value" v-text="valueDynamic" />
      </turbo-frame>
    </div>
    <turbo-frame id="form-frame" class="container">
      <span>Form:</span>
      <span data-testid="form-value" v-text="valueForm" />

      <div class="form-content">
        <a
          :href="$route.path"
          data-turbo-frame="form-frame dynamic-frame"
          data-testid="link"
        >Visit link</a>
        
        <form
          data-turbo-frame="form-frame dynamic-frame"
          data-testid="form"
        >
          <button type="submit">Submit form</button>
        </form>
      </div>
    </turbo-frame>
  </div>
</template>

<style>
turbo-frame {
  display: block;
}

span {
  font-family: monospace;
}

.container {
  display: grid;
  grid-template-columns: 100px 1fr;
  width: min-content;
}

.container > *:nth-child(odd) {
  padding-right: 1em;
}

.form-content {
  grid-column: 1 / 3;
  white-space: nowrap;
  margin-top: 10px;
}
</style>