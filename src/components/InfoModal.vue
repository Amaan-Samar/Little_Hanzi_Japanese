<!-- components/InfoModal.vue -->
<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-[2000] flex items-center justify-center bg-black/5 backdrop-blur-md animate-fadeIn" @click="close">
      <div class="relative bg-white/85 backdrop-blur-xl rounded-2xl w-[90%] max-w-[600px] max-h-[90vh] flex flex-col animate-slideUp border border-white/50 shadow-2xl" @click.stop>
        
        <!-- Close Button -->
        <button class="absolute -top-2.5 -right-2.5 w-8 h-8 rounded-full bg-white border border-black/5 cursor-pointer flex items-center justify-center transition-all duration-200 hover:scale-110 hover:bg-gray-50 hover:border-black/10 text-gray-400 hover:text-gray-600 shadow-md hover:shadow-lg z-10" @click="close">
          <X :size="16" />
        </button>

        <div class="flex-1 overflow-y-auto p-6 pb-8 scrollbar-thin scrollbar-thumb-gray-200/50 scrollbar-track-transparent">
          
          <!-- App Info -->
          <div class="mb-6">
            <h2 class="text-xl font-bold text-gray-800 mb-2">About LittleHanzi Japanese</h2>
            <p class="text-sm text-gray-600 leading-relaxed">
              A tool for learning Japanese through reading. Paste Japanese text and get instant 
              romanization and English translations to help you read and understand better.
            </p>
          </div>

          <!-- App Link -->
          <div class="mb-6 bg-gradient-to-br from-purple-50/50 to-blue-50/50 rounded-xl p-4 border border-purple-100/50">
            <label class="block text-[11px] font-semibold text-purple-600 uppercase tracking-wider mb-2">App URL</label>
            <a 
              href="https://amaan-samar.github.io/Little_Hanzi_Japanese/"
              target="_blank"
              rel="noopener noreferrer"
              class="block text-sm text-purple-700 hover:text-purple-900 font-medium break-all hover:underline"
            >
              https://amaan-samar.github.io/Little_Hanzi_Japanese/
            </a>
          </div>

          <!-- Learning Resources -->
          <div class="mb-6">
            <label class="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Learning Resources</label>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <a
                v-for="resource in resources"
                :key="resource.name"
                :href="resource.url"
                target="_blank"
                rel="noopener noreferrer"
                class="group block p-4 bg-white border border-black/5 rounded-xl hover:border-purple-200 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
              >
                <div class="flex items-start gap-3">
                  <div class="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors duration-200">
                    <span class="text-lg">{{ resource.icon }}</span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <h4 class="text-sm font-semibold text-gray-800 group-hover:text-purple-700 transition-colors duration-200">
                      {{ resource.name }}
                    </h4>
                    <p class="text-xs text-gray-500 mt-0.5 line-clamp-2">
                      {{ resource.description }}
                    </p>
                  </div>
                </div>
              </a>
            </div>
          </div>

          <!-- Tips -->
          <div class="bg-amber-50/80 rounded-xl p-4 border border-amber-100/50">
            <h4 class="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-2">💡 Tips</h4>
            <ul class="text-sm text-gray-600 space-y-1.5">
              <li class="flex items-start gap-2">
                <span class="text-amber-500 mt-0.5">•</span>
                <span>Paste Japanese text in the left box and English translation below that</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-amber-500 mt-0.5">•</span>
                <span>Adjust font sizes and display settings using the Settings gear icon</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-amber-500 mt-0.5">•</span>
                <span>Your articles are automatically saved in History for later reading</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { X } from 'lucide-vue-next'

const emit = defineEmits(['close'])

const resources = [
  {
    name: 'Jisho.org',
    icon: '📖',
    url: 'https://jisho.org/',
    description: 'The most popular free Japanese-English dictionary with kanji lookup, example sentences, and romaji search.'
  },
  {
    name: 'Kanshudo',
    icon: '🎓',
    url: 'https://www.kanshudo.com/',
    description: 'Comprehensive Japanese learning platform with kanji mnemonics, grammar guides, and reading practice.'
  },
  {
    name: 'Tae Kim\'s Guide to Japanese Grammar',
    icon: '📝',
    url: 'https://guidetojapanese.org/learn/',
    description: 'Free, well-structured grammar guide from beginner to intermediate, with clear explanations.'
  },
  {
    name: 'Aozora Bunko',
    icon: '📚',
    url: 'https://www.aozora.gr.jp/',
    description: 'Free digital library of public-domain Japanese literature — ideal for reading practice with your app.'
  },
  {
    name: 'WaniKani',
    icon: '🈴',
    url: 'https://www.wanikani.com/',
    description: 'Spaced-repetition kanji learning system (free for first 3 levels).'
  },
  {
    name: 'NHK Easy News',
    icon: '📰',
    url: 'https://www3.nhk.or.jp/news/easy/',
    description: 'Daily news rewritten in simple Japanese with furigana, perfect for intermediate readers.'
  }
];

const close = () => {
  emit('close')
}
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

.animate-fadeIn {
  animation: fadeIn 0.25s ease;
}

.animate-slideUp {
  animation: slideUp 0.35s cubic-bezier(0.4, 0, 0.2, 1);
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

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>