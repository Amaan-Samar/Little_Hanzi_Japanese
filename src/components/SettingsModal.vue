<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-[2000] flex items-center justify-center bg-black/5 backdrop-blur-md animate-fadeIn" @click="handleOverlayClick">
      <div class="relative bg-white/85 backdrop-blur-xl rounded-2xl w-[90%] max-w-[520px] max-h-[90vh] flex flex-col animate-slideUp border border-white/50 shadow-2xl" :class="{ 'w-[92%] max-h-[90vh] rounded-xl': isMobile }" @click.stop>

        <button class="absolute -top-2.5 -right-2.5 w-8 h-8 rounded-full bg-white border border-black/5 cursor-pointer flex items-center justify-center transition-all duration-200 hover:scale-110 hover:bg-gray-50 hover:border-black/10 text-gray-400 hover:text-gray-600 shadow-md hover:shadow-lg z-10" @click="close">
          <X :size="16" />
        </button>

        <div class="flex-1 overflow-y-auto p-6 pb-8 scrollbar-thin scrollbar-thumb-gray-200/50 scrollbar-track-transparent">

          <!-- Live Preview Section -->
          <div class="mb-6 bg-gradient-to-br from-indigo-50/50 to-slate-50/50 rounded-xl p-4 border border-indigo-100/50">
            <label class="block text-[11px] font-semibold text-indigo-600 uppercase tracking-wider mb-3">Live Preview</label>
            <div class="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-white/50">
              <!-- Greek with Romanization Preview -->
              <div class="mb-3" :style="{ fontFamily: getSelectedFontFamily() }">
                <div class="flex flex-col items-start">
                  <div class="flex gap-0 mb-0.5" v-if="localSettings.showRomanization">
                    <span
                      class="text-indigo-500 font-light tracking-wide"
                      :style="{ fontSize: `${Math.min(localSettings.romanizationFontSize, localSettings.fontSize)}px` }"
                    >
                      {{ previewRomanization }}
                    </span>
                  </div>
                  <div class="flex gap-0 font-semibold" :style="{ fontSize: `${localSettings.fontSize}px` }">
                    <span>{{ previewGreek }}</span>
                  </div>
                </div>
              </div>

              <!-- English Preview -->
              <div v-if="localSettings.showEnglish" class="mt-2 pt-2 border-t border-gray-100/50" :style="{ fontFamily: getSelectedFontFamily() }">
                <div :style="{ fontSize: `${Math.min(localSettings.englishFontSize, localSettings.fontSize)}px` }">
                  <span class="text-slate-700">Hello, this is a preview</span>
                </div>
              </div>

              <div class="mt-2 text-[10px] text-gray-400 flex items-center gap-2">
                <span class="font-medium">Order:</span>
                <span class="px-2 py-0.5 bg-gray-100 rounded-full">
                  {{ localSettings.displayOrder === 'gr-en' ? 'Greek → English' : 'English → Greek' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Greek Font Size -->
          <div class="mb-6 last:mb-0">
            <label class="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Greek Font Size</label>
            <div class="flex items-center gap-3.5 mb-3.5">
              <button
                class="w-9 h-9 rounded-full border border-black/5 bg-white cursor-pointer flex items-center justify-center transition-all duration-200 text-gray-500 hover:bg-gray-50 hover:border-black/10 hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                @click="decreaseFontSize"
                :disabled="localSettings.fontSize <= 12"
              >
                <Minus :size="16" />
              </button>
              <span class="text-lg font-semibold text-gray-800 min-w-[48px] text-center">{{ localSettings.fontSize }}</span>
              <button
                class="w-9 h-9 rounded-full border border-black/5 bg-white cursor-pointer flex items-center justify-center transition-all duration-200 text-gray-500 hover:bg-gray-50 hover:border-black/10 hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                @click="increaseFontSize"
                :disabled="localSettings.fontSize >= 32"
              >
                <Plus :size="16" />
              </button>
            </div>
            <div class="flex gap-1.5 flex-wrap">
              <button
                v-for="size in fontSizePresets"
                :key="size"
                class="px-2.5 py-1 border border-black/5 rounded-md bg-white cursor-pointer text-xs font-medium transition-all duration-200 text-gray-500 hover:bg-gray-50 hover:border-black/10"
                :class="{ 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm': localSettings.fontSize === size }"
                @click="setFontSize(size)"
              >
                {{ size }}
              </button>
            </div>
          </div>

          <!-- Romanization Font Size -->
          <div class="mb-6 last:mb-0">
            <label class="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Romanization Size</label>
            <div class="flex items-center gap-3.5 mb-3.5">
              <button
                class="w-9 h-9 rounded-full border border-black/5 bg-white cursor-pointer flex items-center justify-center transition-all duration-200 text-gray-500 hover:bg-gray-50 hover:border-black/10 hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                @click="decreaseRomanizationSize"
                :disabled="localSettings.romanizationFontSize <= 4"
              >
                <Minus :size="16" />
              </button>
              <span class="text-lg font-semibold text-gray-800 min-w-[48px] text-center">{{ localSettings.romanizationFontSize }}</span>
              <button
                class="w-9 h-9 rounded-full border border-black/5 bg-white cursor-pointer flex items-center justify-center transition-all duration-200 text-gray-500 hover:bg-gray-50 hover:border-black/10 hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                @click="increaseRomanizationSize"
                :disabled="localSettings.romanizationFontSize >= localSettings.fontSize"
              >
                <Plus :size="16" />
              </button>
            </div>
            <div class="flex gap-1.5 flex-wrap">
              <button
                v-for="size in romanizationPresets"
                :key="size"
                class="px-2.5 py-1 border border-black/5 rounded-md bg-white cursor-pointer text-xs font-medium transition-all duration-200 text-gray-500 hover:bg-gray-50 hover:border-black/10"
                :class="{ 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm': localSettings.romanizationFontSize === size }"
                @click="setRomanizationSize(size)"
              >
                {{ size }}
              </button>
            </div>
            <p class="text-xs text-gray-400 mt-2">Maximum: {{ localSettings.fontSize }}px (same as Greek)</p>
          </div>

          <!-- English Font Size -->
          <div class="mb-6 last:mb-0">
            <label class="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">English Size</label>
            <div class="flex items-center gap-3.5 mb-3.5">
              <button
                class="w-9 h-9 rounded-full border border-black/5 bg-white cursor-pointer flex items-center justify-center transition-all duration-200 text-gray-500 hover:bg-gray-50 hover:border-black/10 hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                @click="decreaseEnglishSize"
                :disabled="localSettings.englishFontSize <= 4"
              >
                <Minus :size="16" />
              </button>
              <span class="text-lg font-semibold text-gray-800 min-w-[48px] text-center">{{ localSettings.englishFontSize }}</span>
              <button
                class="w-9 h-9 rounded-full border border-black/5 bg-white cursor-pointer flex items-center justify-center transition-all duration-200 text-gray-500 hover:bg-gray-50 hover:border-black/10 hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                @click="increaseEnglishSize"
                :disabled="localSettings.englishFontSize >= localSettings.fontSize"
              >
                <Plus :size="16" />
              </button>
            </div>
            <div class="flex gap-1.5 flex-wrap">
              <button
                v-for="size in englishPresets"
                :key="size"
                class="px-2.5 py-1 border border-black/5 rounded-md bg-white cursor-pointer text-xs font-medium transition-all duration-200 text-gray-500 hover:bg-gray-50 hover:border-black/10"
                :class="{ 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm': localSettings.englishFontSize === size }"
                @click="setEnglishSize(size)"
              >
                {{ size }}
              </button>
            </div>
            <p class="text-xs text-gray-400 mt-2">Maximum: {{ localSettings.fontSize }}px (same as Greek)</p>
          </div>

          <!-- Font Family -->
          <div class="mb-6 last:mb-0">
            <label class="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Font Family</label>
            <div class="relative font-select-wrapper">
              <button
                class="w-full px-4 py-3 bg-white border border-black/5 rounded-lg flex justify-between items-center cursor-pointer transition-all duration-200 text-gray-600 text-sm hover:bg-gray-50 hover:border-black/10"
                :style="{ fontFamily: getSelectedFontFamily() }"
                @click="toggleFontDropdown"
              >
                <span>{{ getSelectedFontLabel() }}</span>
                <ChevronDown :size="16" class="transition-transform duration-200" :class="{ 'rotate-180': isFontDropdownOpen }" />
              </button>
              <div v-if="isFontDropdownOpen" class="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl border border-black/5 rounded-lg max-h-[200px] overflow-y-auto z-10 shadow-lg animate-slideDown">
                <button
                  v-for="font in fontOptions"
                  :key="font.value"
                  class="w-full px-4 py-2.5 bg-transparent border-none text-left cursor-pointer transition-all duration-200 text-gray-600 text-sm hover:bg-indigo-50"
                  :class="{ 'bg-indigo-50/50 text-indigo-700': localSettings.selectedFont === font.value }"
                  :style="{ fontFamily: font.fontFamily }"
                  @click="handleFontChange(font.value)"
                >
                  {{ font.label }}
                </button>
              </div>
            </div>
          </div>

          <!-- Greek Transliteration Standard -->
          <div class="mb-6 last:mb-0">
            <label class="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Greek Transliteration Standard</label>
            <select
              v-model="localSettings.transliterationPreset"
              @change="handleTransliterationChange"
              class="w-full px-4 py-3 bg-white border border-black/5 rounded-lg text-sm text-gray-600 focus:outline-none focus:border-indigo-300 focus:shadow-indigo-100/30 transition-all duration-200"
            >
              <option value="sbl-academic">SBL Academic — keeps macrons (ē / ō) and accents</option>
              <option value="ala-lc-ancient">ALA-LC Ancient Greek — library catalog standard</option>
              <option value="iso-843-type-1">ISO 843:1997 Type 1 — reversible, character-level</option>
            </select>
            <p class="text-xs text-gray-400 mt-2 leading-relaxed">
              SBL preserves scholarly vowel length and accent marks. ALA-LC is the standard used by research libraries. ISO 843 is fully reversible for database storage.
            </p>
          </div>

          <!-- Display Sections -->
          <div class="mb-6 last:mb-0">
            <label class="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Display Sections</label>
            <div class="flex flex-col gap-3">
              <label class="flex items-center gap-3 cursor-pointer text-sm text-gray-600">
                <input type="checkbox" v-model="localSettings.showRomanization" class="w-4.5 h-4.5 cursor-pointer accent-indigo-500" @change="handleShowRomanizationChange">
                <span>Romanization</span>
              </label>
              <label class="flex items-center gap-3 cursor-pointer text-sm text-gray-600">
                <input type="checkbox" v-model="localSettings.showGreek" class="w-4.5 h-4.5 cursor-pointer accent-indigo-500" @change="handleShowGreekChange">
                <span>Greek</span>
              </label>
              <label class="flex items-center gap-3 cursor-pointer text-sm text-gray-600">
                <input type="checkbox" v-model="localSettings.showEnglish" class="w-4.5 h-4.5 cursor-pointer accent-indigo-500" @change="handleShowEnglishChange">
                <span>English</span>
              </label>
            </div>
          </div>

          <!-- Display Order -->
          <div class="mb-6 last:mb-0">
            <label class="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Display Order</label>
            <div class="flex gap-6" :class="{ 'flex-col gap-3': isMobile }">
              <label class="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
                <input type="radio" v-model="localSettings.displayOrder" value="en-gr" class="w-4.5 h-4.5 cursor-pointer accent-indigo-500" @change="handleDisplayOrderChange">
                <span>English → Greek</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
                <input type="radio" v-model="localSettings.displayOrder" value="gr-en" class="w-4.5 h-4.5 cursor-pointer accent-indigo-500" @change="handleDisplayOrderChange">
                <span>Greek → English</span>
              </label>
            </div>
          </div>

          <div class="mt-2">
            <button class="w-full px-5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 font-medium cursor-pointer transition-all duration-200 hover:bg-slate-100 hover:-translate-y-0.5" @click="resetToDefaults">
              Reset to defaults
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { X, Minus, Plus, ChevronDown } from 'lucide-vue-next'
import { convert } from '@humanities/greek-conversion'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  settings: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'save', 'reset'])

