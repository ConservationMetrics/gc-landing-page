<template>
    <div 
      v-if="showIndicator"
      class="fixed bottom-4 right-4 bg-black/80 backdrop-blur-sm rounded-lg p-3 text-xs text-white z-50 space-y-1"
    >
      <div class="flex items-center space-x-2">
        <div 
          :class="[
            'size-2 rounded-full',
            fps >= 50 ? 'bg-green-500' : fps >= 30 ? 'bg-yellow-500' : 'bg-red-500'
          ]"
        ></div>
        <span>{{ fps }} FPS</span>
      </div>
      
      <div class="flex items-center space-x-2">
        <div 
          :class="[
            'w-2 h-2 rounded-full',
            memory < 50 ? 'bg-green-500' : memory < 100 ? 'bg-yellow-500' : 'bg-red-500'
          ]"
        ></div>
        <span>{{ memory }}MB</span>
      </div>
      
      <div class="flex items-center space-x-2">
        <div 
          :class="[
            'w-2 h-2 rounded-full',
            networkStatus === 'online' ? 'bg-green-500' : 'bg-red-500'
          ]"
        ></div>
        <span class="capitalize">{{ networkStatus }}</span>
      </div>
      
      <button 
        @click="$emit('toggle')"
        class="text-gray-400 hover:text-white text-xs"
      >
        {{ showIndicator ? 'Hide' : 'Show' }}
      </button>
    </div>
  </template>
  
  <script setup>
  import { usePerformance } from '../composables/usePerformance';
  
  defineProps({
    showIndicator: {
      type: Boolean,
      default: false
    }
  })
  
  const { fps, memory, networkStatus } = usePerformance()
  
  defineEmits(['toggle'])
  </script>
  