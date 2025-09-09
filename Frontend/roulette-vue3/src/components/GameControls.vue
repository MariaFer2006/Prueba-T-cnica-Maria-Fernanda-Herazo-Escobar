<template>
  <div class="game-controls">
    <div class="controls-header">
      <h2 class="controls-title">⚙️ Controles del Juego</h2>
      <div class="controls-subtitle">Gestiona tu partida</div>
    </div>
    
    <div class="controls-grid">
      <button 
        class="control-btn primary" 
        @click="$emit('start-game')"
        :disabled="isDisabled('start-game')"
      >
        <div class="btn-icon">▶️</div>
        <div class="btn-content">
          <span class="btn-title">Iniciar Juego</span>
          <span class="btn-description">Comenzar nueva partida</span>
        </div>
      </button>

      <button 
        class="control-btn success" 
        @click="$emit('save-game')"
        :disabled="isDisabled('save-game')"
      >
        <div class="btn-icon">💾</div>
        <div class="btn-content">
          <span class="btn-title">Guardar Saldo</span>
          <span class="btn-description">Salvar progreso actual</span>
        </div>
      </button>

      <button 
        class="control-btn warning" 
        @click="$emit('load-game')"
        :disabled="isDisabled('load-game')"
      >
        <div class="btn-icon">📂</div>
        <div class="btn-content">
          <span class="btn-title">Cargar Jugador</span>
          <span class="btn-description">Recuperar partida guardada</span>
        </div>
      </button>

      <button 
        class="control-btn danger" 
        @click="$emit('reset-game')"
        :disabled="isDisabled('reset-game')"
      >
        <div class="btn-icon">🔄</div>
        <div class="btn-content">
          <span class="btn-title">Reiniciar</span>
          <span class="btn-description">Comenzar desde cero</span>
        </div>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: "GameControls",
  props: {
    gameState: {
      type: String,
      default: 'idle' // idle, playing, spinning, ended
    },
    playerName: {
      type: String,
      default: ''
    },
    hasUnsavedChanges: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    isDisabled(action) {
      switch (action) {
        case 'start-game':
          return !this.playerName || this.gameState === 'playing';
        case 'save-game':
          return this.gameState !== 'playing' || !this.hasUnsavedChanges;
        case 'load-game':
          return !this.playerName || this.gameState === 'playing';
        case 'reset-game':
          return this.gameState === 'spinning';
        default:
          return false;
      }
    }
  }
};
</script>

<style scoped>
.game-controls {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 15px 35px rgba(102, 126, 234, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}

.controls-header {
  text-align: center;
  margin-bottom: 2rem;
}

.controls-title {
  color: white;
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.controls-subtitle {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1rem;
  font-weight: 400;
}

.controls-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.control-btn {
  background: rgba(255, 255, 255, 0.95);
  border: none;
  border-radius: 16px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 1rem;
  text-align: left;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.control-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: currentColor;
  opacity: 0.3;
}

.control-btn:hover:not(:disabled) {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.control-btn:active:not(:disabled) {
  transform: translateY(-2px);
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.btn-icon {
  font-size: 2rem;
  flex-shrink: 0;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.btn-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.btn-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  line-height: 1.2;
}

.btn-description {
  font-size: 0.9rem;
  color: #666;
  font-weight: 400;
}

/* Variantes de color */
.control-btn.primary {
  color: #2563eb;
}

.control-btn.success {
  color: #059669;
}

.control-btn.warning {
  color: #d97706;
}

.control-btn.danger {
  color: #dc2626;
}

/* Estados especiales */
.control-btn.primary:hover:not(:disabled) {
  background: rgba(37, 99, 235, 0.1);
}

.control-btn.success:hover:not(:disabled) {
  background: rgba(5, 150, 105, 0.1);
}

.control-btn.warning:hover:not(:disabled) {
  background: rgba(217, 119, 6, 0.1);
}

.control-btn.danger:hover:not(:disabled) {
  background: rgba(220, 38, 38, 0.1);
}

/* Responsive */
@media (max-width: 768px) {
  .game-controls {
    padding: 1.5rem;
  }
  
  .controls-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .control-btn {
    padding: 1.25rem;
  }
  
  .controls-title {
    font-size: 1.5rem;
  }
  
  .btn-icon {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .controls-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .control-btn {
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }
  
  .btn-title {
    font-size: 1rem;
  }
  
  .btn-description {
    font-size: 0.8rem;
  }
}
</style>