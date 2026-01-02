import * as vscode from 'vscode';
import { Endpoint } from '../models/Endpoint';
import { SpringParser } from '../parsers/SpringParser';

/**
 * Tree item representing an endpoint or controller group
 */
export class EndpointTreeItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly endpoint?: Endpoint,
        public readonly isController: boolean = false
    ) {
        super(label, collapsibleState);
        
        if (endpoint) {
            this.tooltip = `${endpoint.method} ${endpoint.path}`;
            this.description = endpoint.path;
            this.contextValue = 'endpoint';
            
            // Set icon based on HTTP method
            this.iconPath = new vscode.ThemeIcon(this.getMethodIcon(endpoint.method));
            
            // Command to navigate to the endpoint definition
            this.command = {
                command: 'springEndpoints.goToEndpoint',
                title: 'Go to Endpoint',
                arguments: [endpoint]
            };
        } else if (isController) {
            this.contextValue = 'controller';
            this.iconPath = new vscode.ThemeIcon('symbol-class');
        }
    }
    
    private getMethodIcon(method: string): string {
        switch (method) {
            case 'GET': return 'arrow-down';
            case 'POST': return 'add';
            case 'PUT': return 'edit';
            case 'DELETE': return 'trash';
            case 'PATCH': return 'diff-modified';
            default: return 'circle-outline';
        }
    }
}

/**
 * Tree data provider for Spring endpoints
 */
export class EndpointsTreeProvider implements vscode.TreeDataProvider<EndpointTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<EndpointTreeItem | undefined | void> = 
        new vscode.EventEmitter<EndpointTreeItem | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<EndpointTreeItem | undefined | void> = 
        this._onDidChangeTreeData.event;
    
    private endpoints: Endpoint[] = [];
    
    constructor() {
        this.refresh();
    }
    
    /**
     * Refresh the tree view
     */
    public async refresh(): Promise<void> {
        this.endpoints = await SpringParser.scanWorkspaceForEndpoints();
        this._onDidChangeTreeData.fire();
        
        // Show notification
        const count = this.endpoints.length;
        if (count > 0) {
            vscode.window.showInformationMessage(
                `Found ${count} Spring endpoint${count > 1 ? 's' : ''}`
            );
        }
    }
    
    getTreeItem(element: EndpointTreeItem): vscode.TreeItem {
        return element;
    }
    
    getChildren(element?: EndpointTreeItem): Thenable<EndpointTreeItem[]> {
        if (!element) {
            // Root level: group by controller
            return Promise.resolve(this.getControllers());
        } else if (element.isController) {
            // Controller level: show endpoints
            return Promise.resolve(this.getEndpointsForController(element.label));
        }
        
        return Promise.resolve([]);
    }
    
    /**
     * Get list of controllers
     */
    private getControllers(): EndpointTreeItem[] {
        const controllerMap = new Map<string, number>();
        
        // Count endpoints per controller
        for (const endpoint of this.endpoints) {
            const count = controllerMap.get(endpoint.className) || 0;
            controllerMap.set(endpoint.className, count + 1);
        }
        
        // Create tree items
        const controllers: EndpointTreeItem[] = [];
        for (const [className, count] of controllerMap.entries()) {
            const item = new EndpointTreeItem(
                className,
                vscode.TreeItemCollapsibleState.Expanded,
                undefined,
                true
            );
            item.description = `${count} endpoint${count > 1 ? 's' : ''}`;
            controllers.push(item);
        }
        
        return controllers.sort((a, b) => a.label.localeCompare(b.label));
    }
    
    /**
     * Get endpoints for a specific controller
     */
    private getEndpointsForController(className: string): EndpointTreeItem[] {
        const controllerEndpoints = this.endpoints.filter(
            e => e.className === className
        );
        
        return controllerEndpoints.map(endpoint => {
            const label = `${endpoint.method} ${endpoint.methodName}`;
            return new EndpointTreeItem(
                label,
                vscode.TreeItemCollapsibleState.None,
                endpoint,
                false
            );
        });
    }
    
    /**
     * Get all endpoints (for other components)
     */
    public getEndpoints(): Endpoint[] {
        return this.endpoints;
    }
}
