<template>
  <div class="converter-wrapper">
    <div class="app-header">
      <div class="logo-section">
        <h1 class="logo">Little Hanzi 日本語</h1>
      </div>
      <div class="header-buttons">
        <button class="save-icon-btn" @click="handleManualSave" title="Save Article" :disabled="!japaneseText.trim() || isSaving">
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
      <LoadingSpinner :isLoading="isLoading || isProcessing" :text="loadingText" />

      <div v-if="showSaveToast" class="toast toast-success animate-slideDown">
        <span>🌸 Article saved successfully!</span>
      </div>

      <div class="input-display-row">
        <div class="text-section" :style="{fontFamily: getFontFamily, fontSize: `${fontSize}px` }">
          <div class="input-wrapper">
            <textarea v-model="japaneseText" placeholder="Enter Japanese text here..." class="text-input w-full"></textarea>
            <button v-if="japaneseText.trim()" @click="openEditModal('japanese')" class="edit-btn" title="Edit in popup">
              <EditIcon :size="16" />
            </button>
          </div>
          <button @click="clearOrPasteText('japanese')" class="action-btn">
            {{ japaneseText.trim() ? 'Clear' : 'Paste' }}
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

      <div v-if="japaneseText.trim() && (showEnglish || showJapanese)" class="comparison-section">
        <div class="comparison-display relative">
          <div v-for="(block, sentenceId) in comparisonData" :key="sentenceId"
               class="comparison-block relative"
               :data-paragraph-index="sentenceId">

            <template v-if="displayOrder === 'en-ja'">
              <div v-if="showEnglish && englishSegments[sentenceId]" class="english-translation-box">
                <div class="english-text" :style="{ fontSize: `${englishFontSize}px`, lineHeight: '1.6' }">
                  {{ englishSegments[sentenceId] }}
                </div>
              </div>

              <div v-if="showJapanese" class="line-container" :style="{ fontFamily: getFontFamily }">
                <button class="bookmark-btn" @click.stop="toggleBookmark(sentenceId)" title="Bookmark this paragraph">
                  <Bookmark :size="14" :fill="currentBookmark === sentenceId ? 'currentColor' : 'none'" />
                </button>
                <!-- v-html renders the ruby tags -->
                <div class="ruby-content" :style="{ fontSize: `${fontSize}px` }" v-html="block.html"></div>
              </div>
            </template>

            <template v-else>
              <div v-if="showJapanese" class="line-container" :style="{ fontFamily: getFontFamily }">
                <button class="bookmark-btn" @click.stop="toggleBookmark(sentenceId)" title="Bookmark this paragraph">
                  <Bookmark :size="14" :fill="currentBookmark === sentenceId ? 'currentColor' : 'none'" />
                </button>
                <div class="ruby-content" :style="{ fontSize: `${fontSize}px` }" v-html="block.html"></div>
              </div>

              <div v-if="showEnglish && englishSegments[sentenceId]" class="english-translation-box">
                <div class="english-text" :style="{ fontSize: `${englishFontSize}px`, lineHeight: '1.6' }">
                  {{ englishSegments[sentenceId] }}
                </div>
              </div>
            </template>
          </div>

          <div v-if="japaneseText.trim()" class="quick-actions">
            <button @click="requestClearAll" class="clear-all-btn">Clear All Text</button>
          </div>

          <div class="scroll-spacer" :style="{ minHeight: `calc(66vh - ${fontSize * 2}px)` }"></div>
        </div>
      </div>

      <div v-else-if="japaneseText.trim() && !showEnglish && !showJapanese" class="empty-state">
        <p>Both English and Japanese paragraphs are hidden. Enable them in settings.</p>
      </div>
    </div>

    <ConfirmModal
      :isOpen="showConfirmModal"
      title="Clear All Text"
      message="Are you sure you want to clear all Japanese and English text? This action cannot be undone."
      confirmText="Yes, Clear All"
      cancelText="Cancel"
      @confirm="confirmClearAll"
      @cancel="cancelClearAll"
    />
  </div>
</template>

<script>
import ArticleHistoryModal from './ArticleHistoryModal.vue';
import { useArticleHistory } from '../composables/useArticleHistory';
import { Edit as EditIcon, Settings, BookOpen, Save, Info, Bookmark } from 'lucide-vue-next';
import EditModal from './EditModal.vue';
import ConfirmModal from './ConfirmModal.vue';
import SettingsModal from './SettingsModal.vue';
import InfoModal from './InfoModal.vue';
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import LoadingSpinner from './LoadingSpinner.vue';
import { useSettings } from '../composables/useSettings';

// Use kuroshiro-browser for offline support
import { Kuroshiro } from 'kuroshiro-browser';

