<template>
  <div class="roulette-section">
    <div class="roulette-header">
      <h2 class="roulette-title">🎯 Ruleta Europea</h2>
      <div v-if="lastResult" class="last-result">
        Último resultado: 
        <span class="result-number" :class="`result-${lastResult.color}`">
          {{ lastResult.number }}
        </span>
        <span class="result-color">{{ getColorText(lastResult.color) }}</span>
      </div>
    </div>

    <div class="roulette-container">
      <!-- Marcador de posición ganadora -->
      <div class="roulette-pointer">
        <div class="pointer-arrow">▼</div>
      </div>

      <!-- Ruleta principal -->
      <div
        class="roulette-wheel"
        :class="{ 'spinning': spinning }"
        :style="{ transform: `rotate(${rotation}deg)` }"
        @transitionend="onSpinEnd"
      >
        <!-- Centro de la ruleta -->
        <div class="roulette-center">
          <div class="center-circle">
            <div class="center-logo">🎰</div>
          </div>
        </div>

        <!-- Slots numerados -->
        <div
          v-for="(slot, index) in slots"
          :key="index"
          class="roulette-slot"
          :class="`slot-${slot.color}`"
          :style="getSlotStyle(index)"
        >
          <span class="slot-number">{{ slot.number }}</span>
        </div>

        <!-- Anillo exterior decorativo -->
        <div class="outer-ring"></div>
      </div>

      <!-- Información del estado -->
      <div class="roulette-status">
        <div v-if="spinning" class="status-spinning">
          <div class="spinner-icon">⏳</div>
          <span>¡La ruleta está girando...!</span>
        </div>
        
        <div v-else-if="winningNumber !== null" class="status-result">
          <div class="result-icon">🎉</div>
          <span>Resultado: {{ winningNumber }}</span>
        </div>
        
        <div v-else class="status-ready">
          <div class="ready-icon">🎲</div>
          <span>Lista para girar</span>
        </div>
      </div>

      <!-- Botón de prueba (desarrollo) -->
      <div class="roulette-controls">
        <button 
          class="spin-test-btn" 
          @click="spinRandom"
          :disabled="spinning"
          v-if="showTestButton"
        >
          🎲 Prueba de Giro
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "RouletteWheel",
  props: {
    winningNumber: {
      type: Number,
      default: null,
    },
    showTestButton: {
      type: Boolean,
      default: false // Solo para desarrollo
    },
    gameState: {
      type: String,
      default: 'ready' // ready, spinning, finished
    }
  },
  data() {
    return {
      rotation: 0,
      spinning: false,
      lastResult: null,
      // Orden real de la ruleta europea (0-36)
      slots: [
        { number: 0, color: 'green' },
        { number: 26, color: 'black' }, { number: 3, color: 'red' }, { number: 35, color: 'black' },
        { number: 12, color: 'red' }, { number: 28, color: 'black' }, { number: 7, color: 'red' },
        { number: 29, color: 'black' }, { number: 18, color: 'red' }, { number: 22, color: 'black' },
        { number: 9, color: 'red' }, { number: 31, color: 'black' }, { number: 14, color: 'red' },
        { number: 20, color: 'black' }, { number: 1, color: 'red' }, { number: 33, color: 'black' },
        { number: 16, color: 'red' }, { number: 24, color: 'black' }, { number: 5, color: 'red' },
        { number: 10, color: 'black' }, { number: 23, color: 'red' }, { number: 8, color: 'black' },
        { number: 30, color: 'red' }, { number: 11, color: 'black' }, { number: 36, color: 'red' },
        { number: 13, color: 'black' }, { number: 27, color: 'red' }, { number: 6, color: 'black' },
        { number: 34, color: 'red' }, { number: 17, color: 'black' }, { number: 25, color: 'red' },
        { number: 2, color: 'black' }, { number: 21, color: 'red' }, { number: 4, color: 'black' },
        { number: 19, color: 'red' }, { number: 15, color: 'black' }, { number: 32, color: 'red' }
      ],
    };
  },
  watch: {
    winningNumber(newVal) {
      if (newVal !== null && !this.spinning) {
        this.spinTo(newVal);
      }
    },
  },
  methods: {
    spinRandom() {
      const randomNumber = Math.floor(Math.random() * 37);
      this.spinTo(randomNumber);
      this.$emit('test-spin', randomNumber);
    },

    spinTo(number) {
      if (this.spinning) return;
      
      this.spinning = true;
      
      // Encontrar el índice del número en la ruleta
      const slotIndex = this.slots.findIndex(slot => slot.number === number);
      const degreesPerSlot = 360 / this.slots.length;
      
      // Calcular rotación: varias vueltas + posición exacta
      const spins = 8 + Math.random() * 4; // 8-12 vueltas
      const targetDegree = 360 - (slotIndex * degreesPerSlot);
      const finalRotation = (spins * 360) + targetDegree;
      
      this.rotation += finalRotation;
    },

    onSpinEnd() {
      if (!this.spinning) return;
      
      this.spinning = false;
      
      // Calcular número ganador basado en la rotación final
      const degreesPerSlot = 360 / this.slots.length;
      const normalizedRotation = ((this.rotation % 360) + 360) % 360;
      const winningIndex = Math.round((360 - normalizedRotation) / degreesPerSlot) % this.slots.length;
      
      const winner = this.slots[winningIndex];
      this.lastResult = winner;
      
      this.$emit('spin-end', {
        number: winner.number,
        color: winner.color,
        index: winningIndex
      });
    },

    getSlotStyle(index) {
      const degreesPerSlot = 360 / this.slots.length;
      const rotation = index * degreesPerSlot;
      
      return {
        transform: `rotate(${rotation}deg)`,
      };
    },

    getColorText(color) {
      const colorMap = {
        red: '🔴 Rojo',
        black: '⚫ Negro',
        green: '🟢 Verde'
      };
      return colorMap[color] || '';
    }
  },
};
</script>

