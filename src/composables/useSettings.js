// composables/useSettings.js
import { ref, watch } from 'vue'

const STORAGE_KEY = 'littleJapanese_settings'

export function useSettings() {
  const loadSettings = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        return {
          fontSize: parsed.fontSize ?? 18,
          selectedFont: parsed.selectedFont ?? 'NotoSansJP',
          showRomanization: parsed.showRomanization ?? true,
          showJapanese: parsed.showJapanese ?? true,
          showEnglish: parsed.showEnglish ?? true,
          displayOrder: parsed.displayOrder ?? 'ja-en',
          romanizationFontSize: parsed.romanizationFontSize ?? 10,
          englishFontSize: parsed.englishFontSize ?? 14,
          romajiSystem: parsed.romajiSystem ?? 'hepburn'
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
    selectedFont: 'NotoSansJP',
    showRomanization: true,
    showJapanese: true,
    showEnglish: true,
    displayOrder: 'ja-en',
    romanizationFontSize: 10,
    englishFontSize: 14,
    romajiSystem: 'hepburn'
  }

  const savedSettings = loadSettings()

  const fontSize = ref(savedSettings?.fontSize ?? defaultSettings.fontSize)
  const selectedFont = ref(savedSettings?.selectedFont ?? defaultSettings.selectedFont)
  const showRomanization = ref(savedSettings?.showRomanization ?? defaultSettings.showRomanization)
  const showJapanese = ref(savedSettings?.showJapanese ?? defaultSettings.showJapanese)
  const showEnglish = ref(savedSettings?.showEnglish ?? defaultSettings.showEnglish)
  const displayOrder = ref(savedSettings?.displayOrder ?? defaultSettings.displayOrder)
  const romanizationFontSize = ref(savedSettings?.romanizationFontSize ?? defaultSettings.romanizationFontSize)
  const englishFontSize = ref(savedSettings?.englishFontSize ?? defaultSettings.englishFontSize)
  const romajiSystem = ref(savedSettings?.romajiSystem ?? defaultSettings.romajiSystem)

  const saveCurrentSettings = () => {
    saveSettings({
      fontSize: fontSize.value,
      selectedFont: selectedFont.value,
      showRomanization: showRomanization.value,
      showJapanese: showJapanese.value,
      showEnglish: showEnglish.value,
      displayOrder: displayOrder.value,
      romanizationFontSize: romanizationFontSize.value,
      englishFontSize: englishFontSize.value,
      romajiSystem: romajiSystem.value
    })
  }

  watch([
    fontSize, selectedFont, showRomanization, showJapanese, showEnglish,
    displayOrder, romanizationFontSize, englishFontSize, romajiSystem
  ], () => {
    saveCurrentSettings()
  }, { deep: true })

  const resetSettings = () => {
    fontSize.value = defaultSettings.fontSize
    selectedFont.value = defaultSettings.selectedFont
    showRomanization.value = defaultSettings.showRomanization
    showJapanese.value = defaultSettings.showJapanese
    showEnglish.value = defaultSettings.showEnglish
    displayOrder.value = defaultSettings.displayOrder
    romanizationFontSize.value = defaultSettings.romanizationFontSize
    englishFontSize.value = defaultSettings.englishFontSize
    romajiSystem.value = defaultSettings.romajiSystem
  }

  return {
    fontSize,
    selectedFont,
    showRomanization,
    showJapanese,
    showEnglish,
    displayOrder,
    romanizationFontSize,
    englishFontSize,
    romajiSystem,
    resetSettings,
    saveCurrentSettings
  }
}