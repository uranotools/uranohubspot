---
name: uranohubspot
description: Gestión completa de CRM con HubSpot — administra contactos, empresas, tratos, compromisos, propiedades y flujos de trabajo en el CRM directamente desde el agente.
tools: [urano_uranohubspot_crm_listobjects, urano_uranohubspot_crm_searchobjects, urano_uranohubspot_crm_batchreadobjects, urano_uranohubspot_crm_batchcreateobjects, urano_uranohubspot_crm_batchupdateobjects, urano_uranohubspot_crm_getschemas, urano_uranohubspot_engagements_createengagement, urano_uranohubspot_engagements_getengagement, urano_uranohubspot_engagements_updateengagement, urano_uranohubspot_properties_listproperties, urano_uranohubspot_properties_getproperty, urano_uranohubspot_properties_createproperty, urano_uranohubspot_properties_updateproperty, urano_uranohubspot_associations_listassociations, urano_uranohubspot_associations_batchcreateassociations, urano_uranohubspot_associations_getassociationdefinitions, urano_uranohubspot_system_getuserdetails, urano_uranohubspot_system_getlink, urano_uranohubspot_system_listworkflows, urano_uranohubspot_system_getworkflow]
type: mcp
---

# Skill: UranoHubSpot — CRM Inteligente y Gestión Comercial

Este módulo conecta al agente con la cuenta de HubSpot del usuario, permitiendo buscar, crear, actualizar y relacionar objetos del CRM (contactos, empresas, deals/negocios), registrar actividades y notas, e interactuar con propiedades y workflows comerciales.

---

## Protocolo de Inicio Obligatorio

**SIEMPRE** que el usuario pida gestionar o consultar datos de su CRM de HubSpot, debes:

1. Validar la conexión y obtener detalles de tu portal y propietario ejecutando `urano_uranohubspot_system_getuserdetails`.
2. Si obtienes un error indicando que las credenciales no están configuradas, informa amablemente al usuario para que configure su `Private App Access Token` en **MCP Manager → UranoHubSpot → Configuración**.
3. Usa la información de `ownerId` de la sesión y el dominio de HubSpot (`uiDomain`) para guiar tu comportamiento y generar links cuando sea apropiado.

---

## 🔒 Modo de Operación (PLUGIN_MODE)

El administrador de la cuenta puede limitar tus permisos sobre HubSpot. Si intentas ejecutar una herramienta y el plugin devuelve un error con el prefijo `ATENCIÓN IA:`, significa que la acción está bloqueada en el modo actual:

- **Informa al usuario** con cortesía indicándole qué acción está bloqueada.
- **Indica el modo activo** y dónde puede configurarlo: *MCP Manager → UranoHubSpot → Configuración → Modo de Operación*.
- **NO intentes rodear la restricción** de seguridad.

### Niveles de Acceso por Modo

#### 1. Modo `full` (Manejo Personal Completo)
* **Descripción**: Acceso absoluto sin restricciones.
* **Herramientas permitidas**: Todas las herramientas expuestas en el módulo.

#### 2. Modo `readonly` (Solo Lectura)
* **Descripción**: Únicamente consulta de registros comerciales.
* **Herramientas permitidas**:
  * `urano_uranohubspot_crm_listobjects`
  * `urano_uranohubspot_crm_searchobjects`
  * `urano_uranohubspot_crm_batchreadobjects`
  * `urano_uranohubspot_crm_getschemas`
  * `urano_uranohubspot_engagements_getengagement`
  * `urano_uranohubspot_properties_listproperties`
  * `urano_uranohubspot_properties_getproperty`
  * `urano_uranohubspot_associations_listassociations`
  * `urano_uranohubspot_associations_getassociationdefinitions`
  * `urano_uranohubspot_system_getuserdetails`
  * `urano_uranohubspot_system_getlink`
  * `urano_uranohubspot_system_listworkflows`
  * `urano_uranohubspot_system_getworkflow`
