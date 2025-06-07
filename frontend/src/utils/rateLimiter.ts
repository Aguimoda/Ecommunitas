import axios from 'axios'
import { ref } from 'vue'
import { displayError } from '@/shared/utils/errorHandler'

type RateLimitConfig = {
  maxRequests: number
  perMilliseconds: number
  retryAfterHeader?: string
  onRateLimited?: () => void
}

type QueuedRequest = {
  config: any
  resolve: (value: any) => void
  reject: (reason?: any) => void
}

// const toast = useToast()
const isRateLimited = ref(false)
const retryAfter = ref(0)
const queue: QueuedRequest[] = []
const activeRequests = ref(0)
const lastRequestTime = ref(0)
const requestCount = ref(0)

const rateLimiter = (config: RateLimitConfig) => {
  const { maxRequests, perMilliseconds, retryAfterHeader = 'retry-after', onRateLimited } = config
  
  const processQueue = () => {
    if (queue.length === 0 || activeRequests.value >= maxRequests) return
    
    const now = Date.now()
    if (now - lastRequestTime.value < perMilliseconds) {
      setTimeout(processQueue, perMilliseconds - (now - lastRequestTime.value))
      return
    }
    
    activeRequests.value++
    requestCount.value++
    lastRequestTime.value = now
    
    const { config: requestConfig, resolve, reject } = queue.shift()!
    
    axios(requestConfig)
      .then(response => {
        resolve(response)
        activeRequests.value--
        processQueue()
      })
      .catch(error => {
        if (error.response?.status === 429) {
          const waitTime = parseInt(error.response.headers[retryAfterHeader]) || 60
          retryAfter.value = waitTime
          isRateLimited.value = true
          
          if (onRateLimited) onRateLimited()
          
          displayError(`Demasiadas solicitudes. Intenta nuevamente en ${waitTime} segundos`)
          
          setTimeout(() => {
            isRateLimited.value = false
            retryAfter.value = 0
            processQueue()
          }, waitTime * 1000)
        } else {
          reject(error)
        }
        activeRequests.value--
      })
  }
  
  return {
    request: async (config: any) => {
      return new Promise((resolve, reject) => {
        queue.push({ config, resolve, reject })
        processQueue()
      })
    },
    isRateLimited,
    retryAfter,
    getQueueSize: () => queue.length,
    getActiveRequests: () => activeRequests.value,
    getRequestCount: () => requestCount.value
  }
}

export default rateLimiter