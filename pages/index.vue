<script setup lang="ts">
import { ref } from 'vue'
import type { TimeEvent } from '~/types'

const selectedEvent = ref<TimeEvent | null>(null)

const handleSelectEvent = (event: TimeEvent) => {
  selectedEvent.value = event
  // 滚动到对应区域，添加偏移量以适应固定导航栏
  const sectionEl = document.querySelector(`[data-section-id="${event.id}"]`)
  if (sectionEl) {
    const offset = 100 // 与上面的偏移量保持一致
    const targetPosition = sectionEl.getBoundingClientRect().top + window.scrollY - offset
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    })
  }
}

const handleUpdateSelectedEvent = (event: TimeEvent) => {
  selectedEvent.value = event
}

</script>

<template>
  <div class="min-h-screen bg-warm-gray-100">
    <nav class="fixed top-0 left-0 right-0 z-10 backdrop-blur-md bg-warm-gray-100/75 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center h-20">
          <h1 
            class="text-2xl font-serif text-warm-gray-800 whitespace-nowrap transition-colors duration-300 hover:text-warm-gray-600 mr-8">
            小猫咪の树洞
          </h1>
          <div class="grow pt-6 pb-3">
            <Timeline
              :selected-event="selectedEvent"
              @select="handleSelectEvent"
            />
          </div>
        </div>
      </div>
    </nav>

    <main class="pt-24 p-4 sm:p-6">
      <div class="max-w-7xl mx-auto">
        <PhotoGallery 
          :selected-event="selectedEvent"
          @update-selected-event="handleUpdateSelectedEvent"
        />
      </div>
    </main>
  </div>
</template>

<style>
/* 添加平滑滚动效果 */
html {
  scroll-behavior: smooth;
}

/* 确保毛玻璃效果在 Safari 上也能正常工作 */
@supports (-webkit-backdrop-filter: none) {
  .backdrop-blur-md {
    -webkit-backdrop-filter: blur(12px);
  }
}
</style> 