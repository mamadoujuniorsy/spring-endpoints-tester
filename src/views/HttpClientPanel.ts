import * as vscode from 'vscode';
import { Endpoint } from '../models/Endpoint';
import { HttpRequest } from '../models/HttpRequest';
import { HttpClient } from '../utils/HttpClient';

/**
 * WebView panel for HTTP client
 */
export class HttpClientPanel {
    public static currentPanel: HttpClientPanel | undefined;
    private readonly panel: vscode.WebviewPanel;
    private readonly extensionUri: vscode.Uri;
    private disposables: vscode.Disposable[] = [];
    
    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        this.panel = panel;
        this.extensionUri = extensionUri;
        
        // Set HTML content
        this.panel.webview.html = this.getHtmlContent();
        
        // Handle messages from webview
        this.panel.webview.onDidReceiveMessage(
            message => this.handleMessage(message),
            null,
            this.disposables
        );
        
        // Cleanup on panel dispose
        this.panel.onDidDispose(() => this.dispose(), null, this.disposables);
    }
    
    /**
     * Create or show the HTTP client panel
     */
    public static createOrShow(extensionUri: vscode.Uri, endpoint?: Endpoint): void {
        const column = vscode.ViewColumn.Beside;
        
        // If panel already exists, show it
        if (HttpClientPanel.currentPanel) {
            HttpClientPanel.currentPanel.panel.reveal(column);
            if (endpoint) {
                HttpClientPanel.currentPanel.loadEndpoint(endpoint);
            }
            return;
        }
        
        // Create new panel
        const panel = vscode.window.createWebviewPanel(
            'springHttpClient',
            'Spring HTTP Client',
            column,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );
        
        HttpClientPanel.currentPanel = new HttpClientPanel(panel, extensionUri);
        
        if (endpoint) {
            HttpClientPanel.currentPanel.loadEndpoint(endpoint);
        }
    }
    
    /**
     * Load an endpoint into the client
     */
    private loadEndpoint(endpoint: Endpoint): void {
        const config = vscode.workspace.getConfiguration('springEndpoints');
        const baseUrl = config.get<string>('baseUrl', 'http://localhost:8080');
        
        // Build URL with placeholders for path variables
        let url = baseUrl + endpoint.path;
        
        // Build sample body for @RequestBody parameters
        let body = '';
        const bodyParam = endpoint.parameters.find(p => p.annotation === '@RequestBody');
        if (bodyParam) {
            body = this.generateSampleBody(bodyParam.type);
        }
        
        // Build query params for @RequestParam
        const queryParams: { [key: string]: string } = {};
        for (const param of endpoint.parameters) {
            if (param.annotation === '@RequestParam') {
                queryParams[param.name] = param.defaultValue || '';
            }
        }
        
        this.panel.webview.postMessage({
            type: 'loadEndpoint',
            endpoint: {
                method: endpoint.method,
                url,
                body,
                queryParams
            }
        });
    }
    
    /**
     * Generate sample JSON body based on parameter type
     */
    private generateSampleBody(type: string): string {
        // Common type mappings
        const samples: { [key: string]: any } = {
            'User': {
                "name": "John Doe",
                "email": "john@example.com",
                "age": 30
            },
            'UserDTO': {
                "name": "John Doe",
                "email": "john@example.com",
                "age": 30
            },
            'Product': {
                "name": "Laptop",
                "description": "High-performance laptop",
                "price": 999.99,
                "stock": 10
            },
            'ProductDTO': {
                "name": "Laptop",
                "description": "High-performance laptop",
                "price": 999.99,
                "stock": 10
            },
            'String': "example text",
            'Integer': 123,
            'Long': 123,
            'Boolean': true,
            'Double': 123.45
        };
        
        // Check if we have a sample for this type
        if (samples[type]) {
            return JSON.stringify(samples[type], null, 2);
        }
        
        // Check for Map<String, String> or similar
        if (type.includes('Map')) {
            return JSON.stringify({ "key": "value" }, null, 2);
        }
        
        // Check for List or Array
        if (type.includes('List') || type.includes('[]')) {
            return JSON.stringify([{ "example": "item" }], null, 2);
        }
        
        // Default: empty object with a hint
        return '{\n  "// Add your JSON here": ""\n}';
    }
    
    /**
     * Handle messages from webview
     */
    private async handleMessage(message: any): Promise<void> {
        switch (message.type) {
            case 'sendRequest':
                await this.sendRequest(message.request);
                break;
        }
    }
    
    /**
     * Send HTTP request
     */
    private async sendRequest(request: HttpRequest): Promise<void> {
        try {
            const response = await HttpClient.sendRequest(request);
            
            this.panel.webview.postMessage({
                type: 'response',
                response
            });
        } catch (error) {
            vscode.window.showErrorMessage(
                `Error sending request: ${error instanceof Error ? error.message : String(error)}`
            );
        }
    }
    
    /**
     * Get HTML content for webview
     */
    private getHtmlContent(): string {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Spring HTTP Client</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: var(--vscode-font-family);
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .section {
            margin-bottom: 20px;
        }
        
        .section-title {
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 10px;
            color: var(--vscode-foreground);
        }
        
        .request-line {
            display: flex;
            gap: 10px;
            margin-bottom: 10px;
        }
        
        select, input, textarea {
            background-color: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border: 1px solid var(--vscode-input-border);
            padding: 6px 10px;
            font-family: var(--vscode-font-family);
            font-size: 13px;
        }
        
        select {
            width: 120px;
        }
        
        input[type="text"] {
            flex: 1;
        }
        
        textarea {
            width: 100%;
            min-height: 100px;
            font-family: var(--vscode-editor-font-family);
            resize: vertical;
        }
        
        button {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 8px 16px;
            cursor: pointer;
            font-size: 13px;
            font-weight: 500;
        }
        
        button:hover {
            background-color: var(--vscode-button-hoverBackground);
        }
        
        .params-container {
            display: flex;
            flex-direction: column;
            gap: 5px;
        }
        
        .param-row {
            display: flex;
            gap: 10px;
        }
        
        .param-row input {
            flex: 1;
        }
        
        .response-section {
            margin-top: 30px;
            border-top: 1px solid var(--vscode-panel-border);
            padding-top: 20px;
        }
        
        .status-line {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 15px;
        }
        
        .status-badge {
            padding: 4px 8px;
            border-radius: 3px;
            font-weight: 600;
            font-size: 12px;
        }
        
        .status-success {
            background-color: #4caf50;
            color: white;
        }
        
        .status-error {
            background-color: #f44336;
            color: white;
        }
        
        .status-info {
            background-color: #2196f3;
            color: white;
        }
        
        .duration {
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
        }
        
        .response-body {
            background-color: var(--vscode-editor-background);
            border: 1px solid var(--vscode-panel-border);
            padding: 10px;
            overflow-x: auto;
            font-family: var(--vscode-editor-font-family);
            font-size: 12px;
            max-height: 400px;
            overflow-y: auto;
        }
        
        pre {
            margin: 0;
            white-space: pre-wrap;
            word-wrap: break-word;
        }
        
        .hidden {
            display: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="section">
            <div class="section-title">Request</div>
            <div class="request-line">
                <select id="method">
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                    <option value="PATCH">PATCH</option>
                </select>
                <input type="text" id="url" placeholder="http://localhost:8080/api/endpoint" />
                <button id="sendBtn">Send</button>
            </div>
        </div>
        
        <div class="section">
            <div class="section-title">Query Parameters</div>
            <div id="queryParams" class="params-container">
                <div class="param-row">
                    <input type="text" placeholder="Key" class="param-key" />
                    <input type="text" placeholder="Value" class="param-value" />
                </div>
            </div>
        </div>
        
        <div class="section">
            <div class="section-title">Headers</div>
            <textarea id="headers" placeholder='{\n  "Content-Type": "application/json"\n}'>{\n  "Content-Type": "application/json"\n}</textarea>
        </div>
        
        <div class="section">
            <div class="section-title">Body</div>
            <textarea id="body" placeholder='{\n  "key": "value"\n}'></textarea>
        </div>
        
        <div id="responseSection" class="response-section hidden">
            <div class="section-title">Response</div>
            <div class="status-line">
                <span id="statusBadge" class="status-badge"></span>
                <span id="duration" class="duration"></span>
            </div>
            <div class="section">
                <div class="section-title">Response Body</div>
                <div class="response-body">
                    <pre id="responseBody"></pre>
                </div>
            </div>
        </div>
    </div>
    
    <script>
        const vscode = acquireVsCodeApi();
        
        const methodSelect = document.getElementById('method');
        const urlInput = document.getElementById('url');
        const headersTextarea = document.getElementById('headers');
        const bodyTextarea = document.getElementById('body');
        const sendBtn = document.getElementById('sendBtn');
        const responseSection = document.getElementById('responseSection');
        const statusBadge = document.getElementById('statusBadge');
        const duration = document.getElementById('duration');
        const responseBody = document.getElementById('responseBody');
        const queryParamsDiv = document.getElementById('queryParams');
        
        // Send request
        sendBtn.addEventListener('click', () => {
            const method = methodSelect.value;
            const url = urlInput.value;
            
            // Parse headers
            let headers = {};
            try {
                headers = JSON.parse(headersTextarea.value || '{}');
            } catch (e) {
                // Ignore parse errors
            }
            
            // Parse query params
            const queryParams = {};
            const paramRows = queryParamsDiv.querySelectorAll('.param-row');
            paramRows.forEach(row => {
                const key = row.querySelector('.param-key').value;
                const value = row.querySelector('.param-value').value;
                if (key) {
                    queryParams[key] = value;
                }
            });
            
            const body = bodyTextarea.value;
            
            vscode.postMessage({
                type: 'sendRequest',
                request: { method, url, headers, body, queryParams }
            });
            
            sendBtn.disabled = true;
            sendBtn.textContent = 'Sending...';
        });
        
        // Handle messages from extension
        window.addEventListener('message', event => {
            const message = event.data;
            
            switch (message.type) {
                case 'loadEndpoint':
                    methodSelect.value = message.endpoint.method;
                    urlInput.value = message.endpoint.url;
                    bodyTextarea.value = message.endpoint.body || '';
                    
                    // Load query params
                    if (message.endpoint.queryParams) {
                        queryParamsDiv.innerHTML = '';
                        for (const [key, value] of Object.entries(message.endpoint.queryParams)) {
                            const row = document.createElement('div');
                            row.className = 'param-row';
                            row.innerHTML = \`
                                <input type="text" placeholder="Key" class="param-key" value="\${key}" />
                                <input type="text" placeholder="Value" class="param-value" value="\${value}" />
                            \`;
                            queryParamsDiv.appendChild(row);
                        }
                    }
                    break;
                    
                case 'response':
                    sendBtn.disabled = false;
                    sendBtn.textContent = 'Send';
                    
                    const resp = message.response;
                    
                    // Show response section
                    responseSection.classList.remove('hidden');
                    
                    // Update status
                    statusBadge.textContent = \`\${resp.status} \${resp.statusText}\`;
                    if (resp.status >= 200 && resp.status < 300) {
                        statusBadge.className = 'status-badge status-success';
                    } else if (resp.status >= 400) {
                        statusBadge.className = 'status-badge status-error';
                    } else {
                        statusBadge.className = 'status-badge status-info';
                    }
                    
                    duration.textContent = \`\${resp.duration}ms\`;
                    
                    // Format body
                    let formattedBody = resp.body;
                    try {
                        const json = JSON.parse(resp.body);
                        formattedBody = JSON.stringify(json, null, 2);
                    } catch (e) {
                        // Not JSON, keep as is
                    }
                    responseBody.textContent = formattedBody;
                    
                    // Scroll to response
                    responseSection.scrollIntoView({ behavior: 'smooth' });
                    break;
            }
        });
    </script>
</body>
</html>`;
    }
    
    dispose(): void {
        HttpClientPanel.currentPanel = undefined;
        this.panel.dispose();
        
        while (this.disposables.length) {
            const disposable = this.disposables.pop();
            if (disposable) {
                disposable.dispose();
            }
        }
    }
}
