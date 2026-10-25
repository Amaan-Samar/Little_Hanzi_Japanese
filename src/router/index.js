import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'converter',
      component: () => import('../components/JapaneseConverter.vue'), // Removed /index.js
    },

  ],
})

export default router