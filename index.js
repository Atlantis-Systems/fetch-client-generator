import { readFileSync } from 'fs';

export function parseOpenAPISpec(specPath) {
  const spec = JSON.parse(readFileSync(specPath, 'utf8'));
  
  const endpoints = [];
  
  for (const [path, pathItem] of Object.entries(spec.paths)) {
    for (const [method, operation] of Object.entries(pathItem)) {
      const endpoint = {
        path,
        method: method.toUpperCase(),
        operationId: operation.operationId,
        requestBody: operation.requestBody,
        responses: operation.responses,
        tags: operation.tags
      };
      endpoints.push(endpoint);
    }
  }
  
  return {
    info: spec.info,
    endpoints,
    schemas: spec.components?.schemas || {}
  };
}

export function generateFetchClient(parsedSpec, options = {}) {
  const { info, endpoints, schemas } = parsedSpec;
  const className = options.className || 'ApiClient';
  
  let clientCode = `class ${className} {
  constructor(baseUrl = '', options = {}) {
    this.baseUrl = baseUrl;
    this.defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };
  }

  async request(path, options = {}) {
    const url = this.baseUrl + path;
    const config = {
      ...this.defaultOptions,
      ...options,
      headers: {
        ...this.defaultOptions.headers,
        ...options.headers
      }
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else if (contentType && contentType.includes('text/')) {
      return await response.text();
    } else {
      return response;
    }
  }

`;

  for (const endpoint of endpoints) {
    let methodName = endpoint.operationId;
    
    if (!methodName) {
      // Generate camelCase method name from path and method
      const pathParts = endpoint.path.split('/').filter(part => part && !part.startsWith('{'));
      // Convert each part to PascalCase and join
      const pascalParts = pathParts.map(part => part.charAt(0).toUpperCase() + part.slice(1));
      const cleanPath = pascalParts.join('');
      methodName = `${endpoint.method.toLowerCase()}${cleanPath}`;
    }
    
    // Convert to camelCase if not already
    methodName = methodName.charAt(0).toLowerCase() + methodName.slice(1);
    
    const hasRequestBody = endpoint.requestBody && 
      endpoint.requestBody.content && 
      Object.keys(endpoint.requestBody.content).length > 0;
    
    const params = hasRequestBody ? 'data' : '';
    const methodParams = params ? `(${params})` : '()';
    
    clientCode += `  async ${methodName}${methodParams} {
`;
    
    if (hasRequestBody) {
      clientCode += `    return await this.request('${endpoint.path}', {
      method: '${endpoint.method}',
      body: JSON.stringify(data)
    });
`;
    } else {
      clientCode += `    return await this.request('${endpoint.path}', {
      method: '${endpoint.method}'
    });
`;
    }
    
    clientCode += `  }

`;
  }
  
  clientCode += `}

export default ${className};`;
  
  return clientCode;
}

export function generate(inputPath, outputPath, options = {}) {
  const parsedSpec = parseOpenAPISpec(inputPath);
  const clientCode = generateFetchClient(parsedSpec, options);
  
  if (outputPath) {
    import('fs').then(({ writeFileSync }) => {
      writeFileSync(outputPath, clientCode, 'utf8');
    });
  }
  
  return clientCode;
}

export default {
  parseOpenAPISpec,
  generateFetchClient,
  generate
};