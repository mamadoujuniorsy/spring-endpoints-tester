import * as vscode from 'vscode';
import { Endpoint } from '../models/Endpoint';
import { SpringParser } from '../parsers/SpringParser';

/**
 * CodeLens provider for Spring endpoints
 * Adds "Test Endpoint" links above controller methods
 */
export class SpringCodeLensProvider implements vscode.CodeLensProvider {
    
    private _onDidChangeCodeLenses: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
    public readonly onDidChangeCodeLenses: vscode.Event<void> = this._onDidChangeCodeLenses.event;
    
    /**
     * Refresh CodeLenses
     */
    public refresh(): void {
        this._onDidChangeCodeLenses.fire();
    }
    
    provideCodeLenses(
        document: vscode.TextDocument,
        token: vscode.CancellationToken
    ): vscode.CodeLens[] | Thenable<vscode.CodeLens[]> {
        
        const codeLenses: vscode.CodeLens[] = [];
        
        // Parse the current document
        const endpoints = SpringParser.parseJavaFile(document.getText(), document.uri.fsPath);
        
        for (const endpoint of endpoints) {
            // Create a range for the line where the endpoint is defined
            const line = endpoint.line - 1; // Convert to 0-based
            const range = new vscode.Range(line, 0, line, 0);
            
            // Create CodeLens for testing
            const testLens = new vscode.CodeLens(range, {
                title: `$(play) Test Endpoint`,
                tooltip: `Test ${endpoint.method} ${endpoint.path}`,
                command: 'springEndpoints.testEndpoint',
                arguments: [endpoint]
            });
            
            // Create CodeLens for copying URL
            const copyLens = new vscode.CodeLens(range, {
                title: `$(copy) Copy URL`,
                tooltip: `Copy ${endpoint.path} to clipboard`,
                command: 'springEndpoints.copyUrl',
                arguments: [endpoint]
            });
            
            codeLenses.push(testLens, copyLens);
        }
        
        return codeLenses;
    }
}
