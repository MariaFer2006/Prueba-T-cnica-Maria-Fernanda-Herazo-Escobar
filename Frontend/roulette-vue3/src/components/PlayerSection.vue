<template>
  <section class="game-section">
    <h2 class="section-title">👤 Jugador</h2>
    
    <div class="form-group">
      <div class="form-row">
        <!-- Nombre del jugador -->
        <div class="form-group">
          <label for="playerName">Nombre del Jugador:</label>
          <input 
            id="playerName"
            v-model="localPlayerName" 
            type="text" 
            class="form-input"
            placeholder="Ingresa tu nombre" 
            :disabled="gameStarted && !gameEnded"
            @keyup.enter="handleEnterKey"
            @blur="validatePlayerName"
            maxlength="50"
          >
          <span v-if="nameError" class="error-text">{{ nameError }}</span>
        </div>
        
        <!-- Saldo inicial (solo si no ha empezado el juego) -->
        <div class="form-group" v-if="!gameStarted">
          <label for="initialBalance">Saldo Inicial:</label>
          <input 
            id="initialBalance"
            v-model.number="localInitialBalance" 
            type="number" 
            min="1" 
            max="1000000"
            class="form-input"
            placeholder="1000"
            @blur="validateInitialBalance"
          >
          <span v-if="balanceError" class="error-text">{{ balanceError }}</span>
        </div>
      </div>
    </div>

    <!-- Display del saldo actual -->
    <div v-if="gameStarted" class="balance-display">
      💰 Saldo Actual: {{ formatCurrency(currentBalance) }}
      <div v-if="hasUnsavedChanges" class="unsaved-indicator">
        ⚠️ Tienes cambios sin guardar
      </div>
    </div>

    <!-- Estadísticas del jugador -->
    <div v-if="gameStarted && showStats" class="player-stats">
      <div class="stats-row">
        <div class="stat-item">
          <span class="stat-label">Saldo Inicial:</span>
          <span class="stat-value">{{ formatCurrency(initialBalance) }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Ganancia/Pérdida:</span>
          <span 
            class="stat-value"
            :class="profitLossClass"
          >
            {{ formatCurrency(currentBalance - initialBalance) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Controles del juego -->
    <div class="game-controls">
      <!-- Nuevo Juego -->
      <button 
        v-if="!gameStarted" 
        @click="handleNewGame" 
        class="btn btn-primary" 
        :disabled="!canStartNewGame || loading"
        :title="newGameTooltip"
      >
        {{ loading ? '🔄 Iniciando...' : '🎮 Nuevo Juego' }}
      </button>
      
      <!-- Cargar Jugador -->
      <button 
        v-if="!gameStarted" 
        @click="handleLoadPlayer" 
        class="btn btn-warning" 
        :disabled="!canLoadPlayer || loading"
        :title="loadPlayerTooltip"
      >
        {{ loading ? '🔄 Cargando...' : '📂 Cargar Jugador' }}
      </button>
      
      <!-- Guardar Partida -->
      <button 
        v-if="gameStarted && hasUnsavedChanges" 
        @click="handleSaveGame" 
        class="btn btn-success"
        :disabled="saving"
        title="Guarda tu progreso en el servidor"
      >
        {{ saving ? '💾 Guardando...' : '💾 Guardar Partida' }}
      </button>
      
      <!-- Reiniciar Juego -->
      <button 
        v-if="gameEnded" 
        @click="handleResetGame" 
        class="btn btn-info"
        title="Empezar un nuevo juego"
      >
        🔄 Nuevo Juego
      </button>

      <!-- Mostrar/Ocultar Estadísticas -->
      <button 
        v-if="gameStarted"
        @click="toggleStats" 
        class="btn btn-info btn-small"
        :title="showStats ? 'Ocultar estadísticas' : 'Mostrar estadísticas'"
      >
        {{ showStats ? '📊 Ocultar Stats' : '📈 Ver Stats' }}
      </button>
    </div>
  </section>
</template>

<script>
import { formatCurrency, validatePlayerName, validateInitialBalance, GAME_CONFIG, MESSAGES } from '../utils/gameLogic.js'

export default {
  name: 'PlayerSection',
  
  props: {
    playerName: {
      type: String,
      default: ''
    },
    initialBalance: {
      type: Number,
      default: GAME_CONFIG.DEFAULT_INITIAL_BALANCE
    },
    currentBalance: {
      type: Number,
      default: 0
    },
    gameStarted: {
      type: Boolean,
      default: false
    },
    gameEnded: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    saving: {
      type: Boolean,
      default: false
    },
    hasUnsavedChanges: {
      type: Boolean,
      default: false
    }
  },

  emits: [
    'update:playerName',
    'update:initialBalance', 
    'start-new-game',
    'load-player',
    'save-game',
    'reset-game'
  ],

  data() {
    return {
      localPlayerName: this.playerName,
      localInitialBalance: this.initialBalance,
      nameError: '',
      balanceError: '',
      showStats: false
    }
  },

  computed: {
    canStartNewGame() {
      const nameValidation = validatePlayerName(this.localPlayerName)
      const balanceValidation = validateInitialBalance(this.localInitialBalance)
      return nameValidation.valid && balanceValidation.valid
    },

    canLoadPlayer() {
      const nameValidation = validatePlayerName(this.localPlayerName)
      return nameValidation.valid
    },

    newGameTooltip() {
      if (!this.localPlayerName) {
        return 'Ingresa tu nombre para empezar'
      }
      if (!this.localInitialBalance) {
        return 'Ingresa un saldo inicial válido'
      }
      return `Empezar nuevo juego con $${this.localInitialBalance}`
    },

    loadPlayerTooltip() {
      if (!this.localPlayerName) {
        return 'Ingresa tu nombre para cargar datos'
      }
      return `Cargar datos del jugador ${this.localPlayerName}`
    },

    profitLossClass() {
      const difference = this.currentBalance - this.initialBalance
      if (difference > 0) return 'profit'
      if (difference < 0) return 'loss'
      return 'neutral'
    }
  },

  watch: {
    playerName(newValue) {
      this.localPlayerName = newValue
    },
    
    initialBalance(newValue) {
      this.localInitialBalance = newValue
    },

    localPlayerName(newValue) {
      this.$emit('update:playerName', newValue)
      this.nameError = ''
    },

    localInitialBalance(newValue) {
      this.$emit('update:initialBalance', newValue)
      this.balanceError = ''
    }
  },

  methods: {
    formatCurrency,

    validatePlayerName() {
      const validation = validatePlayerName(this.localPlayerName)
      this.nameError = validation.error || ''
      return validation.valid
    },

    validateInitialBalance() {
      const validation = validateInitialBalance(this.localInitialBalance)
      this.balanceError = validation.error || ''
      return validation.valid
    },

    handleEnterKey() {
      if (this.gameStarted) return
      
      if (this.canLoadPlayer) {
        this.handleLoadPlayer()
      }
    },

    handleNewGame() {
      if (!this.validatePlayerName() || !this.validateInitialBalance()) {
        return
      }
      
      this.$emit('start-new-game')
    },

    handleLoadPlayer() {
      if (!this.validatePlayerName()) {
        return
      }
      
      this.$emit('load-player')
    },

    handleSaveGame() {
      this.$emit('save-game')
    },

    handleResetGame() {
      this.$emit('reset-game')
      this.showStats = false
      this.nameError = ''
      this.balanceError = ''
    },

    toggleStats() {
      this.showStats = !this.showStats
    }
  }
}
</script>

<style scoped>
.error-text {
  color: #ff7675;
  font-size: 0.85rem;
  margin-top: 4px;
  display: block;
}

.unsaved-indicator {
  font-size: 0.9rem;
  color: #fdcb6e;
  margin-top: 8px;
  text-align: center;
}

.player-stats {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 15px;
  margin: 20px 0;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.stats-row {
  display: flex;
  justify-content: space-around;
  gap: 20px;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.8;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 1.2rem;
  font-weight: bold;
}

.stat-value.profit {
  color: #00b894;
}

.stat-value.loss {
  color: #ff7675;
}

.stat-value.neutral {
  color: #74b9ff;
}

.btn-small {
  padding: 8px 16px;
  font-size: 14px;
}

@media (max-width: 768px) {
  .stats-row {
    flex-direction: column;
    gap: 10px;
  }
  
  .stat-item {
    flex-direction: row;
    justify-content: space-between;
  }
}
</style>