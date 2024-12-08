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
          <div class="relative w-full max-w-6xl rounded-lg bg-warm-gray-100 shadow-xl">
            <div class="flex flex-col md:flex-row">
              <!-- 图片区域 -->
              <div class="md:w-2/3">
                <div class="relative aspect-w-4 aspect-h-3">
                  <img
                    :src="photo.src"
                    :alt="photo.alt"
                    class="rounded-t-lg md:rounded-l-lg md:rounded-tr-none object-cover"
                  />
                </div>
              </div>
              
              <!-- 故事区域 -->
              <div class="md:w-1/3 p-6">
                <div class="mb-4">
                  <h3 class="text-xl font-medium text-warm-gray-800">
                    {{ photo.year }}年{{ photo.season }}
                  </h3>
                  <p class="mt-2 text-warm-gray-600">
                    {{ photo.story || '这张照片还没有故事...' }}
                  </p>
                </div>
                
                <!-- 关闭按钮 -->
                <button
                  class="absolute top-4 right-4 text-warm-gray-400 hover:text-warm-gray-600 transition-colors duration-200"
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
        </div>
      </div>
    </Transition>
  </Teleport>
</template> 