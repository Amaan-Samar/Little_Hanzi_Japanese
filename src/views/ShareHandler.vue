<template>
  <div class="share-handler">
    <div v-if="!autoChosen" class="share-picker">
      <p class="share-prompt">Where should this text go?</p>
      <div class="share-buttons">
        <button class="share-btn jp" @click="choose('japanese')">
          日本語 — Japanese field
        </button>
        <button class="share-btn en" @click="choose('english')">
          English — English field
        </button>
      </div>
    </div>
    <p v-else class="share-loading">Loading…</p>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const autoChosen = ref(false)
let payload = ''

onMounted(() => {
  const params = new URLSearchParams(window.location.search)
  const text = params.get('text') || ''
  const title = params.get('title') || ''
  const url = params.get('url') || ''
  payload = text || [title, url].filter(Boolean).join('\n\n')

  if (!payload) {
    router.replace('/')
    return
  }

  // Count Japanese characters vs Latin letters
  const kanaKanji =
    (payload.match(/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/g) || []).length
  const latin = (payload.match(/[A-Za-z]/g) || []).length

  // High confidence: 3× dominance AND at least 10 chars of winning script
  const japaneseDominant = kanaKanji >= latin * 3 && kanaKanji >= 10
  const englishDominant = latin >= kanaKanji * 3 && latin >= 10

  if (japaneseDominant || englishDominant) {
    autoChosen.value = true
    choose(japaneseDominant ? 'japanese' : 'english')
  }
  // else: picker stays visible, user chooses
})

const choose = (target) => {
  sessionStorage.setItem('pendingShareText', payload)
  sessionStorage.setItem('pendingShareTarget', target)
  router.replace('/')
}
</script>

<style scoped>
.share-handler {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 24px;
  font-family: system-ui, sans-serif;
  background: #f8fafc;
}
.share-loading {
  color: #94a3b8;
  font-size: 14px;
}
.share-picker {
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  max-width: 380px;
  width: 100%;
}
.share-prompt {
  font-size: 14px;
  font-weight: 600;
  color: #334155;
  margin: 0 0 16px;
}
.share-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.share-btn {
  padding: 14px 20px;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: #f8fafc;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  color: #334155;
}
.share-btn:hover { transform: translateY(-1px); }
.share-btn.jp:hover { background: #fdf2f8; border-color: #fbcfe8; color: #ec4899; }
.share-btn.en:hover { background: #eff6ff; border-color: #bfdbfe; color: #3b82f6; }
</style>