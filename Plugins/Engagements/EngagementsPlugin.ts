import GenericMcpPlugin from '@core/GenericMcpPlugin';
import { guardMode } from '../mode-guard';

export default class EngagementsPlugin extends GenericMcpPlugin {
    async executeAction(action: string, payload: any): Promise<any> {
        guardMode('Engagements', action, this.moduleConfig);

        if (action === 'createEngagement') {
            const properties = typeof payload.propertiesJson === 'string'
                ? JSON.parse(payload.propertiesJson)
                : payload.properties || {};
            const associations = typeof payload.associationsJson === 'string'
                ? JSON.parse(payload.associationsJson)
                : payload.associations || [];
            return await this.callMcpTool('hubspot-create-engagement', {
                engagementType: payload.engagementType,
                properties,
                associations
            });
        }

        if (action === 'getEngagement') {
            return await this.callMcpTool('hubspot-get-engagement', {
                engagementType: payload.engagementType,
                id: payload.id
            });
        }

        if (action === 'updateEngagement') {
            const properties = typeof payload.propertiesJson === 'string'
                ? JSON.parse(payload.propertiesJson)
                : payload.properties || {};
            return await this.callMcpTool('hubspot-update-engagement', {
                engagementType: payload.engagementType,
                id: payload.id,
                properties
            });
        }

        throw new Error(`Acción '${action}' no soportada en EngagementsPlugin`);
    }
}
