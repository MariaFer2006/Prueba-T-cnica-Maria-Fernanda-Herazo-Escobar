/**
 * Lógica del juego de ruleta
 * Contiene todas las reglas de negocio y validaciones
 */

/**
 * Tipos de apuesta disponibles
 */
export const BET_TYPES = {
  COLOR: 'color',
  PARITY: 'parity',
  SPECIFIC: 'specific'
}

/**
 * Colores de la ruleta
 */
export const COLORS = {
  RED: 'red',
  BLACK: 'black'
}

/**
 * Paridades
 */
export const PARITY = {
  EVEN: 'even',
  ODD: 'odd'
}

/**
 * Configuración de premios según tipo de apuesta
 */
export const PRIZE_MULTIPLIERS = {
  [BET_TYPES.COLOR]: 0.5,      // 50% de la apuesta
  [BET_TYPES.PARITY]: 1.0,     // 100% de la apuesta
  [BET_TYPES.SPECIFIC]: 3.0    // 300% de la apuesta
}

/**
 * Configuración del juego
 */
export const GAME_CONFIG = {
  MIN_BET: 1,
  MAX_ROULETTE_NUMBER: 36,
  MIN_ROULETTE_NUMBER: 0,
  DEFAULT_INITIAL_BALANCE: 1000,
  WHEEL_SPIN_DURATION: 3500, // milliseconds
  MESSAGE_TIMEOUT: 8000 // milliseconds
}

/**
 * Valida si un nombre de jugador es válido
 * @param {string} playerName 
 * @returns {Object} {valid: boolean, error: string}
 */
export const validatePlayerName = (playerName) => {
  if (!playerName || typeof playerName !== 'string') {
    return { valid: false, error: 'El nombre del jugador es requerido' }
  }
  
  const trimmed = playerName.trim()
  
  if (trimmed.length < 2) {
    return { valid: false, error: 'El nombre debe tener al menos 2 caracteres' }
  }
  
  if (trimmed.length > 50) {
    return { valid: false, error: 'El nombre no puede tener más de 50 caracteres' }
  }
  
  // Solo letras, números, espacios y algunos caracteres especiales
  const validNameRegex = /^[a-zA-Z0-9\sáéíóúñüÁÉÍÓÚÑÜ._-]+$/
  if (!validNameRegex.test(trimmed)) {
    return { valid: false, error: 'El nombre solo puede contener letras, números y espacios' }
  }
  
  return { valid: true, error: null }
}

/**
 * Valida el saldo inicial
 * @param {number} balance 
 * @returns {Object} {valid: boolean, error: string}
 */
export const validateInitialBalance = (balance) => {
  if (!balance || typeof balance !== 'number' || isNaN(balance)) {
    return { valid: false, error: 'El saldo inicial debe ser un número válido' }
  }
  
  if (balance < GAME_CONFIG.MIN_BET) {
    return { valid: false, error: `El saldo inicial debe ser al menos $${GAME_CONFIG.MIN_BET}` }
  }
  
  if (balance > 1000000) {
    return { valid: false, error: 'El saldo inicial no puede ser mayor a $1,000,000' }
  }
  
  return { valid: true, error: null }
}

/**
 * Valida una apuesta según su tipo
 * @param {Object} bet - Objeto con datos de la apuesta
 * @param {number} currentBalance - Saldo actual del jugador
 * @returns {Object} {valid: boolean, error: string}
 */