* **Herramientas bloqueadas (NO usar)**:
  * `urano_uranohubspot_crm_batchcreateobjects`
  * `urano_uranohubspot_crm_batchupdateobjects`
  * `urano_uranohubspot_engagements_createengagement`
  * `urano_uranohubspot_engagements_updateengagement`
  * `urano_uranohubspot_properties_createproperty`
  * `urano_uranohubspot_properties_updateproperty`
  * `urano_uranohubspot_associations_batchcreateassociations`

#### 3. Modo `chat_only` (Solo Chat/Conversacional)
* **Descripción**: Permite buscar y crear o actualizar prospectos, clientes y tratos comerciales en el CRM, además de registrar notas y tareas para flujos de venta en chat. Sin embargo, no permite alterar definiciones administrativas de propiedades, ni visualizar flujos de trabajo (workflows).
* **Herramientas permitidas**:
  * `urano_uranohubspot_crm_listobjects`
  * `urano_uranohubspot_crm_searchobjects`
  * `urano_uranohubspot_crm_batchreadobjects`
  * `urano_uranohubspot_crm_batchcreateobjects`
  * `urano_uranohubspot_crm_batchupdateobjects`
  * `urano_uranohubspot_crm_getschemas`
  * `urano_uranohubspot_engagements_createengagement`
  * `urano_uranohubspot_engagements_getengagement`
  * `urano_uranohubspot_engagements_updateengagement`
  * `urano_uranohubspot_properties_listproperties`
  * `urano_uranohubspot_properties_getproperty`
  * `urano_uranohubspot_associations_listassociations`
  * `urano_uranohubspot_associations_batchcreateassociations`
  * `urano_uranohubspot_associations_getassociationdefinitions`
  * `urano_uranohubspot_system_getuserdetails`
  * `urano_uranohubspot_system_getlink`
* **Herramientas bloqueadas (NO usar)**:
  * `urano_uranohubspot_properties_createproperty`
  * `urano_uranohubspot_properties_updateproperty`
  * `urano_uranohubspot_system_listworkflows`
  * `urano_uranohubspot_system_getworkflow`

---

## Guía de Uso del CRM de HubSpot

### 👥 Gestión de Contactos, Empresas y Tratos

- Al usar herramientas en lote (`batchCreateObjects` o `batchUpdateObjects`), el parámetro `inputsJson` debe ser un arreglo de objetos JSON en formato string.
  - *Ejemplo de `inputsJson` para creación*:
    ```json
    [
      {
        "properties": {
          "email": "juan.perez@example.com",
          "firstname": "Juan",
          "lastname": "Pérez"
        }
      }
    ]
    ```
  - *Ejemplo de `inputsJson` para actualización*:
    ```json
    [
      {
        "id": "101",
        "properties": {
          "phone": "+50255551234",
          "company": "Tecnología Avanzada"
        }
      }
    ]
    ```

### 🗒️ Actividades y Compromisos (Engagements)

- Permite registrar interacciones. Los tipos válidos son: `notes`, `tasks`, `meetings`, `emails`, `calls`.
- `propertiesJson` debe contener campos específicos del tipo de compromiso (ej. `hs_note_body` para notas, `hs_task_subject` para tareas).
- *Ejemplo para crear una nota asociada a un contacto*:
  - **engagementType**: `notes`
  - **propertiesJson**: `{"hs_note_body": "El cliente está interesado en la propuesta de desarrollo web."}`
  - **associationsJson**:
    ```json
    [
      {
        "to": { "id": "CONTACT_ID_AQUÍ" },
        "types": [
          {
            "associationCategory": "HUBSPOT_DEFINED",
            "associationTypeId": 202
          }
        ]
      }
    ]
    ```
- **Nota**: Llama siempre a `urano_uranohubspot_associations_getassociationdefinitions` si tienes dudas sobre los `associationTypeId` válidos para el enlace de objetos.

### 🔗 Creación de Enlaces Directos al CRM

- Cuando realices operaciones exitosas (ej. crear un contacto o deal), ofrece un enlace web directo al usuario usando `urano_uranohubspot_system_getlink` pasando el `portalId`, `uiDomain` y las páginas solicitadas.
  - *Ejemplo*: Generar enlace de vista del registro del contacto `12345` (usando `objectTypeId: "0-1"`).
