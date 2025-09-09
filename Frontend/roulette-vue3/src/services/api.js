import axios from 'axios'

// Configuración base de Axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para logging de requests
api.interceptors.request.use(
  config => {
    console.log(`🌐 API Request: ${config.method.toUpperCase()} ${config.url}`)
    return config
  },
  error => {
    console.error('❌ Request Error:', error)
    return Promise.reject(error)
  }
)

// Interceptor para manejo de responses
api.interceptors.response.use(
  response => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`)
    return response
  },
  error => {
    console.error('❌ Response Error:', error)
    
    // Manejo específico de errores HTTP
    if (error.response) {
      const { status, data } = error.response
      console.error(`HTTP ${status}:`, data)
      
      switch (status) {
        case 404:
          throw new Error('RESOURCE_NOT_FOUND')
        case 400:
          throw new Error('BAD_REQUEST')
        case 500:
          throw new Error('SERVER_ERROR')
        default:
          throw new Error(`HTTP_ERROR_${status}`)
      }
    } else if (error.request) {
      throw new Error('NETWORK_ERROR')
    } else {
      throw new Error('REQUEST_SETUP_ERROR')
    }
  }
)

/**
 * API Service para el juego de ruleta
 */
export const rouletteAPI = {
  /**
   * Gira la ruleta y obtiene resultado aleatorio
   * @returns {Promise<{number: number, color: string}>}
   */
  async spin() {
    try {
      const response = await api.get('/roulette/spin')
      return response.data
    } catch (error) {
      throw new Error('ERROR_SPINNING_ROULETTE')
    }
  },

  /**
   * Calcula el premio según la apuesta realizada
   * @param {Object} betData - Datos de la apuesta
   * @returns {Promise<{prize: number, won: boolean}>}
   */
  async calculatePrize(betData) {
    try {
      const response = await api.post('/roulette/calculate-prize', betData)
      return response.data
    } catch (error) {
      throw new Error('ERROR_CALCULATING_PRIZE')
    }
  }
}

/**
 * API Service para manejo de usuarios
 */
export const userAPI = {
  /**
   * Obtiene los datos del usuario por nombre
   * @param {string} playerName - Nombre del jugador
   * @returns {Promise<{name: string, balance: number}>}
   */
  async getUser(playerName) {
    try {
      const response = await api.get(`/user/${encodeURIComponent(playerName)}`)
      return response.data
    } catch (error) {
      if (error.message === 'RESOURCE_NOT_FOUND') {
        throw new Error('USER_NOT_FOUND')
      }
      throw new Error('ERROR_LOADING_USER')
    }
  },

  /**
   * Guarda el saldo del usuario (suma o resta el monto)
   * @param {string} name - Nombre del jugador
   * @param {number} amount - Monto a sumar/restar
   * @returns {Promise<Object>}
   */
  async saveBalance(name, amount) {
    try {
      const response = await api.post('/user/save-balance', {
        name,
        amount
      })
      return response.data
    } catch (error) {
      throw new Error('ERROR_SAVING_BALANCE')
    }
  }
}

/**
 * Funciones de fallback para modo offline/testing
 */
export const fallbackAPI = {
  /**
   * Genera resultado aleatorio de ruleta
   */
  generateRouletteResult() {
    const number = Math.floor(Math.random() * 37) // 0-36
    const color = Math.random() < 0.5 ? 'red' : 'black'
    return { number, color }
  },

  /**
   * Calcula premio localmente según las reglas del juego
   */
  calculatePrizeLocal(betData, result) {
    let prize = 0
    
    switch (betData.betType) {
      case 'color':
        // Si acierta color: gana 50% de la apuesta
        if (result.color === betData.color) {
          prize = betData.betAmount * 0.5
        }
        break
        
      case 'parity':
        // Si acierta par/impar del color: gana 100% de la apuesta
        const isEven = result.number % 2 === 0
        const betIsEven = betData.parity === 'even'
        if (result.color === betData.color && isEven === betIsEven) {
          prize = betData.betAmount
        }
        break
        
      case 'specific':
        // Si acierta número y color específico: gana 300% de la apuesta
        if (result.number === betData.number && result.color === betData.color) {
          prize = betData.betAmount * 3
        }
        break
    }
    
    return { prize, won: prize > 0 }
  },

  /**
   * Manejo local de usuarios (localStorage)
   */
  localStorage: {
    saveUser(name, balance) {
      const userData = {
        name: name.toLowerCase(),
        balance: balance,
        lastSaved: new Date().toISOString()
      }
      localStorage.setItem(`roulette_user_${name.toLowerCase()}`, JSON.stringify(userData))
    },

    getUser(name) {
      const data = localStorage.getItem(`roulette_user_${name.toLowerCase()}`)
      return data ? JSON.parse(data) : null
    },

    clearUser(name) {
      localStorage.removeItem(`roulette_user_${name.toLowerCase()}`)
    }
  }
}