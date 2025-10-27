/**
 * 🗺️ Product Field Mapper
 * Maps frontend field names to Supabase database schema
 */

function mapProductDataToSupabase(frontendData) {
    console.log('🗺️ Mapping product data to Supabase schema:', frontendData);
    
    const SUPABASE_SCHEMA_FIELDS = [
        'sku',
        'product_name',
        'internal_code',
        'category',
        'is_active',
        'description',
        'unit_price_rmb',
        'unit_price_eur',
        'unit_price_usd',
        'default_markup_percent',
        'qty_per_box',
        'box_dimensions',
        'supplier_name',
        'supplier_contact',
        'supplier_phone',
        'supplier_address',
        'image_url_1',
        'image_url_2',
        'image_url_3',
        'tags',
        'internal_notes'
    ];
    
    const mappedData = {};
    
    SUPABASE_SCHEMA_FIELDS.forEach(field => {
        if (frontendData.hasOwnProperty(field)) {
            mappedData[field] = frontendData[field];
        }
    });
    
    if ('is_active' in mappedData) {
        mappedData.is_active = Boolean(mappedData.is_active);
    }
    
    const numericFields = [
        'unit_price_rmb',
        'unit_price_eur', 
        'unit_price_usd',
        'default_markup_percent',
        'qty_per_box'
    ];
    
    numericFields.forEach(field => {
        if (field in mappedData && mappedData[field] !== null && mappedData[field] !== '') {
            mappedData[field] = parseFloat(mappedData[field]) || 0;
        }
    });
    
    const removedFields = Object.keys(frontendData).filter(
        key => !SUPABASE_SCHEMA_FIELDS.includes(key) && 
               !['id', 'created_at', 'updated_at', 'gs_project_id', 'gs_table_name'].includes(key)
    );
    
    if (removedFields.length > 0) {
        console.warn(`⚠️ Filtered out ${removedFields.length} fields not in Supabase schema:`, removedFields);
    }
    
    console.log('✅ Mapped data ready for Supabase:', mappedData);
    
    return mappedData;
}

function mapCSVToSupabase(csvRow) {
    console.log('📄 Mapping CSV row to Supabase:', csvRow);
    
    const mappedData = {
        category: 'CSV Import',
        is_active: true,
        tags: 'csv-import',
        unit_price_usd: 0,
        supplier_name: '',
        supplier_contact: '',
        supplier_phone: '',
        supplier_address: '',
        image_url_2: '',
        image_url_3: ''
    };
    
    if (csvRow['Name']) mappedData.product_name = csvRow['Name'];
    if (csvRow['Item Number']) mappedData.internal_code = csvRow['Item Number'];
    if (csvRow['Description']) mappedData.description = csvRow['Description'];
    if (csvRow['Price CNY']) mappedData.unit_price_rmb = parseFloat(csvRow['Price CNY']) || 0;
    if (csvRow['Unit Price EUR']) mappedData.unit_price_eur = parseFloat(csvRow['Unit Price EUR']) || 0;
    if (csvRow['Markup %']) mappedData.default_markup_percent = parseFloat(csvRow['Markup %']) || 25;
    if (csvRow['QTY per CTN']) mappedData.qty_per_box = parseInt(csvRow['QTY per CTN']) || null;
    if (csvRow['Image URL']) mappedData.image_url_1 = csvRow['Image URL'];
    if (csvRow['Picture URL'] && !mappedData.image_url_1) mappedData.image_url_1 = csvRow['Picture URL'];
    
    if (!mappedData.sku) {
        const prefix = (csvRow['Name'] || 'PRD').substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X');
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        mappedData.sku = `${prefix}-${random}`;
    }
    
    const notesArray = [];
    if (csvRow['Product URL']) notesArray.push(`Product URL: ${csvRow['Product URL']}`);
    if (csvRow['Notes']) notesArray.push(`Notes: ${csvRow['Notes']}`);
    if (notesArray.length > 0) {
        mappedData.internal_notes = `Imported from CSV.\n${notesArray.join('\n')}`;
    }
    
    return mapProductDataToSupabase(mappedData);
}

console.log('✅ Product Field Mapper loaded successfully');


