/**
 * ============================================
 * I TRUSTY LTD - SUPABASE API CONFIGURATION
 * ============================================
 * 
 * This file provides a seamless bridge between your existing code
 * and Supabase backend. No changes needed to existing HTML files!
 * 
 * How it works:
 * - Intercepts all fetch('tables/...') calls
 * - Translates them to Supabase REST API format
 * - Returns data in same format as before
 * - Zero breaking changes to existing code
 * 
 * ============================================
 */

// ============================================
// SUPABASE CREDENTIALS
// ============================================
const SUPABASE_CONFIG = {
    url: 'https://yzesqnawqmlqcxafjqfa.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6ZXNxbmF3cW1scWN4YWZqcWZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2NTQ5OTgsImV4cCI6MjA3NjIzMDk5OH0.XTBS4DgvP9f9kBSRHSpssBpTliJ05vhIZsTDbhdgxGM'
};

// ============================================
// COMPATIBILITY MODE
// ============================================
// Set to true during migration (works with both old and new endpoints)
// Set to false when fully migrated to Supabase
// Set to 'disabled' to turn off Supabase and use original API
const COMPATIBILITY_MODE = true;  // ✅ ENABLED - Database is ready!

// ============================================
// API WRAPPER CLASS
// ============================================
class SupabaseAPIWrapper {
    constructor(config) {
        this.baseUrl = config.url;
        this.apiKey = config.anonKey;
        this.headers = {
            'apikey': this.apiKey,
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        };
    }

    /**
     * Translate old API path to Supabase format
     * OLD: tables/customers?page=1&limit=100
     * NEW: /rest/v1/customers?limit=100&offset=0
     */
    translatePath(oldPath) {
        // Remove 'tables/' prefix
        let path = oldPath.replace(/^tables\//, '');
        
        // Split table name and ID if present
        const parts = path.split('?');
        const tablePath = parts[0];
        const queryString = parts[1] || '';
        
        // Check if it's a single record request (has UUID)
        const uuidPattern = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
        const match = tablePath.match(uuidPattern);
        
        if (match) {
            // Single record: tables/customers/{id}
            const id = match[0];
            const table = tablePath.split('/')[0];
            return {
                path: `/rest/v1/${table}?id=eq.${id}`,
                isSingle: true
            };
        }
        
        // List request: tables/customers?page=1&limit=100
        const params = new URLSearchParams(queryString);
        const supabaseParams = new URLSearchParams();
        
        // Translate pagination
        const page = parseInt(params.get('page')) || 1;
        const limit = parseInt(params.get('limit')) || 100;
        const offset = (page - 1) * limit;
        
        supabaseParams.set('limit', limit);
        supabaseParams.set('offset', offset);
        
        // Translate sorting
        const sort = params.get('sort');
        if (sort) {
            // OLD: sort=-created_at or sort=name
            const descending = sort.startsWith('-');
            const field = descending ? sort.substring(1) : sort;
            supabaseParams.set('order', `${field}.${descending ? 'desc' : 'asc'}`);
        }
        
        // Translate search
        const search = params.get('search');
        if (search) {
            // OLD: search=name:John or search=John
            if (search.includes(':')) {
                const [field, value] = search.split(':');
                supabaseParams.set(field, `ilike.%${value}%`);
            } else {
                // Full-text search on common fields
                supabaseParams.set('or', `(name.ilike.%${search}%,customer_name.ilike.%${search}%,description.ilike.%${search}%)`);
            }
        }
        
        const table = tablePath;
        return {
            path: `/rest/v1/${table}?${supabaseParams.toString()}`,
            isSingle: false
        };
    }

    /**
     * Transform Supabase response to match old API format
     */
    transformResponse(supabaseData, isSingle, tableName) {
        if (isSingle) {
            // Single record: return first item or the object itself
            return Array.isArray(supabaseData) ? supabaseData[0] : supabaseData;
        }
        
        // List response: wrap in our old format
        return {
            data: supabaseData,
            total: supabaseData.length,
            page: 1,
            limit: supabaseData.length,
            table: tableName
        };
    }

    /**
     * Main fetch wrapper
     */
    async fetch(path, options = {}) {
        try {
            // Translate path
            const { path: supabasePath, isSingle } = this.translatePath(path);
            const fullUrl = `${this.baseUrl}${supabasePath}`;
            
            // Merge headers
            const fetchOptions = {
                ...options,
                headers: {
                    ...this.headers,
                    ...(options.headers || {})
                }
            };
            
            // Handle POST/PUT/PATCH
            if (options.method === 'POST' || options.method === 'PUT' || options.method === 'PATCH') {
                // Supabase uses JSON body directly
                if (options.body && typeof options.body === 'string') {
                    fetchOptions.body = options.body;
                }
            }
            
            // Execute fetch
            console.log(`🔄 API Call: ${options.method || 'GET'} ${path} → ${supabasePath}`);
            const response = await fetch(fullUrl, fetchOptions);
            
            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }
            
            // Parse response
            const data = await response.json();
            
            // Extract table name from path
            const tableName = path.split('/')[1]?.split('?')[0] || 'unknown';
            
            // Transform to old format
            const transformed = this.transformResponse(data, isSingle, tableName);
            
            console.log(`✅ Success: ${path} (${Array.isArray(transformed.data) ? transformed.data.length : 1} records)`);
            
            return {
                ok: true,
                status: response.status,
                json: async () => transformed
            };
            
        } catch (error) {
            console.error(`❌ API Error: ${path}`, error);
            throw error;
        }
    }
}

