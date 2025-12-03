// assets/js/manage_shuttles.js

document.addEventListener('DOMContentLoaded', () => {
    // 1. Load Data
    loadRoutes();    // Fill the dropdown
    loadShuttles();  // Fill the list
    setupGlobalUI(); // Sidebar logic

    // 2. Handle Add Shuttle Form
    const form = document.getElementById('add-shuttle-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const plate_number = document.getElementById('shuttle-plate').value;
            const capacity = document.getElementById('shuttle-capacity').value;
            const route_id = document.getElementById('shuttle-route').value;

            if(!route_id) {
                alert("Please select a route.");
                return;
            }

            try {
                const response = await fetch('api/admin/add_shuttle.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ plate_number, capacity, route_id })
                });
                const result = await response.json();

                if (result.success) {
                    alert("Shuttle Added Successfully!");
                    form.reset();
                    loadShuttles(); // Refresh list immediately
                } else {
                    alert(result.message);
                }
            } catch (error) {
                console.error('Error adding shuttle:', error);
            }
        });
    }
});

// --- FUNCTION: Load Routes for Dropdown ---
async function loadRoutes() {
    const select = document.getElementById('shuttle-route');
    if(!select) return;

    try {
        // We reuse the existing option fetcher
        const response = await fetch('api/admin/get_form_options.php');
        const json = await response.json();

        if (json.success) {
            // Clear current options (remove hardcoded ones)
            select.innerHTML = '<option value="">-- Select Route --</option>';
            
            json.data.routes.forEach(route => {
                const option = document.createElement('option');
                option.value = route.id;
                option.textContent = route.name;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading routes:', error);
    }
}

// --- FUNCTION: Load Shuttle List ---
async function loadShuttles() {
    const list = document.getElementById('shuttles-list');
    try {
        const response = await fetch('api/admin/get_shuttles.php');
        const json = await response.json();

        list.innerHTML = ''; 

        if (json.success && json.data.length > 0) {
            json.data.forEach(shuttle => {
                const item = document.createElement('div');
                item.className = 'history-item'; 
                // We add a specific ID to the container so we can remove it visually if needed
                item.id = `shuttle-card-${shuttle.id}`; 
                
                item.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:center; width:100%;">
                        <div style="display:flex; align-items:center; gap: 15px;">
                            <i class="fas fa-bus" style="color:#E02B2B; font-size:24px;"></i>
                            <div>
                                <h4 style="margin:0;">${shuttle.plate_number}</h4>
                                <p style="font-size:12px; color:#666; margin:0;">
                                    <strong>${shuttle.capacity}</strong> Seats <br>
                                    Route: ${shuttle.route_name || 'Unassigned'}
                                </p>
                            </div>
                        </div>
                        
                        <button onclick="deleteShuttle(${shuttle.id})" style="background:none; border:none; cursor:pointer;">
                            <i class="fas fa-trash-alt" style="color:#888; transition:color 0.2s;" onmouseover="this.style.color='#E02B2B'" onmouseout="this.style.color='#888'"></i>
                        </button>
                    </div>
                `;
                list.appendChild(item);
            });
        } else {
            list.innerHTML = '<p style="text-align:center; color:#999;">No shuttles registered yet.</p>';
        }
    } catch (error) {
        console.error('Error loading shuttles:', error);
        list.innerHTML = '<p style="text-align:center; color:red;">Error loading data.</p>';
    }
}

// --- FUNCTION: Delete Shuttle ---
async function deleteShuttle(id) {
    if(!confirm("Are you sure you want to delete this shuttle?")) return;

    try {
        const response = await fetch('api/admin/delete_shuttle.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id })
        });
        const result = await response.json();

        if (result.success) {
            // Remove from UI immediately
            const el = document.getElementById(`shuttle-card-${id}`);
            if(el) el.remove();
            
            // Or just reload the whole list
            loadShuttles();
        } else {
            alert("Failed to delete: " + result.message);
        }
    } catch (error) {
        console.error('Error deleting:', error);
    }
}