<script setup lang="ts">
import { computed, ref, onMounted, watch, onUnmounted } from 'vue'
import { useWindowSize, useScroll, useThrottleFn } from '@vueuse/core'
import type { TimeEvent, Photo } from '~/types'
import { timelineEvents } from '~/constants/timeline'

const { width } = useWindowSize()
const { y: scrollY } = useScroll(window)

const galleryRef = ref<HTMLElement | null>(null)
const sectionRefs = ref<Map<number, HTMLElement>>(new Map())

// 添加选中的照片和弹层状态
const selectedPhoto = ref<Photo | null>(null)
const isModalOpen = ref(false)

const photos: Photo[] = [
  { 
    id: 1, 
    src: 'https://picsum.photos/seed/spring2024/800/600', 
    year: 2024, 
    season: '春', 
    alt: '2024年春季风景 - 春暖花开',
    story: '那天阳光正好，樱花盛开。漫步在林间小道，一切都充满了生机。' 
  },
  { 
    id: 2, 
    src: 'https://picsum.photos/seed/summer2024/800/600', 
    year: 2024, 
    season: '夏', 
    alt: '2024年夏季风景 - 夏日海滩' 
  },
  { 
    id: 3, 
    src: 'https://picsum.photos/seed/autumn2024/800/600', 
    year: 2024, 
    season: '秋', 
    alt: '2024年秋季风景 - 秋色宜人' 
  },
  { 
    id: 4, 
    src: 'https://picsum.photos/seed/winter2024/800/600', 
    year: 2024, 
    season: '冬', 
    alt: '2024年冬季风景 - 冬雪纷飞' 
  }
]

const props = defineProps<{
  selectedEvent: TimeEvent | null
}>()

const emit = defineEmits<{
  'updateSelectedEvent': [event: TimeEvent]
}>()

const gridColumns = computed(() => {
  if (width.value > 1100) return '33%'
  if (width.value > 700) return '50%'
  return '100%'
})

const filteredPhotos = computed(() => 
  props.selectedEvent
    ? photos.filter(photo => 
        photo.year === props.selectedEvent?.year && 
        photo.season === props.selectedEvent?.season
      )
    : photos
)

// 添加打开弹层的方法
const openPhotoDetail = (photo: Photo) => {
  selectedPhoto.value = photo
  isModalOpen.value = true
}

// 添加关闭弹层的方法
const closePhotoDetail = () => {
  selectedPhoto.value = null
  isModalOpen.value = false
}

// 按时间分组照片
const groupedPhotos = computed(() => {
  const groups = new Map<string, Photo[]>()
  
  timelineEvents.forEach(event => {
    const key = `${event.year}-${event.season}`
    groups.set(key, photos.filter(photo => 
      photo.year === event.year && photo.season === event.season
    ))
  })
  
  return groups
})

// 监听滚动，更新选中的时间节点
const updateSelectedEventOnScroll = () => {
  if (!galleryRef.value) return
  
  const sections = Array.from(sectionRefs.value.entries())
  if (sections.length === 0) return

  // 获取视口高度的 1/3 位置
  const triggerPosition = window.innerHeight / 3
  
  // 找到当前在触发位置的区域
  let currentSection: [number, HTMLElement] = sections[0]
  for (const section of sections) {
    const rect = section[1].getBoundingClientRect()
    if (rect.top <= triggerPosition) {
      currentSection = section
    } else {
      break
    }
  }

  // 更新选中状态
  const event = timelineEvents.find(e => e.id === currentSection[0])
  if (event && (!props.selectedEvent || props.selectedEvent.id !== event.id)) {
    emit('updateSelectedEvent', event)
  }
}

// 使用 useThrottleFn 来节流滚动事件处理
const throttledUpdateSelectedEvent = useThrottleFn(updateSelectedEventOnScroll, 100)

// 监听滚动
watch(scrollY, () => {
  throttledUpdateSelectedEvent()
})

// 初始化：选中第一个时间节点
onMounted(() => {
  if (timelineEvents.length > 0 && !props.selectedEvent) {
    emit('updateSelectedEvent', timelineEvents[0])
  }
  // 开始监听滚动
  throttledUpdateSelectedEvent()
})

onUnmounted(() => {
  // 停止滚动监听
  throttledUpdateSelectedEvent.stop()
})
</script>

<template>
  <div ref="galleryRef" class="space-y-12">
    <template v-for="event in timelineEvents" :key="`section-${event.id}`">
      <section 
        v-if="groupedPhotos.get(`${event.year}-${event.season}`)?.length"
        :ref="el => sectionRefs.set(event.id, el as HTMLElement)"
        :data-section-id="event.id"
        :class="event.id === 1 ? 'relative pt-20' : 'relative'"
      >
        <!-- 时间标题 - 移除了分割线，保留标题 -->
        <div class="mb-6">
          <h2 class="text-xl font-medium text-warm-gray-800">
            {{ event.year }}年{{ event.season }}
          </h2>
        </div>

        <!-- 照片网格 -->
        <div class="grid gap-4" :style="{ 
          gridTemplateColumns: `repeat(auto-fill, minmax(${gridColumns}, 1fr))`
        }">
          <div
            v-for="photo in groupedPhotos.get(`${event.year}-${event.season}`)"
            :key="photo.id"
            class="bg-white rounded-lg shadow-md overflow-hidden mb-4 transition-all duration-300 hover:shadow-xl cursor-pointer"
            @click="openPhotoDetail(photo)"
          >
            <div class="aspect-w-4 aspect-h-3 relative">
              <img
                :src="photo.src"
                :alt="photo.alt"
                class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </div>
            <div class="p-4">
              <p class="text-sm text-warm-gray-600">{{ photo.year }}年{{ photo.season }}</p>
            </div>
          </div>
        </div>
      </section>
    </template>

    <!-- 图片详情弹层 -->
    <PhotoModal
      :photo="selectedPhoto"
      :is-open="isModalOpen"
      @close="closePhotoDetail"
    />
  </div>
</template>

<style scoped>
.aspect-w-4 {
  position: relative;
  padding-bottom: 75%; /* 4:3 aspect ratio */
}

.aspect-w-4 > img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style> 