const localSettings = ref({
  fontSize: 18,
  selectedFont: 'GFSDidot',
  showRomanization: true,
  showGreek: true,
  showEnglish: true,
  displayOrder: 'gr-en',
  romanizationFontSize: 10,
  englishFontSize: 14,
  transliterationPreset: 'sbl-academic',
  ...props.settings
})

const isMobile = ref(false)
const isFontDropdownOpen = ref(false)
const fontSizePresets = [12, 14, 16, 18, 20, 24, 28, 32]
const romanizationPresets = [4, 6, 8, 10, 12, 14, 16, 18]
const englishPresets = [6, 8, 10, 12, 14, 16, 18, 20]

const fontOptions = [
  { value: 'GFSDidot', label: 'GFS Didot (Greek serif)', fontFamily: "'GFS Didot', 'Noto Serif', Georgia, serif" },
  { value: 'Gentium', label: 'Gentium (scholarly)', fontFamily: "'Gentium Plus', 'Gentium', 'Noto Serif', Georgia, serif" },
  { value: 'NotoSansSC', label: 'Noto Sans (sans-serif)', fontFamily: "'Noto Sans', 'Inter', sans-serif" },
  { value: 'NotoSerifSC', label: 'Noto Serif', fontFamily: "'Noto Serif', 'Georgia', serif" },
  { value: 'Inter', label: 'Inter', fontFamily: "'Inter', sans-serif" },
  { value: 'Roboto', label: 'Roboto', fontFamily: "'Roboto', sans-serif" },
  { value: 'Poppins', label: 'Poppins', fontFamily: "'Poppins', sans-serif" }
]

