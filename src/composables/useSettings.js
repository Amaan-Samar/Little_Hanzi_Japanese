// composables/useSettings.js
import { ref, watch } from 'vue'

const STORAGE_KEY = 'littleGreek_settings'

export function useSettings() {
  const loadSettings = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        return {
          fontSize: parsed.fontSize ?? 18,
          selectedFont: parsed.selectedFont ?? 'NotoSansSC',
          showRomanization: parsed.showRomanization ?? true,
          showGreek: parsed.showGreek ?? true,
          showEnglish: parsed.showEnglish ?? true,
          displayOrder: parsed.displayOrder === 'en-gr' ? 'en-gr' :
                       parsed.displayOrder === 'gr-en' ? 'gr-en' :
                       parsed.displayOrder ?? 'gr-en',
          romanizationFontSize: parsed.romanizationFontSize ?? 10,
          englishFontSize: parsed.englishFontSize ?? 14,
          // NEW: Greek transliteration preset
          transliterationPreset: parsed.transliterationPreset ?? 'sbl-academic'
        }
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
    }
    return null
  }

  const saveSettings = (settings) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    } catch (error) {
      console.error('Failed to save settings:', error)
    }
  }

  const defaultSettings = {
    fontSize: 18,
    selectedFont: 'NotoSansSC',
    showRomanization: true,
    showGreek: true,
    showEnglish: true,
    displayOrder: 'gr-en',
    romanizationFontSize: 10,
    englishFontSize: 14,
    transliterationPreset: 'sbl-academic'
  }

  const savedSettings = loadSettings()

  const fontSize = ref(savedSettings?.fontSize ?? defaultSettings.fontSize)
  const selectedFont = ref(savedSettings?.selectedFont ?? defaultSettings.selectedFont)
  const showRomanization = ref(savedSettings?.showRomanization ?? defaultSettings.showRomanization)
  const showGreek = ref(savedSettings?.showGreek ?? defaultSettings.showGreek)
  const showEnglish = ref(savedSettings?.showEnglish ?? defaultSettings.showEnglish)
  const displayOrder = ref(savedSettings?.displayOrder ?? defaultSettings.displayOrder)
  const romanizationFontSize = ref(savedSettings?.romanizationFontSize ?? defaultSettings.romanizationFontSize)
  const englishFontSize = ref(savedSettings?.englishFontSize ?? defaultSettings.englishFontSize)
  const transliterationPreset = ref(savedSettings?.transliterationPreset ?? defaultSettings.transliterationPreset)

  const saveCurrentSettings = () => {
    saveSettings({
      fontSize: fontSize.value,
      selectedFont: selectedFont.value,
      showRomanization: showRomanization.value,
      showGreek: showGreek.value,
      showEnglish: showEnglish.value,
      displayOrder: displayOrder.value,
      romanizationFontSize: romanizationFontSize.value,
      englishFontSize: englishFontSize.value,
      transliterationPreset: transliterationPreset.value
    })
  }

  watch([
    fontSize, selectedFont, showRomanization, showGreek, showEnglish,
    displayOrder, romanizationFontSize, englishFontSize, transliterationPreset
  ], () => {
    saveCurrentSettings()
  }, { deep: true })

  const resetSettings = () => {
    fontSize.value = defaultSettings.fontSize
    selectedFont.value = defaultSettings.selectedFont
    showRomanization.value = defaultSettings.showRomanization
    showGreek.value = defaultSettings.showGreek
    showEnglish.value = defaultSettings.showEnglish
    displayOrder.value = defaultSettings.displayOrder
    romanizationFontSize.value = defaultSettings.romanizationFontSize
    englishFontSize.value = defaultSettings.englishFontSize
    transliterationPreset.value = defaultSettings.transliterationPreset
  }

  return {
    fontSize,
    selectedFont,
    showRomanization,
    showGreek,
    showEnglish,
    displayOrder,
    romanizationFontSize,
    englishFontSize,
    transliterationPreset,
    resetSettings,
    saveCurrentSettings
  }
}