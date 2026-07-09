import { EnginePluginBase } from '@core/EnginePluginBase';
import type { SessionContext } from '@core/runtime/SessionContext';

export class uranohubspotEnginePlugin extends EnginePluginBase {
    protected config: any;

    constructor(config: any) {
        super(config);
        this.config = config;
    }

    async onSessionStart(ctx: SessionContext): Promise<void> {
        console.log(`[uranohubspotEnginePlugin] Sesión iniciada: ${ctx.sessionId}`);
        const mode = this.config?.PLUGIN_MODE || 'full';
        console.log(`[uranohubspotEnginePlugin] Modo detectado: ${mode}`);
        
        if (mode === 'chat_only') {
            ctx.addBadge({
                id: 'hubspot-chat-active',
                label: '🤖 HubSpot Chat',
                color: 'success'
            });
            await ctx.store.setSession('message_count', 0);
            await ctx.store.setSession('needs_sync_check', true); // Force initial sync check

            ctx.appendCustomInstructions(
                `\n\n[🔒 MÓDULO HUBSPOT - PROTOCOLO DE CONVERSACIÓN (MODO CHAT)]\n` +
                `El plugin de HubSpot está configurado en el modo: "chat_only".\n` +
                `Como agente, debes seguir estrictamente las siguientes reglas de negocio en esta conversación:\n` +
                `1. Al iniciar el chat, es MANDATORIO que saludes al usuario y le solicites activamente sus datos de contacto (nombre, apellido y correo electrónico) para registrarlo en el sistema. Hazlo en tu primera respuesta.\n` +
                `2. Tan pronto como el usuario te proporcione el primer dato significativo (ej. su correo o su nombre), debes crear de inmediato el contacto en HubSpot de fondo llamando a la herramienta 'batchCreateObjects' (objectType 'contacts'). No esperes a tener toda la información.\n` +
                `3. Una vez creado el contacto, el sistema te inyectará su ID de forma transparente en el contexto. A partir de ahí, debes usar 'batchUpdateObjects' (objectType 'contacts') con ese ID para actualizar o agregar cualquier nueva información que captes durante el diálogo (teléfono, empresa, notas, tratos, etc.).`
            );
        }
    }

    async onLlmInput(ctx: SessionContext, llmPayload: any): Promise<void> {
        const mode = this.config?.PLUGIN_MODE || 'full';
        if (mode !== 'chat_only') return;

        // Increment message count
        const count = (await ctx.store.getSession<number>('message_count')) || 0;
        const newCount = count + 1;
        await ctx.store.setSession('message_count', newCount);

        // Every 5 messages, trigger a refresh/sync check in background
        if (newCount % 5 === 0) {
            await ctx.store.setSession('needs_sync_check', true);
        }

        const contactId = await ctx.store.getSession<string>('hubspot_contact_id');
        const contactData = await ctx.store.getSession<any>('hubspot_contact_data');
        const dealId = await ctx.store.getSession<string>('hubspot_deal_id');
        const dealData = await ctx.store.getSession<any>('hubspot_deal_data');
        const needsSync = await ctx.store.getSession<boolean>('needs_sync_check');

        let dynamicCtx = '';

        if (contactId) {
            dynamicCtx += `\n\n[HUBSPOT CONTEXTO ACTIVO (CONTACTO ID: ${contactId})]\n` +
                `- Estás interactuando con el contacto de HubSpot con ID: "${contactId}".\n` +
                `- Cualquier nuevo dato recopilado de este usuario debe guardarse/actualizarse llamando a 'batchUpdateObjects' con el objectType 'contacts' e id '${contactId}'.\n` +
                `- NO intentes crear un nuevo contacto. Actualiza siempre el existente.\n`;
            if (contactData) {
                dynamicCtx += `- Datos actuales del contacto en HubSpot:\n${JSON.stringify(contactData, null, 2)}\n`;
            }
        }

        if (dealId) {
            dynamicCtx += `\n[HUBSPOT TRATO ACTIVO (ID: ${dealId})]\n` +
                `- ID del trato comercial asociado: "${dealId}"\n`;
            if (dealData) {
                dynamicCtx += `- Datos actuales del trato:\n${JSON.stringify(dealData, null, 2)}\n`;
            }
        }

        // Silent synchronization directive (one-time)
        if (needsSync && contactId) {
            dynamicCtx += `\n[INSTRUCCIÓN DEL SISTEMA (UN SOLO USO - SILENCIOSO)]\n` +
                `- Llama inmediatamente a 'batchReadObjects' para el contacto '${contactId}' (objectType 'contacts') de forma silenciosa para sincronizar cualquier cambio externo del CRM. Hazlo de fondo en este turno sin notificar al usuario.\n`;
            await ctx.store.setSession('needs_sync_check', false);
        }

        if (dynamicCtx) {
            llmPayload.systemPrompt += '\n\n' + dynamicCtx;
        }
    }

