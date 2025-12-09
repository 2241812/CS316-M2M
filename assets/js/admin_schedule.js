// assets/js/admin_schedule.js - DEBUG VERSION

document.addEventListener('DOMContentLoaded', () => {
    // 1. Load Data for Form and List
    loadFormOptions(); 
    loadSchedules(); 
    // setupGlobalUI(); // Assuming this is defined in assets/js/main.js

    // 2. Handle Schedule Creation Form
    const saveButton = document.getElementById('btn-save-schedule');
    if (saveButton) {
        saveButton.addEventListener('click', submitSchedule);
    }
});

// Helper function to format date from YYYY-MM-DD (DB format) to DD/MM/YYYY
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    const parts = String(dateString).split('-');
    if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`; // DD/MM/YYYY format
    }
    return dateString; 
}

// CRITICAL FIX: Helper function for time formatting
function formatTime12Hour(timeString) {
    if (!timeString) return 'N/A';
    
    const date = new Date(`2000-01-01T${timeString}`);
    
    if (isNaN(date.getTime())) {
        return timeString; 
    }

    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}


async function loadFormOptions() {
    try {
        const response = await fetch('api/admin/get_form_options.php');
        const json = await response.json();

        if (json.success) {
            populateSelect('route-select', json.data.routes, '-- Select Route --');
            populateSelect('shuttle-select', json.data.shuttles, '-- Select Shuttle --', 'plate_number', 'id');
            populateSelect('driver-select', json.data.drivers, '-- Select Driver --', 'name', 'id');
        } else {
            console.error('Error loading form options:', json.message);
        }
    } catch (error) {
        console.error('Error fetching form options:', error);
    }
}

function populateSelect(elementId, data, defaultText, displayKey = 'name', valueKey = 'id') {
    const select = document.getElementById(elementId);
    if (!select) return;

    select.innerHTML = `<option value="">${defaultText}</option>`;
    
    data.forEach(item => {
        const option = document.createElement('option');
        option.value = item[valueKey];
        option.textContent = item[displayKey];
        select.appendChild(option);
    });
}


async function submitSchedule() {
    const form = document.getElementById('create-schedule-form');
    if (!form.checkValidity()) {
        Swal.fire('Warning', 'Please fill out all required fields.', 'warning');
        return;
    }
    
    const route_id = document.getElementById('route-select').value;
    const shuttle_id = document.getElementById('shuttle-select').value;
    const driver_id = document.getElementById('driver-select').value;
    const schedule_date = document.getElementById('date-input').value;
    const departure_time = document.getElementById('time-input').value;
    const submitBtn = document.getElementById('btn-save-schedule');

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

    try {

        const response = await fetch('api/admin/create_schedule.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                route_id, 
                shuttle_id, 
                driver_id, 
                shift_date: schedule_date, 
                start_time: departure_time 
            })
        });
        const result = await response.json();

        if (result.success) {
            Swal.fire('Success', 'New schedule created successfully!', 'success');
            form.reset();
            loadSchedules(); // Refresh list
        } else {
            Swal.fire('Error', result.message, 'error');
        }
    } catch (error) {
        Swal.fire('Error', 'Network error. Could not create schedule.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-save" style="margin-right: 8px;"></i> Save Schedule';
    }
}


async function loadCancellationRequests() {
    const listContainer = document.getElementById('cancellation-requests-list');
    if (!listContainer) return;

    listContainer.innerHTML = '<li class="loading-state">Loading pending requests...</li>';

    try {
        const response = await fetch('api/admin/get_cancellation_requests.php');
        const result = await response.json();

        if (result.success && result.requests.length > 0) {
            listContainer.innerHTML = '';
            
            result.requests.forEach(request => {
                const requestDate = new Date(request.request_date).toLocaleString();
                const shiftTime = `${request.shift_date} at ${formatTime(request.start_time)}`;
                
                const requestHtml = `
                    <div class="request-card" data-request-id="${request.request_id}">
                        <div class="request-header">
                            <h4>Cancellation Request #${request.request_id}</h4>
                            <span class="badge pending">PENDING</span>
                        </div>
                        <p><strong>Driver:</strong> ${request.driver_name} (${request.driver_email})</p>
                        <p><strong>Trip:</strong> ${request.plate_number} | Route: ${shiftTime}</p>
                        <p class="request-reason">
                            <strong>Reason:</strong> ${request.reason}
                        </p>
                        <div class="request-actions">
                            <button class="btn-action success small" onclick="handleCancellationAction(${request.request_id}, 'approve')">Approve</button>
                            <button class="btn-action danger small" onclick="handleCancellationAction(${request.request_id}, 'reject')">Reject</button>
                        </div>
                    </div>
                `;
                listContainer.innerHTML += requestHtml;
            });

        } else {
            listContainer.innerHTML = '<p class="no-data">No pending cancellation requests.</p>';
        }
    } catch (error) {
        console.error("Error loading cancellation requests:", error);
        listContainer.innerHTML = '<p class="error-data">Failed to load requests from server.</p>';
    }
}

/**
 * Prompts admin for confirmation and notes, then submits the action (approve/reject) to the API.
 * @param {number} requestId - The ID of the cancellation request.
 * @param {string} action - 'approve' or 'reject'.
 */
async function handleCancellationAction(requestId, action) {
    const confirmationText = action === 'approve' 
        ? 'Approving this will CANCEL the scheduled trip. Are you sure?' 
        : 'Rejecting this keeps the trip scheduled. Are you sure?';

    Swal.fire({
        title: action.charAt(0).toUpperCase() + action.slice(1) + ' Request?',
        text: confirmationText,
        icon: 'warning',
        input: 'textarea',
        inputLabel: 'Admin Notes (Required)',
        inputPlaceholder: 'Reason for action...',
        showCancelButton: true,
        confirmButtonText: action === 'approve' ? 'Yes, Approve' : 'Yes, Reject',
        confirmButtonColor: action === 'approve' ? '#28a745' : '#dc3545',
        inputValidator: (value) => {
            if (!value) {
                return 'Admin notes are required for this action!';
            }
        }
    }).then(async (result) => {
        if (result.isConfirmed) {
            const adminNotes = result.value;
            try {
                const response = await fetch('api/admin/handle_cancellation_requests.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        request_id: requestId, 
                        action: action,
                        admin_notes: adminNotes
                    })
                });
                const apiResult = await response.json();

                if (apiResult.success) {
                    Swal.fire('Success!', apiResult.message, 'success');
                    loadCancellationRequests(); // Refresh the list
                } else {
                    Swal.fire('Error', apiResult.message || 'Failed to process request.', 'error');
                }
            } catch (e) {
                Swal.fire('Network Error', 'Could not connect to the API server.', 'error');
            }
        }
    });
}

// NOTE: Ensure your formatTime helper function is defined in admin.js

async function loadSchedules() {
    const list = document.getElementById('schedules-list');
    if (!list) {
        console.error("FATAL ERROR: Schedule list container (id='schedules-list') not found.");
        return;
    }

    list.innerHTML = '<p style="text-align:center; color:#999;"><i class="fas fa-spinner fa-spin"></i> Loading schedules...</p>';

    try {
        const response = await fetch('api/admin/get_schedules.php'); 
        const json = await response.json();

        list.innerHTML = ''; 

        if (json.success && json.data.length > 0) {
            json.data.forEach(schedule => {
                const item = document.createElement('div');
                item.className = 'history-item'; 
                item.id = `schedule-card-${schedule.id}`; 
                
            
                let badgeClass = 'badge-scheduled';
                if (schedule.status === 'in_progress') badgeClass = 'badge-inprogress';
                if (schedule.status === 'completed') badgeClass = 'badge-completed';
                if (schedule.status === 'cancelled') badgeClass = 'badge-cancelled';

                const formattedTime = formatTime12Hour(schedule.departure_time);
                const formattedDate = formatDate(schedule.schedule_date);
                
                const driverName = String(schedule.driver_name || 'Unassigned Driver');


                item.innerHTML = `
                    <div style="display:flex; align-items:flex-start; gap: 15px; flex-grow: 1;">
                        <i class="far fa-calendar-alt" style="color:#E02B2B; font-size:24px; margin-top: 5px;"></i>
                        <div>
                            <h4 style="margin:0;">Route: ${schedule.route_name || 'N/A Route'}</h4>
                            <p style="font-size:12px; color:#666; margin:0;">
                                <i class="fas fa-bus"></i> ${schedule.shuttle_plate || 'Unassigned Shuttle'} (Capacity: ${schedule.capacity || 'N/A'})
                            </p>
                            <p style="font-size:12px; color:#666; margin:2px 0;">
                                <i class="fas fa-user-circle"></i> Driver: ${driverName}
                            </p>
                            <p style="font-size:14px; font-weight: 600; margin: 4px 0 0 0; color: #333;">
                                ${formattedDate} at ${formattedTime}
                            </p>
                        </div>
                    </div>
                    
                    <div style="text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 8px;">
                        <span class="status-badge ${badgeClass}">${schedule.status.toUpperCase()}</span>
                        <button onclick="deleteSchedule(${schedule.id})" 
                                style="background:none; border:none; cursor:pointer; padding: 0;">
                            <i class="fas fa-trash-alt" style="color:#888; transition:color 0.2s;" 
                               onmouseover="this.style.color='#E02B2B'" onmouseout="this.style.color='#888'"></i>
                        </button>
                    </div>
                `;
                list.appendChild(item);
            });
        } else {
            list.innerHTML = '<p style="text-align:center; color:#999;">No schedules found.</p>';
        }
    } catch (error) {
        console.error('FATAL ERROR loading schedules:', error);
        list.innerHTML = '<p style="text-align:center; color:red;">Fatal Error loading schedules. Check browser console for details.</p>';
    }
}
async function deleteSchedule(id) {
    if(!confirm("Are you sure you want to delete this schedule?")) return;

    try {
        const response = await fetch('api/admin/delete_schedule.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id })
        });
        const result = await response.json();

        if (result.success) {
            Swal.fire('Deleted!', 'The schedule has been deleted.', 'success');
            const el = document.getElementById(`schedule-card-${id}`);
            if(el) el.remove();
            loadSchedules(); 
        } else {
            Swal.fire('Failed', "Failed to delete: " + result.message, 'error');
        }
    } catch (error) {
        console.error('Error deleting:', error);
        Swal.fire('Error', 'Network error. Could not delete schedule.', 'error');
    }
}