export default {
  components: {
    ArticleHistoryModal, EditModal, ConfirmModal, SettingsModal, InfoModal,
    LoadingSpinner, BookOpen, EditIcon, Settings, Save, Info, Bookmark,
  },
  name: 'JapaneseConverter',
  setup() {
    const {
      fontSize, selectedFont, showRomanization, showJapanese, showEnglish,
      displayOrder, romanizationFontSize, englishFontSize, romajiSystem,
      resetSettings
    } = useSettings()

    const {
      articles, scheduleAutoSave, cancelAutoSave, saveCurrentArticle,
      deleteArticle, deleteAllArticles, isCurrentArticle, formatDate,
      resetCurrentTracking, isSaving, setBookmark
    } = useArticleHistory()

    const japaneseText = ref('');
    const englishText = ref('');
    const showConfirmModal = ref(false);
    const isSettingsModalOpen = ref(false);
    const isInfoModalOpen = ref(false);
    const isLoading = ref(false);
    const isProcessing = ref(false);
    const loadingText = ref('Processing...');
    const showSaveToast = ref(false);
    let toastTimeout = null;

    const isEditModalOpen = ref(false)
    const editModalType = ref('japanese')
    const editModalTitle = computed(() => editModalType.value === 'japanese' ? 'Japanese Text' : 'English Translation')
    const editModalContent = computed(() => editModalType.value === 'japanese' ? japaneseText.value : englishText.value)

    const isHistoryModalOpen = ref(false)
    const currentArticleId = ref(null)
    const currentBookmark = ref(null)

    // --- Kuroshiro Setup ---
    const kuroshiro = ref(null);
    const isKuroshiroReady = ref(false);

    onMounted(async () => {
      try {
        kuroshiro.value = await Kuroshiro.buildAndInitWithKuromoji(import.meta.env.PROD);
        isKuroshiroReady.value = true;
        processText();
      } catch (err) {
        console.error('Failed to load Kuroshiro:', err);
        loadingText.value = 'Failed to load dictionary. Check public/dict folder.';
      }
    });

    // --- Furigana / Ruby HTML Generation ---
    const comparisonData = ref({});

    const convertParagraphToRuby = async (text) => {
      if (!kuroshiro.value || !text.trim()) return text;
      try {
        // mode: 'furigana' generates <ruby> tags automatically
        return await kuroshiro.value.convert(text, {
          to: 'romaji',
          mode: 'furigana',
          romajiSystem: romajiSystem.value
        });
      } catch (e) {
        console.error('Furigana conversion failed:', e);
        return text;
      }
    };

    const processText = async () => {
      if (!japaneseText.value.trim() || !isKuroshiroReady.value) {
        comparisonData.value = {};
        return;
      }

      isProcessing.value = true;
      const normalizedText = japaneseText.value
        .replace(/\r\n/g, '\n')
        .replace(/\n\s*\n(\s*\n)*/g, '\n\n');

      const paragraphs = normalizedText.split(/\n\n/).map(p => p.trim()).filter(p => p);
      const result = {};

      for (let i = 0; i < paragraphs.length; i++) {
        result[i] = {
          html: await convertParagraphToRuby(paragraphs[i])
        };
      }

      comparisonData.value = result;
      isProcessing.value = false;
    };

    // Watch for text or romaji system changes
    let processTimeout;
    watch([japaneseText, romajiSystem], () => {
      clearTimeout(processTimeout);
      processTimeout = setTimeout(() => {
        processText();
      }, 300);
    });

    // --- App Logic ---
    const handleManualSave = () => {
      if (!japaneseText.value.trim()) return
      const article = saveCurrentArticle(japaneseText.value, englishText.value)
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

    watch([japaneseText, englishText], ([newJa, newEn]) => {
      if (newJa && newJa.trim()) {
        scheduleAutoSave(newJa, newEn)
      } else {
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

      japaneseText.value = article.japaneseContent || ''
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

    // Inside your setup() function in JapaneseConverter.vue

    const scrollToBookmark = async (paragraphIndex) => {
      // Wait for Vue DOM updates
      await nextTick()
      
      // Add a short delay to allow the browser to calculate the line-heights
      // of the newly rendered <ruby> tags
      setTimeout(() => {
        const el = document.querySelector(`[data-paragraph-index="${paragraphIndex}"]`)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 150)
    }

    const toggleBookmark = (paragraphIndex) => {
      if (!currentArticleId.value) {
        const article = saveCurrentArticle(japaneseText.value, englishText.value)
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
      showJapanese: showJapanese.value,
      displayOrder: displayOrder.value,
      romanizationFontSize: romanizationFontSize.value,
      englishFontSize: englishFontSize.value,
      romajiSystem: romajiSystem.value
    }))

    const openSettingsModal = () => { isSettingsModalOpen.value = true }
    const requestClearAll = () => { if (japaneseText.value.trim() || englishText.value.trim()) showConfirmModal.value = true }
    const confirmClearAll = () => { clearText('both'); showConfirmModal.value = false }
    const cancelClearAll = () => { showConfirmModal.value = false }
    const closeSettingsModal = () => { isSettingsModalOpen.value = false }

    const saveSettings = (newSettings) => {
      fontSize.value = newSettings.fontSize
      selectedFont.value = newSettings.selectedFont
      showRomanization.value = newSettings.showRomanization
      showEnglish.value = newSettings.showEnglish
      showJapanese.value = newSettings.showJapanese
      displayOrder.value = newSettings.displayOrder
      romanizationFontSize.value = newSettings.romanizationFontSize
      englishFontSize.value = newSettings.englishFontSize
      romajiSystem.value = newSettings.romajiSystem
      closeSettingsModal()
    }

    const resetToDefaults = () => { resetSettings(); closeSettingsModal() }
    const openEditModal = (type) => { editModalType.value = type; isEditModalOpen.value = true }
    const closeEditModal = () => { isEditModalOpen.value = false }

    const saveEditModalContent = (newContent) => {
      if (editModalType.value === 'japanese') japaneseText.value = newContent
      else englishText.value = newContent
      closeEditModal()
    }

    const fonts = {
      NotoSansJP: "'Noto Sans JP', 'Inter', sans-serif",
      NotoSerifJP: "'Noto Serif JP', 'Georgia', serif",
      Inter: "'Inter', 'Noto Sans JP', sans-serif",
      Roboto: "'Roboto', 'Noto Sans JP', sans-serif",
      Poppins: "'Poppins', 'Noto Sans JP', sans-serif",
    };
    const getFontFamily = computed(() => fonts[selectedFont.value] || fonts.NotoSansJP);

    const breakEnglishText = (englishText, japaneseSegments) => {
      if (!englishText.trim()) return {}
      const normalizedText = englishText.replace(/\r\n/g, '\n').replace(/\n\s*\n(\s*\n)*/g, '\n\n')
      const englishParagraphs = normalizedText.split(/\n\n/).map(p => p.trim()).filter(p => p)
      const result = {}
      const japaneseSegmentKeys = japaneseSegments ? Object.keys(japaneseSegments) : []
      englishParagraphs.forEach((paragraph, index) => {
        if (index < japaneseSegmentKeys.length) result[japaneseSegmentKeys[index]] = paragraph
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
        const targetType = target || 'japanese'
        if (targetType === 'japanese') japaneseText.value = clipboardText
        else englishText.value = clipboardText
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (error) {
        console.error('Failed to read clipboard: ', error)
      } finally {
        isLoading.value = false
      }
    }

    const clearText = (type = 'both') => {
      if (type === 'japanese' || type === 'both') japaneseText.value = ''
      if (type === 'english' || type === 'both') englishText.value = ''
      if (type === 'both') {
        cancelAutoSave()
        resetCurrentTracking()
        currentArticleId.value = null
        currentBookmark.value = null
      }
    }

    const clearOrPasteText = (type) => {
      const text = type === 'japanese' ? japaneseText.value : englishText.value
      if (text.trim()) clearText(type)
      else pasteFromClipboard(type)
    }

    return {
      articles, isHistoryModalOpen, openHistoryModal, closeHistoryModal,
      loadArticleIntoEditor, handleDeleteArticle, handleDeleteAllArticles,
      isCurrentArticle, formatDate,
      isInfoModalOpen, openInfoModal, closeInfoModal,
      japaneseText, englishText, selectedFont, fontSize,
      showRomanization, showJapanese, showEnglish, displayOrder,
      romanizationFontSize, englishFontSize, romajiSystem,
      isLoading, isProcessing, loadingText, isSaving, showSaveToast,
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
.logo { 
  font-size: 20px; font-weight: 700; 
  background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 50%, #0ea5e9 100%); 
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0; 
}
.header-buttons { display: flex; gap: 8px; align-items: center; }
.save-icon-btn, .history-icon-btn, .settings-icon-btn, .info-icon-btn {
  background: transparent; border: none; cursor: pointer; padding: 8px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center; transition: all 0.2s; color: var(--text-muted);
}
.save-icon-btn:hover:not(:disabled) { background: #fce7f3; color: #ec4899; transform: scale(1.05); }
.save-icon-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.save-spinner {
  position: absolute; width: 20px; height: 20px; border: 2px solid #e2e8f0;
  border-top-color: #ec4899; border-radius: 50%; animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.history-icon-btn:hover { background: #e0f2fe; color: #0ea5e9; transform: scale(1.05); }
.settings-icon-btn:hover { background: #fce7f3; color: #ec4899; transform: rotate(90deg); }
.info-icon-btn:hover { background: #e0f2fe; color: #0ea5e9; transform: scale(1.05); }

/* Toast */
.toast {
  position: fixed; top: 80px; left: 50%; transform: translateX(-50%); padding: 12px 24px;
  border-radius: 12px; font-size: 14px; font-weight: 500; z-index: 3000;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1); backdrop-filter: blur(20px);
  background: rgba(255, 255, 255, 0.95); border: 1px solid #fbcfe8; color: #ec4899;
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
  backdrop-filter: blur(10px); border: 2px solid rgba(236, 72, 153, 0.15); border-radius: var(--radius-md);
  font-size: 14px; transition: all 0.2s; resize: vertical; font-family: inherit;
  white-space: pre-wrap; word-wrap: break-word; word-break: break-word;
  overflow-wrap: break-word; box-sizing: border-box; color: var(--text);
}
.text-input:focus {
  outline: none; border-color: #ec4899;
  box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.1); background: rgba(255, 255, 255, 0.95);
}
.text-input::placeholder { color: #94a3b8; opacity: 0.6; }

.english-input { min-height: 30px; padding: 8px; }

.action-btn {
  padding: 8px 20px; margin-top: 8px; font-size: 13px; font-weight: 600;
  background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(10px);
  border: 1px solid rgba(236, 72, 153, 0.2); border-radius: var(--radius-sm);
  color: var(--text-muted); cursor: pointer; transition: all 0.2s;
}
.action-btn:hover { background: #fdf2f8; border-color: #ec4899; color: #ec4899; }

.edit-btn {
  position: absolute; top: 8px; right: 8px; background: var(--bg-input);
  backdrop-filter: blur(10px); border: 1px solid rgba(236, 72, 153, 0.2); border-radius: var(--radius-sm);
  padding: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: all 0.2s; color: var(--text-muted); z-index: 10;
}
.edit-btn:hover { background: #fdf2f8; border-color: #ec4899; color: #ec4899; transform: scale(1.05); }

.quick-actions { max-width: 1200px; margin: 20px auto; padding: 0 1rem; text-align: center; }
.clear-all-btn {
  padding: 8px 20px; font-size: 13px; font-weight: 600;
  background: #f1f5f9; border: 1px solid #e2e8f0;
  border-radius: var(--radius-sm); color: #64748b; cursor: pointer; transition: all 0.2s;
}
.clear-all-btn:hover { background: #e2e8f0; transform: translateY(-1px); }

/* Ruby Content */
.ruby-content {
  line-height: 2;
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: normal;
}
.ruby-content ruby {
  ruby-align: center;
  margin: 0 1px;
}
.ruby-content rt {
  font-size: 0.5em;
  color: #ec4899;
  font-weight: 500;
  letter-spacing: 0.5px;
  opacity: 0.8;
}

.english-translation-box {
  background: rgba(255, 255, 255, 0.4); backdrop-filter: blur(10px);
  border-radius: var(--radius-md); padding: 12px 16px; margin-bottom: 8px;
  border: 1px solid rgba(14, 165, 233, 0.15);
}
.english-text {
  color: #334155; line-height: 1.6; font-family: inherit;
  white-space: pre-wrap; word-wrap: break-word; word-break: break-word; overflow-wrap: break-word;
}

.empty-state {
  text-align: center; padding: 60px 20px; color: #ec4899;
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
  border: 1px solid rgba(236, 72, 153, 0.1); box-shadow: 0 4px 20px rgba(236, 72, 153, 0.05);
  width: 100%; overflow-x: hidden; word-wrap: break-word; word-break: break-word; transition: all 0.3s;
}
.line-container:hover {
  background: rgba(255, 255, 255, 0.85); box-shadow: 0 4px 24px rgba(236, 72, 153, 0.1);
  border-color: rgba(236, 72, 153, 0.25);
}

/* Bookmark button */
.bookmark-btn {
  position: absolute; top: 8px; right: 8px; width: 28px; height: 28px;
  border-radius: 50%; border: none; background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: #94a3b8; transition: all 0.2s; z-index: 5;
}
.bookmark-btn:hover { background: #fdf2f8; color: #ec4899; transform: scale(1.1); }

@media (max-width: 768px) {
  .app-header { padding: 8px 16px; }
  .logo { font-size: 18px; }
  .input-display-row { margin: 10px auto; }
  .text-section { padding: 0 0.5rem; }
  .comparison-section { padding: 0 0.5rem; }
  .line-container { padding: 12px; }
  .toast { top: 70px; font-size: 12px; padding: 10px 16px; max-width: 90%; }
}
</style>