<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  fromId: number
  toId: number
  isFlying: boolean
}>()

const emit = defineEmits<{
  'finish': []
}>()

const planeStyle = ref({
  left: '0px',
  top: '0px',
  transform: 'rotate(0deg)',
  opacity: 0,
})

const calculatePath = (fromId: number, toId: number) => {
  const fromEl = document.querySelector(`[data-node-id="${fromId}"]`)
  const toEl = document.querySelector(`[data-node-id="${toId}"]`)
  
  if (!fromEl || !toEl) return null
  
  const fromRect = fromEl.getBoundingClientRect()
  const toRect = toEl.getBoundingClientRect()
  
  // 计算虚线的 y 坐标（固定在节点中心）
  const lineY = fromRect.top + (fromRect.height / 2)
  
  return {
    start: {
      x: fromRect.left + fromRect.width / 2,
      y: lineY
    },
    end: {
      x: toRect.left + toRect.width / 2,
      y: lineY
    },
  }
}

watch(() => props.isFlying, async (isFlying) => {
  if (!isFlying) return
  
  const path = calculatePath(props.fromId, props.toId)
  if (!path) return
  
  // 计算飞行方向
  const isFlowingRight = path.end.x > path.start.x
  const angle = isFlowingRight ? 0 : 180
  
  // 设置初始位置
  planeStyle.value = {
    left: `${path.start.x}px`,
    top: `${path.start.y}px`,
    transform: `translate(-50%, -50%) rotate(${angle}deg) scale(1)`,
    opacity: 0,
  }
  
  // 等待下一帧以确保初始位置已应用
  await new Promise(resolve => requestAnimationFrame(resolve))
  
  // 淡入
  planeStyle.value = {
    ...planeStyle.value,
    opacity: 1,
  }
  
  await new Promise(resolve => setTimeout(resolve, 100))
  
  // 飞向目标位置
  planeStyle.value = {
    left: `${path.end.x}px`,
    top: `${path.end.y}px`,
    transform: `translate(-50%, -50%) rotate(${angle}deg) scale(1)`,
    opacity: 1,
  }
  
  // 动画结束后淡出
  setTimeout(() => {
    planeStyle.value = {
      ...planeStyle.value,
      opacity: 0,
      transform: `translate(-50%, -50%) rotate(${angle}deg) scale(0.8)`,
    }
    setTimeout(() => emit('finish'), 300)
  }, 500)
})
</script>

<template>
  <div 
    class="fixed pointer-events-none z-50"
    :style="{
      left: planeStyle.left,
      top: planeStyle.top,
      transform: planeStyle.transform,
      opacity: planeStyle.opacity,
      transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
    }"
  >
    <span class="text-base">✈️</span>
  </div>
</template>