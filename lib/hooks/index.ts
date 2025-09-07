// Authentication hooks
export { useAuth } from './use-auth';

// Data fetching hooks
export { usePageData, getServerSidePageData } from './use-page-data';

// Learning functionality hooks
export { useLearning } from './use-learning';

// Audio functionality hooks
export { useAudio, useSimpleAudio } from './use-audio';

// Local storage hooks
export {
  useLocalStorage,
  useLocalStorageState,
  useLocalStorageBoolean,
  useLocalStorageNumber,
  useLocalStorageString,
  useLocalStorageArray,
  useLocalStorageObject,
  useLocalStorageManager,
  useTutorialState,
  useUserPreferences
} from './use-local-storage';

// Re-export types from individual hook files
export type {
  UseAuthOptions,
  UseAuthReturn
} from './use-auth';

export type {
  UsePageDataOptions,
  UsePageDataReturn
} from './use-page-data';