export const validateBet = (bet, currentBalance) => {
  const { betType, betAmount, betColor, betParity, betNumber } = bet
  
  // Validar tipo de apuesta
  if (!betType || !Object.values(BET_TYPES).includes(betType)) {
    return { valid: false, error: 'Debe seleccionar un tipo de apuesta válido' }
  }
  
  // Validar monto
  if (!betAmount || typeof betAmount !== 'number' || isNaN(betAmount)) {
    return { valid: false, error: 'El monto de la apuesta debe ser un número válido' }
  }
  
  if (betAmount < GAME_CONFIG.MIN_BET) {
    return { valid: false, error: `El monto mínimo de apuesta es $${GAME_CONFIG.MIN_BET}` }
  }
  
  if (betAmount > currentBalance) {
    return { valid: false, error: 'No tienes saldo suficiente para esta apuesta' }
  }
  
  // Validar color (requerido para todos los tipos)
  if (!betColor || !Object.values(COLORS).includes(betColor)) {
    return { valid: false, error: 'Debe seleccionar un color válido' }
  }
  
  // Validaciones específicas por tipo de apuesta
  switch (betType) {
    case BET_TYPES.COLOR:
      // Solo necesita color (ya validado arriba)
      break
      
    case BET_TYPES.PARITY:
      if (!betParity || !Object.values(PARITY).includes(betParity)) {
        return { valid: false, error: 'Debe seleccionar par o impar' }
      }
      break
      
    case BET_TYPES.SPECIFIC:
      if (!Number.isInteger(betNumber) || 
          betNumber < GAME_CONFIG.MIN_ROULETTE_NUMBER || 
          betNumber > GAME_CONFIG.MAX_ROULETTE_NUMBER) {
        return { 
          valid: false, 
          error: `El número debe ser un entero entre ${GAME_CONFIG.MIN_ROULETTE_NUMBER} y ${GAME_CONFIG.MAX_ROULETTE_NUMBER}` 
        }
      }
      break
      
    default:
      return { valid: false, error: 'Tipo de apuesta no reconocido' }
  }
  
  return { valid: true, error: null }
}

/**
 * Determina si un número de ruleta es par o impar
 * @param {number} number 
 * @returns {string} 'even' o 'odd'
 */
export const getNumberParity = (number) => {
  return number % 2 === 0 ? PARITY.EVEN : PARITY.ODD
}

/**
 * Calcula el premio de una apuesta según las reglas del juego
 * @param {Object} bet - Datos de la apuesta
 * @param {Object} result - Resultado de la ruleta
 * @returns {Object} {prize: number, won: boolean, details: string}
 */
export const calculatePrizeLocal = (bet, result) => {
  const { betType, betAmount, betColor, betParity, betNumber } = bet
  const { number: resultNumber, color: resultColor } = result
  
  let won = false
  let prize = 0
  let details = ''
  
  switch (betType) {
    case BET_TYPES.COLOR:
      won = resultColor === betColor
      if (won) {
        prize = betAmount * PRIZE_MULTIPLIERS[BET_TYPES.COLOR]
        details = `¡Acertaste el color ${betColor}!`
      } else {
        details = `El color fue ${resultColor}, no ${betColor}`
      }
      break
      
    case BET_TYPES.PARITY:
      const resultParity = getNumberParity(resultNumber)
      won = (resultColor === betColor && resultParity === betParity)
      if (won) {
        prize = betAmount * PRIZE_MULTIPLIERS[BET_TYPES.PARITY]
        details = `¡Acertaste ${betParity} en ${betColor}!`
      } else {
        if (resultColor !== betColor) {
          details = `El color fue ${resultColor}, no ${betColor}`
        } else {
          const expectedParity = betParity === PARITY.EVEN ? 'par' : 'impar'
          const actualParity = resultParity === PARITY.EVEN ? 'par' : 'impar'
          details = `El número fue ${actualParity}, no ${expectedParity}`
        }
      }
      break
      
    case BET_TYPES.SPECIFIC:
      won = (resultNumber === betNumber && resultColor === betColor)
      if (won) {
        prize = betAmount * PRIZE_MULTIPLIERS[BET_TYPES.SPECIFIC]
        details = `¡Acertaste el número exacto ${betNumber} en ${betColor}!`
      } else {
        if (resultNumber === betNumber) {
          details = `Acertaste el número ${betNumber}, pero el color fue ${resultColor}`
        } else if (resultColor === betColor) {
          details = `Acertaste el color ${betColor}, pero el número fue ${resultNumber}`
        } else {
          details = `El resultado fue ${resultNumber} ${resultColor}, no ${betNumber} ${betColor}`
        }
      }
      break
      
    default:
      details = 'Tipo de apuesta no válido'
  }
  
  return {
    prize: Math.round(prize * 100) / 100, // Redondear a 2 decimales
    won,
    details
  }
}

/**
 * Genera un resultado aleatorio de ruleta
 * @returns {Object} {number: number, color: string}
 */
export const generateRandomResult = () => {
  const number = Math.floor(Math.random() * (GAME_CONFIG.MAX_ROULETTE_NUMBER + 1))
  const color = Math.random() < 0.5 ? COLORS.RED : COLORS.BLACK
  
  return { number, color }
}

/**
 * Formatea un número como moneda
 * @param {number} amount 
 * @returns {string}
 */
export const formatCurrency = (amount) => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '$0.00'
  }
  
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount).replace('US$', '$')
}

