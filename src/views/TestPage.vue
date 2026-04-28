<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const apiMessage = ref('Connecting to chef (Laravel)...')

onMounted(async () => {
  try {
    // Note: Use the full URL for now to be safe
    const response = await axios.get('http://127.0.0.1:8000/api/test')
    apiMessage.value = response.data.message
  } catch (error) {
    apiMessage.value = 'Chef is busy! (Check CORS or Laravel Server)'
  }
})
</script>

<template>
  <div style="padding: 20px; text-align: center;">
    <h1>Internal Connection Test</h1>
    <p>Status: <strong>{{ apiMessage }}</strong></p>
    <router-link to="/">Go back Home</router-link>
  </div>
</template>