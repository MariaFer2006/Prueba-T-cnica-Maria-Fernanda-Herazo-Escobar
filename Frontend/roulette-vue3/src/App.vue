<template>
  <div class="app-container">
    <!-- Header del juego -->
    <header class="game-header">
      <div class="header-content">
        <h1 class="game-title">🎰 JUEGO DE LA RULETA</h1>
        <p class="game-subtitle">Prueba Técnica Unilink - Maria Fernanda Herazo escobar</p>
      </div>
    </header>

    <!-- Contenido principal centrado -->
    <main class="main-content">
      <!-- Sección del Jugador -->
      <section class="player-section">
        <div class="section-header">
          <h2 class="section-title">👤 Jugador</h2>
        </div>
        
        <div class="player-form">
          <div class="form-row">
            <div class="input-group">
              <label for="playerName" class="input-label">Nombre del Jugador:</label>
              <input 
                id="playerName"
                v-model="playerName" 
                type="text" 
                class="form-input"
                placeholder="Ingresa tu nombre" 
                :disabled="gameStarted && !gameEnded"
                @keyup.enter="loadPlayer"
                maxlength="50"
              >
            </div>
            
            <div class="input-group" v-if="!gameStarted">
              <label for="initialBalance" class="input-label">Saldo Inicial:</label>
              <input 
                id="initialBalance"
                v-model.number="initialBalance" 
                type="number" 
                min="1" 
                max="1000000"
                class="form-input"
                placeholder="1000"
              >
            </div>
          </div>

          <!-- Display del saldo actual -->
          <div v-if="gameStarted" class="balance-display">
            <div class="balance-container">
              <span class="balance-label">💰 Saldo Actual:</span>
              <span class="balance-amount">${{ currentBalance.toLocaleString() }}</span>
            </div>
            <div v-if="hasUnsavedChanges" class="unsaved-indicator">
              ⚠️ Tienes cambios sin guardar
            </div>
          </div>

          <!-- Controles del juego -->
          <div class="game-controls">
            <button 
              v-if="!gameStarted" 
              @click="startNewGame" 
              class="control-btn primary" 
              :disabled="!playerName || !initialBalance || loading"
            >
              <span class="btn-icon">🎮</span>
              <span class="btn-text">{{ loading ? 'Iniciando...' : 'Nuevo Juego' }}</span>
            </button>
            
            <button 
              v-if="!gameStarted" 
              @click="loadPlayer" 
              class="control-btn secondary" 
              :disabled="!playerName || loading"
            >
              <span class="btn-icon">📂</span>
              <span class="btn-text">{{ loading ? 'Cargando...' : 'Cargar Jugador' }}</span>
            </button>
            
            <button 
              v-if="gameStarted && hasUnsavedChanges" 
              @click="saveGame" 
              class="control-btn success"
              :disabled="saving"
            >
              <span class="btn-icon">💾</span>
              <span class="btn-text">{{ saving ? 'Guardando...' : 'Guardar Partida' }}</span>
            </button>
            
            <button 
              v-if="gameEnded" 
              @click="resetGame" 
              class="control-btn info"
            >
              <span class="btn-icon">🔄</span>
              <span class="btn-text">Nuevo Juego</span>
            </button>
          </div>
        </div>
      </section>

      <!-- Sección de la Ruleta -->
      <section v-if="gameStarted && !gameEnded" class="roulette-section">
        <div class="section-header">
          <h2 class="section-title">🎯 Ruleta</h2>
        </div>
        
        <div class="roulette-container">
          <!-- Marcador de posición ganadora -->
          <div class="roulette-pointer">
            <div class="pointer-arrow">▼</div>
          </div>

          <div 
            class="roulette-wheel" 
            :class="{ 'roulette-spinning': spinning }"
            :style="{ transform: `rotate(${wheelRotation}deg)` }"
          >
            <div class="roulette-center">
              <div class="center-content">
                {{ lastResult.number !== null ? lastResult.number : '?' }}
              </div>
            </div>

            <!-- Números de la ruleta distribuidos -->
            <div class="roulette-numbers">
              <div 
                v-for="(number, index) in rouletteNumbers" 
                :key="index"
                class="number-slot"
                :class="getNumberClass(number)"
                :style="getNumberStyle(index)"
              >
                {{ number }}
              </div>
            </div>
          </div>
          
          <!-- Resultado de la ruleta -->
          <div v-if="lastResult.number !== null" class="result-display">
            <div class="result-header">Último Resultado:</div>
            <div class="result-content">
              <span class="result-number" :class="`color-${lastResult.color}`">
                {{ lastResult.number }}
              </span>
              <span class="result-details">
                {{ getColorText(lastResult.color) }} - 
                {{ lastResult.number % 2 === 0 ? 'Par' : 'Impar' }}
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- Sección de Apuestas -->
      <section v-if="gameStarted && !spinning && !gameEnded" class="betting-section">
        <div class="section-header">
          <h2 class="section-title">💰 Realizar Apuesta</h2>
        </div>
        
        <div class="betting-form">
          <!-- Monto de la apuesta -->
          <div class="input-group">
            <label for="betAmount" class="input-label">Monto de la Apuesta:</label>
            <input 
              id="betAmount"
              v-model.number="betAmount" 
              type="number" 
              min="1" 
              :max="currentBalance" 
              class="form-input amount-input"
              placeholder="Cantidad a apostar"
            >
          </div>

          <!-- Opciones de apuesta -->
          <div class="betting-options">
            <!-- Apuesta por Color -->
            <div 
              class="bet-option" 
              :class="{ selected: betType === 'color' }" 
              @click="selectBetType('color')"
            >
              <div class="bet-option-header">
                <h3 class="bet-title">🎨 Apostar por Color</h3>
                <p class="bet-description">Gana 50% si aciertas el color</p>
              </div>
              <div v-if="betType === 'color'" class="bet-controls">
                <select v-model="betColor" class="form-select">
                  <option value="red">🔴 Rojo</option>
                  <option value="black">⚫ Negro</option>
                </select>
              </div>
            </div>

            <!-- Apuesta por Par/Impar de un Color -->
            <div 
              class="bet-option" 
              :class="{ selected: betType === 'parity' }" 
              @click="selectBetType('parity')"
            >
              <div class="bet-option-header">
                <h3 class="bet-title">🔢 Par/Impar por Color</h3>
                <p class="bet-description">Gana 100% si aciertas paridad y color</p>
              </div>
              <div v-if="betType === 'parity'" class="bet-controls">
                <select v-model="betColor" class="form-select">
                  <option value="red">🔴 Rojo</option>
                  <option value="black">⚫ Negro</option>
                </select>
                <select v-model="betParity" class="form-select">
                  <option value="even">🟦 Par</option>
                  <option value="odd">🟨 Impar</option>
                </select>
              </div>
            </div>

            <!-- Apuesta Específica -->
            <div 
              class="bet-option" 
              :class="{ selected: betType === 'specific' }" 
              @click="selectBetType('specific')"
            >
              <div class="bet-option-header">
                <h3 class="bet-title">🎯 Número y Color Específico</h3>
                <p class="bet-description">Gana 300% si aciertas número y color exactos</p>
              </div>
              <div v-if="betType === 'specific'" class="bet-controls">
                <input 
                  v-model.number="betNumber" 
                  type="number" 
                  min="0" 
                  max="36" 
                  class="form-input"
                  placeholder="Número (0-36)"
                >
                <select v-model="betColor" class="form-select">
                  <option value="red">🔴 Rojo</option>
                  <option value="black">⚫ Negro</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Botón para girar ruleta -->
          <div class="action-controls">
            <button 
              @click="placeBet" 
              class="control-btn primary large" 
              :disabled="!canPlaceBet || spinning"
            >
              <span class="btn-icon">🎲</span>
              <span class="btn-text">Girar Ruleta y Apostar</span>
            </button>
          </div>
        </div>
      </section>
    </main>

    <!-- Mensajes del sistema -->
    <div v-if="message" :class="`message message-${message.type}`">
      <span class="message-text">{{ message.text }}</span>
      <button class="message-close" @click="clearMessage">×</button>
    </div>

    <!-- Indicador de giro -->
    <div v-if="spinning" class="loading-overlay">
      <div class="loading-content">
        <div class="spinner-container">
          <div class="spinner"></div>
          <div class="spinner-glow"></div>
        </div>
        <p class="spinning-text">🎪 ¡La ruleta está girando...!</p>
        <div class="progress-container">
          <div class="progress-bar"></div>
        </div>
      </div>
    </div>

    <!-- Game Over -->
    <div v-if="gameEnded" class="game-over-overlay">
      <div class="game-over-content">
        <h3 class="game-over-title">🎮 ¡Juego Terminado!</h3>
        <p class="game-over-message">Te has quedado sin saldo suficiente para continuar.</p>
        <div class="final-stats">
          <div class="stat-row">
            <span class="stat-label">Saldo Final:</span>
            <span class="stat-value final-balance">${{ currentBalance }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Ganancia/Pérdida:</span>
            <span class="stat-value" :class="profitLossClass">
              {{ currentBalance - initialBalance >= 0 ? '+' : '' }}${{ currentBalance - initialBalance }}
            </span>
          </div>
        </div>
        <button @click="resetGame" class="control-btn primary large">
          <span class="btn-icon">🔄</span>
          <span class="btn-text">Empezar Nuevo Juego</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { rouletteAPI, userAPI, fallbackAPI } from './services/api.js'

export default {
  name: 'RouletteApp',
  data() {
    return {
      // Estado del juego
      gameStarted: false,
      gameEnded: false,
      spinning: false,
      loading: false,
      saving: false,
      
      // Información del jugador
      playerName: '',
      initialBalance: 1000,
      currentBalance: 0,
      savedBalance: 0,
      
      // Apuesta
      betType: '',
      betAmount: 0,
      betColor: 'red',
      betParity: 'even',
      betNumber: 0,
      
      // Resultado de la ruleta
      lastResult: {
        number: null,
        color: null
      },
      wheelRotation: 0,
      
      // Números de la ruleta europea
      rouletteNumbers: [0, 26, 3, 35, 12, 28, 7, 29, 18, 22, 9, 31, 14, 20, 1, 33, 16, 24, 5, 10, 23, 8, 30, 11, 36, 13, 27, 6, 34, 17, 25, 2, 21, 4, 19, 15, 32],
      
      // Sistema de mensajes
      message: null,
      messageTimeout: null
    }
  },
  
  computed: {
    canPlaceBet() {
      return (
        this.betType && 
        this.betAmount > 0 && 
        this.betAmount <= this.currentBalance && 
        this.isValidBet() &&
        !this.spinning
      )
    },
    
    hasUnsavedChanges() {
      return this.currentBalance !== this.savedBalance
    },

    profitLossClass() {
      const difference = this.currentBalance - this.initialBalance
      if (difference > 0) return 'profit'
      if (difference < 0) return 'loss'
      return 'neutral'
    }
  },
  
  methods: {
    startNewGame() {
      if (!this.playerName || !this.initialBalance) {
        this.showMessage('Por favor ingresa tu nombre y saldo inicial', 'error')
        return
      }
      
      this.gameStarted = true
      this.gameEnded = false
      this.currentBalance = this.initialBalance
      this.savedBalance = this.initialBalance
      this.resetBet()
      
      this.showMessage(
        `¡Bienvenido ${this.playerName}! Tienes $${this.currentBalance.toLocaleString()} para apostar.`, 
        'success'
      )
    },

    async loadPlayer() {
      if (!this.playerName.trim()) {
        this.showMessage('Por favor ingresa un nombre de jugador', 'error')
        return
      }

      this.loading = true
      
      try {
        const userData = await userAPI.getUser(this.playerName.trim())
        
        this.currentBalance = userData.balance
        this.savedBalance = userData.balance
        this.gameStarted = true
        this.gameEnded = false
        this.resetBet()
        
        this.showMessage(
          `Jugador ${this.playerName} cargado exitosamente. Saldo: $${this.currentBalance.toLocaleString()}`, 
          'success'
        )
        
      } catch (error) {
        if (error.message === 'USER_NOT_FOUND') {
          this.showMessage(
            'Jugador no encontrado. Puedes crear un nuevo juego con este nombre.', 
            'info'
          )
        } else {
          console.error('Error cargando jugador:', error)
          this.showMessage('Error conectando con el servidor. Intenta nuevamente.', 'error')
          this.tryLoadFromLocalStorage()
        }
      } finally {
        this.loading = false
      }
    },

    tryLoadFromLocalStorage() {
      const localData = fallbackAPI.localStorage.getUser(this.playerName)
      if (localData) {
        this.currentBalance = localData.balance
        this.savedBalance = localData.balance
        this.gameStarted = true
        this.gameEnded = false
        this.resetBet()
        
        this.showMessage(
          `Jugador cargado desde cache local. Saldo: $${this.currentBalance.toLocaleString()}`, 
          'warning'
        )
      }
    },

    async saveGame() {
      if (this.saving || !this.hasUnsavedChanges) return
      
      this.saving = true
      
      try {
        await userAPI.saveBalance(this.playerName.trim(), this.currentBalance)

        
        this.savedBalance = this.currentBalance
        this.showMessage('Partida guardada exitosamente en el servidor', 'success')
        
      } catch (error) {
        console.error('Error guardando partida:', error)
        
        fallbackAPI.localStorage.saveUser(this.playerName, this.currentBalance)
        this.savedBalance = this.currentBalance
        this.showMessage('Error en servidor. Partida guardada localmente.', 'warning')
        
      } finally {
        this.saving = false
      }
    },

    selectBetType(type) {
      this.betType = type
      if (type !== 'specific') {
        this.betNumber = 0
      }
    },

    isValidBet() {
      switch (this.betType) {
        case 'color':
          return this.betColor
        case 'parity':
          return this.betColor && this.betParity
        case 'specific':
          return this.betNumber >= 0 && this.betNumber <= 36 && this.betColor
        default:
          return false
      }
    },

    async placeBet() {
      if (!this.canPlaceBet) {
        this.showMessage('Apuesta inválida. Verifica los datos.', 'error')
        return
      }

      this.spinning = true
      this.message = null

      try {
        await this.animateRoulette()
        const result = await this.getRouletteResult()
        this.lastResult = result
        
        const prizeResult = await this.calculatePrize(result)
        const oldBalance = this.currentBalance
        this.currentBalance = oldBalance - this.betAmount + prizeResult.prize
        
        this.showBetResult(prizeResult, oldBalance)
        
        if (this.currentBalance < 1) {
          this.gameEnded = true
          this.showMessage('¡Se acabó tu saldo! El juego ha terminado.', 'error')
        }

      } catch (error) {
        console.error('Error procesando apuesta:', error)
        this.showMessage('Error al procesar la apuesta. Intenta nuevamente.', 'error')
      } finally {
        this.spinning = false
        this.resetBet()
      }
    },

    async animateRoulette() {
      return new Promise(resolve => {
        const spins = 4 + Math.random() * 3
        const finalRotation = this.wheelRotation + (spins * 360) + (Math.random() * 360)
        this.wheelRotation = finalRotation
        setTimeout(resolve, 4000)
      })
    },

    async getRouletteResult() {
      try {
        return await rouletteAPI.spin()
      } catch (error) {
        console.error('Error obteniendo resultado:', error)
        this.showMessage('Error de conexión. Usando resultado local.', 'warning')
        // Generar resultado local con colores correctos
        const number = Math.floor(Math.random() * 37)
        const color = this.getNumberColor(number)
        return { number, color }
      }
    },

    async calculatePrize(result) {
      const betData = {
        betType: this.betType,
        betAmount: this.betAmount,
        color: this.betColor,
        parity: this.betParity,
        number: this.betNumber,
        resultNumber: result.number,
        resultColor: result.color
      }

      try {
        return await rouletteAPI.calculatePrize(betData)
      } catch (error) {
        console.error('Error calculando premio:', error)
        this.showMessage('Error de conexión. Calculando premio localmente.', 'warning')
        return fallbackAPI.calculatePrizeLocal(betData, result)
      }
    },

    showBetResult(prizeResult, oldBalance) {
      if (prizeResult.won && prizeResult.prize > 0) {
        this.showMessage(
          `¡GANASTE! 🎉 Premio: $${prizeResult.prize.toLocaleString()} | Saldo: $${oldBalance.toLocaleString()} → $${this.currentBalance.toLocaleString()}`, 
          'success'
        )
      } else {
        this.showMessage(
          `No ganaste esta vez. Perdiste: $${this.betAmount.toLocaleString()} | Saldo: $${oldBalance.toLocaleString()} → $${this.currentBalance.toLocaleString()}`, 
          'info'
        )
      }
    },

    getNumberClass(number) {
      if (number === 0) return 'green'
      const redNumbers = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]
      return redNumbers.includes(number) ? 'red' : 'black'
    },

    getNumberStyle(index) {
      const angle = (index * (360 / this.rouletteNumbers.length)) - 90
      return {
        transform: `rotate(${angle}deg) translateY(-140px) rotate(-${angle}deg)`
      }
    },

    getColorText(color) {
      const colorMap = {
        red: '🔴 Rojo',
        black: '⚫ Negro',
        green: '🟢 Verde'
      }
      return colorMap[color] || ''
    },

    resetBet() {
      this.betType = ''
      this.betAmount = 0
      this.betColor = 'red'
      this.betParity = 'even'
      this.betNumber = 0
    },

    resetGame() {
      this.gameStarted = false
      this.gameEnded = false
      this.spinning = false
      this.currentBalance = 0
      this.savedBalance = 0
      this.lastResult = { number: null, color: null }
      this.wheelRotation = 0
      this.resetBet()
      this.clearMessage()
    },

    showMessage(text, type = 'info') {
      if (this.messageTimeout) {
        clearTimeout(this.messageTimeout)
      }
      
      this.message = { text, type }
      
      if (type !== 'error' || !text.includes('terminado')) {
        this.messageTimeout = setTimeout(() => {
          this.message = null
        }, 8000)
      }
    },

    clearMessage() {
      this.message = null
      if (this.messageTimeout) {
        clearTimeout(this.messageTimeout)
        this.messageTimeout = null
      }
    }
  },

  beforeUnmount() {
    if (this.messageTimeout) {
      clearTimeout(this.messageTimeout)
    }
  }
}
</script>

