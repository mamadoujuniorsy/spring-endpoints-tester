/**
 * Represents a parameter in a Spring REST endpoint method
 */
export interface Parameter {
    name: string;
    type: string;           // String, Long, UserDTO, etc.
    annotation: string;     // @PathVariable, @RequestBody, @RequestParam
    required: boolean;
    defaultValue?: string;
}

/**
 * Represents a Spring REST endpoint
 */
export interface Endpoint {
    method: string;           // GET, POST, PUT, DELETE, etc.
    path: string;            // /api/users/{id}
    className: string;       // UserController
    methodName: string;      // getUserById
    filePath: string;        // chemin du fichier
    line: number;           // numéro de ligne
    parameters: Parameter[]; // paramètres de la méthode
    produces?: string;       // application/json
    consumes?: string;       // application/json
}
