export const UranoHubSpotConfig = {
    name: "uranohubspot",
    description: "Integración completa con HubSpot: gestiona contactos, empresas, negocios, propietarios, webhooks, propiedades, asociaciones y flujos de trabajo.",
    icon: "Users",
    category: "Soporte y Ventas",

    inCloud: true,
    inDesktop: true,

    // ── Engine Plugin Configuration (Hybrid Support) ───────────────────────
    enginePlugin: true,
    engineHooks: ['onSessionStart', 'onLlmInput', 'afterToolCall'],
    enginePluginPath: 'Plugins/Engine/uranohubspotEnginePlugin',

    // ── Plugins habilitados ────────────────────────────────────────────────
    enabledPlugins: ['CRM', 'Engagements', 'Properties', 'Associations', 'System'],

    // ── Credenciales y configuración de entorno ────────────────────────────
    settings: [
        {
            name: 'PLUGIN_MODE',
            type: 'select',
            title: '🔒 Modo de Operación',
            description:
                'Define qué capacidades tiene el agente sobre tu HubSpot.\n' +
                '• Manejo Personal Completo: acceso completo a todas las herramientas (lectura, escritura, creación de propiedades).\n' +
                '• Solo Lectura: consulta y búsqueda de contactos, empresas, tratos, etc., sin modificar nada.\n' +
                '• Solo Chat: diseñado para chatbots de atención. Permite buscar y crear/actualizar contactos, empresas y tratos, además de registrar notas y tareas.',
            options: [
                { label: '✅ Manejo Personal Completo', value: 'full' },
                { label: '👁️ Solo Lectura (sin modificar)', value: 'readonly' },
                { label: '🤖 Solo Chat (buscar + crear/actualizar contactos/deals/tareas)', value: 'chat_only' },
            ],
            perAgent: true
        },
        {
            name: 'HUBSPOT_ACCESS_TOKEN',
            type: 'password',
            title: 'Private App Access Token',
            description: 'Tu Private App Access Token de HubSpot. Generado en Settings -> Integrations -> Private Apps',
        }
    ],

    mcpServer: {
        command: process.platform === 'win32' ? 'cmd.exe' : 'npx',
        args: process.platform === 'win32'
            ? ['/c', 'npx', '-y', '@hubspot/mcp-server']
            : ['-y', '@hubspot/mcp-server'],
        requiredEnv: ['HUBSPOT_ACCESS_TOKEN'],
        defaultEnv: {
            BASE_URL_OVERRIDE: 'https://api.hubapi.com'
        }
    },

    // ── Esquemas de Herramientas MCP ───────────────────────────────────────
    pluginSchemas: {
        CRM: {
            actions: {
                listObjects: {
                    label: 'Listar Objetos CRM',
                    description: 'Obtiene una lista paginada de objetos CRM (contacts, companies, deals, tickets, etc.)',
                    fields: [
                        { name: 'objectType', type: 'required', label: 'Tipo de Objeto (ej. contacts, companies, deals)' },
                        { name: 'limit', type: 'text', label: 'Límite (máx 500, default: 100)' },
                        { name: 'after', type: 'text', label: 'Cursor de paginación (after)' }
                    ]
                },
                searchObjects: {
                    label: 'Buscar Objetos CRM',
                    description: 'Busca objetos CRM aplicando filtros, ordenamiento y búsqueda de texto completo',
                    fields: [
                        { name: 'objectType', type: 'required', label: 'Tipo de Objeto (ej. contacts, companies, deals)' },
                        { name: 'query', type: 'text', label: 'Término de búsqueda (opcional)' }
                    ]
                },
                batchReadObjects: {
                    label: 'Leer Objetos en Lote',
                    description: 'Recupera múltiples objetos de un tipo usando sus IDs',
                    fields: [
                        { name: 'objectType', type: 'required', label: 'Tipo de Objeto' },
                        { name: 'ids', type: 'required', label: 'IDs separados por comas' }
                    ]
                },
                batchCreateObjects: {
                    label: 'Crear Objetos en Lote',
                    description: 'Crea múltiples objetos CRM de un mismo tipo',
                    fields: [
                        { name: 'objectType', type: 'required', label: 'Tipo de Objeto' },
                        { name: 'inputsJson', type: 'required', label: 'JSON de inputs (Array de objetos con properties y opcionalmente associations)' }
                    ]
                },
                batchUpdateObjects: {
                    label: 'Actualizar Objetos en Lote',
                    description: 'Actualiza múltiples objetos CRM de un mismo tipo',
                    fields: [
                        { name: 'objectType', type: 'required', label: 'Tipo de Objeto' },
                        { name: 'inputsJson', type: 'required', label: 'JSON de inputs (Array de objetos con id y properties)' }
                    ]
                },
                getSchemas: {
                    label: 'Obtener Esquemas de Objetos',
                    description: 'Obtiene la lista y definiciones de esquemas de todos los objetos, incluyendo personalizados',
                    fields: []
                }
            }
        },
        Engagements: {
            actions: {
                createEngagement: {
                    label: 'Crear Actividad/Compromiso',
                    description: 'Crea una actividad o compromiso (notas, tareas, reuniones, correos, llamadas) en un objeto',
                    fields: [
                        { name: 'engagementType', type: 'required', label: 'Tipo (notes, tasks, meetings, emails, calls)' },
                        { name: 'propertiesJson', type: 'required', label: 'Propiedades de la actividad en formato JSON' },
                        { name: 'associationsJson', type: 'text', label: 'Asociaciones en formato JSON (opcional)' }
                    ]
                },
                getEngagement: {
                    label: 'Obtener Actividad',
                    description: 'Obtiene los detalles de una actividad/compromiso específico por su ID y tipo',
                    fields: [
                        { name: 'engagementType', type: 'required', label: 'Tipo (notes, tasks, meetings, emails, calls)' },
                        { name: 'id', type: 'required', label: 'ID de la Actividad' }
                    ]
                },
                updateEngagement: {
                    label: 'Actualizar Actividad',
                    description: 'Actualiza una actividad/compromiso existente',
                    fields: [
                        { name: 'engagementType', type: 'required', label: 'Tipo (notes, tasks, meetings, emails, calls)' },
                        { name: 'id', type: 'required', label: 'ID de la Actividad' },
                        { name: 'propertiesJson', type: 'required', label: 'Propiedades a actualizar en formato JSON' }
                    ]
                }
            }
        },
        Properties: {
            actions: {
                listProperties: {
                    label: 'Listar Propiedades',
                    description: 'Obtiene todas las propiedades definidas para un tipo de objeto específico',
                    fields: [
                        { name: 'objectType', type: 'required', label: 'Tipo de Objeto' }
                    ]
                },
                getProperty: {
                    label: 'Ver Detalle de Propiedad',
                    description: 'Obtiene los detalles de una propiedad específica de un objeto',
                    fields: [
                        { name: 'objectType', type: 'required', label: 'Tipo de Objeto' },
                        { name: 'propertyName', type: 'required', label: 'Nombre de la Propiedad' }
                    ]
                },
                createProperty: {
                    label: 'Crear Propiedad',
                    description: 'Crea una propiedad personalizada para un tipo de objeto específico',
                    fields: [
                        { name: 'objectType', type: 'required', label: 'Tipo de Objeto' },
                        { name: 'propertyJson', type: 'required', label: 'Definición de propiedad en JSON' }
                    ]
                },
                updateProperty: {
                    label: 'Actualizar Propiedad',
                    description: 'Actualiza la definición de una propiedad existente',
                    fields: [
                        { name: 'objectType', type: 'required', label: 'Tipo de Objeto' },
                        { name: 'propertyName', type: 'required', label: 'Nombre de la Propiedad' },
                        { name: 'propertyJson', type: 'required', label: 'Nuevos campos en JSON' }
                    ]
                }
            }
        },
        Associations: {
            actions: {
                listAssociations: {
                    label: 'Listar Asociaciones',
                    description: 'Lista los IDs de objetos asociados a un objeto de origen específico',
                    fields: [
                        { name: 'fromObjectType', type: 'required', label: 'Tipo de objeto origen' },
                        { name: 'fromObjectId', type: 'required', label: 'ID del objeto origen' },
                        { name: 'toObjectType', type: 'required', label: 'Tipo de objeto destino' }
                    ]
                },
                batchCreateAssociations: {
                    label: 'Crear Asociaciones en Lote',
                    description: 'Crea relaciones de asociación en lote entre objetos de origen y destino',
                    fields: [
                        { name: 'fromObjectType', type: 'required', label: 'Tipo de objeto origen' },
                        { name: 'toObjectType', type: 'required', label: 'Tipo de objeto destino' },
                        { name: 'inputsJson', type: 'required', label: 'JSON de asociaciones (Array con from/to/types)' }
                    ]
                },
                getAssociationDefinitions: {
                    label: 'Obtener Tipos de Asociación',
                    description: 'Obtiene las definiciones y etiquetas de asociación válidas entre dos tipos de objetos',
                    fields: [
                        { name: 'fromObjectType', type: 'required', label: 'Tipo de objeto origen' },
                        { name: 'toObjectType', type: 'required', label: 'Tipo de objeto destino' }
                    ]
                }
            }
        },
        System: {
            actions: {
                getUserDetails: {
                    label: 'Obtener Detalles de Usuario/Token',
                    description: 'Obtiene información del usuario, portal ID, scopes autorizados y detalles del propietario actual',
                    fields: []
                },
                getLink: {
                    label: 'Generar Enlace de HubSpot',
                    description: 'Genera enlaces directos a la interfaz web de HubSpot para registros o listas de un objeto',
                    fields: [
                        { name: 'portalId', type: 'required', label: 'Portal ID' },
                        { name: 'uiDomain', type: 'required', label: 'Dominio de interfaz (ej. app.hubspot.com)' },
                        { name: 'pageRequestsJson', type: 'required', label: 'JSON de solicitudes (Array con pagetype y objectTypeId/objectId)' }
                    ]
                },
                listWorkflows: {
                    label: 'Listar Flujos de Trabajo',
                    description: 'Obtiene una lista de workflows del portal',
                    fields: []
                },
                getWorkflow: {
                    label: 'Ver Detalles de Flujo',
                    description: 'Obtiene la definición detallada de un workflow por su ID',
                    fields: [
                        { name: 'workflowId', type: 'required', label: 'ID del Workflow' }
                    ]
                }
            }
        }
    }
};