<style scoped>
:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --success-color: #28a745;
  --warning-color: #ffc107;
  --danger-color: #dc3545;
  --info-color: #17a2b8;
  --light-color: #f8f9fa;
  --dark-color: #343a40;
  --border-radius: 16px;
  --shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  --shadow-hover: 0 12px 48px rgba(0, 0, 0, 0.15);
}

.app-container {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  font-family: 'Inter', 'Segoe UI', sans-serif;
  line-height: 1.6;
}

.game-header {
  padding: 2rem 0;
  text-align: center;
}

.header-content {
  max-width: 800px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.95);
  border-radius: var(--border-radius);
  padding: 2rem;
  box-shadow: var(--shadow);
  backdrop-filter: blur(10px);
}

.game-title {
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0 0 0.5rem 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.game-subtitle {
  font-size: 1.1rem;
  color: #666;
  margin: 0;
  font-weight: 500;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.player-section,
.roulette-section,
.betting-section {
  background: #0c345cff;
  border-radius: var(--border-radius);
  padding: 2rem;
  box-shadow: var(--shadow);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.section-header {
  text-align: center;
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--dark-color);
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.player-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-label {
  font-weight: 600;
  color: var(--dark-color);
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.form-input {
  padding: 1rem;
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #e1e5e9;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input:disabled {
  background: #e1e5e9;
  color: #6c757d;
}

.amount-input {
  font-size: 1.2rem;
  font-weight: 600;
  text-align: center;
}

.form-select {
  padding: 0.75rem;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  background: white;
  font-size: 0.9rem;
  cursor: pointer;
}

.balance-display {
  text-align: center;
  padding: 1.5rem;
  background: linear-gradient(45deg, var(--success-color), #20c997);
  border-radius: 12px;
  color: white;
  box-shadow: 0 4px 15px rgba(40, 167, 69, 0.2);
}

.balance-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.balance-label {
  font-size: 1.1rem;
  font-weight: 500;
}

.balance-amount {
  font-size: 1.4rem;
  font-weight: 800;
  color: #ffd700;
}

.unsaved-indicator {
  font-size: 0.9rem;
  opacity: 0.9;
}

.game-controls {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

.action-controls {
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
}

.control-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-decoration: none;
  position: relative;
  overflow: hidden;
}

.control-btn.large {
  padding: 1.25rem 2rem;
  font-size: 1.1rem;
}

.control-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover);
}

.control-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.control-btn.primary {
  background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
  color: white;
}

.control-btn.secondary {
  background: linear-gradient(45deg, #6c757d, #5a6268);
  color: white;
}

.control-btn.success {
  background: linear-gradient(45deg, var(--success-color), #20c997);
  color: white;
}

.control-btn.info {
  background: linear-gradient(45deg, var(--info-color), #138496);
  color: white;
}

.btn-icon {
  font-size: 1.2rem;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
}

.btn-text {
  font-weight: 600;
}

.roulette-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  padding: 2rem 0;
  position: relative;
}

.roulette-pointer {
  position: absolute;
  top: 30px;
  z-index: 10;
}

.pointer-arrow {
  font-size: 2rem;
  color: #dc3545;
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
}

.roulette-wheel {
  position: relative;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: conic-gradient(
    from 0deg,
    #8b0000 0deg, #1a1a1a 9.7deg,
    #dc2626 19.4deg, #1a1a1a 29.1deg,
    #8b0000 38.8deg, #1a1a1a 48.5deg,
    #dc2626 58.2deg, #1a1a1a 67.9deg,
    #8b0000 77.6deg, #1a1a1a 87.3deg,
    #dc2626 97deg, #1a1a1a 106.7deg,
    #8b0000 116.4deg, #1a1a1a 126.1deg,
    #dc2626 135.8deg, #1a1a1a 145.5deg,
    #8b0000 155.2deg, #1a1a1a 164.9deg,
    #dc2626 174.6deg, #1a1a1a 184.3deg,
    #8b0000 194deg, #1a1a1a 203.7deg,
    #dc2626 213.4deg, #1a1a1a 223.1deg,
    #8b0000 232.8deg, #1a1a1a 242.5deg,
    #dc2626 252.2deg, #1a1a1a 261.9deg,
    #8b0000 271.6deg, #1a1a1a 281.3deg,
    #dc2626 291deg, #1a1a1a 300.7deg,
    #8b0000 310.4deg, #1a1a1a 320.1deg,
    #dc2626 329.8deg, #1a1a1a 339.5deg,
    #8b0000 349.2deg, #1a1a1a 358.9deg
  );
  border: 8px solid #d4af37;
  box-shadow: 
    0 0 30px rgba(212, 175, 55, 0.4),
    inset 0 0 50px rgba(0, 0, 0, 0.3);
  transition: transform 4s cubic-bezier(0.23, 1, 0.32, 1);
}

.roulette-wheel.roulette-spinning {
  transition: transform 6s cubic-bezier(0.17, 0.67, 0.12, 0.99);
}

.roulette-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  background: radial-gradient(circle, #ffd700, #b8860b);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5;
  box-shadow: 
    0 0 20px rgba(255, 215, 0, 0.5),
    inset 0 2px 4px rgba(255, 255, 255, 0.3);
}

.center-content {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.roulette-numbers {
  position: relative;
  width: 100%;
  height: 100%;
}

.number-slot {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 30px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.8rem;
  color: white;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
  background: rgba(0, 0, 0, 0.5);
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.number-slot.red {
  background: rgba(220, 38, 38, 0.8);
}

.number-slot.black {
  background: rgba(31, 41, 55, 0.8);
}

.number-slot.green {
  background: rgba(5, 150, 105, 0.8);
}

.result-display {
  text-align: center;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
}

.result-header {
  font-size: 1rem;
  margin-bottom: 1rem;
  opacity: 0.9;
}

.result-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.result-number {
  font-size: 2rem;
  font-weight: bold;
  padding: 0.5rem 1rem;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
}

.result-number.color-red {
  background: #dc2626;
}

.result-number.color-black {
  background: #1f2937;
}

.result-number.color-green {
  background: #059669;
}

.result-details {
  font-size: 1.1rem;
  font-weight: 500;
}

.betting-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.betting-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.bet-option {
  background: white;
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.bet-option:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.bet-option.selected {
  border-color: var(--primary-color);
  background: linear-gradient(145deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05));
  transform: translateY(-3px);
}

.bet-option-header {
  margin-bottom: 1rem;
}

.bet-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--dark-color);
  margin: 0 0 0.5rem 0;
}

.bet-description {
  font-size: 0.9rem;
  color: #666;
  margin: 0;
}

.bet-controls {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.message {
  position: fixed;
  top: 20px;
  right: 20px;
  max-width: 400px;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  color: white;
  font-weight: 500;
  z-index: 1000;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  animation: slideInRight 0.3s ease-out;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.message-success {
  background: linear-gradient(45deg, var(--success-color), #20c997);
}

.message-error {
  background: linear-gradient(45deg, var(--danger-color), #c82333);
}

.message-info {
  background: linear-gradient(45deg, var(--info-color), #138496);
}

.message-warning {
  background: linear-gradient(45deg, var(--warning-color), #e0a800);
  color: #333;
}

.message-text {
  flex: 1;
  line-height: 1.4;
}

.message-close {
  background: none;
  border: none;
  color: currentColor;
  font-size: 1.4rem;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.message-close:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.1);
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  color: white;
}

.loading-content {
  text-align: center;
  max-width: 400px;
  padding: 2rem;
}

.spinner-container {
  position: relative;
  margin-bottom: 2rem;
}

.spinner {
  width: 80px;
  height: 80px;
  border: 4px solid rgba(255, 255, 255, 0.2);
  border-top: 4px solid #ffd700;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

.spinner-glow {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 100px;
  border: 2px solid rgba(255, 215, 0, 0.3);
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

.spinning-text {
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 2rem;
}

.progress-container {
  width: 300px;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  overflow: hidden;
  margin: 0 auto;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #ffd700, #ffed4e);
  border-radius: 3px;
  animation: progress 4s ease-in-out;
}

.game-over-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.5s ease-out;
}

.game-over-content {
  background: white;
  padding: 3rem;
  border-radius: 20px;
  text-align: center;
  max-width: 500px;
  margin: 1rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.game-over-title {
  font-size: 2.2rem;
  color: var(--danger-color);
  margin-bottom: 1rem;
  font-weight: 700;
}

.game-over-message {
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 2rem;
  line-height: 1.5;
}

.final-stats {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
}

.stat-label {
  font-weight: 500;
  color: #666;
}

.stat-value {
  font-weight: bold;
  font-size: 1.1rem;
}

.final-balance {
  color: var(--danger-color);
  font-size: 1.3rem;
}

.stat-value.profit {
  color: var(--success-color);
}

.stat-value.loss {
  color: var(--danger-color);
}

.stat-value.neutral {
  color: #6c757d;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { opacity: 0.3; transform: translateX(-50%) scale(1); }
  50% { opacity: 1; transform: translateX(-50%) scale(1.05); }
}

@keyframes progress {
  0% { width: 0%; }
  100% { width: 100%; }
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 0 0.5rem 1rem;
  }
  
  .header-content {
    margin: 0 0.5rem;
    padding: 1.5rem;
  }
  
  .game-title {
    font-size: 2rem;
  }
  
  .game-subtitle {
    font-size: 1rem;
  }
  
  .player-section,
  .roulette-section,
  .betting-section {
    padding: 1.5rem;
    margin: 0 0.5rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .game-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .control-btn {
    justify-content: center;
  }
  
  .roulette-wheel {
    width: 250px;
    height: 250px;
  }
  
  .roulette-center {
    width: 60px;
    height: 60px;
  }
  
  .center-content {
    font-size: 1.2rem;
  }
  
  .betting-options {
    grid-template-columns: 1fr;
  }
  
  .message {
    top: 10px;
    right: 10px;
    left: 10px;
    max-width: none;
  }
  
  .loading-content {
    padding: 1rem;
  }
  
  .progress-container {
    width: 250px;
  }
  
  .game-over-content {
    padding: 2rem;
  }
}

@media (max-width: 480px) {
  .game-title {
    font-size: 1.8rem;
  }
  
  .section-title {
    font-size: 1.5rem;
  }
  
  .roulette-wheel {
    width: 220px;
    height: 220px;
  }
  
  .bet-controls {
    flex-direction: column;
  }
  
  .control-btn {
    padding: 1rem;
  }
  
  .control-btn.large {
    padding: 1rem 1.5rem;
  }
}
</style>