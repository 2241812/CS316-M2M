// assets/js/admin_cancellation.js

// --- UTILITY FUNCTION (Helper to format the time for display) ---
function formatTime(timeString) {
    // Converts 24-hour time string (e.g., "14:30:00") to 12-hour format (e.g., "2:30 PM")
    const [hours, minutes] = timeString.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${minutes} ${ampm}`;
}

// --- CORE FUNCTIONS ---

/**
 * Fetches all pending cancellation requests and renders them into the list container.
 */
async function loadCancellationRequests() {
    const listContainer = document.getElementById('cancellation-requests-list');
    if (!listContainer) return;

    // Show loading state
    listContainer.innerHTML = '<p style="text-align:center; color:#999;">Loading pending requests...</p>';

    try {
        const response = await fetch('api/admin/get_cancellation_requests.php');
        const result = await response.json();

        if (result.success && result.requests.length > 0) {
            listContainer.innerHTML = ''; // Clear loading text
            
            // Generate HTML for each pending request
            result.requests.forEach(request => {
                const shiftTime = `${request.shift_date} at ${formatTime(request.start_time)}`;
                
                const requestHtml = `
                    <div class="request-card" data-request-id="${request.request_id}">
                        <div class="request-header">
                            <h4>Cancellation Request for Trip #${request.schedule_id}</h4>
                            <span class="badge pending">PENDING</span>
                        </div>
                        <p><strong>Driver:</strong> ${request.driver_name} (${request.driver_email})</p>
                        <p><strong>Trip Time:</strong> ${shiftTime} (Bus: ${request.plate_number})</p>
                        <div class="request-reason">
                            <strong>Driver's Reason:</strong> ${request.reason}
                        </div>
                        <div class="request-actions" style="text-align: right;">
                            <button class="btn-action success" onclick="handleCancellationAction(${request.request_id}, 'approve')">
                                <i class="fas fa-check"></i> Approve
                            </button>
                            <button class="btn-action danger" onclick="handleCancellationAction(${request.request_id}, 'reject')">
                                <i class="fas fa-times"></i> Reject
                            </button>
                        </div>
                    </div>
                `;
                listContainer.innerHTML += requestHtml;
            });

        } else {
            // No pending requests found
            listContainer.innerHTML = '<p class="no-data" style="text-align:center; padding: 10px 0; color:#999;">No pending cancellation requests.</p>';
        }
        
        // Always refresh the sidebar badge count after loading the list
        loadPendingRequestCount(); 

    } catch (error) {
        console.error("Error loading cancellation requests:", error);
        listContainer.innerHTML = '<p class="error-data" style="text-align:center; color:red;">Failed to load requests from server.</p>';
    }
}

/**
 * Prompts admin for confirmation and notes, then submits the action (approve/reject) to the API.
 * @param {number} requestId - The ID of the cancellation request.
 * @param {string} action - 'approve' or 'reject'.
 */
async function handleCancellationAction(requestId, action) {
    const confirmationText = action === 'approve' 
        ? 'Approving this will permanently **CANCEL** the scheduled trip. Are you sure?' 
        : 'Rejecting this means the trip remains **SCHEDULED**. Are you sure?';

    Swal.fire({
        title: action.charAt(0).toUpperCase() + action.slice(1) + ' Request?',
        html: `<p>${confirmationText}</p>`,
        icon: 'warning',
        input: 'textarea',
        inputLabel: 'Admin Notes (Required)',
        inputPlaceholder: 'Reason for action...',
        showCancelButton: true,
        confirmButtonText: action === 'approve' ? 'Yes, Approve It' : 'Yes, Reject It',
        confirmButtonColor: action === 'approve' ? '#28a745' : '#dc3545',
        inputValidator: (value) => {
            if (!value || value.trim() === '') {
                return 'Admin notes are required for this action!';
            }
        }
    }).then(async (result) => {
        if (result.isConfirmed) {
            const adminNotes = result.value;
            try {
                // API call to handle the action
                const response = await fetch('api/admin/handle_cancellation_request.php', {
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
                    loadCancellationRequests(); // Refresh the requests list
                } else {
                    Swal.fire('Error', apiResult.message || 'Failed to process request.', 'error');
                }
            } catch (e) {
                Swal.fire('Network Error', 'Could not connect to the API server.', 'error');
            }
        }
    });
}

/**
 * Fetches the count of pending requests for the sidebar badge using get_pending_count.php.
 */
async function loadPendingRequestCount() {
    const badgeElement = document.getElementById('cancellation-badge');
    
    if (!badgeElement) return;

    try {
        const response = await fetch('api/admin/get_pending_count.php');
        const result = await response.json();

        if (result.success) {
            const count = result.pending_count;
            
            if (count > 0) {
                badgeElement.textContent = count;
                badgeElement.style.display = 'inline'; // Show the badge
            } else {
                badgeElement.style.display = 'none'; // Hide if count is zero
            }
        } 
    } catch (error) {
        // Silent error handling for background count refresh
    }
}


// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    // Load the list of requests immediately
    loadCancellationRequests(); 
    
    // Load the count for the sidebar badge
    loadPendingRequestCount(); 
    
    // Set intervals for automatic refresh
    setInterval(loadCancellationRequests, 60000); // Refresh list every 1 minute
    setInterval(loadPendingRequestCount, 30000); // Refresh badge count every 30 seconds
});