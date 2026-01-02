import * as vscode from 'vscode';

/**
 * File watcher to detect changes in Java files
 */
export class FileWatcher {
    private watcher: vscode.FileSystemWatcher;
    private onChangeCallback: () => void;
    
    constructor(onChangeCallback: () => void) {
        this.onChangeCallback = onChangeCallback;
        
        // Create file system watcher for Java files
        this.watcher = vscode.workspace.createFileSystemWatcher(
            '**/src/main/java/**/*.java'
        );
        
        // Register event handlers
        this.watcher.onDidChange(() => this.handleChange());
        this.watcher.onDidCreate(() => this.handleChange());
        this.watcher.onDidDelete(() => this.handleChange());
    }
    
    private handleChange(): void {
        // Debounce changes to avoid too many refreshes
        setTimeout(() => {
            this.onChangeCallback();
        }, 500);
    }
    
    dispose(): void {
        this.watcher.dispose();
    }
}
