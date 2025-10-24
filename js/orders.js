class OrdersManager {
    constructor() {
        this.orders = [];
        this.filteredOrders = [];
        this.supplierPayments = [];
        this.statusChart = null;
        this.trendsChart = null;
        this.selectedOrders = new Set(); // Track selected orders
        
        this.init();
    }

    async init() {
        try {
            await this.loadData();
            this.updateStats();
            this.renderOrders();
            this.createCharts();
            this.renderActivityTimeline();
            this.setupEventListeners();
        } catch (error) {
            console.error('Initialization error:', error);
            this.showNotification('Failed to load orders data', 'error');
        }
    }

    async loadData() {
        try {
            const [ordersResponse, paymentsResponse] = await Promise.all([
                fetch('tables/orders'),
                fetch('tables/supplier_payments?limit=1000')
            ]);
            
            if (ordersResponse.ok) {
                const ordersData = await ordersResponse.json();
                this.orders = ordersData.data || [];
            }
            
            if (paymentsResponse.ok) {
                const paymentsData = await paymentsResponse.json();
                this.supplierPayments = paymentsData.data || [];
            }

            this.filteredOrders = [...this.orders];
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    updateStats() {
        const totalOrders = this.orders.length;
        const processingOrders = this.orders.filter(o => 
            ['Processing', 'Sourcing', 'Production'].includes(o.status)).length;
        const shippedOrders = this.orders.filter(o => 
            ['Shipped', 'Delivered'].includes(o.status)).length;
        const totalValue = this.orders.reduce((sum, o) => sum + (o.total_value_rmb || 0), 0);
        const overdueOrders = this.orders.filter(o => {
            if (!o.delivery_date || ['Delivered', 'Cancelled'].includes(o.status)) return false;
            return new Date(o.delivery_date) < new Date();
        }).length;

        document.getElementById('totalOrders').textContent = totalOrders;
        document.getElementById('processingOrders').textContent = processingOrders;
        document.getElementById('shippedOrders').textContent = shippedOrders;
        document.getElementById('totalValue').textContent = `¥${totalValue.toLocaleString()}`;
        document.getElementById('overdueOrders').textContent = overdueOrders;
    }

    renderOrders() {
        const container = document.getElementById('ordersList');
        container.innerHTML = '';

        if (this.filteredOrders.length === 0) {
            container.innerHTML = `
                <div class="text-center py-12">
                    <i class="fas fa-shopping-cart text-4xl text-gray-300 mb-4"></i>
                    <p class="text-gray-500">No orders found matching your criteria</p>
                </div>
            `;
            return;
        }

        this.filteredOrders.forEach(order => {
            const isOverdue = order.delivery_date && 
                new Date(order.delivery_date) < new Date() && 
                !['Delivered', 'Cancelled'].includes(order.status);
                
            const deliveryDate = order.delivery_date ? 
                new Date(order.delivery_date).toLocaleDateString() : 'Not set';
            
            const orderDate = order.order_date ? 
                new Date(order.order_date).toLocaleDateString() : 'Unknown';

            const orderDiv = document.createElement('div');
            orderDiv.className = `order-card priority-${order.priority.toLowerCase()} ${isOverdue ? 'border-l-red-500' : ''}`;
            orderDiv.onclick = () => this.showOrderDetail(order);
            orderDiv.style.cursor = 'pointer';

            orderDiv.innerHTML = `
                <div class="flex justify-between items-start mb-4">
                    <div class="flex items-center gap-3">
                        <input type="checkbox" 
                               class="order-checkbox w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" 
                               data-order-id="${order.id}"
                               onclick="event.stopPropagation(); window.ordersManager.toggleOrderSelection('${order.id}', this.checked)"
                               ${this.selectedOrders.has(order.id) ? 'checked' : ''}>
                    </div>
                    <div class="flex-1">
                        <div class="flex items-center gap-3 mb-2">
                            <h3 class="text-lg font-semibold text-gray-900">${order.order_number}</h3>
                            <span class="office-badge ${order.assigned_office.toLowerCase()}-badge">
                                ${this.getOfficeBadge(order.assigned_office)}
                            </span>
                            ${isOverdue ? '<span class="text-red-500 text-xs font-medium"><i class="fas fa-exclamation-triangle"></i> OVERDUE</span>' : ''}
                        </div>
                        <p class="text-gray-600 font-medium">${order.client_name}</p>
                        <p class="text-gray-700 text-sm mt-1">${order.product_description.substring(0, 100)}${order.product_description.length > 100 ? '...' : ''}</p>
                    </div>
                    <div class="text-right">
                        <span class="status-badge ${this.getStatusBadgeClass(order.status)}">${order.status}</span>
                        <div class="text-xs px-2 py-1 rounded mt-1 inline-block ${this.getTransactionTypeBadge(order.transaction_type)}">
                            ${this.getTransactionTypeLabel(order.transaction_type)}
                        </div>
                        <div class="text-lg font-bold text-gray-900 mt-2">${this.getCurrencySymbol(order.currency)}${(order.total_value || order.total_value_rmb || 0).toLocaleString()}</div>
                        <div class="text-sm text-gray-500">${order.quantity} units @ ${this.getCurrencySymbol(order.currency)}${(order.unit_price || order.unit_price_rmb || 0).toLocaleString()}</div>
                    </div>
                </div>

                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                        <span class="text-gray-500">Order Date:</span>
                        <p class="font-medium">${orderDate}</p>
                    </div>
                    <div>
                        <span class="text-gray-500">Delivery Date:</span>
                        <p class="font-medium ${isOverdue ? 'text-red-600' : ''}">${deliveryDate}</p>
                    </div>
                    <div>
                        <span class="text-gray-500">Priority:</span>
                        <p class="font-medium text-${this.getPriorityColor(order.priority)}">${order.priority}</p>
                    </div>
                    <div>
                        <span class="text-gray-500">Office:</span>
                        <p class="font-medium">${order.assigned_office}</p>
                    </div>
                </div>

                ${order.supplier_info ? `
                <div class="mt-3 pt-3 border-t border-gray-200">
                    <span class="text-xs text-gray-500">Supplier:</span>
                    <p class="text-sm text-gray-700 mt-1">${order.supplier_info.substring(0, 80)}${order.supplier_info.length > 80 ? '...' : ''}</p>
                </div>
                ` : ''}

                <div class="mt-3 flex justify-between items-center">
                    <div class="flex gap-2">
                        <button onclick="event.stopPropagation(); updateOrderStatus('${order.id}', 'next')" 
                                class="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">
                            Advance Status
                        </button>
                        <button onclick="event.stopPropagation(); editOrder('${order.id}')" 
                                class="text-xs bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600">
                            Edit
                        </button>
                    </div>
                    <div class="text-xs text-gray-500">
                        Updated ${this.getRelativeTime(order.updated_at)}
                    </div>
                </div>
            `;

            container.appendChild(orderDiv);
        });
        
        // Update bulk delete button after rendering
        this.updateBulkDeleteButton();
    }

    createCharts() {
        this.createStatusChart();
        this.createTrendsChart();
    }

    createStatusChart() {
        const ctx = document.getElementById('statusChart');
        
        if (this.statusChart) {
            this.statusChart.destroy();
        }

        const statusCounts = {};
        this.orders.forEach(order => {
            statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
        });

        const statusColors = {
            'Received': '#9ca3af',
            'Processing': '#3b82f6',
            'Sourcing': '#f59e0b',
            'Production': '#8b5cf6',
            'Quality Check': '#06b6d4',
            'Shipped': '#10b981',
            'Delivered': '#22c55e',
            'Cancelled': '#ef4444'
        };

        this.statusChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(statusCounts),
                datasets: [{
                    data: Object.values(statusCounts),
                    backgroundColor: Object.keys(statusCounts).map(status => statusColors[status] || '#6b7280'),
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            boxWidth: 12,
                            fontSize: 10
                        }
                    }
                }
            }
        });
    }

    createTrendsChart() {
        const ctx = document.getElementById('trendsChart');
        
        if (this.trendsChart) {
            this.trendsChart.destroy();
        }

        // Group orders by month
        const monthlyData = {};
        this.orders.forEach(order => {
            if (order.order_date) {
                const month = new Date(order.order_date).toISOString().slice(0, 7); // YYYY-MM format
                if (!monthlyData[month]) {
                    monthlyData[month] = { count: 0, value: 0 };
                }
                monthlyData[month].count++;
                monthlyData[month].value += order.total_value_rmb || 0;
            }
        });

        // Sort by month and get last 6 months
        const sortedMonths = Object.keys(monthlyData).sort().slice(-6);
        const monthLabels = sortedMonths.map(month => {
            const date = new Date(month + '-01');
            return date.toLocaleDateString('en', { month: 'short', year: '2-digit' });
        });

        this.trendsChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: monthLabels,
                datasets: [
                    {
                        label: 'Order Count',
                        data: sortedMonths.map(month => monthlyData[month].count),
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        yAxisID: 'y'
                    },
                    {
                        label: 'Order Value (¥K)',
                        data: sortedMonths.map(month => Math.round(monthlyData[month].value / 1000)),
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Order Count'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Value (¥K)'
                        },
                        grid: {
                            drawOnChartArea: false,
                        },
                    }
                },
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    renderActivityTimeline() {
        const container = document.getElementById('activityTimeline');
        
        // Sort orders by updated date
        const recentOrders = [...this.orders]
            .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
            .slice(0, 10);

        container.innerHTML = recentOrders.map(order => `
            <div class="timeline-item">
                <div class="flex justify-between items-start">
                    <div class="flex-1">
                        <p class="text-sm font-medium">${order.order_number}</p>
                        <p class="text-xs text-gray-600">${order.client_name}</p>
                        <p class="text-xs text-gray-500">Status: ${order.status}</p>
                    </div>
                    <span class="text-xs text-gray-400">${this.getRelativeTime(order.updated_at)}</span>
                </div>
            </div>
        `).join('');
    }

    setupEventListeners() {
        // Search functionality
        document.getElementById('searchOrders').addEventListener('input', () => {
            this.filterOrders();
        });

        // Filter change listeners
        document.getElementById('statusFilter').addEventListener('change', () => {
            this.filterOrders();
        });

        document.getElementById('priorityFilter').addEventListener('change', () => {
            this.filterOrders();
        });

        document.getElementById('officeFilter').addEventListener('change', () => {
            this.filterOrders();
        });

        // Currency and transaction type filters (if they exist)
        const currencyFilter = document.getElementById('currencyFilter');
        if (currencyFilter) {
            currencyFilter.addEventListener('change', () => {
                this.filterOrders();
            });
        }

        const transactionTypeFilter = document.getElementById('transactionTypeFilter');
        if (transactionTypeFilter) {
            transactionTypeFilter.addEventListener('change', () => {
                this.filterOrders();
            });
        }

        // Form submission
        document.getElementById('createOrderForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleCreateOrder(e.target);
        });
    }

    filterOrders() {
        const searchTerm = document.getElementById('searchOrders').value.toLowerCase();
        const statusFilter = document.getElementById('statusFilter').value;
        const priorityFilter = document.getElementById('priorityFilter').value;
        const officeFilter = document.getElementById('officeFilter').value;
        const currencyFilter = document.getElementById('currencyFilter') ? document.getElementById('currencyFilter').value : '';
        const transactionTypeFilter = document.getElementById('transactionTypeFilter') ? document.getElementById('transactionTypeFilter').value : '';

        this.filteredOrders = this.orders.filter(order => {
            const matchesSearch = !searchTerm || 
                order.order_number.toLowerCase().includes(searchTerm) ||
                order.client_name.toLowerCase().includes(searchTerm) ||
                order.product_description.toLowerCase().includes(searchTerm);
            
            const matchesStatus = !statusFilter || order.status === statusFilter;
            const matchesPriority = !priorityFilter || order.priority === priorityFilter;
            const matchesOffice = !officeFilter || order.assigned_office === officeFilter;
            const matchesCurrency = !currencyFilter || order.currency === currencyFilter || (!order.currency && currencyFilter === 'RMB');
            const matchesTransactionType = !transactionTypeFilter || order.transaction_type === transactionTypeFilter || (!order.transaction_type && transactionTypeFilter === 'customer_order');

            return matchesSearch && matchesStatus && matchesPriority && matchesOffice && matchesCurrency && matchesTransactionType;
        });

        this.renderOrders();
    }

    async handleCreateOrder(form) {
        const formData = new FormData(form);
        const quantity = parseInt(formData.get('quantity'));
        const unitPrice = parseFloat(formData.get('unit_price') || formData.get('unit_price_rmb'));
        
        const orderData = {
            order_number: formData.get('order_number'),
            client_name: formData.get('client_name'),
            product_description: formData.get('product_description'),
            currency: formData.get('currency') || 'RMB',
            transaction_type: formData.get('transaction_type') || 'customer_order',
            quantity: quantity,
            unit_price: unitPrice,
            total_value: quantity * unitPrice,
            // Keep legacy fields for backward compatibility
            unit_price_rmb: unitPrice,
            total_value_rmb: quantity * unitPrice,
            priority: formData.get('priority'),
            status: 'Received',
            assigned_office: formData.get('assigned_office'),
            supplier_info: formData.get('supplier_info'),
            order_date: Date.now()
        };

        if (formData.get('delivery_date')) {
            orderData.delivery_date = new Date(formData.get('delivery_date')).getTime();
        }

        try {
            const response = await fetch('tables/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            if (response.ok) {
                this.showNotification('Order created successfully', 'success');
                this.closeCreateOrderModal();
                await this.loadData();
                this.updateStats();
                this.renderOrders();
                this.createCharts();
                this.renderActivityTimeline();
            } else {
                throw new Error('Failed to create order');
            }
        } catch (error) {
            console.error('Error creating order:', error);
            this.showNotification('Failed to create order', 'error');
        }
    }

    async updateOrderStatus(orderId, action) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) return;

        const statusFlow = [
            'Received', 'Processing', 'Sourcing', 'Production', 
            'Quality Check', 'Shipped', 'Delivered'
        ];
        
        const currentIndex = statusFlow.indexOf(order.status);
        const nextStatus = currentIndex >= 0 && currentIndex < statusFlow.length - 1 ? 
            statusFlow[currentIndex + 1] : order.status;

        if (nextStatus === order.status) {
            this.showNotification('Order is already at final status', 'info');
            return;
        }

        try {
            const response = await fetch(`tables/orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: nextStatus })
            });

            if (response.ok) {
                this.showNotification(`Order status updated to ${nextStatus}`, 'success');
                await this.loadData();
                this.updateStats();
                this.renderOrders();
                this.createCharts();
                this.renderActivityTimeline();
            } else {
                throw new Error('Failed to update order status');
            }
        } catch (error) {
            console.error('Error updating order:', error);
            this.showNotification('Failed to update order status', 'error');
        }
    }

    showOrderDetail(order) {
        // Store current order for editing
        window.currentEditingOrder = order;
        
        document.getElementById('orderDetailTitle').textContent = `Edit Order: ${order.order_number}`;
        
        const content = document.getElementById('orderDetailContent');
        content.innerHTML = `
            <form id="orderDetailForm" class="space-y-6">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Left Column: Basic Order Info -->
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Order Number *</label>
                            <input type="text" id="detailOrderNumber" value="${order.order_number || ''}" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" required>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Client Name *</label>
                            <input type="text" id="detailClientName" value="${order.client_name || ''}" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" required>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Product Description *</label>
                            <textarea id="detailProductDescription" rows="3" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" required>${order.product_description || ''}</textarea>
                        </div>
                        
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                                <select id="detailCurrency" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                                    <option value="EUR" ${order.currency === 'EUR' ? 'selected' : ''}>EUR (€)</option>
                                    <option value="USD" ${order.currency === 'USD' ? 'selected' : ''}>USD ($)</option>
                                    <option value="RMB" ${!order.currency || order.currency === 'RMB' ? 'selected' : ''}>RMB (¥)</option>
                                    <option value="GBP" ${order.currency === 'GBP' ? 'selected' : ''}>GBP (£)</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Transaction Type</label>
                                <select id="detailTransactionType" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                                    <option value="customer_order" ${!order.transaction_type || order.transaction_type === 'customer_order' ? 'selected' : ''}>Customer Order</option>
                                    <option value="supplier_order" ${order.transaction_type === 'supplier_order' ? 'selected' : ''}>Supplier Order</option>
                                    <option value="commission" ${order.transaction_type === 'commission' ? 'selected' : ''}>Commission</option>
                                    <option value="services" ${order.transaction_type === 'services' ? 'selected' : ''}>Services</option>
                                    <option value="products" ${order.transaction_type === 'products' ? 'selected' : ''}>Products</option>
                                    <option value="shipping" ${order.transaction_type === 'shipping' ? 'selected' : ''}>Shipping</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-3 gap-3">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                                <input type="number" id="detailQuantity" value="${order.quantity || ''}" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Unit Price</label>
                                <input type="number" id="detailUnitPrice" value="${order.unit_price || order.unit_price_rmb || ''}" step="0.01" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Total Value</label>
                                <input type="number" id="detailTotalValue" value="${order.total_value || order.total_value_rmb || ''}" step="0.01" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                            </div>
                        </div>
                    </div>
                    
                    <!-- Right Column: Status & Dates -->
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                            <select id="detailStatus" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" required>
                                <option value="Received" ${order.status === 'Received' ? 'selected' : ''}>Received</option>
                                <option value="Processing" ${order.status === 'Processing' ? 'selected' : ''}>Processing</option>
                                <option value="Sourcing" ${order.status === 'Sourcing' ? 'selected' : ''}>Sourcing</option>
                                <option value="Production" ${order.status === 'Production' ? 'selected' : ''}>Production</option>
                                <option value="Quality Check" ${order.status === 'Quality Check' ? 'selected' : ''}>Quality Check</option>
                                <option value="Shipped" ${order.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
                                <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                                <option value="Cancelled" ${order.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                            </select>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Priority *</label>
                            <select id="detailPriority" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" required>
                                <option value="Low" ${order.priority === 'Low' ? 'selected' : ''}>Low</option>
                                <option value="Medium" ${order.priority === 'Medium' ? 'selected' : ''}>Medium</option>
                                <option value="High" ${order.priority === 'High' ? 'selected' : ''}>High</option>
                                <option value="Urgent" ${order.priority === 'Urgent' ? 'selected' : ''}>Urgent</option>
                            </select>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Assigned Office *</label>
                            <select id="detailOffice" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" required>
                                <option value="Yiwu" ${order.assigned_office === 'Yiwu' ? 'selected' : ''}>Yiwu (义乌)</option>
                                <option value="Shenzhen" ${order.assigned_office === 'Shenzhen' ? 'selected' : ''}>Shenzhen (深圳)</option>
                                <option value="Both" ${order.assigned_office === 'Both' ? 'selected' : ''}>Both Offices (双城)</option>
                            </select>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Order Date</label>
                            <input type="date" id="detailOrderDate" value="${order.order_date ? order.order_date.split('T')[0] : ''}" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Delivery Date</label>
                            <input type="date" id="detailDeliveryDate" value="${order.delivery_date ? order.delivery_date.split('T')[0] : ''}" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Supplier Information</label>
                            <textarea id="detailSupplierInfo" rows="3" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">${order.supplier_info || ''}</textarea>
                        </div>
                    </div>
                </div>
                
                <!-- Supplier Payments Section -->
                <div class="border-t pt-6 mt-6">
                    <h4 class="font-semibold mb-4 flex items-center gap-2">
                        <i class="fas fa-money-bill-wave text-green-600"></i>
                        Supplier Payments (¥)
                    </h4>
                    
                    <!-- Existing Payments -->
                    <div id="existingPayments" class="space-y-2 mb-4">
                        ${this.getOrderPayments(order.id).map((payment, index) => `
                            <div class="flex items-center justify-between bg-gray-50 p-3 rounded-lg border-l-4 ${payment.status === 'Completed' ? 'border-green-500' : payment.status === 'Pending' ? 'border-yellow-500' : 'border-red-500'}">
                                <div class="flex-1">
                                    <div class="flex items-center justify-between mb-1">
                                        <p class="text-sm font-medium">¥${(payment.payment_amount_rmb || 0).toLocaleString()}</p>
                                        <span class="text-xs px-2 py-1 rounded ${payment.status === 'Completed' ? 'bg-green-100 text-green-800' : payment.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}">
                                            ${payment.status}
                                        </span>
                                    </div>
                                    <p class="text-xs text-gray-600">${payment.payment_method} • ${new Date(payment.payment_date).toLocaleDateString()}</p>
                                    ${payment.payment_reference ? `<p class="text-xs text-gray-500">Ref: ${payment.payment_reference}</p>` : ''}
                                    ${payment.notes ? `<p class="text-xs text-gray-500 mt-1">${payment.notes}</p>` : ''}
                                </div>
                                <button type="button" onclick="window.ordersManager.deletePayment('${payment.id}')" class="ml-3 text-red-600 hover:text-red-800 text-sm">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        `).join('')}
                        ${this.getOrderPayments(order.id).length === 0 ? '<p class="text-sm text-gray-500">No payments recorded yet</p>' : ''}
                    </div>
                    
                    <!-- Payment Summary -->
                    ${this.getOrderPayments(order.id).length > 0 ? `
                    <div class="bg-blue-50 p-3 rounded-lg mb-4">
                        <div class="flex justify-between text-sm">
                            <span class="font-medium">Total Paid:</span>
                            <span class="font-bold text-green-600">¥${this.getOrderPayments(order.id).filter(p => p.status === 'Completed').reduce((sum, p) => sum + (p.payment_amount_rmb || 0), 0).toLocaleString()}</span>
                        </div>
                        <div class="flex justify-between text-sm mt-1">
                            <span class="font-medium">Pending:</span>
                            <span class="font-bold text-yellow-600">¥${this.getOrderPayments(order.id).filter(p => p.status === 'Pending').reduce((sum, p) => sum + (p.payment_amount_rmb || 0), 0).toLocaleString()}</span>
                        </div>
                    </div>
                    ` : ''}
                    
                    <!-- Add New Payment Button -->
                    <button type="button" onclick="window.ordersManager.showAddPaymentModal('${order.id}')" class="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm flex items-center justify-center gap-2">
                        <i class="fas fa-plus"></i>
                        Record New Payment
                    </button>
                </div>
                
                <!-- File Attachments Section -->
                <div class="border-t pt-6 mt-6">
                    <h4 class="font-semibold mb-4 flex items-center gap-2">
                        <i class="fas fa-paperclip text-blue-600"></i>
                        File Attachments
                    </h4>
                    
                    <!-- Existing Attachments -->
                    <div id="existingAttachments" class="space-y-2 mb-4">
                        ${(order.attachments || []).map((file, index) => `
                            <div class="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                                <div class="flex items-center gap-3">
                                    <i class="fas fa-file text-gray-600"></i>
                                    <div>
                                        <p class="text-sm font-medium">${file.filename}</p>
                                        <p class="text-xs text-gray-500">${file.file_type} • ${new Date(file.upload_date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div class="flex gap-2">
                                    <button type="button" onclick="window.ordersManager.downloadAttachment(${index})" class="text-blue-600 hover:text-blue-800 text-sm">
                                        <i class="fas fa-download"></i> Download
                                    </button>
                                    <button type="button" onclick="window.ordersManager.removeAttachment(${index})" class="text-red-600 hover:text-red-800 text-sm">
                                        <i class="fas fa-trash"></i> Remove
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                        ${(!order.attachments || order.attachments.length === 0) ? '<p class="text-sm text-gray-500">No files attached yet</p>' : ''}
                    </div>
                    
                    <!-- Upload New File -->
                    <div class="border-2 border-dashed border-gray-300 rounded-lg p-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Add New File (PDF, Excel, Images - Max 1MB)
                        </label>
                        <input type="file" id="fileUploadInput" accept=".pdf,.xlsx,.xls,.jpg,.jpeg,.png,.gif" class="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100">
                        <button type="button" onclick="window.ordersManager.uploadFile()" class="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm flex items-center gap-2">
                            <i class="fas fa-upload"></i>
                            Upload File
                        </button>
                    </div>
                </div>
                
                <!-- Save/Cancel Buttons -->
                <div class="flex justify-end gap-3 pt-4 border-t mt-6">
                    <button type="button" onclick="window.ordersManager.closeOrderDetailModal()" class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                        Cancel
                    </button>
                    <button type="button" onclick="window.ordersManager.saveOrderFromDetail()" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                        <i class="fas fa-save"></i>
                        Save Changes
                    </button>
                    <button type="button" onclick="window.ordersManager.deleteOrderFromDetail('${order.id}')" class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2">
                        <i class="fas fa-trash"></i>
                        Delete Order
                    </button>
                </div>
            </form>
        `;
        
        document.getElementById('orderDetailModal').classList.remove('hidden');
    }

    getOfficeBadge(office) {
        const badges = {
            'Yiwu': '义乌',
            'Shenzhen': '深圳',
            'Both': '双城'
        };
        return badges[office] || office;
    }

    getStatusBadgeClass(status) {
        const classes = {
            'Received': 'bg-gray-100 text-gray-800',
            'Processing': 'bg-blue-100 text-blue-800',
            'Sourcing': 'bg-yellow-100 text-yellow-800',
            'Production': 'bg-purple-100 text-purple-800',
            'Quality Check': 'bg-cyan-100 text-cyan-800',
            'Shipped': 'bg-green-100 text-green-800',
            'Delivered': 'bg-emerald-100 text-emerald-800',
            'Cancelled': 'bg-red-100 text-red-800'
        };
        return classes[status] || 'bg-gray-100 text-gray-800';
    }

    getPriorityColor(priority) {
        const colors = {
            'Low': 'gray-600',
            'Medium': 'blue-600',
            'High': 'orange-600',
            'Urgent': 'red-600'
        };
        return colors[priority] || 'gray-600';
    }

    getRelativeTime(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    }

    getCurrencySymbol(currency) {
        const symbols = {
            'EUR': '€',
            'USD': '$',
            'RMB': '¥',
            'GBP': '£'
        };
        return symbols[currency] || '¥';
    }

    getTransactionTypeLabel(type) {
        const labels = {
            'customer_order': 'Customer Order',
            'supplier_order': 'Supplier Order',
            'commission': 'Commission',
            'services': 'Services',
            'products': 'Products',
            'shipping': 'Shipping'
        };
        return labels[type] || 'Customer Order';
    }

    getTransactionTypeBadge(type) {
        const badges = {
            'customer_order': 'bg-green-100 text-green-800',
            'supplier_order': 'bg-blue-100 text-blue-800',
            'commission': 'bg-purple-100 text-purple-800',
            'services': 'bg-cyan-100 text-cyan-800',
            'products': 'bg-orange-100 text-orange-800',
            'shipping': 'bg-gray-100 text-gray-800'
        };
        return badges[type] || 'bg-green-100 text-green-800';
    }

    closeCreateOrderModal() {
        document.getElementById('createOrderModal').classList.add('hidden');
        document.getElementById('createOrderForm').reset();
    }

    closeOrderDetailModal() {
        document.getElementById('orderDetailModal').classList.add('hidden');
        window.currentEditingOrder = null;
    }

    async saveOrderFromDetail() {
        if (!window.currentEditingOrder) return;
        
        const orderId = window.currentEditingOrder.id;
        const orderData = {
            order_number: document.getElementById('detailOrderNumber').value,
            client_name: document.getElementById('detailClientName').value,
            product_description: document.getElementById('detailProductDescription').value,
            currency: document.getElementById('detailCurrency').value,
            transaction_type: document.getElementById('detailTransactionType').value,
            quantity: parseInt(document.getElementById('detailQuantity').value) || null,
            unit_price: parseFloat(document.getElementById('detailUnitPrice').value) || 0,
            total_value: parseFloat(document.getElementById('detailTotalValue').value) || 0,
            status: document.getElementById('detailStatus').value,
            priority: document.getElementById('detailPriority').value,
            assigned_office: document.getElementById('detailOffice').value,
            order_date: document.getElementById('detailOrderDate').value || null,
            delivery_date: document.getElementById('detailDeliveryDate').value || null,
            supplier_info: document.getElementById('detailSupplierInfo').value
        };

        try {
            const response = await fetch(`tables/orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            if (response.ok) {
                this.showNotification('Order updated successfully!', 'success');
                this.closeOrderDetailModal();
                await this.loadData();
                this.updateStats();
                this.renderOrders();
            } else {
                throw new Error('Failed to update order');
            }
        } catch (error) {
            console.error('Error updating order:', error);
            this.showNotification('Error updating order. Please try again.', 'error');
        }
    }

    async deleteOrderFromDetail(orderId) {
        if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`tables/orders/${orderId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                this.showNotification('Order deleted successfully!', 'success');
                this.closeOrderDetailModal();
                await this.loadData();
                this.updateStats();
                this.renderOrders();
            } else {
                throw new Error('Failed to delete order');
            }
        } catch (error) {
            console.error('Error deleting order:', error);
            this.showNotification('Error deleting order. Please try again.', 'error');
        }
    }

    // Checkbox selection methods
    toggleOrderSelection(orderId, isChecked) {
        if (isChecked) {
            this.selectedOrders.add(orderId);
        } else {
            this.selectedOrders.delete(orderId);
        }
        this.updateBulkDeleteButton();
    }

    toggleSelectAllOrders(isChecked) {
        const checkboxes = document.querySelectorAll('.order-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = isChecked;
            const orderId = checkbox.dataset.orderId;
            if (isChecked) {
                this.selectedOrders.add(orderId);
            } else {
                this.selectedOrders.delete(orderId);
            }
        });
        this.updateBulkDeleteButton();
    }

    updateBulkDeleteButton() {
        const deleteBtn = document.getElementById('bulkDeleteBtn');
        const selectAllCheckbox = document.getElementById('selectAllOrders');
        
        if (deleteBtn) {
            if (this.selectedOrders.size > 0) {
                deleteBtn.classList.remove('hidden');
                deleteBtn.querySelector('span').textContent = `Delete ${this.selectedOrders.size} order(s)`;
            } else {
                deleteBtn.classList.add('hidden');
            }
        }

        // Update select all checkbox state
        if (selectAllCheckbox) {
            const allCheckboxes = document.querySelectorAll('.order-checkbox');
            const checkedCheckboxes = document.querySelectorAll('.order-checkbox:checked');
            selectAllCheckbox.checked = allCheckboxes.length > 0 && allCheckboxes.length === checkedCheckboxes.length;
            selectAllCheckbox.indeterminate = checkedCheckboxes.length > 0 && checkedCheckboxes.length < allCheckboxes.length;
        }
    }

    async deleteSelectedOrders() {
        if (this.selectedOrders.size === 0) {
            this.showNotification('No orders selected', 'error');
            return;
        }

        if (!confirm(`Are you sure you want to delete ${this.selectedOrders.size} order(s)? This action cannot be undone.`)) {
            return;
        }

        try {
            const deletePromises = Array.from(this.selectedOrders).map(orderId =>
                fetch(`tables/orders/${orderId}`, { method: 'DELETE' })
            );

            await Promise.all(deletePromises);

            this.showNotification(`${this.selectedOrders.size} order(s) deleted successfully!`, 'success');
            this.selectedOrders.clear();
            
            await this.loadData();
            this.updateStats();
            this.renderOrders();
            this.updateBulkDeleteButton();
        } catch (error) {
            console.error('Error deleting orders:', error);
            this.showNotification('Error deleting some orders. Please try again.', 'error');
        }
    }

    async uploadFile() {
        const fileInput = document.getElementById('fileUploadInput');
        const file = fileInput.files[0];
        
        if (!file) {
            this.showNotification('Please select a file first', 'error');
            return;
        }
        
        // Check file size (max 1MB)
        if (file.size > 1024 * 1024) {
            this.showNotification('File size must be less than 1MB', 'error');
            return;
        }
        
        // Read file as base64
        const reader = new FileReader();
        reader.onload = async (e) => {
            const base64Data = e.target.result;
            const fileAttachment = {
                filename: file.name,
                file_type: file.type,
                file_size: file.size,
                upload_date: new Date().toISOString(),
                file_data: base64Data
            };
            
            // Get current attachments
            const currentOrder = window.currentEditingOrder;
            const attachments = currentOrder.attachments || [];
            attachments.push(fileAttachment);
            
            // Update order with new attachment
            try {
                const response = await fetch(`tables/orders/${currentOrder.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ attachments: attachments })
                });
                
                if (response.ok) {
                    this.showNotification('File uploaded successfully!', 'success');
                    fileInput.value = ''; // Clear input
                    // Reload order detail
                    const updatedOrder = await response.json();
                    window.currentEditingOrder = updatedOrder;
                    this.showOrderDetail(updatedOrder);
                } else {
                    throw new Error('Failed to upload file');
                }
            } catch (error) {
                console.error('Error uploading file:', error);
                this.showNotification('Error uploading file. Please try again.', 'error');
            }
        };
        
        reader.onerror = () => {
            this.showNotification('Error reading file', 'error');
        };
        
        reader.readAsDataURL(file);
    }

    downloadAttachment(index) {
        const currentOrder = window.currentEditingOrder;
        if (!currentOrder || !currentOrder.attachments || !currentOrder.attachments[index]) {
            this.showNotification('File not found', 'error');
            return;
        }
        
        const attachment = currentOrder.attachments[index];
        
        // Create a temporary link and trigger download
        const link = document.createElement('a');
        link.href = attachment.file_data;
        link.download = attachment.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showNotification('Download started', 'success');
    }

    async removeAttachment(index) {
        if (!confirm('Are you sure you want to remove this file?')) {
            return;
        }
        
        const currentOrder = window.currentEditingOrder;
        const attachments = [...(currentOrder.attachments || [])];
        attachments.splice(index, 1);
        
        try {
            const response = await fetch(`tables/orders/${currentOrder.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ attachments: attachments })
            });
            
            if (response.ok) {
                this.showNotification('File removed successfully!', 'success');
                const updatedOrder = await response.json();
                window.currentEditingOrder = updatedOrder;
                this.showOrderDetail(updatedOrder);
            } else {
                throw new Error('Failed to remove file');
            }
        } catch (error) {
            console.error('Error removing file:', error);
            this.showNotification('Error removing file. Please try again.', 'error');
        }
    }

    getOrderPayments(orderId) {
        return this.supplierPayments.filter(p => p.order_id === orderId);
    }

    showAddPaymentModal(orderId) {
        window.currentPaymentOrderId = orderId;
        const order = this.orders.find(o => o.id === orderId);
        
        // Create modal HTML
        const modalHTML = `
            <div id="addPaymentModal" class="fixed inset-0 bg-black bg-opacity-50 z-[70]">
                <div class="flex items-center justify-center min-h-screen p-4">
                    <div class="bg-white rounded-lg max-w-2xl w-full p-6">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-xl font-bold text-gray-900">
                                <i class="fas fa-money-bill-wave text-green-600 mr-2"></i>
                                Record Supplier Payment
                            </h3>
                            <button onclick="window.ordersManager.closeAddPaymentModal()" class="text-gray-400 hover:text-gray-600 text-xl">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        
                        <form id="addPaymentForm" class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Order</label>
                                <input type="text" value="${order.order_number} - ${order.client_name}" disabled class="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50">
                            </div>
                            
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Amount (¥) *</label>
                                    <input type="number" id="paymentAmount" step="0.01" required class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Payment Date *</label>
                                    <input type="date" id="paymentDate" value="${new Date().toISOString().split('T')[0]}" required class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500">
                                </div>
                            </div>
                            
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Payment Method *</label>
                                    <select id="paymentMethod" required class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500">
                                        <option value="Bank Transfer">Bank Transfer</option>
                                        <option value="WeChat Pay">WeChat Pay</option>
                                        <option value="Alipay">Alipay</option>
                                        <option value="Cash">Cash</option>
                                        <option value="Check">Check</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                                    <select id="paymentStatus" required class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500">
                                        <option value="Completed">Completed</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Failed">Failed</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Supplier Name</label>
                                <input type="text" id="supplierName" value="${order.supplier_info ? order.supplier_info.split('\n')[0] : ''}" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Payment Reference</label>
                                <input type="text" id="paymentReference" placeholder="Transaction ID or reference number" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                                <textarea id="paymentNotes" rows="3" placeholder="Additional payment notes..." class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"></textarea>
                            </div>
                            
                            <div class="flex justify-end gap-3 pt-4 border-t">
                                <button type="button" onclick="window.ordersManager.closeAddPaymentModal()" class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                                    Cancel
                                </button>
                                <button type="submit" class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
                                    <i class="fas fa-save"></i>
                                    Save Payment
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        // Remove existing modal if any
        const existingModal = document.getElementById('addPaymentModal');
        if (existingModal) existingModal.remove();
        
        // Add modal to page
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Add form submit listener
        document.getElementById('addPaymentForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.savePayment();
        });
    }

    closeAddPaymentModal() {
        const modal = document.getElementById('addPaymentModal');
        if (modal) modal.remove();
        window.currentPaymentOrderId = null;
    }

    async savePayment() {
        const paymentData = {
            order_id: window.currentPaymentOrderId,
            supplier_name: document.getElementById('supplierName').value,
            payment_amount_rmb: parseFloat(document.getElementById('paymentAmount').value),
            payment_date: document.getElementById('paymentDate').value,
            payment_method: document.getElementById('paymentMethod').value,
            payment_reference: document.getElementById('paymentReference').value,
            notes: document.getElementById('paymentNotes').value,
            status: document.getElementById('paymentStatus').value
        };

        try {
            const response = await fetch('tables/supplier_payments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(paymentData)
            });

            if (response.ok) {
                this.showNotification('Payment recorded successfully!', 'success');
                this.closeAddPaymentModal();
                await this.loadData();
                // Refresh order detail view
                const order = this.orders.find(o => o.id === window.currentPaymentOrderId);
                if (order && window.currentEditingOrder) {
                    window.currentEditingOrder = order;
                    this.showOrderDetail(order);
                }
            } else {
                throw new Error('Failed to save payment');
            }
        } catch (error) {
            console.error('Error saving payment:', error);
            this.showNotification('Error saving payment. Please try again.', 'error');
        }
    }

    async deletePayment(paymentId) {
        if (!confirm('Are you sure you want to delete this payment record?')) {
            return;
        }

        try {
            const response = await fetch(`tables/supplier_payments/${paymentId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                this.showNotification('Payment deleted successfully!', 'success');
                await this.loadData();
                // Refresh order detail view
                if (window.currentEditingOrder) {
                    const order = this.orders.find(o => o.id === window.currentEditingOrder.id);
                    if (order) {
                        window.currentEditingOrder = order;
                        this.showOrderDetail(order);
                    }
                }
            } else {
                throw new Error('Failed to delete payment');
            }
        } catch (error) {
            console.error('Error deleting payment:', error);
            this.showNotification('Error deleting payment. Please try again.', 'error');
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
            type === 'success' ? 'bg-green-500 text-white' :
            type === 'error' ? 'bg-red-500 text-white' :
            'bg-blue-500 text-white'
        }`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Global functions
function showCreateOrderModal() {
    document.getElementById('createOrderModal').classList.remove('hidden');
}

function closeCreateOrderModal() {
    if (window.ordersManager) {
        window.ordersManager.closeCreateOrderModal();
    }
}

function applyFilters() {
    if (window.ordersManager) {
        window.ordersManager.filterOrders();
    }
}

function updateOrderStatus(orderId, action) {
    if (window.ordersManager) {
        window.ordersManager.updateOrderStatus(orderId, action);
    }
}

function editOrder(orderId) {
    console.log('Edit order:', orderId);
    if (window.ordersManager) {
        window.ordersManager.openEditModal(orderId);
    }
}

function exportOrders() {
    if (window.ordersManager) {
        console.log('Exporting orders...');
        window.ordersManager.showNotification('Export feature coming soon', 'info');
    }
}

function refreshData() {
    if (window.ordersManager) {
        window.ordersManager.loadData().then(() => {
            window.ordersManager.updateStats();
            window.ordersManager.renderOrders();
            window.ordersManager.createCharts();
            window.ordersManager.renderActivityTimeline();
            window.ordersManager.showNotification('Data refreshed successfully', 'success');
        });
    }
}

// Global variable to store current order being edited
let currentEditingOrder = null;

// Close order detail modal
function closeOrderDetail() {
    document.getElementById('orderDetailModal').classList.add('hidden');
    currentEditingOrder = null;
}

// Open edit order modal
function openEditOrderModal() {
    if (!currentEditingOrder) return;
    
    // Populate form with current order data
    document.getElementById('editOrderId').value = currentEditingOrder.id;
    document.getElementById('editOrderNumber').value = currentEditingOrder.order_number || '';
    document.getElementById('editClientName').value = currentEditingOrder.client_name || '';
    document.getElementById('editProductDescription').value = currentEditingOrder.product_description || '';
    document.getElementById('editCurrency').value = currentEditingOrder.currency || 'EUR';
    document.getElementById('editTransactionType').value = currentEditingOrder.transaction_type || 'customer_order';
    document.getElementById('editQuantity').value = currentEditingOrder.quantity || '';
    document.getElementById('editUnitPrice').value = currentEditingOrder.unit_price || currentEditingOrder.unit_price_rmb || '';
    document.getElementById('editTotalValue').value = currentEditingOrder.total_value || currentEditingOrder.total_value_rmb || '';
    document.getElementById('editOrderStatus').value = currentEditingOrder.status || 'Received';
    document.getElementById('editOrderPriority').value = currentEditingOrder.priority || 'Medium';
    document.getElementById('editAssignedOffice').value = currentEditingOrder.assigned_office || 'Yiwu';
    document.getElementById('editOrderDate').value = currentEditingOrder.order_date || '';
    document.getElementById('editDeliveryDate').value = currentEditingOrder.delivery_date || '';
    document.getElementById('editSupplierInfo').value = currentEditingOrder.supplier_info || '';
    
    // Close detail modal and open edit modal
    document.getElementById('orderDetailModal').classList.add('hidden');
    document.getElementById('editOrderModal').classList.remove('hidden');
}

// Close edit order modal
function closeEditOrderModal() {
    document.getElementById('editOrderModal').classList.add('hidden');
    currentEditingOrder = null;
}

// Save order edits
async function saveOrderEdits() {
    const orderId = document.getElementById('editOrderId').value;
    
    const orderData = {
        order_number: document.getElementById('editOrderNumber').value,
        client_name: document.getElementById('editClientName').value,
        product_description: document.getElementById('editProductDescription').value,
        currency: document.getElementById('editCurrency').value,
        transaction_type: document.getElementById('editTransactionType').value,
        quantity: parseInt(document.getElementById('editQuantity').value) || null,
        unit_price: parseFloat(document.getElementById('editUnitPrice').value) || 0,
        total_value: parseFloat(document.getElementById('editTotalValue').value) || 0,
        status: document.getElementById('editOrderStatus').value,
        priority: document.getElementById('editOrderPriority').value,
        assigned_office: document.getElementById('editAssignedOffice').value,
        order_date: document.getElementById('editOrderDate').value || null,
        delivery_date: document.getElementById('editDeliveryDate').value || null,
        supplier_info: document.getElementById('editSupplierInfo').value
    };

    try {
        const response = await fetch(`tables/orders/${orderId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        if (response.ok) {
            closeEditOrderModal();
            if (window.ordersManager) {
                await window.ordersManager.loadData();
                window.ordersManager.updateStats();
                window.ordersManager.renderOrders();
                window.ordersManager.createCharts();
                window.ordersManager.showNotification('Order updated successfully!', 'success');
            }
        } else {
            alert('Error updating order. Please try again.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error updating order. Please try again.');
    }
}

// Delete order
async function deleteOrder() {
    if (!currentEditingOrder) return;
    
    if (!confirm(`Are you sure you want to delete order "${currentEditingOrder.order_number}"? This action cannot be undone.`)) {
        return;
    }

    try {
        const response = await fetch(`tables/orders/${currentEditingOrder.id}`, {
            method: 'DELETE'
        });

        if (response.ok || response.status === 204) {
            closeOrderDetail();
            if (window.ordersManager) {
                await window.ordersManager.loadData();
                window.ordersManager.updateStats();
                window.ordersManager.renderOrders();
                window.ordersManager.createCharts();
                window.ordersManager.showNotification('Order deleted successfully!', 'success');
            }
        } else {
            alert('Error deleting order. Please try again.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error deleting order. Please try again.');
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.ordersManager = new OrdersManager();
    
    // Setup edit order form submission
    const editOrderForm = document.getElementById('editOrderForm');
    if (editOrderForm) {
        editOrderForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await saveOrderEdits();
        });
    }
});