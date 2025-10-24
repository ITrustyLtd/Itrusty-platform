/**
 * Supabase API Configuration & Wrapper
 * I Trusty Ltd - Business Management Platform
 * 
 * SETUP INSTRUCTIONS:
 * 1. Replace SUPABASE_URL with your project URL
 * 2. Replace SUPABASE_ANON_KEY with your anon/public key
 * 3. Save this file
 * 4. This file is already included in all HTML pages!
 */

// ⚠️ REPLACE THESE WITH YOUR SUPABASE CREDENTIALS
const SUPABASE_URL = https://yzesqnawqmlqcxafjqfa.supabase.co;  // Example: https://xxxxxxxxxxxxx.supabase.co
const SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6ZXNxbmF3cW1scWN4YWZqcWZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2NTQ5OTgsImV4cCI6MjA3NjIzMDk5OH0.XTBS4DgvP9f9kBSRHSpssBpTliJ05vhIZsTDbhdgxGM;  // Example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// Check if Supabase is configured
let supabaseClient = null;
let isSupabaseConfigured = false;

if (SUPABASE_URL !== 'YOUR_SUPABASE_URL_HERE' && SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY_HERE') {
    try {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        isSupabaseConfigured = true;
        console.log('✅ Supabase connected successfully!');
    } catch (error) {
        console.error('❌ Supabase connection failed:', error);
    }
} else {
    console.warn('⚠️ Supabase not configured. Please update SUPABASE_URL and SUPABASE_ANON_KEY in js/supabase-api.js');
}

/**
 * Unified API wrapper that works with both old (tables/) and new (Supabase) APIs
 */
class UnifiedAPI {
    constructor() {
        this.useSupabase = isSupabaseConfigured;
    }

    /**
     * GET - Fetch records from table
     * @param {string} endpoint - Table name or endpoint (e.g., 'customers' or 'tables/customers')
     * @param {object} params - Query parameters (page, limit, filters)
     * @returns {Promise<object>} - { data: [], total: number }
     */
    async get(endpoint, params = {}) {
        const tableName = endpoint.replace('tables/', '');
        
        if (this.useSupabase) {
            return await this._supabaseGet(tableName, params);
        } else {
            return await this._legacyGet(endpoint, params);
        }
    }

    /**
     * POST - Create new record
     * @param {string} endpoint - Table name or endpoint
     * @param {object} data - Record data
     * @returns {Promise<object>} - Created record
     */
    async post(endpoint, data) {
        const tableName = endpoint.replace('tables/', '');
        
        if (this.useSupabase) {
            return await this._supabasePost(tableName, data);
        } else {
            return await this._legacyPost(endpoint, data);
        }
    }

    /**
     * PUT - Update existing record
     * @param {string} endpoint - Table name or endpoint with ID
     * @param {string} id - Record ID (if not in endpoint)
     * @param {object} data - Updated data
     * @returns {Promise<object>} - Updated record
     */
    async put(endpoint, id, data) {
        const tableName = endpoint.replace('tables/', '').split('/')[0];
        const recordId = id || endpoint.split('/').pop();
        
        if (this.useSupabase) {
            return await this._supabasePut(tableName, recordId, data);
        } else {
            return await this._legacyPut(endpoint, data);
        }
    }

    /**
     * PATCH - Partial update
     * @param {string} endpoint - Table name or endpoint with ID
     * @param {string} id - Record ID
     * @param {object} data - Partial data
     * @returns {Promise<object>} - Updated record
     */
    async patch(endpoint, id, data) {
        return await this.put(endpoint, id, data);
    }

    /**
     * DELETE - Delete record
     * @param {string} endpoint - Table name or endpoint with ID
     * @param {string} id - Record ID (if not in endpoint)
     * @returns {Promise<object>} - Success response
     */
    async delete(endpoint, id) {
        const tableName = endpoint.replace('tables/', '').split('/')[0];
        const recordId = id || endpoint.split('/').pop();
        
        if (this.useSupabase) {
            return await this._supabaseDelete(tableName, recordId);
        } else {
            return await this._legacyDelete(endpoint);
        }
    }

    // ===== SUPABASE IMPLEMENTATION =====
    
    async _supabaseGet(tableName, params = {}) {
        try {
            let query = supabaseClient.from(tableName).select('*', { count: 'exact' });
            
            // Apply filters
            if (params.filter) {
                Object.keys(params.filter).forEach(key => {
                    query = query.eq(key, params.filter[key]);
                });
            }
            
            // Search
            if (params.search) {
                // Implement search across common fields
                query = query.or(`name.ilike.%${params.search}%,email.ilike.%${params.search}%,customer_name.ilike.%${params.search}%`);
            }
            
            // Sorting
            if (params.sort) {
                const [field, order] = params.sort.split(':');
                query = query.order(field, { ascending: order === 'asc' });
            }
            
            // Pagination
            const page = params.page || 1;
            const limit = params.limit || 100;
            const from = (page - 1) * limit;
            const to = from + limit - 1;
            
            query = query.range(from, to);
            
            const { data, error, count } = await query;
            
            if (error) throw error;
            
            return {
                data: data || [],
                total: count || 0,
                page: page,
                limit: limit
            };
        } catch (error) {
            console.error('Supabase GET error:', error);
            throw error;
        }
    }
    
