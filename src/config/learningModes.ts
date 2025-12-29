// Learning Mode Configuration
// Supports multi-language and exam-specific modes

export type LearningModeCategory = 'universal' | 'exam' | 'advanced';

export interface LearningModeConfig {
  id: string;
  icon: string;
  label: string;
  category: LearningModeCategory;
  supportedLanguages?: string[]; // undefined = all languages, specific array = only those languages
  description?: string;
}

// 🌍 LEARNING MODES - Dynamically filtered by target language
export const LEARNING_MODES: LearningModeConfig[] = [
  // ============================================
  // UNIVERSAL MODES (All languages)
  // ============================================
  {
    id: 'translation',
    icon: '📝',
    label: 'Translation Mode',
    category: 'universal',
    description: 'Translate between your native and target language',
  },
  {
    id: 'conversation',
    icon: '💬',
    label: 'Conversation Mode',
    category: 'universal',
    description: 'Have natural conversations with the avatar',
  },
  {
    id: 'correction',
    icon: '✏️',
    label: 'Sentence Correction',
    category: 'universal',
    description: 'Get grammar and style corrections',
  },
  {
    id: 'wordofday',
    icon: '📚',
    label: 'Word of the Day',
    category: 'universal',
    description: 'Learn a new word every day',
  },
  {
    id: 'flashcard',
    icon: '🃏',
    label: 'Flashcard Mode',
    category: 'universal',
    description: 'Practice vocabulary with flashcards',
  },
  {
    id: 'quiz',
    icon: '🎯',
    label: 'Grammar Quiz',
    category: 'universal',
    description: 'Test your grammar knowledge',
  },
  {
    id: 'roleplay',
    icon: '🎭',
    label: 'Role-Play Scenarios',
    category: 'universal',
    description: 'Practice real-world situations',
  },
  {
    id: 'listening',
    icon: '👂',
    label: 'Listening Comprehension',
    category: 'universal',
    description: 'Improve listening skills with stories',
  },

  // ============================================
  // EXAM MODES - English (IELTS, TOEFL)
  // ============================================
  {
    id: 'ielts-speaking',
    icon: '🎓',
    label: 'IELTS Speaking',
    category: 'exam',
    supportedLanguages: ['en'],
    description: 'Prepare for IELTS Speaking (4 parts)',
  },
  {
    id: 'toefl-speaking',
    icon: '📚',
    label: 'TOEFL Speaking',
    category: 'exam',
    supportedLanguages: ['en'],
    description: 'Prepare for TOEFL Speaking (4 tasks)',
  },

  // ============================================
  // EXAM MODES - German (TestDaF, Goethe, telc)
  // ============================================
  {
    id: 'testdaf',
    icon: '🎓',
    label: 'TestDaF',
    category: 'exam',
    supportedLanguages: ['de'],
    description: 'Prepare for TestDaF exam',
  },
  {
    id: 'goethe',
    icon: '📜',
    label: 'Goethe Zertifikat',
    category: 'exam',
    supportedLanguages: ['de'],
    description: 'Prepare for Goethe certification',
  },
  {
    id: 'telc',
    icon: '✍️',
    label: 'telc Deutsch',
    category: 'exam',
    supportedLanguages: ['de'],
    description: 'Prepare for telc German exam',
  },

  // 🆕 Future: Add more exam modes for other languages
  // Spanish: DELE, SIELE
  // French: DELF, DALF, TCF
  // etc.
];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get learning modes filtered by target language
 * @param targetLanguage - ISO 639-1 code (e.g., 'en', 'de', 'tr')
 * @returns Filtered list of available modes
 */
export function getAvailableModes(targetLanguage: string): LearningModeConfig[] {
  return LEARNING_MODES.filter(
    (mode) =>
      mode.supportedLanguages === undefined || // Universal modes
      mode.supportedLanguages.includes(targetLanguage) // Language-specific modes
  );
}

/**
 * Get mode configuration by ID
 * @param modeId - Mode identifier
 * @returns Mode config or undefined
 */
export function getModeById(modeId: string): LearningModeConfig | undefined {
  return LEARNING_MODES.find((mode) => mode.id === modeId);
}

/**
 * Get modes by category
 * @param category - 'universal' | 'exam' | 'advanced'
 * @returns Modes in that category
 */
export function getModesByCategory(category: LearningModeCategory): LearningModeConfig[] {
  return LEARNING_MODES.filter((mode) => mode.category === category);
}

/**
 * Get exam modes for a specific language
 * @param language - ISO 639-1 code
 * @returns Exam modes for that language
 */
export function getExamModes(language: string): LearningModeConfig[] {
  return LEARNING_MODES.filter(
    (mode) =>
      mode.category === 'exam' &&
      mode.supportedLanguages?.includes(language)
  );
}
