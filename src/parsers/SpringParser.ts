import * as vscode from 'vscode';
import { Endpoint, Parameter } from '../models/Endpoint';

/**
 * Parser for Spring Boot Java files to extract REST endpoints
 */
export class SpringParser {
    
    /**
     * Parse a Java file to extract Spring REST endpoints
     */
    public static parseJavaFile(fileContent: string, filePath: string): Endpoint[] {
        const endpoints: Endpoint[] = [];
        const lines = fileContent.split('\n');
        
        let classPath = '';
        let className = '';
        let isRestController = false;
        
        // First pass: detect class-level annotations
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Detect @RestController or @Controller
            if (line.includes('@RestController') || line.includes('@Controller')) {
                isRestController = true;
            }
            
            // Detect class-level @RequestMapping
            if (line.includes('@RequestMapping')) {
                const pathMatch = line.match(/@RequestMapping\s*\(\s*["']([^"']+)["']/);
                if (pathMatch) {
                    classPath = pathMatch[1];
                }
            }
            
            // Detect class name
            if (line.includes('class ') && !line.startsWith('//')) {
                const classMatch = line.match(/class\s+(\w+)/);
                if (classMatch) {
                    className = classMatch[1];
                }
            }
        }
        
        if (!isRestController) {
            return endpoints;
        }
        
        // Second pass: detect method-level endpoints
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Detect method annotations
            const mappingAnnotations = [
                '@GetMapping',
                '@PostMapping',
                '@PutMapping',
                '@DeleteMapping',
                '@PatchMapping',
                '@RequestMapping'
            ];
            
            for (const annotation of mappingAnnotations) {
                if (line.includes(annotation)) {
                    const endpoint = this.parseEndpoint(
                        lines,
                        i,
                        annotation,
                        classPath,
                        className,
                        filePath
                    );
                    
                    if (endpoint) {
                        endpoints.push(endpoint);
                    }
                }
            }
        }
        
