import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'converter',
      component: () => import('../components/JapaneseConverter.vue'), // Removed /index.js
    },
    {
      path: '/share-handler',
      name: 'ShareHandler',
      component: () => import('../views/ShareHandler.vue'),
    },

  ],
})

export default router