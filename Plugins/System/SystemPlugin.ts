import GenericMcpPlugin from '@core/GenericMcpPlugin';
import { guardMode } from '../mode-guard';

export default class SystemPlugin extends GenericMcpPlugin {
    async executeAction(action: string, payload: any): Promise<any> {
        guardMode('System', action, this.moduleConfig);

        if (action === 'getUserDetails') {
            return await this.callMcpTool('hubspot-get-user-details', {});
        }

        if (action === 'getLink') {
            const pageRequests = typeof payload.pageRequestsJson === 'string'
                ? JSON.parse(payload.pageRequestsJson)
                : payload.pageRequests || [];
            return await this.callMcpTool('hubspot-get-link', {
                portalId: payload.portalId,
                uiDomain: payload.uiDomain,
                pageRequests
            });
        }

        if (action === 'listWorkflows') {
            return await this.callMcpTool('hubspot-list-workflows', {});
        }

        if (action === 'getWorkflow') {
            return await this.callMcpTool('hubspot-get-workflow', {
                workflowId: payload.workflowId
            });
        }

        throw new Error(`Acción '${action}' no soportada en SystemPlugin`);
    }
}
