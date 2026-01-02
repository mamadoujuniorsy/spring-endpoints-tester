/**
 * Represents an HTTP request to be sent
 */
export interface HttpRequest {
    url: string;
    method: string;
    headers: { [key: string]: string };
    body?: string;
    queryParams?: { [key: string]: string };
}

/**
 * Represents an HTTP response received
 */
export interface HttpResponse {
    status: number;
    statusText: string;
    headers: { [key: string]: string };
    body: string;
    duration: number; // en ms
}