// Preview strings
const previewGreek = 'Ἕλλησιν'
const previewRomanization = computed(() => {
  try {
    return convert(previewGreek, 'greek', 'transliteration', {
      preset: localSettings.value.transliterationPreset
    })
  } catch {
    return previewGreek
  }
})

let fontSizeTimeout = null

const getSelectedFontLabel = () => {
  const font = fontOptions.find(f => f.value === localSettings.value.selectedFont)
  return font ? font.label : 'GFS Didot'
}

const getSelectedFontFamily = () => {
  const font = fontOptions.find(f => f.value === localSettings.value.selectedFont)
  return font ? font.fontFamily : "'GFS Didot', Georgia, serif"
}

const toggleFontDropdown = () => {
  isFontDropdownOpen.value = !isFontDropdownOpen.value
}

// Greek font size controls
const increaseFontSize = () => {
  if (localSettings.value.fontSize < 32) {
    localSettings.value.fontSize += 2
    emitSave()
  }
}

const decreaseFontSize = () => {
  if (localSettings.value.fontSize > 12) {
    localSettings.value.fontSize -= 2
    emitSave()
  }
}

const setFontSize = (size) => {
  localSettings.value.fontSize = size
  if (localSettings.value.romanizationFontSize > size) {
    localSettings.value.romanizationFontSize = size
  }
  if (localSettings.value.englishFontSize > size) {
    localSettings.value.englishFontSize = size
  }
  emitSave()
}

