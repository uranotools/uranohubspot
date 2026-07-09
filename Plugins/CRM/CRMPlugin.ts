import GenericMcpPlugin from '@core/GenericMcpPlugin';
import { guardMode } from '../mode-guard';

export default class CRMPlugin extends GenericMcpPlugin {
    async executeAction(action: string, payload: any): Promise<any> {
        guardMode('CRM', action, this.moduleConfig);

        if (action === 'listObjects') {
            return await this.callMcpTool('hubspot-list-objects', {
                objectType: payload.objectType,
                limit: payload.limit ? Number(payload.limit) : undefined,
                after: payload.after,
                properties: payload.properties,
                associations: payload.associations
            });
        }

        if (action === 'searchObjects') {
            return await this.callMcpTool('hubspot-search-objects', {
                objectType: payload.objectType,
                query: payload.query,
                limit: payload.limit ? Number(payload.limit) : undefined,
                after: payload.after
            });
        }

        if (action === 'batchReadObjects') {
            const ids = (payload.ids || '').split(',').map((id: string) => id.trim()).filter(Boolean);
            const inputs = ids.map((id: string) => ({ id }));
            return await this.callMcpTool('hubspot-batch-read-objects', {
                objectType: payload.objectType,
                inputs
            });
        }

        if (action === 'batchCreateObjects') {
            console.log('[CRMPlugin] batchCreateObjects raw payload:', JSON.stringify(payload, null, 2));
            let inputs;
            try {
                inputs = typeof payload.inputsJson === 'string'
                    ? JSON.parse(payload.inputsJson)
                    : payload.inputsJson || [];
            } catch (err) {
                throw new Error(`JSON.parse failed for inputsJson: "${payload.inputsJson}". Error: ${err.message}`);
            }
            if ((!inputs || inputs.length === 0) && payload.inputs) {
                inputs = payload.inputs;
            }
            console.log('[CRMPlugin] final inputs for callMcpTool:', JSON.stringify(inputs, null, 2));
            return await this.callMcpTool('hubspot-batch-create-objects', {
                objectType: payload.objectType,
                inputs
            });
        }

        if (action === 'batchUpdateObjects') {
            console.log('[CRMPlugin] batchUpdateObjects raw payload:', JSON.stringify(payload, null, 2));
            let inputs;
            try {
                inputs = typeof payload.inputsJson === 'string'
                    ? JSON.parse(payload.inputsJson)
                    : payload.inputsJson || [];
            } catch (err) {
                throw new Error(`JSON.parse failed for inputsJson: "${payload.inputsJson}". Error: ${err.message}`);
            }
            if ((!inputs || inputs.length === 0) && payload.inputs) {
                inputs = payload.inputs;
            }
            console.log('[CRMPlugin] final inputs for callMcpTool:', JSON.stringify(inputs, null, 2));
            return await this.callMcpTool('hubspot-batch-update-objects', {
                objectType: payload.objectType,
                inputs
            });
        }

        if (action === 'getSchemas') {
            return await this.callMcpTool('hubspot-get-schemas', {});
        }

        throw new Error(`Acción '${action}' no soportada en CRMPlugin`);
    }
}
