<script setup lang="ts">
import type { Photo } from '~/types'

const props = defineProps<{
  photo: Photo | null
  isOpen: boolean
}>()

const emit = defineEmits<{
  'close': []
}>()

// 按ESC键关闭弹层
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    emit('close')
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <div
        v-if="isOpen && photo"
        class="fixed inset-0 z-[100] overflow-y-auto"
        @click.self="emit('close')"
      >
        <!-- 背景遮罩 -->
        <div class="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm" />
        
        <!-- 弹层内容 -->
        <div class="flex min-h-screen items-center justify-center p-4">
          <div 
            class="relative w-full rounded-lg overflow-hidden"
            :class="[photo.story ? 'max-w-6xl bg-warm-gray-100' : 'max-w-4xl']"
          >
            <div class="flex flex-col md:flex-row">
              <!-- 图片区域 -->
              <div :class="[photo.story ? 'md:w-2/3' : 'w-full']">
                <div class="relative aspect-w-4 aspect-h-3">
                  <img
                    :src="photo.src"
                    :alt="photo.alt"
                    class="w-full h-full object-cover"
                    :class="[photo.story ? 'md:rounded-l-lg' : 'rounded-lg']"
                  />
                </div>
              </div>
              
              <!-- 故事区域 - 仅在有故事时显示 -->
              <div v-if="photo.story" class="md:w-1/3 p-6">
                <div class="mb-4">
                  <div class="flex items-center gap-2 mb-3">
                    <h3 class="text-xl font-medium text-warm-gray-800">
                      {{ photo.year }}年{{ photo.season }}
                    </h3>
                    <span class="text-warm-gray-500">·</span>
                    <span class="text-warm-gray-600">{{ photo.location }}</span>
                  </div>
                  <p class="mt-2 text-warm-gray-600 leading-relaxed">
                    {{ photo.story }}
                  </p>
                </div>
              </div>
            </div>
            
            <!-- 关闭按钮 -->
            <button
              class="absolute top-4 right-4 transition-colors duration-200 rounded-full p-1.5"
              :class="[
                photo.story 
                  ? 'text-warm-gray-400 hover:text-warm-gray-600 bg-transparent' 
                  : 'text-white hover:text-white/80 mix-blend-difference bg-white/10 backdrop-blur-sm'
              ]"
              @click="emit('close')"
            >
              <span class="sr-only">关闭</span>
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template> 