        return endpoints;
    }
    
    /**
     * Parse a single endpoint from method annotation
     */
    private static parseEndpoint(
        lines: string[],
        annotationLine: number,
        annotation: string,
        classPath: string,
        className: string,
        filePath: string
    ): Endpoint | null {
        const line = lines[annotationLine].trim();
        
        // Extract HTTP method
        let method = '';
        if (annotation === '@GetMapping') { method = 'GET'; }
        else if (annotation === '@PostMapping') { method = 'POST'; }
        else if (annotation === '@PutMapping') { method = 'PUT'; }
        else if (annotation === '@DeleteMapping') { method = 'DELETE'; }
        else if (annotation === '@PatchMapping') { method = 'PATCH'; }
        else if (annotation === '@RequestMapping') {
            // Extract method from annotation
            const methodMatch = line.match(/method\s*=\s*RequestMethod\.(\w+)/);
            method = methodMatch ? methodMatch[1] : 'GET';
        }
        
        // Extract path
        let methodPath = '';
        const pathMatch = line.match(/[(@]\w+\s*\(\s*["']([^"']+)["']/);
        if (pathMatch) {
            methodPath = pathMatch[1];
        } else {
            // Check for value parameter
            const valueMatch = line.match(/value\s*=\s*["']([^"']+)["']/);
            if (valueMatch) {
                methodPath = valueMatch[1];
            }
        }
        
        // Combine class path and method path
        let fullPath = classPath;
        if (methodPath) {
            if (!fullPath.endsWith('/') && !methodPath.startsWith('/')) {
                fullPath += '/';
            }
            fullPath += methodPath;
        }
        
        // Ensure path starts with /
        if (!fullPath.startsWith('/')) {
            fullPath = '/' + fullPath;
        }
        
        // Extract method name and parameters
        let methodName = '';
        const parameters: Parameter[] = [];
        
        // Look for method declaration (could be on next lines)
        for (let i = annotationLine + 1; i < Math.min(annotationLine + 5, lines.length); i++) {
            const methodLine = lines[i].trim();
            
            // Find method declaration
            const methodMatch = methodLine.match(/(?:public|private|protected)?\s*\w+\s+(\w+)\s*\(/);
            if (methodMatch) {
                methodName = methodMatch[1];
                
                // Extract parameters
                const paramsMatch = methodLine.match(/\(([^)]*)\)/);
                if (paramsMatch && paramsMatch[1].trim()) {
                    const paramsStr = paramsMatch[1];
                    parameters.push(...this.parseParameters(paramsStr));
                }
                
                break;
            }
        }
        
        if (!methodName) {
            return null;
        }
        
        // Extract produces/consumes
        let produces: string | undefined;
        let consumes: string | undefined;
        
        const producesMatch = line.match(/produces\s*=\s*["']([^"']+)["']/);
        if (producesMatch) {
            produces = producesMatch[1];
        }
        
        const consumesMatch = line.match(/consumes\s*=\s*["']([^"']+)["']/);
        if (consumesMatch) {
            consumes = consumesMatch[1];
        }
        
        return {
            method,
            path: fullPath,
            className,
            methodName,
            filePath,
            line: annotationLine + 1, // Convert to 1-based
            parameters,
            produces,
            consumes
        };
    }
    
    /**
     * Parse method parameters
     */
    private static parseParameters(paramsStr: string): Parameter[] {
        const parameters: Parameter[] = [];
        
        // Split by comma, but be careful with generics
        const params = this.splitParameters(paramsStr);
        
        for (const param of params) {
            const trimmed = param.trim();
            if (!trimmed) {continue;}
            
            let annotation = '';
            let required = false;
            let defaultValue: string | undefined;
            
            // Check for annotations
            if (trimmed.includes('@PathVariable')) {
                annotation = '@PathVariable';
                required = !trimmed.includes('required = false');
            } else if (trimmed.includes('@RequestParam')) {
                annotation = '@RequestParam';
                required = !trimmed.includes('required = false');
                
                // Extract default value
                const defaultMatch = trimmed.match(/defaultValue\s*=\s*["']([^"']+)["']/);
                if (defaultMatch) {
                    defaultValue = defaultMatch[1];
                }
            } else if (trimmed.includes('@RequestBody')) {
                annotation = '@RequestBody';
                required = true;
            }
            
            // Extract type and name
            const typeNameMatch = trimmed.match(/(\w+(?:<[^>]+>)?)\s+(\w+)$/);
            if (typeNameMatch) {
                parameters.push({
                    name: typeNameMatch[2],
                    type: typeNameMatch[1],
                    annotation,
                    required,
                    defaultValue
                });
            }
        }
        
        return parameters;
    }
    
    /**
     * Split parameters string by comma, respecting generics
     */
    private static splitParameters(paramsStr: string): string[] {
        const params: string[] = [];
        let current = '';
        let depth = 0;
        
        for (const char of paramsStr) {
            if (char === '<') {
                depth++;
            } else if (char === '>') {
                depth--;
            } else if (char === ',' && depth === 0) {
                params.push(current);
                current = '';
                continue;
            }
            current += char;
        }
        
        if (current.trim()) {
            params.push(current);
        }
        
        return params;
    }
    
    /**
     * Scan workspace for all Spring endpoints
     */
    public static async scanWorkspaceForEndpoints(): Promise<Endpoint[]> {
        const allEndpoints: Endpoint[] = [];
        
        // Find all Java files in src/main/java
        const javaFiles = await vscode.workspace.findFiles(
            '**/src/main/java/**/*.java',
            '**/node_modules/**'
        );
        
        for (const file of javaFiles) {
            try {
                const document = await vscode.workspace.openTextDocument(file);
                const content = document.getText();
                const endpoints = this.parseJavaFile(content, file.fsPath);
                allEndpoints.push(...endpoints);
            } catch (error) {
                console.error(`Error parsing file ${file.fsPath}:`, error);
            }
        }
        
        return allEndpoints;
    }
}
