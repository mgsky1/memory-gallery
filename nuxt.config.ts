export default defineNuxtConfig({
  modules: ['@nuxtjs/tailwindcss', '@vueuse/nuxt'],
  css: ['~/assets/css/tailwind.css'],
  tailwindcss: {
    cssPath: '~/assets/css/tailwind.css',
    configPath: 'tailwind.config.ts',
    exposeConfig: false,
    injectPosition: 0,
    viewer: true,
  },
  // 确保生产构建时资源路径正确
   app: {
    baseURL: '/memory-gallery',
    buildAssetsDir: 'nuxt/', // 默认值
    cdnURL: '' // 如果需要CDN可以在这里配置
  },
  
  // 确保正确的构建输出
  nitro: {
    output: {
      publicDir: 'dist'
    }
  }
}) 
