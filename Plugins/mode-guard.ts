/**
 * mode-guard.ts — Control de acceso por modo de operación del plugin HubSpot
 *
 * PLUGIN_MODE define qué herramientas puede usar el agente:
 *
 *  full       → Acceso completo a todas las herramientas (modo personal)
 *  readonly   → Solo lectura: sin crear, actualizar, ni realizar operaciones destructivas
 *  chat_only  → Solo chat: permite leer, buscar, crear y actualizar contactos/deals/tareas, pero sin acciones de administración (como propiedades o flujos de trabajo)
 */

export type PluginMode = 'full' | 'readonly' | 'chat_only';

// ── Mapa de acciones permitidas por modo y plugin ───────────────────────────
const ALLOWED: Record<PluginMode, Record<string, string[]>> = {
    full: {
        // Acceso total
        CRM:          ['listObjects', 'searchObjects', 'batchReadObjects', 'batchCreateObjects', 'batchUpdateObjects', 'getSchemas'],
        Engagements:  ['createEngagement', 'getEngagement', 'updateEngagement'],
        Properties:   ['listProperties', 'getProperty', 'createProperty', 'updateProperty'],
        Associations: ['listAssociations', 'batchCreateAssociations', 'getAssociationDefinitions'],
        System:       ['getUserDetails', 'getLink', 'listWorkflows', 'getWorkflow']
    },
    readonly: {
        // Solo lectura
        CRM:          ['listObjects', 'searchObjects', 'batchReadObjects', 'getSchemas'],
        Engagements:  ['getEngagement'],
        Properties:   ['listProperties', 'getProperty'],
        Associations: ['listAssociations', 'getAssociationDefinitions'],
        System:       ['getUserDetails', 'getLink', 'listWorkflows', 'getWorkflow']
    },
    chat_only: {
        // Funciones que un chatbot necesita para interactuar y registrar datos
        CRM:          ['listObjects', 'searchObjects', 'batchReadObjects', 'batchCreateObjects', 'batchUpdateObjects', 'getSchemas'],
        Engagements:  ['createEngagement', 'getEngagement', 'updateEngagement'],
        Properties:   ['listProperties', 'getProperty'],
        Associations: ['listAssociations', 'batchCreateAssociations', 'getAssociationDefinitions'],
        System:       ['getUserDetails', 'getLink']
    }
};

// Descripciones amigables para mensajes de error al agente
const MODE_LABELS: Record<PluginMode, string> = {
    full:      'Manejo Personal Completo',
    readonly:  'Solo Lectura',
    chat_only: 'Solo Chatbot / Conversacional',
};

/**
 * Lanza un error descriptivo si la acción no está permitida en el modo activo.
 * Llama esto al inicio de cada executeAction o método expuesto.
 *
 * @param plugin   Nombre del plugin (ej: 'CRM')
 * @param action   Nombre de la acción (ej: 'batchCreateObjects')
 * @param config   Objeto de configuración inyectado por Urano (contiene PLUGIN_MODE)
 */
export function guardMode(plugin: string, action: string, config: any): void {
    const rawMode = (config?.PLUGIN_MODE || 'full') as string;
    const mode: PluginMode = (['full', 'readonly', 'chat_only'].includes(rawMode)
        ? rawMode
        : 'full') as PluginMode;

    const allowed = ALLOWED[mode][plugin] ?? [];

    if (!allowed.includes(action)) {
        const label = MODE_LABELS[mode];
        throw new Error(
            `ATENCIÓN IA: La acción '${action}' del plugin '${plugin}' no está disponible ` +
            `en el modo actual del plugin ("${label}"). ` +
            `El usuario ha configurado este plugin para uso restringido. ` +
            `No intentes ejecutar esta acción ni sugerir alternativas que la requieran. ` +
            `Informa al usuario que puede cambiar el modo en el MCP Manager → UranoHubSpot → Configuración.`
        );
    }
}

/**
 * Retorna las acciones permitidas para un plugin en el modo actual.
 * Útil para generar mensajes explicativos.
 */
export function getAllowedActions(plugin: string, config: any): string[] {
    const rawMode = (config?.PLUGIN_MODE || 'full') as string;
    const mode: PluginMode = (['full', 'readonly', 'chat_only'].includes(rawMode)
        ? rawMode
        : 'full') as PluginMode;
    return ALLOWED[mode][plugin] ?? [];
}