/**
 * Calcula la rotación de la ruleta basada en el resultado
 * @param {number} resultNumber 
 * @param {number} currentRotation 
 * @returns {number} Nueva rotación en grados
 */
export const calculateWheelRotation = (resultNumber, currentRotation) => {
  // Cada número ocupa 360/37 ≈ 9.73 grados
  const degreesPerNumber = 360 / 37
  const targetDegree = resultNumber * degreesPerNumber
  
  // Agregar vueltas completas para la animación (3-7 vueltas)
  const extraSpins = 3 + Math.random() * 4
  const totalRotation = currentRotation + (extraSpins * 360) + targetDegree
  
  return Math.round(totalRotation)
}

/**
 * Obtiene información descriptiva sobre un tipo de apuesta
 * @param {string} betType 
 * @returns {Object} {title: string, description: string, multiplier: string}
 */
export const getBetTypeInfo = (betType) => {
  switch (betType) {
    case BET_TYPES.COLOR:
      return {
        title: '🎨 Apostar por Color',
        description: 'Gana si aciertas el color (rojo o negro)',
        multiplier: '50% de tu apuesta'
      }
      
    case BET_TYPES.PARITY:
      return {
        title: '🔢 Par/Impar por Color',
        description: 'Gana si aciertas la paridad del color específico',
        multiplier: '100% de tu apuesta'
      }
      
    case BET_TYPES.SPECIFIC:
      return {
        title: '🎯 Número y Color Específico',
        description: 'Gana si aciertas el número exacto y su color',
        multiplier: '300% de tu apuesta'
      }
      
    default:
      return {
        title: 'Tipo desconocido',
        description: 'Selecciona un tipo de apuesta',
        multiplier: '0%'
      }
  }
}

/**
 * Traduce valores a texto legible en español
 */
export const translations = {
  colors: {
    [COLORS.RED]: 'Rojo',
    [COLORS.BLACK]: 'Negro'
  },
  
  parity: {
    [PARITY.EVEN]: 'Par',
    [PARITY.ODD]: 'Impar'
  },
  
  betTypes: {
    [BET_TYPES.COLOR]: 'Color',
    [BET_TYPES.PARITY]: 'Par/Impar por Color',
    [BET_TYPES.SPECIFIC]: 'Número y Color Específico'
  }
}

/**
 * Utilidades para el manejo de estado del juego
 */
export const gameStateUtils = {
  /**
   * Verifica si un juego puede continuar
   */
  canContinueGame: (balance) => balance >= GAME_CONFIG.MIN_BET,
  
  /**
   * Calcula el saldo después de una apuesta
   */
  calculateNewBalance: (currentBalance, betAmount, prize) => {
    return Math.max(0, currentBalance - betAmount + prize)
  },
  
  /**
   * Genera un ID único para una apuesta
   */
  generateBetId: () => {
    return `bet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },
  
  /**
   * Convierte grados a radianes
   */
  degreesToRadians: (degrees) => degrees * (Math.PI / 180),
  
  /**
   * Convierte radianes a grados
   */
  radiansToDegrees: (radians) => radians * (180 / Math.PI)
}

/**
 * Constantes para mensajes del sistema
 */
export const MESSAGES = {
  WELCOME: (name, balance) => `¡Bienvenido ${name}! Tienes ${formatCurrency(balance)} para apostar.`,
  PLAYER_LOADED: (name, balance) => `Jugador ${name} cargado exitosamente. Saldo: ${formatCurrency(balance)}`,
  GAME_SAVED: 'Partida guardada exitosamente en el servidor',
  GAME_OVER: 'Te has quedado sin saldo suficiente para continuar',
  INVALID_BET: 'Apuesta inválida. Verifica los datos.',
  CONNECTION_ERROR: 'Error de conexión con el servidor',
  SPINNING: '🎪 ¡La ruleta está girando... Esperando resultado!',
  CALCULATING: '🧮 Calculando resultado...'
}

export default {
  BET_TYPES,
  COLORS,
  PARITY,
  PRIZE_MULTIPLIERS,
  GAME_CONFIG,
  validatePlayerName,
  validateInitialBalance,
  validateBet,
  getNumberParity,
  calculatePrizeLocal,
  generateRandomResult,
  formatCurrency,
  calculateWheelRotation,
  getBetTypeInfo,
  translations,
  gameStateUtils,
  MESSAGES
}