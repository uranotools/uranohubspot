<div align="center">
  <img src="https://cdn.simpleicons.org/hubspot" alt="HubSpot Logo" width="120" height="120" />
  
  # 👥 HubSpot CRM AI Plugin — Urano MCP
 
  [![Urano Core Compatibility](https://img.shields.io/badge/Urano_Core-%E2%89%A5_2.0.0-blueviolet?style=for-the-badge&logo=electron)](https://github.com/uranotools/UranoDesktop)
  [![Type](https://img.shields.io/badge/Plugin_Type-MCP_Integration-cyan?style=for-the-badge&logo=typescript)](https://github.com/uranotools/hubspot-plugin)
  [![Licence](https://img.shields.io/badge/Licence-MIT-green?style=for-the-badge)](https://opensource.org/licenses/MIT)

  **El plugin definitivo para gestionar y automatizar el CRM de HubSpot (contactos, empresas, deals, actividades, propiedades y workflows) de manera 100% conversacional.**

  *Perfectamente integrado como MCP Tool Provider con soporte para modos de operación per-agente.*
</div>

---

## ✨ Capacidades

| Plugin | Herramientas MCP | Descripción |
|--------|-----------------|-------------|
| **CRM** | `listObjects`, `searchObjects`, `batchReadObjects`, `batchCreateObjects`, `batchUpdateObjects`, `getSchemas` | Gestión de contactos, empresas, negocios, tickets, etc. |
| **Engagements** | `createEngagement`, `getEngagement`, `updateEngagement` | Registro de actividades: notas, tareas, llamadas, correos y reuniones. |
| **Properties** | `listProperties`, `getProperty`, `createProperty`, `updateProperty` | Gestión de campos y propiedades estándar o personalizadas. |
| **Associations** | `listAssociations`, `batchCreateAssociations`, `getAssociationDefinitions` | Relación y enlaces entre diferentes tipos de objetos. |
| **System** | `getUserDetails`, `getLink`, `listWorkflows`, `getWorkflow` | Información del portal, enlaces directos a la UI web y workflows. |

**Total: 20 herramientas MCP** registradas bajo el namespace `urano_hubspot_*`

---

## 🚀 Instalación en Urano

### Modo Desarrollador (Dev Mode — recomendado para desarrollo)

1. Abre **Urano Desktop → MCP Manager → Pestaña "Desarrollador"**.
2. Haz clic en **"Vincular Carpeta Local"**.
3. Selecciona esta carpeta (`UranoHubSpot/`).
4. Urano creará un symlink y activará hot-reload automático.

### Instalación desde ZIP (Producción)

1. Instala dependencias:
   ```bash
   npm install
   ```
2. Compila el bundle:
   ```bash
   npm run build
   ```
3. Comprime el contenido de la carpeta `dist` en un archivo `hubspot-aiplugin.zip` o usa el script `pack` si está disponible.
4. En **Urano → MCP Manager → Instalar MCP (.zip)**, sube el archivo generado.

---

## ⚙️ Configuración

Una vez instalado, ve a **MCP Manager → UranoHubSpot → Configuración** y completa:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `PLUGIN_MODE` | 🔒 Selector | **Modo de Operación** — controla qué puede hacer el agente (ver tabla abajo) |
| `HUBSPOT_ACCESS_TOKEN` | 🔒 Password (Bóveda) | Tu **Private App Access Token** de HubSpot. Obtenlo en HubSpot Settings -> Integrations -> Private Apps |

### 🔒 Modos de Operación

| Modo | Valor | Herramientas disponibles |
|------|-------|--------------------------|
| ✅ Manejo Personal Completo | `full` | Todas las 20 herramientas del plugin. |
| 👁️ Solo Lectura | `readonly` | Buscar, listar, leer objetos, propiedades, asociaciones y workflows sin modificar ni crear nada. |
| 🤖 Solo Chat | `chat_only` | Buscar, crear y actualizar contactos/deals/empresas, además de registrar compromisos (notas, tareas, reuniones) y asociaciones. Ideal para chatbots de soporte o ventas. |
