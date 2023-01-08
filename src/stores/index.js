import { createPinia } from 'pinia'
import { store } from 'quasar/wrappers'
import { useAuthStore } from './auth'
import { useCommentStore } from './comments'
import { useEntryStore } from './entries'
import { usePromptStore } from './prompts'
import { useStatStore } from './stats'
import { useUserStore } from './user'
/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Store instance.
 */

export default store((/* { ssrContext } */) => {
  const pinia = createPinia()

  // You can add Pinia plugins here
  // pinia.use(SomePiniaPlugin)

  return pinia
})

export { useAuthStore, useCommentStore, useEntryStore, usePromptStore, useStatStore, useUserStore }