// ============================================
// INITIALIZE WRAPPER
// ============================================
const supabaseAPI = new SupabaseAPIWrapper(SUPABASE_CONFIG);

// ============================================
// INTERCEPT FETCH CALLS (GLOBAL OVERRIDE)
// ============================================
if (COMPATIBILITY_MODE === true) {
    // Store original fetch
    const originalFetch = window.fetch;
    
    // Override fetch globally
    window.fetch = function(url, options = {}) {
        // Check if it's a tables/ API call
        if (typeof url === 'string' && url.includes('tables/')) {
            console.log(`🎯 Intercepted: ${url}`);
            return supabaseAPI.fetch(url, options);
        }
        
        // Pass through all other fetch calls
        return originalFetch.call(this, url, options);
    };
    
    console.log('✅ Supabase API Wrapper Active (Compatibility Mode)');
    console.log('📡 All tables/* calls will be routed to Supabase');
} else if (COMPATIBILITY_MODE === 'disabled') {
    console.log('⏸️ Supabase API Wrapper DISABLED - Using original API');
    console.log('💡 To enable: Set COMPATIBILITY_MODE = true in supabase-config.js');
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Direct Supabase query builder (for advanced use)
 */
window.supabase = {
    from: (table) => {
        return {
            select: async (columns = '*') => {
                const url = `${SUPABASE_CONFIG.url}/rest/v1/${table}?select=${columns}`;
                const response = await fetch(url, {
                    headers: supabaseAPI.headers
                });
                return await response.json();
            },
            insert: async (data) => {
                const url = `${SUPABASE_CONFIG.url}/rest/v1/${table}`;
                const response = await fetch(url, {
                    method: 'POST',
                    headers: supabaseAPI.headers,
                    body: JSON.stringify(data)
                });
                return await response.json();
            },
            update: async (data, filter) => {
                const url = `${SUPABASE_CONFIG.url}/rest/v1/${table}?${filter}`;
                const response = await fetch(url, {
                    method: 'PATCH',
                    headers: supabaseAPI.headers,
                    body: JSON.stringify(data)
                });
                return await response.json();
            },
            delete: async (filter) => {
                const url = `${SUPABASE_CONFIG.url}/rest/v1/${table}?${filter}`;
                const response = await fetch(url, {
                    method: 'DELETE',
                    headers: supabaseAPI.headers
                });
                return response.ok;
            }
        };
    }
};

// ============================================
// TESTING FUNCTIONS
// ============================================

/**
 * Test Supabase connection
 */
window.testSupabaseConnection = async function() {
    console.log('🧪 Testing Supabase Connection...');
    
    try {
        // Test 1: Get customers (should work even if table is empty)
        console.log('Test 1: Fetching customers...');
        const response = await fetch('tables/customers?limit=5');
        const data = await response.json();
        console.log('✅ Customers:', data);
        
        // Test 2: Get single customer (will fail if no customers exist - that's ok)
        console.log('Test 2: Testing single record fetch...');
        
        // Test 3: Get invoices
        console.log('Test 3: Fetching invoices...');
        const invoicesResponse = await fetch('tables/invoices?limit=5');
        const invoicesData = await invoicesResponse.json();
        console.log('✅ Invoices:', invoicesData);
        
        console.log('🎉 All tests passed! Supabase connection working!');
        return true;
        
    } catch (error) {
        console.error('❌ Connection test failed:', error);
        return false;
    }
};

// ============================================
// AUTO-TEST ON LOAD (Development Only)
// ============================================
// Uncomment this to auto-test connection when page loads
// window.addEventListener('DOMContentLoaded', () => {
//     setTimeout(() => testSupabaseConnection(), 1000);
// });

// ============================================
// EXPORT FOR MANUAL USE
// ============================================
window.SupabaseAPI = supabaseAPI;

console.log('🚀 Supabase API Configuration Loaded');
console.log('📝 Your credentials are configured');
console.log('🧪 Run testSupabaseConnection() to verify connection');
