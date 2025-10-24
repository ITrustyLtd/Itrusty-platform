    /**
     * Translate old API path to Supabase REST API path
     * OLD: tables/customers?page=1&limit=100
     * NEW: /rest/v1/customers?limit=100&offset=0
     */
    translatePath(fullPath) {
        const [tablePath, queryString] = fullPath.split('?');
        
        // Single record: tables/customers/123
        if (tablePath.includes('/') && tablePath.split('/').length > 2) {
            const parts = tablePath.split('/');
            const id = parts[parts.length - 1];
            const table = tablePath.split('/')[0];
            return {
                path: `/rest/v1/${table}?id=eq.${id}`,
                isSingle: true
            };
        }
        
        // If no query string, return simple path (for POST/PUT/PATCH)
        if (!queryString) {
            const table = tablePath;
            return {
                path: `/rest/v1/${table}`,
                isSingle: false
            };
        }
        
        // List request with query params: tables/customers?page=1&limit=100
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
            const descending = sort.startsWith('-');
            const field = descending ? sort.substring(1) : sort;
            supabaseParams.set('order', `${field}.${descending ? 'desc' : 'asc'}`);
        }
        
        // Translate search
        const search = params.get('search');
        if (search) {
            if (search.includes(':')) {
                const [field, value] = search.split(':');
                supabaseParams.set(field, `ilike.%${value}%`);
            } else {
                supabaseParams.set('or', `(name.ilike.%${search}%,customer_name.ilike.%${search}%,description.ilike.%${search}%)`);
            }
        }
        
        const table = tablePath;
        return {
            path: `/rest/v1/${table}?${supabaseParams.toString()}`,
            isSingle: false
        };
    }