// Romanization font size controls
const increaseRomanizationSize = () => {
  if (localSettings.value.romanizationFontSize < localSettings.value.fontSize) {
    localSettings.value.romanizationFontSize += 1
    emitSave()
  }
}

const decreaseRomanizationSize = () => {
  if (localSettings.value.romanizationFontSize > 4) {
    localSettings.value.romanizationFontSize -= 1
    emitSave()
  }
}

const setRomanizationSize = (size) => {
  if (size <= localSettings.value.fontSize) {
    localSettings.value.romanizationFontSize = size
    emitSave()
  }
}

// English font size controls
const increaseEnglishSize = () => {
  if (localSettings.value.englishFontSize < localSettings.value.fontSize) {
    localSettings.value.englishFontSize += 1
    emitSave()
  }
}

const decreaseEnglishSize = () => {
  if (localSettings.value.englishFontSize > 4) {
    localSettings.value.englishFontSize -= 1
    emitSave()
  }
}

const setEnglishSize = (size) => {
  if (size <= localSettings.value.fontSize) {
    localSettings.value.englishFontSize = size
    emitSave()
  }
}

const emitSave = () => {
  if (fontSizeTimeout) clearTimeout(fontSizeTimeout)
  fontSizeTimeout = setTimeout(() => {
    emit('save', localSettings.value)
  }, 50)
}

