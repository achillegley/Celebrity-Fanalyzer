<template>
  <TheHeader title="Admin Panel">
    <q-btn v-if="userStore.isAdvertiser || userStore.isAdmin" color="primary" @click="openAdvertiseDialog">Add Advertise</q-btn>
    <q-btn-dropdown
      auto-close
      data-test="button-dropdown"
      color="primary"
      dropdown-icon="control_point"
      flat
      rounded
      transition-show="jump-down"
      transition-hide="jump-up"
    >
      <q-list style="min-width: 100px">
        <q-item
          v-if="userStore.isEditorOrAbove"
          clickable
          :data-test="promptStore.isLoading || entryStore.isLoading ? '' : 'prompt-dropdown'"
          @click="openPromptDialog()"
        >
          <q-item-section>New Prompt</q-item-section>
        </q-item>
        <q-item
          v-if="userStore.isWriterOrAbove"
          clickable
          :data-test="promptStore.isLoading || entryStore.isLoading ? '' : 'entry-dropdown'"
          @click="openEntryDialog()"
        >
          <q-item-section>New Entry</q-item-section>
        </q-item>
        <!-- <q-item v-if="userStore.isAdvertiser || userStore.isAdmin" color="primary" clickable @click="openAdvertiseDialog">
          <q-item-section>New Advertise</q-item-section>
        </q-item> -->
      </q-list>
    </q-btn-dropdown>
  </TheHeader>
  <q-page-container>
    <q-page class="absolute q-pt-sm q-pb-xl window-width" style="left: 0">
      <q-tabs active-color="primary" align="justify">
        <q-route-tab
          v-if="userStore.isEditorOrAbove"
          data-test="posts-tab"
          name="prompts"
          icon="view_list"
          label="Prompts & Entries"
          :to="{ name: 'admin.prompts' }"
        />
        <q-route-tab
          v-if="userStore.isAdmin"
          data-test="users-tab"
          name="users"
          :to="{ name: 'admin.users' }"
          icon="people"
          label="Users"
        />
        <q-route-tab
          v-if="userStore.isAdvertiser || userStore.isAdmin"
          name="advertises"
          :to="{ name: 'admin.advertises' }"
          icon="campaign"
          label="Advertises"
        />
        <q-route-tab
          v-if="userStore.isEditorOrAbove"
          data-test="feedbacks-tab"
          name="feedbacks"
          icon="feedback"
          label="Feedbacks"
          :to="{ name: 'admin.feedbacks' }"
          exact
        />

        <q-route-tab
          v-if="userStore.isAdmin"
          :to="{ name: 'admin.errors' }"
          exact
          data-test="errors-tab"
          name="errors"
          icon="error"
          label="Errors"
        />

        <q-route-tab
          v-if="userStore.isEditorOrAbove"
          data-test="reports-tab"
          name="reports"
          icon="report"
          label="Reports"
          :to="{ name: 'admin.reports' }"
        />
      </q-tabs>

      <q-dialog full-width position="bottom" v-model="prompt.dialog">
        <PromptCard v-bind="prompt" @hideDialog="prompt = {}" />
      </q-dialog>

      <q-dialog full-width position="bottom" v-model="entry.dialog">
        <EntryCard v-bind="entry" @hideDialog="entry = {}" />
      </q-dialog>

      <q-dialog class="min-" position="bottom" v-model="advertise.dialog">
        <AdvertiseCard v-bind="advertise" @hideDialog="advertise = {}" />
      </q-dialog>

      <router-view @openPromptDialog="openPromptDialog" @openAdvertiseDialog="openAdvertiseDialog" />
    </q-page>
  </q-page-container>
</template>

<script setup>
import EntryCard from 'src/components/Admin/EntryCard.vue'
import PromptCard from 'src/components/Admin/PromptCard.vue'
import AdvertiseCard from 'src/components/Advertiser/AdvertiseCard.vue'
import TheHeader from 'src/components/shared/TheHeader.vue'
import { useEntryStore, usePromptStore, useRequestStore, useUserStore, useAdvertiseStore } from 'src/stores'
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const requestStore = useRequestStore()
const userStore = useUserStore()

const entry = ref({})
const prompt = ref({})
const advertise = ref({})
const tab = ref('posts')
const entryStore = useEntryStore()
const promptStore = usePromptStore()
const advertiseStore = useAdvertiseStore()
const currentPath = ref('')

const router = useRouter()
const route = useRoute()
onMounted(() => {
  userStore.fetchUsers()
  requestStore.readRequests()
  advertiseStore.fetchAdvertises().catch((error) => console.log(error))

  currentPath.value = router.currentRoute.value.path
  const adminTab = document.querySelector('.adminTab')
  const activeHomeTab = document.querySelector('[href="/"]')
  const handleHomeTabClasses = () => {
    activeHomeTab?.classList.remove('q-tab--active')
    activeHomeTab?.classList.remove('text-primary')
    activeHomeTab?.classList.add('q-tab--inactive')
  }
  if (router.currentRoute.value.fullPath.includes('/admin')) {
    setTimeout(() => {
      handleHomeTabClasses()
    }, 400)

    if (adminTab) {
      adminTab?.classList.add('admin_tab', 'cursor-pointer', 'q-router-link--active')
      adminTab?.classList.replace('q-tab--inactive', 'q-tab--active')
    }
  }

  watch(route, () => {
    if (router.currentRoute.value.fullPath.includes('/admin')) {
      setTimeout(() => {
        handleHomeTabClasses()
      }, 400)

      if (adminTab) {
        adminTab?.classList.add('admin_tab', 'cursor-pointer', 'q-router-link--active')
        adminTab?.classList.replace('q-tab--inactive', 'q-tab--active')
      }
    } else {
      activeHomeTab?.classList.remove('q-tab--inactive')
      adminTab?.classList.remove('admin_tab', 'cursor-pointer', 'q-router-link--active')
      adminTab?.classList.replace('q-tab--active', 'q-tab--inactive')
    }
  })
})

function openPromptDialog(props) {
  prompt.value = props?.id ? props : {}
  prompt.value.dialog = true
}

function openEntryDialog() {
  entry.value = {}
  entry.value.dialog = true
}
function openAdvertiseDialog(props) {
  advertise.value = props?.id ? props : {}
  advertise.value.dialog = true
}
</script>
