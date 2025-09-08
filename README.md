# Prueba Técnica - Juego de la Ruleta
## Desarrollador: 

### 🎯 Descripción
Aplicación web completa del juego de la ruleta con:
- **Frontend**: Vue.js 3 con diseño moderno y responsivo
- **Backend**: ASP.NET Core 8 Web API con Entity Framework Core
- **Base de datos**: SQL Server LocalDB

### 🚀 Características Implementadas
✅ Interfaz gráfica atractiva y responsiva
✅ Sistema de inicio/carga de jugadores
✅ Ruleta animada con resultados aleatorios
✅ 3 tipos de apuestas (color, par/impar por color, número específico)
✅ Cálculo automático de premios
✅ Persistencia en base de datos SQL
✅ API REST completa con Swagger
✅ Manejo de errores y modo offline

### 📁 Estructura del Proyecto
`
Prueba-Tecnica-/
├── Backend/
│   └── RouletteApi/          # API REST en ASP.NET Core 8
│       ├── Controllers/      # Controladores de la API
│       ├── Models/          # Modelos de datos
│       ├── Data/            # Contexto de Entity Framework
│       └── Services/        # Lógica de negocio
├── Frontend/
│   └── index.html           # Aplicación Vue.js 3
└── README.md
`

### 🔧 Instalación y Ejecución

#### Requisitos Previos
- .NET 8 SDK
- SQL Server LocalDB
- IIS habilitado
- Navegador moderno

#### Ejecutar Backend
`ash
cd Backend/RouletteApi
dotnet run
`
**URL API**: http://localhost:5000
**Swagger**: https://localhost:5001/swagger

#### Ejecutar Frontend
**URL**: http://localhost:8080 (configurado en IIS)

### 🎮 Reglas del Juego
1. **Apuesta por color**: Gana 50% del monto apostado
2. **Par/Impar por color**: Gana 100% del monto apostado
3. **Número y color específicos**: Gana 300% del monto apostado

### 🛠️ Tecnologías Utilizadas
- **Frontend**: Vue.js 3, HTML5, CSS3, JavaScript ES6+
- **Backend**: ASP.NET Core 8, Entity Framework Core 8
- **Base de Datos**: SQL Server LocalDB
- **Herramientas**: PowerShell, IIS, Git

### 📊 Endpoints de la API
- GET /api/roulette/spin - Obtener resultado de ruleta
- POST /api/roulette/calculate-prize - Calcular premio
- GET /api/user/{name} - Obtener usuario
- POST /api/user/save-balance - Guardar saldo

### 🎨 Características del Frontend
- Diseño moderno con gradientes y animaciones
- Ruleta con rotación realística
- Sistema de mensajes informativos
- Responsive design para móviles
- Integración completa con API + fallback offline

### ⚡ Comandos Útiles
`ash
# Reinstalar base de datos
dotnet ef database drop -f
dotnet ef database update

# Ver logs de la aplicación
dotnet run --verbosity detailed

# Abrir Swagger UI
start https://localhost:5001/swagger
`

### 📞 Soporte
Desarrollado por: ****
Fecha: 08/09/2025

¡Proyecto listo para entrevista técnica! 🚀
