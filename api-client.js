class ApiClient {
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
      throw new Error(`HTTP error! status: ${response.status}`);
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

  async token() {
    return await this.request('/authentication/token', {
      method: 'POST'
    });
  }

  async logout(data) {
    return await this.request('/authentication/logout', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getAuthenticationPing() {
    return await this.request('/authentication/ping', {
      method: 'GET'
    });
  }

  async getApiOrganisations() {
    return await this.request('/api/organisations', {
      method: 'GET'
    });
  }

}

export default ApiClient;