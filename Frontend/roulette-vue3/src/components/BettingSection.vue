<template>
  <div class="betting-section">
    <div class="betting-header">
      <h2>🎲 Realiza tu apuesta</h2>
      <div class="balance-display">
        💰 Saldo disponible: <span class="balance-amount">${{ currentBalance.toLocaleString() }}</span>
      </div>
    </div>

    <div class="betting-form">
      <!-- Tipo de apuesta con cards -->
      <div class="form-section">
        <h3>📋 Tipo de apuesta</h3>
        <div class="bet-type-grid">
          <div 
            v-for="type in betTypes" 
            :key="type.value"
            :class="['bet-type-card', { active: bet.type === type.value }]"
            @click="selectBetType(type.value)"
          >
            <div class="card-icon">{{ type.icon }}</div>
            <div class="card-title">{{ type.title }}</div>
            <div class="card-payout">{{ type.payout }}</div>
            <div class="card-description">{{ type.description }}</div>
          </div>
        </div>
      </div>

      <!-- Opciones específicas por tipo -->
      <div v-if="bet.type" class="form-section">
        <h3>🎯 Configuración de apuesta</h3>
        
        <!-- Apuesta por color -->
        <div v-if="bet.type === 'color'" class="bet-options">
          <label class="section-label">Selecciona un color:</label>
          <div class="color-selection">
            <button 
              v-for="color in colors" 
              :key="color.value"
              :class="['color-btn', color.value, { active: bet.color === color.value }]"
              @click="selectColor(color.value)"
            >
              <span class="color-icon">{{ color.icon }}</span>
              <span class="color-name">{{ color.name }}</span>
            </button>
          </div>
        </div>

        <!-- Apuesta por paridad de color -->
        <div v-if="bet.type === 'paridad'" class="bet-options">
          <label class="section-label">Selecciona color y paridad:</label>
          
          <div class="parity-grid">
            <div 
              v-for="option in parityOptions" 
              :key="`${option.color}-${option.parity}`"
              :class="['parity-card', option.color, { 
                active: bet.color === option.color && bet.parity === option.parity 
              }]"
              @click="selectParity(option.color, option.parity)"
            >
              <div class="parity-icon">{{ option.icon }}</div>
              <div class="parity-text">{{ option.text }}</div>
            </div>
          </div>
        </div>

        <!-- Apuesta por número específico -->
        <div v-if="bet.type === 'numero'" class="bet-options">
          <div class="number-input-section">
            <label class="section-label">Número (0-36):</label>
            <div class="number-input-wrapper">
              <input 
                type="number" 
                v-model.number="bet.number" 
                min="0" 
                max="36" 
                class="number-input"
                :class="{ error: numberError }"
                @input="validateNumber"
                placeholder="0-36"
              />
              <div v-if="numberError" class="error-message">{{ numberError }}</div>
            </div>
          </div>

          <div class="color-for-number" v-if="bet.number !== null && bet.number >= 0">
            <label class="section-label">Color del número {{ bet.number }}:</label>
            <div v-if="bet.number === 0" class="auto-color green">
              🟢 Verde (automático para el 0)
            </div>
            <div v-else class="color-selection">
              <button 
                v-for="color in getValidColorsForNumber(bet.number)" 
                :key="color.value"
                :class="['color-btn', color.value, { 
                  active: bet.color === color.value,
                  suggested: color.suggested
                }]"
                @click="selectColor(color.value)"
              >
                <span class="color-icon">{{ color.icon }}</span>
                <span class="color-name">{{ color.name }}</span>
                <span v-if="color.suggested" class="suggested-label">✓ Correcto</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Monto de apuesta -->
      <div v-if="bet.type" class="form-section">
        <h3>💵 Monto de apuesta</h3>
        <div class="amount-section">
          <div class="amount-input-wrapper">
            <label class="section-label">Cantidad a apostar:</label>
            <input 
              type="number" 
              v-model.number="bet.amount" 
              min="1" 
              :max="currentBalance"
              class="amount-input"
              :class="{ error: amountError }"
              @input="validateAmount"
              placeholder="Ingresa monto"
            />
            <div v-if="amountError" class="error-message">{{ amountError }}</div>
          </div>

          <!-- Botones de monto rápido -->
          <div class="quick-amount-buttons">
            <button 
              v-for="quickAmount in quickAmounts" 
              :key="quickAmount"
              class="quick-btn"
              :disabled="quickAmount > currentBalance"
              @click="setQuickAmount(quickAmount)"
            >
              ${{ quickAmount.toLocaleString() }}
            </button>
          </div>

          <!-- Premio potencial -->
          <div v-if="bet.amount > 0" class="potential-prize">
            <div class="prize-info">
              <span class="prize-label">🏆 Premio potencial:</span>
              <span class="prize-amount">${{ calculatePotentialPrize().toLocaleString() }}</span>
            </div>
            <div class="risk-info">
              <span class="risk-label">⚠️ Riesgo:</span>
              <span class="risk-amount">${{ bet.amount.toLocaleString() }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Botones de acción -->
      <div class="action-section">
        <button 
          class="btn btn-primary bet-button"
          :disabled="!canPlaceBet"
          @click="placeBet"
        >
          <span v-if="!isProcessing">💸 Confirmar Apuesta</span>
          <span v-else>⏳ Procesando...</span>
        </button>

        <button 
          class="btn btn-secondary reset-button"
          @click="resetBet"
          :disabled="isProcessing"
        >
          🗑️ Limpiar
        </button>
      </div>

      <!-- Resumen de apuesta -->
      <div v-if="bet.type && bet.amount > 0" class="bet-summary">
        <h4>📄 Resumen de tu apuesta</h4>
        <div class="summary-content">
          <div class="summary-item">
            <span class="summary-label">Tipo:</span>
            <span class="summary-value">{{ getBetTypeText() }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Selección:</span>
            <span class="summary-value">{{ getBetSelectionText() }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Monto:</span>
            <span class="summary-value">${{ bet.amount.toLocaleString() }}</span>
          </div>
          <div class="summary-item highlight">
            <span class="summary-label">Premio si ganas:</span>
            <span class="summary-value">${{ calculatePotentialPrize().toLocaleString() }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "BettingSection",
  props: {
    currentBalance: {
      type: Number,
      default: 1000
    },
    isProcessing: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      bet: {
        type: "",
        color: "",
        parity: "",
        number: null,
        amount: 0,
      },
      numberError: "",
      amountError: "",
      betTypes: [
        {
          value: "color",
          title: "Color",
          icon: "🎨",
          payout: "Paga 0.5x",
          description: "Apuesta a rojo o negro"
        },
        {
          value: "paridad",
          title: "Par/Impar + Color",
          icon: "📊",
          payout: "Paga 1x",
          description: "Combina paridad y color"
        },
        {
          value: "numero",
          title: "Número Específico",
          icon: "🎯",
          payout: "Paga 3x",
          description: "Mayor riesgo, mayor premio"
        }
      ],
      colors: [
        { value: "red", name: "Rojo", icon: "🔴" },
        { value: "black", name: "Negro", icon: "⚫" }
      ],
      parityOptions: [
        { color: "red", parity: "even", icon: "🔴📊", text: "Rojo Par" },
        { color: "red", parity: "odd", icon: "🔴📈", text: "Rojo Impar" },
        { color: "black", parity: "even", icon: "⚫📊", text: "Negro Par" },
        { color: "black", parity: "odd", icon: "⚫📈", text: "Negro Impar" }
      ],
      redNumbers: [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36],
      quickAmounts: [10, 25, 50, 100, 250]
    };
  },
  computed: {
    canPlaceBet() {
      return this.bet.type && 
             this.bet.amount > 0 && 
             this.bet.amount <= this.currentBalance && 
             !this.numberError && 
             !this.amountError &&
             this.isValidBetConfiguration();
    }
  },
  methods: {
    selectBetType(type) {
      this.bet.type = type;
      this.resetBetDetails();
    },

    selectColor(color) {
      this.bet.color = color;
    },

    selectParity(color, parity) {
      this.bet.color = color;
      this.bet.parity = parity;
    },

    validateNumber() {
      this.numberError = "";
      
      if (this.bet.number < 0 || this.bet.number > 36) {
        this.numberError = "El número debe estar entre 0 y 36";
      } else if (this.bet.number === 0) {
        this.bet.color = "green";
      }
    },

    validateAmount() {
      this.amountError = "";
      
      if (this.bet.amount <= 0) {
        this.amountError = "El monto debe ser mayor a 0";
      } else if (this.bet.amount > this.currentBalance) {
        this.amountError = "No tienes suficiente saldo";
      }
    },

    getValidColorsForNumber(number) {
      if (number === 0) return [{ value: "green", name: "Verde", icon: "🟢" }];
      
      const isRed = this.redNumbers.includes(number);
      return [
        { 
          value: "red", 
          name: "Rojo", 
          icon: "🔴", 
          suggested: isRed 
        },
        { 
          value: "black", 
          name: "Negro", 
          icon: "⚫", 
          suggested: !isRed 
        }
      ];
    },

    isValidBetConfiguration() {
      switch (this.bet.type) {
        case "color":
          return this.bet.color !== "";
        case "paridad":
          return this.bet.color !== "" && this.bet.parity !== "";
        case "numero":
          return this.bet.number !== null && 
                 this.bet.number >= 0 && 
                 this.bet.number <= 36 && 
                 this.bet.color !== "";
        default:
          return false;
      }
    },

    setQuickAmount(amount) {
      this.bet.amount = amount;
      this.validateAmount();
    },

    calculatePotentialPrize() {
      if (!this.bet.amount) return 0;
      
      switch (this.bet.type) {
        case "color":
          return Math.floor(this.bet.amount * 0.5);
        case "paridad":
          return this.bet.amount;
        case "numero":
          return this.bet.amount * 3;
        default:
          return 0;
      }
    },

    getBetTypeText() {
      const typeMap = {
        "color": "Color",
        "paridad": "Par/Impar + Color",
        "numero": "Número Específico"
      };
      return typeMap[this.bet.type] || "";
    },

    getBetSelectionText() {
      switch (this.bet.type) {
        case "color":
          return this.bet.color === "red" ? "🔴 Rojo" : "⚫ Negro";
        case "paridad":
          const colorText = this.bet.color === "red" ? "Rojo" : "Negro";
          const parityText = this.bet.parity === "even" ? "Par" : "Impar";
          const colorIcon = this.bet.color === "red" ? "🔴" : "⚫";
          return `${colorIcon} ${colorText} ${parityText}`;
        case "numero":
          const colorIcon2 = this.bet.color === "red" ? "🔴" : 
                            this.bet.color === "black" ? "⚫" : "🟢";
          return `${this.bet.number} ${colorIcon2}`;
        default:
          return "";
      }
    },

    resetBetDetails() {
      this.bet.color = "";
      this.bet.parity = "";
      this.bet.number = null;
      this.numberError = "";
      this.amountError = "";
    },

    resetBet() {
      this.bet = {
        type: "",
        color: "",
        parity: "",
        number: null,
        amount: 0,
      };
      this.numberError = "";
      this.amountError = "";
    },

    placeBet() {
      if (!this.canPlaceBet) return;
      
      this.$emit("bet-placed", { ...this.bet });
    },
  },
};
</script>

<style scoped>
.betting-section {
  background: linear-gradient(145deg, #ffffff, #f8f9fa);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.1);
}

.betting-header {
  text-align: center;
  margin-bottom: 2rem;
}

.betting-header h2 {
  color: #667eea;
  font-size: 2rem;
  margin-bottom: 1rem;
  font-weight: 700;
}

.balance-display {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  padding: 1rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1.1rem;
}

.balance-amount {
  color: #ffd700;
  font-weight: bold;
}

.form-section {
  margin-bottom: 2.5rem;
}

.form-section h3 {
  color: #333;
  font-size: 1.3rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e1e5e9;
}

.bet-type-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.bet-type-card {
  background: white;
  border: 2px solid #e1e5e9;
  border-radius: 16px;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.bet-type-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
}

.bet-type-card.active {
  border-color: #667eea;
  background: linear-gradient(145deg, #667eea, #764ba2);
  color: white;
  transform: translateY(-5px) scale(1.02);
}

.card-icon {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.card-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.card-payout {
  font-size: 1rem;
  font-weight: bold;
  color: #28a745;
  margin-bottom: 0.5rem;
}

.bet-type-card.active .card-payout {
  color: #ffd700;
}

.card-description {
  font-size: 0.9rem;
  opacity: 0.8;
}

.section-label {
  display: block;
  font-weight: 600;
  color: #555;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.color-selection {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.color-btn {
  background: white;
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 1.1rem;
}

.color-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.color-btn.active {
  border-color: #ffd700;
  transform: translateY(-2px) scale(1.05);
}

.color-btn.red {
  color: #dc3545;
}

.color-btn.red.active {
  background: #dc3545;
  color: white;
}

.color-btn.black {
  color: #343a40;
}

.color-btn.black.active {
  background: #343a40;
  color: white;
}

.color-btn.suggested {
  border-color: #28a745;
  background: rgba(40, 167, 69, 0.1);
}

.suggested-label {
  background: #28a745;
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
}

.parity-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.parity-card {
  background: white;
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.parity-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.parity-card.active {
  border-color: #ffd700;
  transform: translateY(-2px) scale(1.05);
}

.parity-card.red.active {
  background: #dc3545;
  color: white;
}

.parity-card.black.active {
  background: #343a40;
  color: white;
}

.parity-icon {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.parity-text {
  font-weight: 600;
}

.number-input-wrapper {
  position: relative;
}

.number-input {
  width: 100%;
  padding: 1rem;
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  font-size: 1.2rem;
  text-align: center;
  font-weight: 600;
  transition: border-color 0.3s ease;
}

.number-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.number-input.error {
  border-color: #dc3545;
  background: rgba(220, 53, 69, 0.05);
}

.auto-color {
  background: #28a745;
  color: white;
  padding: 1rem;
  border-radius: 12px;
  text-align: center;
  font-weight: 600;
  font-size: 1.1rem;
}

.amount-input {
  width: 100%;
  padding: 1rem;
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  font-size: 1.2rem;
  font-weight: 600;
  transition: border-color 0.3s ease;
}

.amount-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.amount-input.error {
  border-color: #dc3545;
  background: rgba(220, 53, 69, 0.05);
}

.quick-amount-buttons {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.quick-btn {
  background: #f8f9fa;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
}

.quick-btn:hover:not(:disabled) {
  background: #667eea;
  color: white;
  transform: translateY(-1px);
}

.quick-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.potential-prize {
  background: linear-gradient(45deg, #28a745, #20c997);
  color: white;
  padding: 1rem;
  border-radius: 12px;
  margin-top: 1rem;
}

.prize-info, .risk-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.prize-amount, .risk-amount {
  font-weight: bold;
  font-size: 1.2rem;
}

.error-message {
  color: #dc3545;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  font-weight: 500;
}

.action-section {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.btn {
  padding: 1rem 2rem;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  flex: 1;
}

.btn-primary {
  background: linear-gradient(45deg, #28a745, #20c997);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(40, 167, 69, 0.3);
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #5a6268;
  transform: translateY(-2px);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.bet-summary {
  background: linear-gradient(145deg, #667eea, #764ba2);
  color: white;
  padding: 2rem;
  border-radius: 16px;
  animation: fadeInUp 0.5s ease-out;
}

.bet-summary h4 {
  margin-bottom: 1.5rem;
  text-align: center;
  font-size: 1.3rem;
}

.summary-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}

.summary-item.highlight {
  background: rgba(255, 215, 0, 0.2);
  border: 1px solid rgba(255, 215, 0, 0.3);
}

.summary-label {
  font-weight: 500;
}

.summary-value {
  font-weight: bold;
  font-size: 1.1rem;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .betting-section {
    padding: 1.5rem;
  }
  
  .bet-type-grid {
    grid-template-columns: 1fr;
  }
  
  .color-selection {
    grid-template-columns: 1fr;
  }
  
  .parity-grid {
    grid-template-columns: 1fr;
  }
  
  .action-section {
    flex-direction: column;
  }
  
  .quick-amount-buttons {
    justify-content: center;
  }
  
  .summary-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}</style>