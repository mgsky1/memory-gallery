<script setup lang="ts">
import type { TimeEvent } from '~/types'
import { ref, watch } from 'vue'
import { timelineEvents } from '~/constants/timeline'

const props = defineProps<{
  selectedEvent: TimeEvent | null
}>()

const emit = defineEmits<{
  'select': [event: TimeEvent]
}>()

const flyingPlane = ref({
  fromId: 0,
  toId: 0,
  isFlying: false,
})

const localSelectedEvent = ref(props.selectedEvent)

watch(() => props.selectedEvent, (newVal: TimeEvent | null) => {
  localSelectedEvent.value = newVal
})

const handleSelect = (event: TimeEvent) => {
  if (localSelectedEvent.value && localSelectedEvent.value.id !== event.id) {
    // 先更新本地状态
    localSelectedEvent.value = event
    
    // 先触发选中事件，让页面滚动
    emit('select', event)
    
    // 获取目标区域元素
    const targetSection = document.querySelector(`[data-section-id="${event.id}"]`)
    if (!targetSection) return

    // 计算滚动目标位置
    const targetRect = targetSection.getBoundingClientRect()
    const targetPosition = window.scrollY + targetRect.top - 100 // 100px 的偏移量

    // 监听滚动完成
    const checkScrollEnd = () => {
      const currentPosition = window.scrollY
      // 如果已经滚动到目标位置附近（允许 50px 的误差）
      if (Math.abs(currentPosition - targetPosition) < 50) {
        // 触发飞机动画
        flyingPlane.value = {
          fromId: localSelectedEvent.value!.id,
          toId: event.id,
          isFlying: true,
        }
        // 移除滚动监听
        window.removeEventListener('scroll', checkScrollEnd)
      }
    }

    // 添加滚动监听
    window.addEventListener('scroll', checkScrollEnd)
    // 5秒后自动移除监听（以防滚动没有完成）
    setTimeout(() => {
      window.removeEventListener('scroll', checkScrollEnd)
    }, 5000)
  } else {
    localSelectedEvent.value = event
    emit('select', event)
  }
}

const handleFlyingFinish = () => {
  flyingPlane.value.isFlying = false
}
</script>

<template>
  <div class="w-full relative">
    <div class="relative h-32 pt-4">
      <div class="flex justify-between relative overflow-x-auto px-4 max-w-2xl mx-auto h-16">
        <div class="absolute left-4 right-4 top-1/2 h-0 border-t-2 border-dashed border-warm-gray-300/50" />
        
        <div
          v-for="event in timelineEvents"
          :key="event.id"
          class="relative flex flex-col items-center flex-shrink-0 group mx-6"
        >
          <div 
            class="absolute top-1/2 -translate-y-1/2 z-10 bg-warm-gray-100/75 rounded-full p-0.5"
            :data-node-id="event.id"
          >
            <button
              class="transition-allease-in-out focus:outline-none rounded-full"
              :class="[
                localSelectedEvent?.id === event.id
                  ? 'w-5 h-5 bg-warm-gray-600 ring-1 ring-warm-gray-400 ring-offset-1 ring-offset-warm-gray-100 scale-110'
                  : 'w-5 h-5 bg-white border border-warm-gray-400 hover:border-warm-gray-600 hover:scale-105'
              ]"
              @click="handleSelect(event)"
            />
          </div>
          
          <h3 
            class="text-sm font-medium transition-colors duration-300 whitespace-nowrap absolute top-12 left-1/2 -translate-x-1/2"
            :class="[
              localSelectedEvent?.id === event.id
                ? 'text-warm-gray-800 font-bold'
                : 'text-warm-gray-600'
            ]"
          >
            {{ event.year }}年{{ event.season }}
          </h3>
        </div>
      </div>
    </div>

    <FlyingPlane
      v-if="flyingPlane.isFlying"
      :from-id="flyingPlane.fromId"
      :to-id="flyingPlane.toId"
      :is-flying="flyingPlane.isFlying"
      @finish="handleFlyingFinish"
    />
  </div>
</template>

<style scoped>
.overflow-x-auto {
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.overflow-x-auto::-webkit-scrollbar {
  display: none;
}
</style> 