    async _supabasePost(tableName, data) {
        try {
            // Remove system fields if present
            const cleanData = { ...data };
            delete cleanData.id;
            delete cleanData.created_at;
            delete cleanData.updated_at;
            
            const { data: result, error } = await supabaseClient
                .from(tableName)
                .insert([cleanData])
                .select()
                .single();
            
            if (error) throw error;
            
            return result;
        } catch (error) {
            console.error('Supabase POST error:', error);
            throw error;
        }
    }
    
    async _supabasePut(tableName, id, data) {
        try {
            // Remove system fields
            const cleanData = { ...data };
            delete cleanData.id;
            delete cleanData.created_at;
            
            const { data: result, error } = await supabaseClient
                .from(tableName)
                .update(cleanData)
                .eq('id', id)
                .select()
                .single();
            
            if (error) throw error;
            
            return result;
        } catch (error) {
            console.error('Supabase PUT error:', error);
            throw error;
        }
    }
    
    async _supabaseDelete(tableName, id) {
        try {
            const { error } = await supabaseClient
                .from(tableName)
                .delete()
                .eq('id', id);
            
            if (error) throw error;
            
            return { success: true, id: id };
        } catch (error) {
            console.error('Supabase DELETE error:', error);
            throw error;
        }
    }

    // ===== LEGACY API IMPLEMENTATION (for local development) =====
    
    async _legacyGet(endpoint, params = {}) {
        const url = new URL(endpoint, window.location.origin);
        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
        
        const response = await fetch(url.toString());
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        return await response.json();
    }
    
    async _legacyPost(endpoint, data) {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        return await response.json();
    }
    
    async _legacyPut(endpoint, data) {
        const response = await fetch(endpoint, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        return await response.json();
    }
    
    async _legacyDelete(endpoint) {
        const response = await fetch(endpoint, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        return { success: true };
    }
}

// Create global API instance
window.API = new UnifiedAPI();

// Backward compatibility - map old fetch calls to new API
const originalFetch = window.fetch;
window.fetch = function(url, options = {}) {
    // Only intercept tables/ API calls
    if (typeof url === 'string' && url.startsWith('tables/')) {
        const method = options.method || 'GET';
        const tableName = url.replace('tables/', '').split('?')[0].split('/')[0];
        
        console.log(`🔄 Intercepting ${method} ${url} → Using ${isSupabaseConfigured ? 'Supabase' : 'Legacy'} API`);
        
        if (method === 'GET') {
            return Promise.resolve({
                ok: true,
                json: () => window.API.get(url)
            });
        } else if (method === 'POST') {
            return Promise.resolve({
                ok: true,
                json: () => window.API.post(url, JSON.parse(options.body))
            });
        } else if (method === 'PUT') {
            const id = url.split('/').pop();
            return Promise.resolve({
                ok: true,
                json: () => window.API.put(tableName, id, JSON.parse(options.body))
            });
        } else if (method === 'DELETE') {
            const id = url.split('/').pop();
            return Promise.resolve({
                ok: true,
                json: () => window.API.delete(tableName, id)
            });
        }
    }
    
    // Pass through all other requests
    return originalFetch.apply(this, arguments);
};

// Helper function to check configuration
window.checkSupabaseConfig = function() {
    if (!isSupabaseConfigured) {
        console.warn(`
╔════════════════════════════════════════════════════════════════╗
║  ⚠️  SUPABASE NOT CONFIGURED                                   ║
╟────────────────────────────────────────────────────────────────╢
║  Please update js/supabase-api.js with your credentials:      ║
║                                                                 ║
║  1. Open: js/supabase-api.js                                   ║
║  2. Replace: YOUR_SUPABASE_URL_HERE                            ║
║     With: https://xxxxxxxxxxxxx.supabase.co                    ║
║                                                                 ║
║  3. Replace: YOUR_SUPABASE_ANON_KEY_HERE                       ║
║     With: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...             ║
║                                                                 ║
║  4. Save and refresh the page                                  ║
╚════════════════════════════════════════════════════════════════╝
        `);
        return false;
    }
    
    console.log(`
╔════════════════════════════════════════════════════════════════╗
║  ✅  SUPABASE CONNECTED                                        ║
╟────────────────────────────────────────────────────────────────╢
║  Your application is connected to Supabase!                    ║
║  Database: ${SUPABASE_URL}                                     ║
╚════════════════════════════════════════════════════════════════╝
    `);
    return true;
};

// Auto-check on load
console.log('🚀 I Trusty Ltd API System loaded');
window.checkSupabaseConfig();
