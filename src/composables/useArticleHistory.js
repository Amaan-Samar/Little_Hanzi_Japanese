// composables/useArticleHistory.js
import { ref, onMounted } from 'vue'

const STORAGE_KEY = 'littleGreek_articles'
const MAX_ARTICLES = 100
const AUTOSAVE_DELAY = 60 * 1000 // 1 minute

export function useArticleHistory() {
  const articles = ref([])
  const currentArticleId = ref(null)   // "active editing session" id
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

  /**
   * Save the current editing session.
   *
   * Behavior:
   *  - If currentArticleId is set, UPDATE that article in place (this is the
   *    "same session" case: edit, manual save, auto-save — all keep the same
   *    article, even if the content changes drastically).
   *  - If currentArticleId is null, CREATE a new article and set
   *    currentArticleId so subsequent saves target it.
   *
   * The session is only ended by resetCurrentTracking() — which is called by
   * the "Clear All Text" action in GreekConverter.vue.
   */
  const saveCurrentArticle = (greekContent, englishContent) => {
    if (!greekContent || !greekContent.trim()) {
      return null
    }

    const now = Date.now()
    const title = extractTitle(greekContent)

    // --- Case 1: existing session — update in place, keep same id ---
    if (currentArticleId.value) {
      const existing = articles.value.find(a => a.id === currentArticleId.value)
      if (existing) {
        existing.greekContent = greekContent
        existing.englishContent = englishContent || ''
        existing.title = title
        existing.timestamp = now
        saveArticles()
        return existing
      }
      // If the tracked article was deleted, fall through to create new one
      currentArticleId.value = null
    }

    // --- Case 2: no active session — create a new article ---
    const article = {
      id: generateId(),
      greekContent: greekContent,
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

  const scheduleAutoSave = (greekContent, englishContent) => {
    if (autoSaveTimeout.value) clearTimeout(autoSaveTimeout.value)

    if (!greekContent || !greekContent.trim()) return

    autoSaveTimeout.value = setTimeout(() => {
      saveCurrentArticle(greekContent, englishContent)
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

  /**
   * Load an article from history into the editor.
   * Sets currentArticleId so that subsequent edits / saves UPDATE it
   * instead of creating a new article. This is the key behavior the user
   * wants: opening from history and editing should not fork a new article.
   */
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

  /**
   * End the current editing session.
   * Call this ONLY when the user explicitly finishes the article (e.g.,
   * "Clear All Text"). After this, the next save creates a brand-new article.
   */
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

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
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