// composables/useArticleHistory.js
import { ref, onMounted } from 'vue'

const STORAGE_KEY = 'littleJapanese_articles'
const MAX_ARTICLES = 100
const AUTOSAVE_DELAY = 60 * 1000 // 1 minute

export function useArticleHistory() {
  const articles = ref([])
  const currentArticleId = ref(null)   // Tracks the active editing session
  const autoSaveTimeout = ref(null)
  const isSaving = ref(false)

  const loadArticles = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) articles.value = JSON.parse(saved)
    } catch (error) {
      console.error('Failed to load articles:', error)
      articles.value = []
    }
  }

  const saveArticles = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(articles.value))
    } catch (error) {
      console.error('Failed to save articles:', error)
    }
  }

  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
  }

  const extractTitle = (content) => {
    if (!content) return 'Untitled'
    const lines = content.split('\n').filter(line => line.trim())
    if (lines.length === 0) return 'Untitled'
    const firstLine = lines[0].trim()
    return firstLine.length > 50 ? firstLine.substring(0, 50) + '...' : firstLine
  }

  const saveCurrentArticle = (japaneseContent, englishContent) => {
    if (!japaneseContent || !japaneseContent.trim()) {
      return null
    }

    const now = Date.now()
    const title = extractTitle(japaneseContent)

    // --- CRITICAL FIX: Update in place if we have an active session ---
    if (currentArticleId.value) {
      const existing = articles.value.find(a => a.id === currentArticleId.value)
      if (existing) {
        existing.japaneseContent = japaneseContent
        existing.englishContent = englishContent || ''
        existing.title = title
        existing.timestamp = now
        saveArticles()
        return existing
      }
      // If the article was deleted in another tab, fall through to create new
      currentArticleId.value = null
    }

    // --- Create new only if no active session ---
    const article = {
      id: generateId(),
      japaneseContent: japaneseContent,
      englishContent: englishContent || '',
      title: title,
      timestamp: now,
      bookmark: null
    }

    articles.value.unshift(article)

    if (articles.value.length > MAX_ARTICLES) {
      articles.value = articles.value.slice(0, MAX_ARTICLES)
    }

    saveArticles()
    currentArticleId.value = article.id
    return article
  }

  const scheduleAutoSave = (japaneseContent, englishContent) => {
    if (autoSaveTimeout.value) clearTimeout(autoSaveTimeout.value)
    if (!japaneseContent || !japaneseContent.trim()) return

    autoSaveTimeout.value = setTimeout(() => {
      saveCurrentArticle(japaneseContent, englishContent)
      autoSaveTimeout.value = null
    }, AUTOSAVE_DELAY)
  }

  const cancelAutoSave = () => {
    if (autoSaveTimeout.value) {
      clearTimeout(autoSaveTimeout.value)
      autoSaveTimeout.value = null
    }
  }

  const deleteArticle = (articleId) => {
    articles.value = articles.value.filter(a => a.id !== articleId)
    if (currentArticleId.value === articleId) currentArticleId.value = null
    saveArticles()
  }

  const deleteAllArticles = () => {
    articles.value = []
    currentArticleId.value = null
    saveArticles()
  }

  const loadArticle = (articleId) => {
    const article = articles.value.find(a => a.id === articleId)
    if (article) {
      currentArticleId.value = articleId
      return article
    }
    return null
  }

  const isCurrentArticle = (articleId) => {
    return currentArticleId.value === articleId
  }

  const resetCurrentTracking = () => {
    currentArticleId.value = null
  }

  const setBookmark = (articleId, paragraphIndex) => {
    const article = articles.value.find(a => a.id === articleId)
    if (article) {
      article.bookmark = paragraphIndex
      saveArticles()
    }
  }

  const formatDate = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date
    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  onMounted(() => {
    loadArticles()
  })

  return {
    articles,
    currentArticleId,
    isSaving,
    saveCurrentArticle,
    scheduleAutoSave,
    cancelAutoSave,
    deleteArticle,
    deleteAllArticles,
    loadArticle,
    isCurrentArticle,
    resetCurrentTracking,
    setBookmark,
    formatDate,
    saveArticles
  }
}