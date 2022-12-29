import {
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  setDoc,
  Timestamp,
  updateDoc,
  where
} from 'firebase/firestore'
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { defineStore } from 'pinia'
import { LocalStorage } from 'quasar'
import { db, storage } from 'src/firebase'
import { useUserStore } from 'src/stores'
import sha1 from 'sha1'

export const usePromptStore = defineStore('prompts', {
  state: () => ({
    _isLoading:   false,
    _monthPrompt: null,
    _isLoaded:    false,
    _prompts:     []
  }),

  getters: {
    getMonthPrompt:  (state) => LocalStorage.getItem('monthPrompt') || state._monthPrompt,
    getPromptRef:    () => (id) => doc(db, 'prompts', id),
    getPrompts:      (state) => state._prompts,
    getPromptById:   (state) => (promptId) => {
      if (state._prompts !== []) return state._prompts.find((prompt) => prompt.id === promptId)
      return {}
    },
    getPromptBySlug: (state) => (promptSlug) => {
      if (state._prompts !== []) return state._prompts.find((prompt) => prompt.slug === promptSlug)
      return {}
    },
    isLoading:       (state) => state._isLoading
  },

  actions: {
    async fetchMonthPrompt() {
      // TODO check if we already have a monthPrompt and if it's updated before all
      this._isLoading = true
      const monthId = `${new Date().getFullYear()}-${new Date().getMonth()}`

      // TODO improve the use of the local storage
      // TODO Check the local storage before fetchMonthPrompt
      // TODO try to fetch prompt by id if we still don't have data after fetchPrompt
      if (this._isLoaded === false) {
        await this.fetchPrompts().then(() => this.fetchMonthPrompt())
      }
      if (this._isLoaded === true && this._prompts !== []) {
        // set the current month Prompt
        this._monthPrompt = this._prompts.find((prompt) => {
          return prompt.id === monthId
        })

        // Load Current Month Entries
        if (this._monthPrompt && !this._monthPrompt.isEntriesFetched) {
          await this.fetchPromptEntry(this._monthPrompt.id).then(() => this.fetchMonthPrompt())
        }
      }
      this._isLoading = false
    },
    /**
     * Fetch prompt By id if it's not exist or reload it if it's exist
     * @param id
     * @returns {Promise<boolean>}
     */
    async fetchPromptById(id) {
      this._isLoading = true
      return await getDoc(doc(db, 'prompts', id))
        .then(async (doc) => {
          if (doc.data === undefined) {
            throw new Error('Document not found.')
          }
          const prompt = { id: doc.id, ...doc.data() }
          const localPrompt = this.getPromptById(prompt.id)
          if (!localPrompt) {
            prompt.author = await getDoc(prompt.author).then((doc) => doc.data())
            if (prompt.entries?.length) {
              for (const index in prompt.entries) {
                prompt.entries[index] = await getDoc(prompt.entries[index]).then((doc) => doc.data())
                prompt.entries[index].author = await getDoc(prompt.entries[index].author).then((doc) => doc.data())
              }
            }
            const index = this._prompts.findIndex((_prompt) => _prompt.id === prompt.id)
            this._prompts[index] = prompt
          } else {
            const newPrompt = { ...prompt, ...{ entries: localPrompt.entries, author: localPrompt.author } }
            const index = this._prompts.findIndex((_prompt) => _prompt.id === prompt.id)
            this._prompts[index] = newPrompt
          }
          // await this.fetchPromptEntry(id)
          return prompt
        })
        .catch((err) => {
          throw new Error(err)
        })
        .finally(() => (this._isLoading = false))
    },

    async fetchPromptsByYear(year) {
      const q = query(collection(db, 'prompts'), where('date', '>=', `${year}-01-01`), where('date', '<=', `${year}-12-31`))

      this._isLoading = true
      return await getDocs(q)
        .then(async (querySnapshot) => {
          const prompts = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

          for (const prompt of prompts) {
            prompt.author = await getDoc(prompt.author).then((doc) => doc.data())
          }

          prompts.reverse()

          return prompts
        })
        .catch((error) => {
          console.error(error)
          throw new Error(error)
        })
        .finally(() => (this._isLoading = false))
    },

    async fetchPrompts() {
      // TODO check if we have data updated before  all
      this._isLoading = true
      if (this._isLoaded === false) {
        await getDocs(collection(db, 'prompts'))
          .then(async (querySnapshot) => {
            const prompts = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data(), isEntriesFetched: false }))

            for (const prompt of prompts) {
              prompt.author = await getDoc(prompt.author).then((doc) => doc.data())
            }

            prompts.reverse()

            this._prompts = []
            this.$patch({ _prompts: prompts })
          })
          .catch((error) => {
            console.error(error)
            throw new Error(error)
          })
          .finally(() => {
            this._isLoading = false
            this._isLoaded = true
          })
      } else {
        this._isLoading = false
      }
    },

    async fetchPromptEntry(promptId) {
      this._isLoading = true
      let currentPrompt = this.getPromptById(promptId)

      // TODO: improve by saving entries in the entry store
      if (currentPrompt.entries && currentPrompt.isEntriesFetched === false) {
        for (const index in currentPrompt.entries) {
          currentPrompt.entries[index] = await getDoc(currentPrompt.entries[index]).then((doc) => doc.data())
          currentPrompt.entries[index].author = await getDoc(currentPrompt.entries[index].author).then((doc) => doc.data())
        }

        // Confirm that this Prompt Entry is fetched
        currentPrompt.isEntriesFetched = true

        // Update the current Prompt in the prompt list
        const promptIndex = this._prompts.findIndex((prompt) => prompt.id === promptId)
        this._prompts[promptIndex] = currentPrompt
      }
      this._isLoading = false
    },

    async fetchPromptsAndEntries() {
      this._isLoading = true
      await getDocs(collection(db, 'prompts'))
        .then(async (querySnapshot) => {
          const prompts = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

          for (const prompt of prompts) {
            prompt.author = await getDoc(prompt.author).then((doc) => doc.data())

            if (prompt.entries) {
              for (const index in prompt.entries) {
                prompt.entries[index] = await getDoc(prompt.entries[index]).then((doc) => doc.data())
                prompt.entries[index].author = await getDoc(prompt.entries[index].author).then((doc) => doc.data())
              }
            }
          }

          prompts.reverse()

          this._prompts = []
          this.$patch({ _prompts: prompts })
        })
        .catch((error) => {
          console.error(error)
          throw new Error(error)
        })
        .finally(() => (this._isLoading = false))
    },

    async addPrompt(prompt) {
      const userStore = useUserStore()

      prompt.author = userStore.getUserRef
      prompt.created = Timestamp.fromDate(new Date())

      this._isLoading = true
      await setDoc(doc(db, 'prompts', prompt.date), prompt)
        .then(() => {
          this.$patch({ _prompts: [...this.getPrompts, prompt] })
        })
        .catch((error) => {
          console.error(error)
          throw new Error(error)
        })
        .finally(() => (this._isLoading = false))
    },

    async editPrompt(prompt) {
      this._isLoading = true
      await runTransaction(db, async (transaction) => {
        transaction.update(doc(db, 'prompts', prompt.id), { ...prompt })
      })
        .then(() => {
          const index = this.getPrompts.findIndex((p) => p.id === prompt.id)
          this.$patch({
            _prompts: [...this._prompts.slice(0, index), { ...this._prompts[index], ...prompt }, ...this._prompts.slice(index + 1)]
          })
        })
        .catch((error) => {
          console.error(error)
          throw new Error(error)
        })
        .finally(() => (this._isLoading = false))
    },

    async deletePrompt(id) {
      this._isLoading = true
      const localPrompt = this._prompts.find((prompt) => prompt.id === id)
      const imageRef = ref(storage, `images/${localPrompt.image.slice(86, 133)}`)
      const deleteImage = await deleteObject(imageRef)
      const deletePrompt = await deleteDoc(doc(db, 'prompts', id))
      Promise.all([deleteImage, deletePrompt])
        .then(() => {
          const index = this._prompts.findIndex((prompt) => prompt.id === id)
          this._prompts.splice(index, 1)
        })
        .catch((error) => {
          console.error(error)
          throw new Error(error)
        })
        .finally(() => (this._isLoading = false))
    },

    async updateEntryField(promptId, entryRef) {
      this._isLoading = true
      await updateDoc(doc(db, 'prompts', promptId), {
        entries: arrayUnion(entryRef)
      })
        .then(() => this.fetchPromptById(promptId))
        .catch((error) => {
          console.error(error)
          throw new Error(error)
        })
        .finally(() => (this._isLoading = false))
    },

    async uploadImage(file) {
      const storageRef = ref(storage, `images/prompt-${sha1(file.name + Date.now())}`)
      await uploadBytes(storageRef, file).finally(() => (this._isLoading = false))
      return getDownloadURL(ref(storage, storageRef))
    },

    async addLike(id) {
      this._isLoading = true

      // Export reused peace of code that create and save a prompt like
      async function createAndSaveLike() {
        await updateDoc(doc(db, 'prompts', id), {
          likes: arrayUnion({
            user: useUserStore().getUser.uid,
            status: true,
            createdAt: Date.now(),
            updatedAd: Date.now()
          })
        }).then(async () => {
          await this.fetchPromptById(id)
        })
      }

      // First load prompt stored in the store
      const prompt = this.getPromptById(id)


      if (prompt.likes) {
        let userLike = prompt.likes.find((like) => like.user === useUserStore().getUser.uid)
        if (userLike && !userLike.status) {
          await updateDoc(doc(db, 'prompts', id), {
            likes: arrayRemove({ ...userLike })
          }).then(async () => {
            await updateDoc(doc(db, 'prompts', id), {
              likes: arrayUnion({ ...userLike, status: true, updatedAd: Date.now() } )
            }).then(async () => {
              await this.fetchPromptById(id)
            })
          })
        }else if (!userLike){
          await createAndSaveLike.call(this);
        }
        if(userLike && userLike.status===true){
          console.info("user already likes it so no update");
        }
      }else{
        await createAndSaveLike.call(this);
      }
      this._isLoading=false
    },

    async addDislike(id) {
      this._isLoading = true

      // Export reused peace of code that create and save a prompt Dislike
      async function createAndSaveDislike() {
        await updateDoc(doc(db, 'prompts', id), {
          likes: arrayUnion({
            user: useUserStore().getUser.uid,
            status: false,
            createdAt: Date.now(),
            updatedAd: Date.now()
          })
        }).then(async () => {
          await this.fetchPromptById(id)
        })
      }


      // First load prompt stored in the store
      const prompt = this.getPromptById(id)

      if (prompt.likes) {
        let userLike = prompt.likes.find((like) => like.user === useUserStore().getUser.uid)
        if (userLike && userLike.status===true) {
          await updateDoc(doc(db, 'prompts', id), {
            likes: arrayRemove({ ...userLike })
          }).then(async () => {
            await updateDoc(doc(db, 'prompts', id), {
              likes: arrayUnion({ ...userLike, status: false, updatedAd: Date.now() })
            }).then(async () => {
              await this.fetchPromptById(id)
            })
          })
        }else if (!userLike){
          await createAndSaveDislike.call(this);
        }
        if(userLike && userLike.status===false){
          console.info("user already Dislike it so no update");
        }
      }else{
        await createAndSaveDislike.call(this);
      }
      this._isLoading = false
    }
  }
})
