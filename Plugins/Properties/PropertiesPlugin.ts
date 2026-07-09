import GenericMcpPlugin from '@core/GenericMcpPlugin';
import { guardMode } from '../mode-guard';

export default class PropertiesPlugin extends GenericMcpPlugin {
    async executeAction(action: string, payload: any): Promise<any> {
        guardMode('Properties', action, this.moduleConfig);

        if (action === 'listProperties') {
            return await this.callMcpTool('hubspot-list-properties', {
                objectType: payload.objectType
            });
        }

        if (action === 'getProperty') {
            return await this.callMcpTool('hubspot-get-property', {
                objectType: payload.objectType,
                propertyName: payload.propertyName
            });
        }

        if (action === 'createProperty') {
            const property = typeof payload.propertyJson === 'string'
                ? JSON.parse(payload.propertyJson)
                : payload.property || {};
            return await this.callMcpTool('hubspot-create-property', {
                objectType: payload.objectType,
                property
            });
        }

        if (action === 'updateProperty') {
            const property = typeof payload.propertyJson === 'string'
                ? JSON.parse(payload.propertyJson)
                : payload.property || {};
            return await this.callMcpTool('hubspot-update-property', {
                objectType: payload.objectType,
                propertyName: payload.propertyName,
                property
            });
        }

        throw new Error(`Acción '${action}' no soportada en PropertiesPlugin`);
    }
}