<style scoped>
.roulette-section {
  background: linear-gradient(145deg, #1a1a2e, #16213e);
  border-radius: 25px;
  padding: 2rem;
  color: white;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.roulette-header {
  text-align: center;
  margin-bottom: 2rem;
}

.roulette-title {
  font-size: 2.2rem;
  font-weight: 700;
  color: #ffd700;
  margin-bottom: 1rem;
  text-shadow: 0 2px 10px rgba(255, 215, 0, 0.3);
}

.last-result {
  font-size: 1.1rem;
  color: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.result-number {
  font-weight: bold;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  color: white;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
}

.result-red { background: #dc2626; }
.result-black { background: #1f2937; }
.result-green { background: #059669; }

.roulette-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.roulette-pointer {
  position: absolute;
  top: -10px;
  z-index: 10;
}

.pointer-arrow {
  font-size: 2rem;
  color: #ffd700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  filter: drop-shadow(0 2px 4px rgba(255, 215, 0, 0.3));
}

.roulette-wheel {
  position: relative;
  width: 350px;
  height: 350px;
  border-radius: 50%;
  margin: 2rem 0;
  background: conic-gradient(
    #8b0000 0deg, #1a1a1a 9.7deg,
    #dc2626 19.4deg, #1a1a1a 29.1deg,
    #8b0000 38.8deg, #1a1a1a 48.5deg
  );
  box-shadow: 
    0 0 0 8px #d4af37,
    0 0 0 12px #b8860b,
    0 0 30px rgba(212, 175, 55, 0.4),
    inset 0 0 50px rgba(0, 0, 0, 0.3);
  transition: transform 4s cubic-bezier(0.23, 1, 0.32, 1);
}

.roulette-wheel.spinning {
  transition: transform 6s cubic-bezier(0.17, 0.67, 0.12, 0.99);
}

.roulette-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  z-index: 5;
}

.center-circle {
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, #ffd700, #b8860b);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 
    0 0 20px rgba(255, 215, 0, 0.5),
    inset 0 2px 4px rgba(255, 255, 255, 0.3);
}

.center-logo {
  font-size: 2rem;
  filter: drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.5));
}

.roulette-slot {
  position: absolute;
  width: 50%;
  height: 50%;
  top: 50%;
  left: 50%;
  transform-origin: 0% 0%;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 20px;
}

.slot-number {
  color: white;
  font-weight: bold;
  font-size: 0.9rem;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
  background: rgba(0, 0, 0, 0.3);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  backdrop-filter: blur(2px);
}

.outer-ring {
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  border-radius: 50%;
  border: 4px solid transparent;
  background: linear-gradient(45deg, #ffd700, #b8860b, #ffd700) border-box;
  mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
  mask-composite: exclude;
}

.roulette-status {
  margin: 1.5rem 0;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.status-spinning,
.status-result,
.status-ready {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  font-size: 1.1rem;
  font-weight: 500;
}

.spinner-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.status-result {
  color: #10b981;
}

.status-spinning {
  color: #f59e0b;
}

.status-ready {
  color: #60a5fa;
}

.roulette-controls {
  margin-top: 1rem;
}

.spin-test-btn {
  background: linear-gradient(45deg, #dc2626, #b91c1c);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(220, 38, 38, 0.3);
}

.spin-test-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(220, 38, 38, 0.4);
}

.spin-test-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* Responsive */
@media (max-width: 768px) {
  .roulette-section {
    padding: 1.5rem;
  }
  
  .roulette-title {
    font-size: 1.8rem;
  }
  
  .roulette-wheel {
    width: 280px;
    height: 280px;
  }
  
  .center-circle {
    width: 60px;
    height: 60px;
  }
  
  .center-logo {
    font-size: 1.5rem;
  }
  
  .slot-number {
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .roulette-wheel {
    width: 240px;
    height: 240px;
  }
  
  .last-result {
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .pointer-arrow {
    font-size: 1.5rem;
  }
}</style>