<template>
  <div class="converter-wrapper">
    <div class="app-header">
      <div class="logo-section">
        <h1 class="logo">LittleHanzi Ἑλληνικά</h1>
      </div>
      <div class="header-buttons">
        <button class="save-icon-btn" @click="handleManualSave" title="Save Article" :disabled="!greekText.trim() || isSaving">
          <Save :size="20" />
          <span v-if="isSaving" class="save-spinner"></span>
        </button>
        <button class="history-icon-btn" @click="openHistoryModal" title="Reading History">
          <BookOpen :size="22" />
        </button>
        <button class="settings-icon-btn" @click="openSettingsModal" title="Settings">
          <Settings :size="24" />
        </button>
        <button class="info-icon-btn" @click="openInfoModal" title="Information">
          <Info :size="22" />
        </button>
      </div>
    </div>

    <ArticleHistoryModal
      :isOpen="isHistoryModalOpen"
      :articles="articles"
      :isCurrentArticle="isCurrentArticle"
      :formatDate="formatDate"
      @close="closeHistoryModal"
      @load-article="loadArticleIntoEditor"
      @delete-article="handleDeleteArticle"
      @delete-all="handleDeleteAllArticles"
    />

    <InfoModal :isOpen="isInfoModalOpen" @close="closeInfoModal" />

    <div class="main-content">
      <LoadingSpinner :isLoading="isLoading" :text="loadingText" />

      <div v-if="showSaveToast" class="toast toast-success animate-slideDown">
        <span>✅ Article saved successfully!</span>
      </div>

      <div class="input-display-row">
        <div class="text-section" :style="{fontFamily: getFontFamily, fontSize: `${fontSize}px` }">
          <div class="input-wrapper">
            <textarea v-model="greekText" placeholder="Enter Greek text here..." class="text-input w-full"></textarea>
            <button v-if="greekText.trim()" @click="openEditModal('greek')" class="edit-btn" title="Edit in popup">
              <EditIcon :size="16" />
            </button>
          </div>
          <button @click="clearOrPasteText('greek')" class="action-btn">
            {{ greekText.trim() ? 'Clear' : 'Paste' }}
          </button>
        </div>

        <div class="text-section" :style="{fontSize: `${fontSize}px` }">
          <div class="input-wrapper">
            <textarea v-model="englishText" placeholder="Enter English translation here..." class="text-input w-full english-input"></textarea>
            <button v-if="englishText.trim()" @click="openEditModal('english')" class="edit-btn" title="Edit in popup">
              <EditIcon :size="16" />
            </button>
          </div>
          <button @click="clearOrPasteText('english')" class="action-btn">
            {{ englishText.trim() ? 'Clear' : 'Paste' }}
          </button>
        </div>
      </div>

      <EditModal
        :isOpen="isEditModalOpen"
        :title="editModalTitle"
        :content="editModalContent"
        :fontSize="Number(fontSize)"
        :fontFamily="getFontFamily"
        @close="closeEditModal"
        @save="saveEditModalContent"
      />

      <SettingsModal
        :isOpen="isSettingsModalOpen"
        :settings="settings"
        @close="closeSettingsModal"
        @save="saveSettings"
        @reset="resetToDefaults"
      />

      <div v-if="greekText.trim() && (showEnglish || showGreek)" class="comparison-section">
        <div class="comparison-display relative">
          <div v-for="(block, sentenceId) in comparisonData" :key="sentenceId"
               class="comparison-block relative"
               :data-paragraph-index="sentenceId">

            <template v-if="displayOrder === 'en-gr'">
              <div v-if="showEnglish && englishSegments[sentenceId]" class="english-translation-box">
                <div class="english-text" :style="{ fontSize: `${englishFontSize}px`, lineHeight: '1.6' }">
                  {{ englishSegments[sentenceId] }}
                </div>
              </div>

              <div v-if="showGreek" class="line-container" :style="{ fontFamily: getFontFamily }">
                <button class="bookmark-btn" @click.stop="toggleBookmark(sentenceId)" title="Bookmark this paragraph">
                  <Bookmark :size="14" :fill="currentBookmark === sentenceId ? 'currentColor' : 'none'" />
                </button>
                <div class="text-line relative">
                  <div class="line-words" :style="{ fontSize: `${fontSize}px` }">
                    <span v-for="(wordData, wordIndex) in block.words" :key="wordIndex" class="word-group">
                      <span class="word-with-romanization">
                        <span class="romanization-above" :style="{ display: showRomanization ? 'flex' : 'none' }">
                          <span class="romanization-char" :style="{ fontSize: `${romanizationFontSize}px` }">
                            {{ wordData.romanized }}
                          </span>
                        </span>
                        <span class="word">
                          <span v-for="(char, charIndex) in wordData.greekChars" :key="charIndex" class="greek-char">
                            {{ char }}
                          </span>
                        </span>
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </template>

            <template v-else>
              <div v-if="showGreek" class="line-container" :style="{ fontFamily: getFontFamily }">
                <button class="bookmark-btn" @click.stop="toggleBookmark(sentenceId)" title="Bookmark this paragraph">
                  <Bookmark :size="14" :fill="currentBookmark === sentenceId ? 'currentColor' : 'none'" />
                </button>
                <div class="text-line relative">
                  <div class="line-words" :style="{ fontSize: `${fontSize}px` }">
                    <span v-for="(wordData, wordIndex) in block.words" :key="wordIndex" class="word-group">
                      <span class="word-with-romanization">
                        <span class="romanization-above" :style="{ display: showRomanization ? 'flex' : 'none' }">
                          <span class="romanization-char" :style="{ fontSize: `${romanizationFontSize}px` }">
                            {{ wordData.romanized }}
                          </span>
                        </span>
                        <span class="word">
                          <span v-for="(char, charIndex) in wordData.greekChars" :key="charIndex" class="greek-char">
                            {{ char }}
                          </span>
                        </span>
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              <div v-if="showEnglish && englishSegments[sentenceId]" class="english-translation-box">
                <div class="english-text" :style="{ fontSize: `${englishFontSize}px`, lineHeight: '1.6' }">
                  {{ englishSegments[sentenceId] }}
                </div>
              </div>
            </template>
          </div>

          <div v-if="greekText.trim()" class="quick-actions">
            <button @click="requestClearAll" class="clear-all-btn">Clear All Text</button>
          </div>

          <div class="scroll-spacer" :style="{ minHeight: `calc(66vh - ${fontSize * 2}px)` }"></div>
        </div>
      </div>

      <div v-else-if="greekText.trim() && !showEnglish && !showGreek" class="empty-state">
        <p>Both English and Greek paragraphs are hidden. Enable them in settings.</p>
      </div>
    </div>

    <ConfirmModal
      :isOpen="showConfirmModal"
      title="Clear All Text"
      message="Are you sure you want to clear all Greek and English text? This action cannot be undone."
      confirmText="Yes, Clear All"
      cancelText="Cancel"
      @confirm="confirmClearAll"
      @cancel="cancelClearAll"
    />
  </div>
