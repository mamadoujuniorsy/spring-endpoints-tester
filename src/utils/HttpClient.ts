import { HttpRequest, HttpResponse } from '../models/HttpRequest';

/**
 * HTTP client for sending requests
 */
export class HttpClient {
    
    /**
     * Send an HTTP request
     */
    public static async sendRequest(request: HttpRequest): Promise<HttpResponse> {
        const startTime = Date.now();
        
        try {
            // Build URL with query parameters
            let url = request.url;
            if (request.queryParams && Object.keys(request.queryParams).length > 0) {
                const params = new URLSearchParams(request.queryParams);
                url += (url.includes('?') ? '&' : '?') + params.toString();
            }
            
            // Build fetch options
            const options: RequestInit = {
                method: request.method,
                headers: request.headers
            };
            
            // Add body for POST, PUT, PATCH
            if (request.body && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
                options.body = request.body;
            }
            
            // Send request
            const response = await fetch(url, options);
            
            // Read response
            const body = await response.text();
            const duration = Date.now() - startTime;
            
            // Extract headers
            const headers: { [key: string]: string } = {};
            response.headers.forEach((value, key) => {
                headers[key] = value;
            });
            
            return {
                status: response.status,
                statusText: response.statusText,
                headers,
                body,
                duration
            };
            
        } catch (error) {
            const duration = Date.now() - startTime;
            
            return {
                status: 0,
                statusText: 'Network Error',
                headers: {},
                body: error instanceof Error ? error.message : String(error),
                duration
            };
        }
    }
}
