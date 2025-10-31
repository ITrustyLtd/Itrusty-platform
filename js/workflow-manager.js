/**
 * Workflow Manager JavaScript
 * Handles workflow creation, step management, and progress tracking
 */

// Global state
let currentWorkflows = [];
let currentWorkflow = null;
let workflowSteps = [];

/**
 * Initialize the workflow manager
 */
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🔧 Workflow Manager initializing...');
    await loadWorkflows();
    renderWorkflows();
});

/**
 * Load workflows from Supabase
 */
async function loadWorkflows() {
    try {
        const response = await fetch('tables/workflows?limit=100');
        const result = await response.json();
        currentWorkflows = result.data || [];
        console.log('✅ Loaded workflows:', currentWorkflows.length);
    } catch (error) {
        console.error('❌ Error loading workflows:', error);
        currentWorkflows = [];
    }
}

/**
 * Render workflows list
 */
function renderWorkflows() {
    const container = document.getElementById('workflowsList');
    if (!container) return;
    
    if (currentWorkflows.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12 text-gray-500">
                <i class="fas fa-project-diagram text-6xl mb-4"></i>
                <p class="text-xl">No workflows yet</p>
                <p class="text-sm mt-2">Create your first workflow to get started</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = currentWorkflows.map(workflow => `
        <div class="workflow-card bg-white rounded-lg shadow-md p-6 mb-4 hover:shadow-lg transition cursor-pointer"
             onclick="selectWorkflow('${workflow.id}')">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-xl font-semibold text-gray-900">${workflow.name || 'Untitled Workflow'}</h3>
                <span class="px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(workflow.status)}">
                    ${workflow.status || 'active'}
                </span>
            </div>
            <p class="text-gray-600 text-sm mb-4">${workflow.description || 'No description'}</p>
            <div class="flex items-center gap-4 text-sm text-gray-500">
                <span><i class="fas fa-list-ol mr-2"></i>${workflow.total_steps || 0} steps</span>
                <span><i class="fas fa-check-circle mr-2 text-green-600"></i>${workflow.completed_steps || 0} completed</span>
                <span><i class="fas fa-clock mr-2"></i>${formatDate(workflow.created_at)}</span>
            </div>
        </div>
    `).join('');
}

/**
 * Get status badge CSS class
 */
function getStatusBadgeClass(status) {
    const classes = {
        'active': 'bg-green-100 text-green-800',
        'in-progress': 'bg-blue-100 text-blue-800',
        'completed': 'bg-gray-100 text-gray-800',
        'blocked': 'bg-red-100 text-red-800'
    };
    return classes[status] || classes['active'];
}

/**
 * Format date for display
 */
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Create new workflow
 */
async function createNewWorkflow() {
    const name = prompt('Enter workflow name:');
    if (!name) return;
    
    const description = prompt('Enter workflow description (optional):');
    
    const workflowData = {
        name: name.trim(),
        description: description?.trim() || '',
        status: 'active',
        total_steps: 0,
        completed_steps: 0,
        created_at: new Date().toISOString()
    };
    
    try {
        const response = await fetch('tables/workflows', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(workflowData)
        });
        
        if (response.ok) {
            const result = await response.json();
            const createdWorkflow = result.data ? result.data[0] : result;
            console.log('✅ Workflow created:', createdWorkflow);
            alert('✅ Workflow created successfully!');
            await loadWorkflows();
            renderWorkflows();
            selectWorkflow(createdWorkflow.id);
        } else {
            throw new Error('Failed to create workflow');
        }
    } catch (error) {
        console.error('❌ Error creating workflow:', error);
        alert('❌ Failed to create workflow');
    }
}

/**
 * Select a workflow to view/edit
 */
async function selectWorkflow(workflowId) {
    try {
        const response = await fetch(`tables/workflows/${workflowId}`);
        const result = await response.json();
        currentWorkflow = result.data ? result.data[0] : result;
        
        // Load workflow steps
        const stepsResponse = await fetch(`tables/workflow_steps?workflow_id=eq.${workflowId}`);
        const stepsResult = await stepsResponse.json();
        workflowSteps = stepsResult.data || [];
        
        renderWorkflowDetails();
    } catch (error) {
        console.error('❌ Error loading workflow:', error);
        alert('❌ Failed to load workflow');
    }
}

/**
 * Render workflow details
 */
function renderWorkflowDetails() {
    const container = document.getElementById('workflowDetails');
    if (!container || !currentWorkflow) return;
    
    container.innerHTML = `
        <div class="bg-white rounded-lg shadow-lg p-6">
            <div class="flex items-center justify-between mb-6">
                <h2 class="text-2xl font-bold text-gray-900">${currentWorkflow.name}</h2>
                <button onclick="closeWorkflowDetails()" class="text-gray-400 hover:text-gray-600">
                    <i class="fas fa-times text-xl"></i>
                </button>
            </div>
            
            <p class="text-gray-600 mb-6">${currentWorkflow.description || 'No description'}</p>
            
            <div class="mb-6">
                <button onclick="addWorkflowStep()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    <i class="fas fa-plus mr-2"></i>Add Step
                </button>
            </div>
            
            <div id="workflowStepsList">
                ${renderWorkflowSteps()}
            </div>
        </div>
    `;
}

