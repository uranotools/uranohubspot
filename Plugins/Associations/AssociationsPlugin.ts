import GenericMcpPlugin from '@core/GenericMcpPlugin';
import { guardMode } from '../mode-guard';

export default class AssociationsPlugin extends GenericMcpPlugin {
    async executeAction(action: string, payload: any): Promise<any> {
        guardMode('Associations', action, this.moduleConfig);

        if (action === 'listAssociations') {
            return await this.callMcpTool('hubspot-list-associations', {
                fromObjectType: payload.fromObjectType,
                fromObjectId: payload.fromObjectId,
                toObjectType: payload.toObjectType
            });
        }

        if (action === 'batchCreateAssociations') {
            const inputs = typeof payload.inputsJson === 'string'
                ? JSON.parse(payload.inputsJson)
                : payload.inputs || [];
            return await this.callMcpTool('hubspot-batch-create-associations', {
                fromObjectType: payload.fromObjectType,
                toObjectType: payload.toObjectType,
                inputs
            });
        }

        if (action === 'getAssociationDefinitions') {
            return await this.callMcpTool('hubspot-get-association-definitions', {
                fromObjectType: payload.fromObjectType,
                toObjectType: payload.toObjectType
            });
        }

        throw new Error(`Acción '${action}' no soportada en AssociationsPlugin`);
    }
}