    async afterToolCall(ctx: SessionContext, toolCall: any, result: any): Promise<any> {
        const mode = this.config?.PLUGIN_MODE || 'full';
        if (mode !== 'chat_only') return result;

        const toolName = toolCall.name.toLowerCase();
        if (toolName.includes('uranohubspot')) {
            const objectType = toolCall.arguments?.objectType;
            if (objectType === 'contacts') {
                const cid = this.extractIdFromResult(result);
                if (cid) {
                    const currentCid = await ctx.store.getSession<string>('hubspot_contact_id');
                    if (cid !== currentCid) {
                        await ctx.store.setSession('hubspot_contact_id', cid);
                        console.log(`[uranohubspotEnginePlugin] Guardado nuevo contact_id en sesión: ${cid}`);
                    }
                }
                const cdata = this.extractDataFromResult(result);
                if (cdata) {
                    await ctx.store.setSession('hubspot_contact_data', cdata);
                    console.log(`[uranohubspotEnginePlugin] Guardado contact_data actualizado en sesión.`);
                }
            } else if (objectType === 'deals') {
                const did = this.extractIdFromResult(result);
                if (did) {
                    const currentDid = await ctx.store.getSession<string>('hubspot_deal_id');
                    if (did !== currentDid) {
                        await ctx.store.setSession('hubspot_deal_id', did);
                        console.log(`[uranohubspotEnginePlugin] Guardado nuevo deal_id en sesión: ${did}`);
                    }
                }
                const ddata = this.extractDataFromResult(result);
                if (ddata) {
                    await ctx.store.setSession('hubspot_deal_data', ddata);
                    console.log(`[uranohubspotEnginePlugin] Guardado deal_data actualizado en sesión.`);
                }
            }
        }
        return result;
    }

    private extractIdFromResult(resultContent: any): string | null {
        if (!resultContent) return null;
        let text = '';
        if (typeof resultContent === 'string') {
            text = resultContent;
        } else if (typeof resultContent === 'object') {
            if (Array.isArray(resultContent.content)) {
                text = resultContent.content.map((c: any) => c.text || '').join(' ');
            } else if (resultContent.content && typeof resultContent.content === 'string') {
                text = resultContent.content;
            } else {
                text = JSON.stringify(resultContent);
            }
        }
        
        try {
            const parsed = JSON.parse(text);
            if (parsed.results && Array.isArray(parsed.results) && parsed.results.length > 0) {
                return parsed.results[0].id || null;
            }
            if (parsed.id) {
                return parsed.id;
            }
        } catch {}
        
        const idRegex = /"id"\s*:\s*"(\d+)"/i;
        const match = text.match(idRegex);
        if (match && match[1]) {
            return match[1];
        }
        return null;
    }

    private extractDataFromResult(resultContent: any): any {
        if (!resultContent) return null;
        let text = '';
        if (typeof resultContent === 'string') {
            text = resultContent;
        } else if (typeof resultContent === 'object') {
            if (Array.isArray(resultContent.content)) {
                text = resultContent.content.map((c: any) => c.text || '').join(' ');
            } else if (resultContent.content && typeof resultContent.content === 'string') {
                text = resultContent.content;
            } else {
                text = JSON.stringify(resultContent);
            }
        }
        
        try {
            const parsed = JSON.parse(text);
            if (parsed.results && Array.isArray(parsed.results) && parsed.results.length > 0) {
                return parsed.results[0].properties || parsed.results[0];
            }
            if (parsed.properties) {
                return parsed.properties;
            }
            return parsed;
        } catch {
            return null;
        }
    }
}
