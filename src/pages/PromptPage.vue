<template>
  <q-tabs active-color="primary" class="bg-white fixed-bottom tab-selector" dense indicator-color="transparent" v-model="tab">
    <q-tab content-class="q-ml-auto q-py-sm" data-test="prompt-tab" icon="fiber_manual_record" name="post" :ripple="false" />
    <q-tab content-class="q-py-sm" data-test="graph-tab" icon="fiber_manual_record" name="anthrogram" :ripple="false" />
    <q-tab content-class="q-mr-auto q-py-sm" data-test="comments-tab" icon="fiber_manual_record" name="comments" :ripple="false" />
  </q-tabs>
  <q-tab-panels v-if="prompt" animated class="bg-transparent col-grow" swipeable v-model="tab">
    <!-- Panel 1: Prompt -->
    <q-tab-panel name="post" style="padding: 0">
      <ThePost collectionName="prompts" :post="prompt" title="Prompt Page" @clickComments="tab = 'comments'" />
      <TheEntries :entries="entries" ref="entriesRef" />
    </q-tab-panel>
    <!-- Panel 2: Anthrogram -->
    <q-tab-panel name="anthrogram" class="bg-white">
      <TheAnthrogram collectionName="prompts" :post="prompt" />
    </q-tab-panel>
    <!-- Panel 3: Comments -->
    <q-tab-panel name="comments" class="bg-white" v-if="prompt">
      <TheComments collectionName="prompts" :post="prompt" />
    </q-tab-panel>
  </q-tab-panels>

  <q-spinner v-else class="absolute-center" color="primary" size="3em" />
</template>

<script setup>
import TheAnthrogram from 'src/components/Posts/TheAnthrogram.vue'
import TheComments from 'src/components/Posts/TheComments.vue'
import ThePost from 'src/components/Posts/ThePost.vue'
import TheEntries from 'src/components/shared/TheEntries.vue'
import { useCommentStore, useEntryStore, useErrorStore, useLikeStore, usePromptStore, useShareStore } from 'src/stores'
import { currentYearMonth } from 'src/utils/date'
import { computed, onMounted, onUnmounted, ref, watch, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

const router = useRouter()
const $q = useQuasar()
const commentStore = useCommentStore()
const entryStore = useEntryStore()
const errorStore = useErrorStore()
const likeStore = useLikeStore()
const promptStore = usePromptStore()
const shareStore = useShareStore()

const entriesRef = ref(null)

const tab = ref(promptStore.tab)
const shareIsLoading = ref(false)
const shareIsLoaded = ref(false)

const { href, params, path, name } = router.currentRoute.value
const prompt = computed(() => {
  // eslint-disable-next-line vue/no-side-effects-in-computed-properties
  return promptStore.getPrompts
    ?.sort((a, b) => a.id - b.id)
    ?.find((prompt) => {
      switch (name) {
        case 'month':
          return prompt.id <= currentYearMonth()
        case 'year-month':
          return prompt.date === params.year + '-' + params.month
        case 'slug':
          return prompt.slug?.includes(params.slug)
        default:
          return false
      }
    })
})

const entries = computed(() => {
  return entryStore.getEntries?.filter((entry) => entry.prompt?.id === prompt.value?.id)
})

const onScroll = () => {
  if (entriesRef.value) {
    const marginTop = entriesRef.value?.getBoundingClientRect().top
    const windowsHeight = window.innerHeight
    if (!entries.value?.length && marginTop - windowsHeight < -50) {
      entryStore.fetchPromptsEntries(prompt.value.entries).catch((error) => errorStore.throwError(error))
    }
  }
}

watchEffect(async () => {
  if (prompt.value?.id) {
    const promptId = prompt.value?.id
    await likeStore.getAllLikesDislikes('prompts', promptId).catch((error) => errorStore.throwError(error))

    shareIsLoading.value = true
    await shareStore
      .fetchShares('prompts', promptId)
      .catch((error) => errorStore.throwError(error))
      .finally(() => {
        shareIsLoading.value = false
        shareIsLoaded.value = true
      })
  }
})

onMounted(async () => {
  await entryStore.resetEntries
  entriesRef.value = document.querySelector('.entries-page-container')
  window.addEventListener('scroll', onScroll)
})

watch(entriesRef, (newVal) => {
  if (entriesRef.value) {
    if (newVal) {
      entriesRef.value = document.querySelector('.entries-page-container')
    } else {
      console.error('EntriesRef error')
    }
  }
})

onUnmounted(async () => {
  promptStore.setTab('post')
  await likeStore.resetLikes()
  await shareStore.resetShares()
  await commentStore.resetComments()
  window.removeEventListener('scroll', onScroll)
})
</script>

<style scoped lang="scss">
.tab-selector {
  margin-bottom: 4rem;
  z-index: 3;
}
</style>
