<script setup lang="ts">
import { computed, ref, onMounted, watch, onUnmounted } from 'vue'
import { useWindowSize, useScroll, useThrottleFn } from '@vueuse/core'
import type { TimeEvent, Photo } from '~/types'
import { timelineEvents } from '~/constants/timeline'
import photosData from '~/data/photos.json'

const { width } = useWindowSize()
const { y: scrollY } = useScroll(window)

const galleryRef = ref<HTMLElement | null>(null)
const sectionRefs = ref<Map<number, HTMLElement>>(new Map())

// 添加选中的照片和弹层状态
const selectedPhoto = ref<Photo | null>(null)
const isModalOpen = ref(false)

// 使用导入的照片数据
const photos = photosData.photos as Photo[]

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

// 添加按地点分组的计算属性
const groupPhotosByLocation = (photos: Photo[]) => {
  const groups = new Map<string, Photo[]>()
  photos.forEach(photo => {
    if (!groups.has(photo.location)) {
      groups.set(photo.location, [])
    }
    groups.get(photo.location)!.push(photo)
  })
  return groups
}

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
        <!-- 时间标题 -->
        <div class="mb-6">
          <h2 class="text-xl font-medium text-warm-gray-800">
            {{ event.year }}年{{ event.season }}
          </h2>
        </div>

        <!-- 按地点分组展示照片 -->
        <div class="space-y-8">
          <template 
            v-for="[location, locationPhotos] in groupPhotosByLocation(
              groupedPhotos.get(`${event.year}-${event.season}`) || []
            )"
            :key="location"
          >
            <!-- 地点标题 -->
            <div class="flex items-center gap-2 mb-4">
              <svg class="w-5 h-5 text-warm-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <h3 class="text-lg font-medium text-warm-gray-700">{{ location }}</h3>
            </div>

            <!-- 照片网格 -->
            <div class="grid gap-4" :style="{ 
              gridTemplateColumns: `repeat(auto-fill, minmax(${gridColumns}, 1fr))`
            }">
              <div
                v-for="photo in locationPhotos"
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
              </div>
            </div>
          </template>
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