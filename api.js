const API_BASE = 'http://localhost:3333';

class AssignmentAPI {
    static getToken() {
        return localStorage.getItem('token');
    }

    static async makeRequest(url, options = {}) {
        const token = this.getToken();
        
        const defaultHeaders = {
            'Content-Type': 'application/json',
        };

        if (token) {
            defaultHeaders['Authorization'] = `Bearer ${token}`;
        }

        const config = {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers,
            },
        };

        try {
            console.log(`🔄 API Call: ${url}`, config);
            const response = await fetch(`${API_BASE}${url}`, config);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ 
                    message: `HTTP ${response.status}` 
                }));
                throw new Error(errorData.message || `Request failed with status ${response.status}`);
            }

            if (response.status === 204) {
                return { success: true };
            }

            return await response.json();
        } catch (error) {
            console.error('❌ API Error:', error);
            throw error;
        }
    }

    static async register(userData) {
        return this.makeRequest('/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    static async login(userData) {
        return this.makeRequest('/login', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    static async getAssignments() {
        return this.makeRequest('/assignments');
    }

    static async createAssignment(assignmentData) {
        return this.makeRequest('/assignments', {
            method: 'POST',
            body: JSON.stringify(assignmentData)
        });
    }

    static async updateAssignment(id, assignmentData) {
        return this.makeRequest(`/assignments/${id}`, {
            method: 'PUT',
            body: JSON.stringify(assignmentData)
        });
    }

    static async deleteAssignment(id) {
        return this.makeRequest(`/assignments/${id}`, {
            method: 'DELETE'
        });
    }
}

async function testConnection() {
    try {
        const test = await fetch(`${API_BASE}/`);
        const data = await test.json();
        console.log('✅ Backend connected:', data);
        return true;
    } catch (error) {
        console.error('❌ Cannot connect to backend:', error);
        alert('Tidak dapat terhubung ke server. Pastikan backend berjalan di localhost:3333');
        return false;
    }
}

testConnection();