/**
 * Render workflow steps
 */
function renderWorkflowSteps() {
    if (workflowSteps.length === 0) {
        return `
            <div class="text-center py-8 text-gray-500">
                <i class="fas fa-tasks text-4xl mb-2"></i>
                <p>No steps added yet</p>
            </div>
        `;
    }
    
    return workflowSteps.map((step, index) => `
        <div class="workflow-step ${step.status}" data-step-id="${step.id}">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <span class="text-2xl font-bold text-gray-300">${index + 1}</span>
                    <div>
                        <h4 class="font-semibold text-gray-900">${step.step_name}</h4>
                        <p class="text-sm text-gray-500">${step.notes || ''}</p>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <select onchange="updateStepStatus('${step.id}', this.value)" class="text-sm border rounded px-2 py-1">
                        <option value="pending" ${step.status === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="in-progress" ${step.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
                        <option value="completed" ${step.status === 'completed' ? 'selected' : ''}>Completed</option>
                        <option value="blocked" ${step.status === 'blocked' ? 'selected' : ''}>Blocked</option>
                    </select>
                    <button onclick="deleteStep('${step.id}')" class="text-red-600 hover:text-red-800">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

/**
 * Add workflow step
 */
async function addWorkflowStep() {
    if (!currentWorkflow) {
        alert('⚠️ Please select a workflow first');
        return;
    }
    
    const stepName = prompt('Enter step name:');
    if (!stepName) return;
    
    const description = prompt('Enter step description (optional):');
    
    const stepData = {
        workflow_id: currentWorkflow.id,
        step_name: stepName.trim(),
        notes: description?.trim() || '',
        step_number: workflowSteps.length + 1,
        step_order: workflowSteps.length + 1,
        status: 'pending'
    };
    
    try {
        const response = await fetch('tables/workflow_steps', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(stepData)
        });
        
        if (response.ok) {
            console.log('✅ Step added');
            alert('✅ Step added successfully!');
            await selectWorkflow(currentWorkflow.id);
        } else {
            throw new Error('Failed to add step');
        }
    } catch (error) {
        console.error('❌ Error adding step:', error);
        alert('❌ Failed to add step');
    }
}

/**
 * Quick add predefined step
 */
async function quickAddStep(stepName) {
    if (!currentWorkflow) {
        // Create a default workflow first
        await createDefaultWorkflow();
    }
    
    if (!currentWorkflow) {
        alert('⚠️ Please create or select a workflow first');
        return;
    }
    
    const stepData = {
        workflow_id: currentWorkflow.id,
        step_name: stepName,
        notes: `Standard ${stepName} step`,
        step_number: workflowSteps.length + 1,
        step_order: workflowSteps.length + 1,
        status: 'pending'
    };
    
    try {
        const response = await fetch('tables/workflow_steps', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(stepData)
        });
        
        if (response.ok) {
            console.log('✅ Quick step added:', stepName);
            await selectWorkflow(currentWorkflow.id);
        } else {
            throw new Error('Failed to add step');
        }
    } catch (error) {
        console.error('❌ Error adding quick step:', error);
        alert('❌ Failed to add step');
    }
}

/**
 * Create default workflow if none exists
 */
async function createDefaultWorkflow() {
    const workflowData = {
        name: 'Default Order Workflow',
        description: 'Standard order processing workflow',
        status: 'active',
        total_steps: 0,
        completed_steps: 0
    };
    
    try {
        const response = await fetch('tables/workflows', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(workflowData)
        });
        
        if (response.ok) {
            const result = await response.json();
            currentWorkflow = result.data ? result.data[0] : result;
            await loadWorkflows();
            renderWorkflows();
        }
    } catch (error) {
        console.error('❌ Error creating default workflow:', error);
    }
}

/**
 * Update step status
 */
async function updateStepStatus(stepId, newStatus) {
    try {
        const response = await fetch(`tables/workflow_steps/${stepId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        
        if (response.ok) {
            console.log('✅ Step status updated');
            await selectWorkflow(currentWorkflow.id);
        } else {
            throw new Error('Failed to update status');
        }
    } catch (error) {
        console.error('❌ Error updating step status:', error);
        alert('❌ Failed to update status');
    }
}

/**
 * Delete workflow step
 */
async function deleteStep(stepId) {
    if (!confirm('Are you sure you want to delete this step?')) return;
    
    try {
        const response = await fetch(`tables/workflow_steps/${stepId}`, {
            method: 'DELETE'
        });
        
        if (response.ok || response.status === 204) {
            console.log('✅ Step deleted');
            await selectWorkflow(currentWorkflow.id);
        } else {
            throw new Error('Failed to delete step');
        }
    } catch (error) {
        console.error('❌ Error deleting step:', error);
        alert('❌ Failed to delete step');
    }
}

/**
 * Close workflow details
 */
function closeWorkflowDetails() {
    const container = document.getElementById('workflowDetails');
    if (container) {
        container.innerHTML = '';
    }
    currentWorkflow = null;
    workflowSteps = [];
}

console.log('✅ Workflow Manager JS loaded');