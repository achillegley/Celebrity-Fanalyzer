import { addDoc, collection, getDocs, Timestamp } from 'firebase/firestore'
import { defineStore } from 'pinia'
import { Notify } from 'quasar'
import { db } from 'src/firebase'
import { useUserStore } from 'src/stores'

export const useErrorStore = defineStore('errors', {
  state: () => ({
    _errors: [],
    _isLoading: false
  }),

  getters: {
    getErrors: (state) => state._errors,
    isLoading: (state) => state._isLoading
  },

  actions: {
    async fetchErrors() {
      this._isLoading = true
      await getDocs(collection(db, 'errors'))
        .then((querySnapshot) => {
          const errors = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
          this.$patch({ _errors: errors })
        })
        .finally(() => (this._isLoading = false))
    },

    async throwError(error, message) {
      const userStore = useUserStore()
      await userStore.fetchUserIp()

      const err = {
        createdAt: Timestamp.fromDate(new Date()),
        error: error.stack,
        user: userStore.isAuthenticated ? userStore.getUserRef : userStore.getUserIp
      }

      await addDoc(collection(db, 'errors'), err)
        .then(() => console.log('Error stored in database'))
        .catch((e) => console.error(e))
        .finally(() => {
          if (message) {
            Notify.create({ message, type: 'negative' })
          }
          throw new Error(error)
        })
    }
  }
})
