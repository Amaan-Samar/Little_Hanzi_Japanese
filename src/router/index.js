import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'converter',
      component: () => import('../components/JapaneseConverter.vue'),
    },
    {
      path: '/share-handler',
      name: 'ShareHandler',
      component: () => import('../views/ShareHandler.vue'),
    },
  ],
})

// Recover from stale chunks after a new deploy
router.onError((err, to) => {
  const isChunkError = /Failed to fetch dynamically imported module|Importing a module script failed/i.test(err.message)
  if (!isChunkError) return

  // Guard against an infinite reload loop if the file is truly missing
  const key = 'chunkReloadAt'
  const last = Number(sessionStorage.getItem(key) || 0)
  if (Date.now() - last < 10000) return

  sessionStorage.setItem(key, String(Date.now()))
  window.location.assign(router.resolve(to.fullPath).href)
})

export default router