const handleFontChange = (fontValue) => {
  localSettings.value.selectedFont = fontValue
  isFontDropdownOpen.value = false
  emit('save', localSettings.value)
}

const handleTransliterationChange = () => {
  emitSave()
}

const handleShowRomanizationChange = () => {
  emit('save', localSettings.value)
}

const handleShowGreekChange = () => {
  emit('save', localSettings.value)
}

const handleShowEnglishChange = () => {
  emit('save', localSettings.value)
}

const handleDisplayOrderChange = () => {
  emit('save', localSettings.value)
}

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

const handleOverlayClick = () => {
  // Don't close on overlay click - user must click the close button
}

const close = () => {
  isFontDropdownOpen.value = false
  emit('close')
}

const resetToDefaults = () => {
  const defaults = {
    fontSize: 18,
    selectedFont: 'GFSDidot',
    showRomanization: true,
    showGreek: true,
    showEnglish: true,
    displayOrder: 'gr-en',
    romanizationFontSize: 10,
    englishFontSize: 14,
    transliterationPreset: 'sbl-academic'
  }
  localSettings.value = { ...defaults }
  emit('reset')
  emit('save', localSettings.value)
}

const handleEscape = (e) => {
  if (e.key === 'Escape' && props.isOpen) {
    close()
  }
}

const handleClickOutside = (e) => {
  if (isFontDropdownOpen.value) {
    const wrapper = document.querySelector('.font-select-wrapper')
    if (wrapper && !wrapper.contains(e.target)) {
      isFontDropdownOpen.value = false
    }
  }
}

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    localSettings.value = { ...props.settings }
    isFontDropdownOpen.value = false
  }
})

watch(() => props.settings, (newVal) => {
  if (props.isOpen) {
    localSettings.value = { ...newVal }
  }
}, { deep: true })

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  document.addEventListener('keydown', handleEscape)
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkMobile)
  document.removeEventListener('keydown', handleEscape)
  document.removeEventListener('click', handleClickOutside)
  if (fontSizeTimeout) clearTimeout(fontSizeTimeout)
})
</script>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.25s ease;
}

.animate-slideUp {
  animation: slideUp 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.animate-slideDown {
  animation: slideDown 0.2s ease;
}

.scrollbar-thin::-webkit-scrollbar {
  width: 4px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.08);
  border-radius: 20px;
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.15);
}

.scrollbar-thin {
  scrollbar-width: thin;
}

input[type="checkbox"],
input[type="radio"] {
  accent-color: #6366F1;
}

@media (max-width: 768px) {
  .w-\[92\%\] {
    width: 92%;
  }

  .max-h-\[90vh\] {
    max-height: 90vh;
  }

  .rounded-xl {
    border-radius: 16px;
  }
}

button {
  transition: all 0.2s ease;
}

.font-dropdown::-webkit-scrollbar {
  width: 4px;
}

.font-dropdown::-webkit-scrollbar-track {
  background: transparent;
}

.font-dropdown::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.08);
  border-radius: 20px;
}

.preview-romanization {
  transition: all 0.2s ease;
}

@media (max-width: 480px) {
  .preview-container {
    padding: 12px;
  }
}
</style>