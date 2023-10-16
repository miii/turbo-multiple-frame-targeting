<script lang="ts" setup>
import { enable, disable } from '@miii/turbo-multiple-frame-targeting'

// Use latest version of Turbo from CDN
declare const Turbo: typeof import('@hotwired/turbo')
if (process.client)
  Turbo.start()

// Enable module
const enabled = ref(true)
watch(enabled, value => value ? enable() : disable())

if (process.client && enabled.value)
  enable()

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
    <br>
    <br>

    <div class="container">
      <span>Static frame:</span>
      <turbo-frame id="frame-static">
        <span data-testid="frame-static" v-text="valueStatic" />
      </turbo-frame>
    </div>

    <br>
    
    <div class="container">
      <span>Frame 1:</span>
      <turbo-frame id="frame-1">
        <span data-testid="frame-1" v-text="valueDynamic" />
      </turbo-frame>
    </div>

    <div class="container">
      <span>Frame 2:</span>
      <turbo-frame id="frame-2" class="container">
        <span data-testid="frame-2" v-text="valueForm" />
      </turbo-frame>
    </div>

    <div class="triggers">
      <TAnchor target="frame-1" data-testid="a-single" />
      <TAnchor target="frame-1 frame-2" data-testid="a-multiple" />
      <TFormButton target="frame-1" data-testid="form-single" />
      <TFormButton target="frame-1 frame-2" data-testid="form-multiple" />
    </div>

    <br>
    <br>

    <turbo-frame id="frame-parent">
      <div class="container">
        <span>Shared &lt;turbo-frame&gt;</span>
        <span data-testid="frame-parent" v-text="valueForm" />
      </div>

      <div class="triggers">
        <TAnchor data-testid="a-scoped-none" />
        <TAnchor target="_self" data-testid="a-scoped-self" />
        <TAnchor target="_self frame-2" data-testid="a-scoped-multiple" />
        <TFormButton data-testid="form-scoped-none" />
        <TFormButton target="_self" data-testid="form-scoped-self" />
        <TFormButton target="_self frame-2" data-testid="form-scoped-multiple" />
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
  grid-template-columns: 200px 1fr;
  width: min-content;
}

.container > *:nth-child(odd) {
  padding-right: 1em;
}

.triggers {
  grid-column: 1 / 3;
  white-space: nowrap;
  margin-top: 10px;
  display: grid;
  gap: 5px;
  font-family: monospace;
}
</style>