import * as vscode from 'vscode';
import { EndpointsTreeProvider } from './providers/EndpointsTreeProvider';
import { SpringCodeLensProvider } from './providers/CodeLensProvider';
import { HttpClientPanel } from './views/HttpClientPanel';
import { FileWatcher } from './utils/FileWatcher';
import { Endpoint } from './models/Endpoint';

export function activate(context: vscode.ExtensionContext) {
	console.log('Spring Endpoints Tester is now active!');

	// Create tree data provider
	const treeProvider = new EndpointsTreeProvider();
	
	// Register tree view
	const treeView = vscode.window.createTreeView('springEndpoints', {
		treeDataProvider: treeProvider,
		showCollapseAll: true
	});
	
	// Register CodeLens provider
	const codeLensProvider = new SpringCodeLensProvider();
	const codeLensDisposable = vscode.languages.registerCodeLensProvider(
		{ language: 'java', scheme: 'file' },
		codeLensProvider
	);
	
	// Setup file watcher
	const fileWatcher = new FileWatcher(() => {
		treeProvider.refresh();
		codeLensProvider.refresh();
	});
	
	// Register commands
	
	// Refresh endpoints
	const refreshCommand = vscode.commands.registerCommand(
		'springEndpoints.refresh',
		() => {
			treeProvider.refresh();
			codeLensProvider.refresh();
		}
	);
	
	// Go to endpoint definition
	const goToEndpointCommand = vscode.commands.registerCommand(
		'springEndpoints.goToEndpoint',
		(endpoint: Endpoint) => {
			const uri = vscode.Uri.file(endpoint.filePath);
			const position = new vscode.Position(endpoint.line - 1, 0);
			const range = new vscode.Range(position, position);
			
			vscode.window.showTextDocument(uri, {
				selection: range,
				viewColumn: vscode.ViewColumn.One
			});
		}
	);
	
	// Test endpoint
	const testEndpointCommand = vscode.commands.registerCommand(
		'springEndpoints.testEndpoint',
		(endpoint: Endpoint) => {
			HttpClientPanel.createOrShow(context.extensionUri, endpoint);
		}
	);
	
	// Copy URL to clipboard
	const copyUrlCommand = vscode.commands.registerCommand(
		'springEndpoints.copyUrl',
		async (endpoint: Endpoint) => {
			const config = vscode.workspace.getConfiguration('springEndpoints');
			const baseUrl = config.get<string>('baseUrl', 'http://localhost:8080');
			const fullUrl = baseUrl + endpoint.path;
			
			await vscode.env.clipboard.writeText(fullUrl);
			vscode.window.showInformationMessage(`URL copied: ${fullUrl}`);
		}
	);
	
	// Open HTTP client
	const openClientCommand = vscode.commands.registerCommand(
		'springEndpoints.openClient',
		() => {
			HttpClientPanel.createOrShow(context.extensionUri);
		}
	);
	
	// Add all disposables to subscriptions
	context.subscriptions.push(
		treeView,
		codeLensDisposable,
		fileWatcher,
		refreshCommand,
		goToEndpointCommand,
		testEndpointCommand,
		copyUrlCommand,
		openClientCommand
	);
	
	// Initial scan if enabled
	const config = vscode.workspace.getConfiguration('springEndpoints');
	if (config.get<boolean>('scanOnStartup', true)) {
		treeProvider.refresh();
	}
}

export function deactivate() {}