</template>

<script>
import ArticleHistoryModal from './ArticleHistoryModal.vue';
import { useArticleHistory } from '../composables/useArticleHistory.js';
import { Edit as EditIcon, Settings, BookOpen, Save, Info, Bookmark } from 'lucide-vue-next';
import EditModal from './EditModal.vue';
import ConfirmModal from './ConfirmModal.vue';
import SettingsModal from './SettingsModal.vue';
import InfoModal from './InfoModal.vue';
import { ref, computed, watch, nextTick } from 'vue';
import { convert } from '@humanities/greek-conversion';
import LoadingSpinner from './LoadingSpinner.vue';
import { useSettings } from '../composables/useSettings.js';

export default {
  components: {
    ArticleHistoryModal, EditModal, ConfirmModal, SettingsModal, InfoModal,
    LoadingSpinner, BookOpen, EditIcon, Settings, Save, Info, Bookmark,
  },
  name: 'GreekConverter',
  setup() {
    const {
      fontSize, selectedFont, showRomanization, showGreek, showEnglish,
      displayOrder, romanizationFontSize, englishFontSize, transliterationPreset,
      resetSettings
    } = useSettings()

    const {
      articles, scheduleAutoSave, cancelAutoSave, saveCurrentArticle,
      deleteArticle, deleteAllArticles, isCurrentArticle, formatDate,
      resetCurrentTracking, isSaving, setBookmark
    } = useArticleHistory()

    const greekText = ref('');
    const englishText = ref('');
    const showConfirmModal = ref(false);
    const isSettingsModalOpen = ref(false);
    const isInfoModalOpen = ref(false);
    const isLoading = ref(false);
    const loadingText = ref('Processing...');
    const showSaveToast = ref(false);
    let toastTimeout = null;

    const isEditModalOpen = ref(false)
    const editModalType = ref('greek')
    const editModalTitle = computed(() => editModalType.value === 'greek' ? 'Greek Text' : 'English Translation')
    const editModalContent = computed(() => editModalType.value === 'greek' ? greekText.value : englishText.value)

    const isHistoryModalOpen = ref(false)
    const currentArticleId = ref(null)
    const currentBookmark = ref(null)

    const handleManualSave = () => {
      if (!greekText.value.trim()) return
      const article = saveCurrentArticle(greekText.value, englishText.value)
      if (article) {
        currentArticleId.value = article.id
        showSaveToastMessage('Article saved successfully!')
      }
    }

    const showSaveToastMessage = (message) => {
      showSaveToast.value = true
      if (toastTimeout) clearTimeout(toastTimeout)
      toastTimeout = setTimeout(() => { showSaveToast.value = false }, 3000)
    }

    watch([greekText, englishText], ([newGreek, newEnglish]) => {
      if (newGreek && newGreek.trim()) {
        scheduleAutoSave(newGreek, newEnglish)
      } else {
        // Do NOT reset tracking here — only the explicit "Clear All Text"
        // action should end the editing session.
        cancelAutoSave()
      }
    }, { deep: true })

    const openHistoryModal = () => { isHistoryModalOpen.value = true }
    const closeHistoryModal = () => { isHistoryModalOpen.value = false }
    const openInfoModal = () => { isInfoModalOpen.value = true }
    const closeInfoModal = () => { isInfoModalOpen.value = false }

    const loadArticleIntoEditor = async (article) => {
      isLoading.value = true
      loadingText.value = 'Loading article...'
      await new Promise(resolve => setTimeout(resolve, 300))

      greekText.value = article.greekContent || ''
      englishText.value = article.englishContent || ''
      currentArticleId.value = article.id
      currentBookmark.value = article.bookmark ?? null
      cancelAutoSave()
      resetCurrentTracking()

      isLoading.value = false

      if (article.bookmark !== null && article.bookmark !== undefined) {
        scrollToBookmark(article.bookmark)
      }
    }

    const scrollToBookmark = async (paragraphIndex) => {
      await nextTick()
      const el = document.querySelector(`[data-paragraph-index="${paragraphIndex}"]`)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }

    const toggleBookmark = (paragraphIndex) => {
      if (!currentArticleId.value) {
        // If not yet saved, save first
        const article = saveCurrentArticle(greekText.value, englishText.value)
        if (article) currentArticleId.value = article.id
      }
      if (currentArticleId.value) {
        if (currentBookmark.value === paragraphIndex) {
          currentBookmark.value = null
          setBookmark(currentArticleId.value, null)
        } else {
          currentBookmark.value = paragraphIndex
          setBookmark(currentArticleId.value, paragraphIndex)
        }
      }
    }

    const handleDeleteArticle = (articleId) => { deleteArticle(articleId) }
    const handleDeleteAllArticles = () => { deleteAllArticles() }

    const settings = computed(() => ({
      fontSize: Number(fontSize.value),
      selectedFont: selectedFont.value,
      showRomanization: showRomanization.value,
      showEnglish: showEnglish.value,
      showGreek: showGreek.value,
      displayOrder: displayOrder.value,
      romanizationFontSize: romanizationFontSize.value,
      englishFontSize: englishFontSize.value,
      transliterationPreset: transliterationPreset.value
    }))

    // Greek word processing
    const getWordsWithRomanization = (text) => {
      if (!text) return []
      const tokens = text.split(/(\s+|[.,!?;:()"'])/g).filter(t => t.trim() || t === ' ')
      const result = []
      let currentWord = ''

      for (const token of tokens) {
        if (token.trim() === '') {
          if (currentWord) { result.push(processWord(currentWord)); currentWord = '' }
          result.push({ greek: token, greekChars: [], romanized: '', isPunctuation: false })
        } else if (/[\u0370-\u03FF\u1F00-\u1FFF]/.test(token)) {
          if (currentWord) { result.push(processWord(currentWord)); currentWord = '' }
          result.push(processWord(token))
        } else if (/[.,!?;:()"']/.test(token)) {
          if (currentWord) { result.push(processWord(currentWord)); currentWord = '' }
          result.push({ greek: token, greekChars: [token], romanized: token, isPunctuation: true })
        } else {
          currentWord += token
        }
      }
      if (currentWord) result.push(processWord(currentWord))
      return result
    }

    const processWord = (word) => {
      const greekChars = [...word]
      let romanized = ''
      try {
        romanized = convert(word, 'greek', 'transliteration', {
          preset: transliterationPreset.value
        })
      } catch (e) {
        romanized = word
      }
      return {
        greek: word,
        greekChars: greekChars,
        romanized: romanized,
        isPunctuation: false
      }
    }

    const openSettingsModal = () => { isSettingsModalOpen.value = true }
    const requestClearAll = () => { if (greekText.value.trim() || englishText.value.trim()) showConfirmModal.value = true }
    const confirmClearAll = () => { clearText('both'); showConfirmModal.value = false }
    const cancelClearAll = () => { showConfirmModal.value = false }
    const closeSettingsModal = () => { isSettingsModalOpen.value = false }

    const saveSettings = (newSettings) => {
      fontSize.value = newSettings.fontSize
      selectedFont.value = newSettings.selectedFont
      showRomanization.value = newSettings.showRomanization
      showEnglish.value = newSettings.showEnglish
      showGreek.value = newSettings.showGreek
      displayOrder.value = newSettings.displayOrder
      romanizationFontSize.value = newSettings.romanizationFontSize
      englishFontSize.value = newSettings.englishFontSize
      transliterationPreset.value = newSettings.transliterationPreset
      closeSettingsModal()
    }

    const resetToDefaults = () => { resetSettings(); closeSettingsModal() }
    const openEditModal = (type) => { editModalType.value = type; isEditModalOpen.value = true }
    const closeEditModal = () => { isEditModalOpen.value = false }

    const saveEditModalContent = (newContent) => {
      if (editModalType.value === 'greek') greekText.value = newContent
      else englishText.value = newContent
      closeEditModal()
    }

    const fonts = {
      NotoSansSC: "'Noto Sans SC', 'Inter', sans-serif",
      NotoSerifSC: "'Noto Serif SC', 'Georgia', serif",
      Inter: "'Inter', 'Noto Sans SC', sans-serif",
      Roboto: "'Roboto', 'Noto Sans SC', sans-serif",
      Poppins: "'Poppins', 'Noto Sans SC', sans-serif",
    };
    const getFontFamily = computed(() => fonts[selectedFont.value]);

    const breakEnglishText = (englishText, greekSegments) => {
      if (!englishText.trim()) return {}
      const normalizedText = englishText.replace(/\r\n/g, '\n').replace(/\n\s*\n(\s*\n)*/g, '\n\n')
      const englishParagraphs = normalizedText.split(/\n\n/).map(p => p.trim()).filter(p => p)
      const result = {}
      const greekSegmentKeys = greekSegments ? Object.keys(greekSegments) : []
      englishParagraphs.forEach((paragraph, index) => {
        if (index < greekSegmentKeys.length) result[greekSegmentKeys[index]] = paragraph
      })
      return result
    }

    const englishSegments = computed(() => breakEnglishText(englishText.value, comparisonData.value))

    const pasteFromClipboard = async (target = null) => {
      isLoading.value = true
      loadingText.value = 'Pasting from clipboard...'
      try {
        await new Promise(resolve => setTimeout(resolve, 100))
        const clipboardText = await navigator.clipboard.readText()
        const targetType = target || 'greek'
        if (targetType === 'greek') greekText.value = clipboardText
        else englishText.value = clipboardText
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (error) {
        console.error('Failed to read clipboard: ', error)
      } finally {
        isLoading.value = false
      }
    }

    const clearText = (type = 'both') => {
      if (type === 'greek' || type === 'both') greekText.value = ''
      if (type === 'english' || type === 'both') englishText.value = ''
      if (type === 'both') {
        cancelAutoSave()
        resetCurrentTracking()
        currentArticleId.value = null
        currentBookmark.value = null
      }
    }

    const clearOrPasteText = (type) => {
      const text = type === 'greek' ? greekText.value : englishText.value
      if (text.trim()) clearText(type)
      else pasteFromClipboard(type)
    }

    const comparisonData = computed(() => {
      if (!greekText.value) return {}
      const normalizedText = greekText.value.replace(/\r\n/g, '\n').replace(/\n\s*\n(\s*\n)*/g, '\n\n')
      const greekParagraphs = normalizedText.split(/\n\n/).map(p => p.trim()).filter(p => p)
      const result = {}
      greekParagraphs.forEach((paragraph, index) => {
        result[index] = { words: getWordsWithRomanization(paragraph) }
      })
      return result
    })

    return {
      articles, isHistoryModalOpen, openHistoryModal, closeHistoryModal,
      loadArticleIntoEditor, handleDeleteArticle, handleDeleteAllArticles,
      isCurrentArticle, formatDate,
      isInfoModalOpen, openInfoModal, closeInfoModal,
      greekText, englishText, selectedFont, fontSize,
      showRomanization, showGreek, showEnglish, displayOrder,
      romanizationFontSize, englishFontSize, transliterationPreset,
      isLoading, loadingText, isSaving, showSaveToast,
      getFontFamily, comparisonData, englishSegments, settings,
      clearOrPasteText, clearAllText: clearText, handleManualSave, showSaveToastMessage,
      EditIcon, Settings, Save, Info, Bookmark,
      isEditModalOpen, editModalTitle, editModalContent, openEditModal, closeEditModal, saveEditModalContent,
      isSettingsModalOpen, openSettingsModal, closeSettingsModal, saveSettings, resetToDefaults,
      showConfirmModal, requestClearAll, confirmClearAll, cancelClearAll,
      currentBookmark, toggleBookmark,
    };
  },
};
</script>

<style scoped>
/* Header */
.app-header {
  position: sticky; top: 0; background: var(--bg-card); backdrop-filter: blur(20px);
  border-bottom: var(--border-primary-light); padding: 12px 24px;
  display: flex; justify-content: space-between; align-items: center; z-index: 100;
}
.logo { font-size: 20px; font-weight: 600; background: var(--gradient-logo); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0; }
.header-buttons { display: flex; gap: 8px; align-items: center; }
.save-icon-btn, .history-icon-btn, .settings-icon-btn, .info-icon-btn {
  background: transparent; border: none; cursor: pointer; padding: 8px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center; transition: all 0.2s; color: var(--text-muted);
}
.save-icon-btn:hover:not(:disabled) { background: var(--indigo-100); color: var(--indigo-600); transform: scale(1.05); }
.save-icon-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.save-spinner {
  position: absolute; width: 20px; height: 20px; border: 2px solid var(--slate-200);
  border-top-color: var(--indigo-500); border-radius: 50%; animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.history-icon-btn:hover { background: var(--indigo-100); transform: scale(1.05); }
.settings-icon-btn:hover { background: var(--indigo-100); transform: rotate(90deg); }
.info-icon-btn:hover { background: var(--indigo-100); color: var(--indigo-600); transform: scale(1.05); }

/* Toast */
.toast {
  position: fixed; top: 80px; left: 50%; transform: translateX(-50%); padding: 12px 24px;
  border-radius: 12px; font-size: 14px; font-weight: 500; z-index: 3000;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1); backdrop-filter: blur(20px);
  background: rgba(255, 255, 255, 0.95); border: 1px solid var(--indigo-200); color: var(--indigo-600);
  animation: slideDown 0.3s ease;
}
@keyframes slideDown { from { opacity: 0; transform: translateX(-50%) translateY(-20px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }

.main-content { display: block; }
.converter-wrapper { width: 100%; min-height: 100vh; background: var(--gradient-main); }
.input-display-row { margin: 20px auto; padding: 5px; display: block; width: 100%; max-width: 1200px; }
.text-section { width: 100%; padding: 0 1rem; margin-bottom: 20px; }
.input-wrapper { position: relative; width: 100%; }

.text-input {
  width: 100%; min-height: 40px; padding: 12px; background: var(--bg-input);
  backdrop-filter: blur(10px); border: var(--border-primary-strong); border-radius: var(--radius-md);
  font-size: 14px; transition: all 0.2s; resize: vertical; font-family: inherit;
  white-space: pre-wrap; word-wrap: break-word; word-break: break-word;
  overflow-wrap: break-word; box-sizing: border-box; color: var(--text);
}
.text-input:focus {
  outline: none; border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); background: rgba(255, 255, 255, 0.95);
}
.text-input::placeholder { color: var(--slate-400); opacity: 0.5; }

.english-input { min-height: 30px; padding: 8px; }

.action-btn {
  padding: 8px 20px; margin-top: 8px; font-size: 13px; font-weight: 600;
  background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(10px);
  border: var(--border-primary); border-radius: var(--radius-sm);
  color: var(--text-muted); cursor: pointer; transition: all 0.2s;
}
.action-btn:hover { background: var(--indigo-50); border-color: var(--primary); color: var(--indigo-600); }

.edit-btn {
  position: absolute; top: 8px; right: 8px; background: var(--bg-input);
  backdrop-filter: blur(10px); border: var(--border-primary); border-radius: var(--radius-sm);
  padding: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: all 0.2s; color: var(--text-muted); z-index: 10;
}
.edit-btn:hover { background: var(--indigo-50); border-color: var(--primary); color: var(--indigo-600); transform: scale(1.05); }

.quick-actions { max-width: 1200px; margin: 20px auto; padding: 0 1rem; text-align: center; }
.clear-all-btn {
  padding: 8px 20px; font-size: 13px; font-weight: 600;
  background: var(--slate-100); border: 1px solid var(--slate-200);
  border-radius: var(--radius-sm); color: var(--slate-600); cursor: pointer; transition: all 0.2s;
}
.clear-all-btn:hover { background: var(--slate-200); transform: translateY(-1px); }

/* Line containers */
.line-words {
  text-wrap: wrap; width: 100%; display: flex; flex-wrap: wrap;
  word-wrap: break-word; word-break: break-word; overflow-wrap: break-word;
  white-space: normal; line-height: 1.4;
}
.word-group { display: inline-flex; flex-direction: column; align-items: center; white-space: normal; margin: 0 1px; }
.word-with-romanization { display: inline-flex; flex-direction: column; align-items: center; }
.romanization-above { display: flex; gap: 0px; justify-content: center; margin-bottom: 1px; flex-wrap: nowrap; }
.romanization-char {
  color: var(--indigo-500); font-weight: 400; letter-spacing: 0.5px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  display: inline-block; opacity: 0.7;
}
.word { display: inline-flex; font-weight: 400; color: var(--text); gap: 0px; }
.greek-char { display: inline-block; }

.english-translation-box {
  background: rgba(255, 255, 255, 0.4); backdrop-filter: blur(10px);
  border-radius: var(--radius-md); padding: 12px 16px; margin-bottom: 8px;
  border: var(--border-secondary);
}
.english-text {
  color: var(--slate-700); line-height: 1.6; font-family: inherit;
  white-space: pre-wrap; word-wrap: break-word; word-break: break-word; overflow-wrap: break-word;
}

.empty-state {
  text-align: center; padding: 60px 20px; color: var(--primary);
  font-style: italic; background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(10px); border-radius: var(--radius-lg);
}

.relative { position: relative; }
.comparison-section { max-width: 1200px; margin: 0 auto; padding: 0 1rem; overflow-x: hidden; }
.comparison-display { max-width: 100%; width: 100%; overflow-x: hidden; }
.comparison-block { margin-bottom: 24px; width: 100%; overflow-x: hidden; }

.line-container {
  position: relative;
  background: var(--bg-card); backdrop-filter: blur(20px);
  border-radius: var(--radius-lg); padding: 16px; margin-bottom: 12px;
  border: var(--border-primary-light); box-shadow: var(--shadow-primary);
  width: 100%; overflow-x: auto; word-wrap: break-word; word-break: break-word; transition: all 0.3s;
}
.line-container:hover {
  background: rgba(255, 255, 255, 0.85); box-shadow: var(--shadow-primary-hover);
  border-color: rgba(99, 102, 241, 0.15);
}

.text-line { display: block; word-wrap: break-word; white-space: normal; overflow-wrap: break-word; }

/* Bookmark button */
.bookmark-btn {
  position: absolute; top: 8px; right: 8px; width: 28px; height: 28px;
  border-radius: 50%; border: none; background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: var(--slate-400); transition: all 0.2s; z-index: 5;
}
.bookmark-btn:hover { background: var(--indigo-50); color: var(--indigo-500); transform: scale(1.1); }

@media (max-width: 768px) {
  .app-header { padding: 8px 16px; }
  .logo { font-size: 18px; }
  .input-display-row { margin: 10px auto; }
  .text-section { padding: 0 0.5rem; }
  .comparison-section { padding: 0 0.5rem; }
  .line-container { padding: 12px; }
  .line-words { gap: 2px 4px; }
  .toast { top: 70px; font-size: 12px; padding: 10px 16px; max-width: 90%; }
}
</style>