// Global variables
let currentScheduleId = null;
let passengerRefreshInterval = null; 
let currentUser = JSON.parse(localStorage.getItem('m2m_user'));

// --- MERGED DOM Content Loaded Event Listener ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. User/Role Check
    if(!currentUser || currentUser.role !== 'driver') {
        window.location.href = 'index.html';
        return;
    }

    setupSidebar();
    loadDriverSchedule();
    loadNotifications();

    // 1. REAL-TIME UPDATE: Refresh Dashboard every 5 seconds
    setInterval(loadDriverSchedule, 5000); 
    setInterval(loadNotifications, 30000);
});

// ... (setupSidebar function remains the same, keep it here) ...
function setupSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const openBtn = document.getElementById('open-sidebar');
    const closeBtn = document.getElementById('close-sidebar');
    const logoutBtn = document.getElementById('btn-logout');

    if (openBtn) openBtn.addEventListener('click', () => { sidebar.classList.add('active'); overlay.classList.add('active'); });
    
    function closeSidebarMenu() { sidebar.classList.remove('active'); overlay.classList.remove('active'); }

    if (closeBtn) closeBtn.addEventListener('click', closeSidebarMenu);
    if (overlay) overlay.addEventListener('click', closeSidebarMenu);

    if (logoutBtn) logoutBtn.addEventListener('click', () => {
        Swal.fire({
            title: 'Logout?', text: "End shift?", icon: 'warning', showCancelButton: true, confirmButtonColor: '#E02B2B', confirmButtonText: 'Yes'
        }).then((result) => {
            if (result.isConfirmed) { localStorage.removeItem('m2m_user'); window.location.href = 'index.html'; }
        });
    });
}


// Global variables and DOMContentLoaded setup are assumed to be correct
// ... (Your setupSidebar function)
// ... (Your formatTime function at the end)

async function loadDriverSchedule() {
    try {
        const response = await fetch(`api/driver/get_schedule.php?driver_id=${currentUser.id}`);
        const result = await response.json();

        if (result.success && result.data) {
            renderCurrentTrip(result.data.current_trip);
            renderUpcomingTrips(result.data.upcoming_trips);
        } else {
             // Handle case where API call succeeded but returned false or no data
             renderCurrentTrip(null);
             renderUpcomingTrips([]);
             console.error('API reported failure:', result.message);
        }
    } catch (error) {
        console.error('Error loading schedule:', error);
        // Display generic error in both containers if load fails entirely
        document.getElementById('current-trip-container').innerHTML = `<div class="trip-card gray-card"><p class="sub-text error-data">Failed to connect to schedule server.</p></div>`;
        document.getElementById('upcoming-trips-list').innerHTML = `<p class="sub-text error-data" style="text-align:center;">Failed to load upcoming trips.</p>`;
    }
}

function renderCurrentTrip(trip) {
    const container = document.getElementById('current-trip-container');
    
    if (!trip) {
        // If no active trip, reset global ID and display message
        currentScheduleId = null;
        container.innerHTML = `<div class="trip-card gray-card"><h3 class="card-title">No Active Trips</h3><p class="sub-text">Next trip will appear 15 minutes before departure.</p></div>`;
        return;
    }

    currentScheduleId = trip.id;
    const capacityPercentage = Math.min(100, (trip.passenger_count / trip.capacity) * 100);

    let statusHtml;
    let btnText;
    let btnColor;
    let btnAction;
    let boardingLabel = '';

    const isStarted = trip.status === 'in_progress' || trip.status === 'delayed';

    if (trip.status === 'in_progress') {
        statusHtml = '<span class="live-badge">LIVE</span>';
        btnText = "End Trip";
        btnAction = "complete";
        btnColor = "#444";
    } else if (trip.status === 'delayed') {
        statusHtml = '<span class="live-badge" style="background:orange;">DELAYED</span>';
        btnText = "End Trip";
        btnAction = "complete";
        btnColor = "#444";
    } else if (trip.is_boarding) {
        // This comes from your PHP logic: status='scheduled' and within 15 mins of start
        statusHtml = '<span class="live-badge" style="background:#007bff;">BOARDING</span>';
        btnText = "Start Trip";
        btnAction = "start";
        btnColor = "#E02B2B"; // Red
        boardingLabel = `<span style="font-size:12px; color:#007bff; font-weight:600;">Trip is boarding now.</span>`;
    } else {
        // Should not happen often if PHP logic is working, but serves as fallback for 'scheduled'
        statusHtml = '<span class="live-badge" style="background:gray;">UPCOMING</span>';
        btnText = "Start Trip";
        btnAction = "start";
        btnColor = "#E02B2B"; // Red
    }

    container.innerHTML = `
        <div class="trip-card gray-card">
            <div class="card-header-row">
                <h3 class="card-title">Current Trip</h3>
                ${statusHtml}
            </div>
            
            <p class="sub-text" style="font-size:14px; margin-bottom:5px;"><strong>Bus:</strong> ${trip.plate_number}</p>
            <p class="sub-text" style="font-size:14px;"><strong>Route:</strong> ${trip.route_name || 'Route Not Assigned'}</p>
            ${boardingLabel}

            <div class="booking-status" style="margin: 15px 0;">
                <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                     <span class="label">Passenger Count</span>
                     <span class="count" style="font-size:16px; font-weight:bold; color:#E02B2B;">${trip.passenger_count} / ${trip.capacity}</span>
                </div>
                <div class="progress-bar"><div class="progress-fill" style="width: ${capacityPercentage}%;"></div></div>
            </div>

            <div class="time-info">
                <div class="time-box"><span>Departure</span><strong>${formatTime(trip.start_time)}</strong></div>
                <div class="time-divider"></div>
                <div class="time-box"><span>End Time</span><strong>${formatTime(trip.end_time)}</strong></div>
            </div>

            <button class="btn-action" style="background-color: #444; margin-bottom: 10px;" onclick="openPassengerModal()">
                <i class="fas fa-users"></i> View Passengers
            </button>

            <div class="action-buttons">
                <button class="btn-action red" style="background-color: ${btnColor}" onclick="updateTripStatus('${btnAction}')">${btnText}</button>
                <button class="btn-action red" onclick="reportDelay()">Report Delay</button>
            </div>
        </div>
    `;
}

function renderUpcomingTrips(trips) {
    const container = document.getElementById('upcoming-trips-list');
    

    container.innerHTML = ''; 

    if (!container) return;

    if (trips.length === 0) {
        container.innerHTML = `<p class="sub-text" style="text-align:center; padding: 15px 0; color:#666;">No further upcoming trips scheduled.</p>`;
        return;
    }

    const htmlContent = trips.map(trip => {
        const statusClass = 'status-scheduled-upcoming'; 
        const statusText = 'Scheduled';
        const capacityPercentage = Math.min(100, (trip.passenger_count / trip.capacity) * 100);

        return `
            <div class="schedule-item upcoming-trip-item" data-schedule-id="${trip.id}" style="border: 1px solid #ddd; padding: 15px; border-radius: 8px; margin-bottom: 10px;">
                <div class="schedule-header" style="display:flex; justify-content:space-between; align-items:center;">
                    <span class="route-name" style="font-weight:600; font-size:16px; color:#333;">${trip.route_name || 'Unassigned Route'}</span>
                    <span class="status-badge ${statusClass}" style="background:#f0f0f0; color:#444; padding: 4px 8px; border-radius: 4px; font-size: 11px;">${statusText}</span>
                </div>
                <p class="route-details" style="margin: 8px 0;">
                    <i class="fas fa-calendar-alt" style="color:#E02B2B;"></i> <strong>${trip.shift_date}</strong> 
                    <i class="fas fa-clock" style="color:#E02B2B; margin-left: 10px;"></i> ${formatTime(trip.start_time)}
                </p>
                <p class="sub-text" style="font-size:13px; margin-bottom:10px;"><strong>Bus:</strong> ${trip.plate_number}</p>

                <div class="booking-status" style="margin: 10px 0;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:3px;">
                         <span class="label" style="font-size:13px; color:#666;">Bookings</span>
                         <span class="count" style="font-size:15px; font-weight:bold; color:#E02B2B;">${trip.passenger_count} / ${trip.capacity}</span>
                    </div>
                    <div class="progress-bar small-bar" style="background:#eee; height: 5px; border-radius: 5px; overflow: hidden;">
                        <div class="progress-fill" style="width: ${capacityPercentage}%; background:#E02B2B; height: 100%;"></div>
                    </div>
                </div>

            
            </div>
        `;
    }).join('');

    container.innerHTML = htmlContent;
}


function viewPassengers(scheduleId) {
    currentScheduleId = scheduleId; 
    openPassengerModal();
}



// Add this function to your driver.js
function openPassengerModal() {
    if (!currentScheduleId) {
        Swal.fire('Error', 'Please select an active or upcoming trip first.', 'warning');
        return;
    }
    
    // Clear previous data
    document.getElementById('passenger-list').innerHTML = '<div class="loading-state">Loading passenger manifest...</div>';
    
    // Open the modal
    openModal('passenger-modal');
    
    // Load the manifest data
    loadPassengers(currentScheduleId);
    
    // Start interval to refresh manifest every 10 seconds
    if (passengerRefreshInterval) {
        clearInterval(passengerRefreshInterval);
    }
    passengerRefreshInterval = setInterval(() => loadPassengers(currentScheduleId), 10000);
}

// Add this function to your driver.js
function closePassengerModal() {
    closeModal('passenger-modal');
    // Stop refreshing when closed to save resources
    if(passengerRefreshInterval) clearInterval(passengerRefreshInterval);
}

async function loadPassengers() {
    const container = document.getElementById('passenger-list');
    if(!container) return;

    try {
        const response = await fetch(`api/driver/get_trip_passengers.php?schedule_id=${scheduleId}`);
        const result = await response.json();

        if (result.success && result.passengers) {
            if (result.passengers.length === 0) {
                passengerListElement.innerHTML = '<p class="no-data" style="text-align: center;">No passengers booked for this trip yet.</p>';
                return;
            }

            passengerListElement.innerHTML = result.passengers.map(passenger => {
                const statusClass = passenger.booking_status === 'Confirmed' ? 'status-confirmed' : 'status-pending';
                const statusText = passenger.booking_status;
                
                return `
                    <div class="passenger-item">
                        <div class="passenger-info">
                            <h4>${passenger.user_name}</h4>
                            <p>${passenger.user_email}</p>
                        </div>
                        <span class="status-badge-small ${statusClass}">${statusText}</span>
                    </div>
                `;
            }).join('');
        }
    } catch (e) {
        console.error(e);
    }
}

async function verifyPassenger(bookingId) {
    if(passengerRefreshInterval) clearInterval(passengerRefreshInterval);

    if(!confirm("Confirm that you received cash payment?")) {
        passengerRefreshInterval = setInterval(loadPassengers, 3000);
        return;
    }

    try {
        const response = await fetch('api/driver/verify_payment.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ booking_id: bookingId })
        });
        const result = await response.json();

        if(result.success) {
            Swal.fire({ icon: 'success', title: 'Payment Verified', timer: 1500, showConfirmButton: false });
            loadPassengers(); 
            loadDriverSchedule(); 
        } else {
            Swal.fire('Error', result.message, 'error');
        }
    } catch (e) {
        console.error(e);
    } finally {
        passengerRefreshInterval = setInterval(loadPassengers, 3000);
    }
}

// ... (Rest of your functions: updateTripStatus, reportDelay, notifications, formatTime) ...
// Make sure to add the rest of the existing functions here
async function updateTripStatus(action, extraData = {}) {
    if(!currentScheduleId) return;

    const payload = {
        schedule_id: currentScheduleId,
        action: action,
        driver_name: currentUser.name,
        ...extraData
    };

    try {
        const res = await fetch('api/driver/update_trip.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        
        if(data.success) {
            Swal.fire('Success', action === 'start' ? "Trip Started!" : "Status Updated", 'success');
            loadDriverSchedule(); 
        } else {
            Swal.fire('Error', data.message, 'error');
        }
    } catch (e) {
        console.error(e);
    }
}

function reportDelay() {
    const minutes = prompt("How many minutes is the delay?");
    if (minutes && !isNaN(minutes)) {
        updateTripStatus('delay', { minutes: minutes });
    }
}

// ... loadNotifications function (Unchanged) ...
async function loadNotifications() {
    const list = document.getElementById('notification-list');
    if (!list) return;

    try {
        const response = await fetch('api/driver/get_notifications.php');
        const json = await response.json();

        if (json.success) {
            const notifs = json.data;
            let unreadCount = 0; 

            if (notifs.length === 0) {
                list.innerHTML = '<li class="feed-item"><p>No new notifications.</p></li>';
                return;
            }

            list.innerHTML = notifs.map(item => {
                const isUnread = item.is_read === 0;
                if (isUnread) unreadCount++; 

                const unreadClass = isUnread ? 'unread' : '';
                
                let iconClass = 'fas fa-bullhorn'; 
                let iconColor = '#E02B2B';        
                let backgroundColor = '#eef2ff';

                if (item.type === 'announcement') {
                    iconClass = 'fas fa-megophone'; 
                    iconColor = '#007bff'; 
                    backgroundColor = '#e6f3ff';
                }

                return `
                    <li class="feed-item ${unreadClass}">
                        <div class="feed-icon" style="background:${backgroundColor}; color:${iconColor};">
                            <i class="${iconClass}"></i>
                        </div>
                        <div class="feed-content">
                            <p><strong>[Announcement]</strong> ${item.message}</p>
                            <span>${item.created_at}</span>
                        </div>
                    </li>
                `;
            }).join('');
            
            const dot = document.querySelector('.notification-icon .dot');
            if (dot) {
                dot.style.display = unreadCount > 0 ? 'block' : 'none';
            }
        }
    } catch (error) {
        console.error("Error loading notifications", error);
    }
}


async function requestCancellation() {

    const { value: reason } = await Swal.fire({
        title: 'Request Trip Cancellation',
        input: 'textarea',
        inputLabel: 'Reason for Cancellation',
        inputPlaceholder: 'Enter a detailed reason for the cancellation request...',
        showCancelButton: true,
        confirmButtonText: 'Submit Request',
        cancelButtonText: 'Nevermind',
        inputValidator: (value) => {
            if (!value) {
                return 'You need to write a reason to submit a request!';
            }
        }
    });

    if (reason) {
        const upcomingContainer = document.getElementById('upcoming-trips-list');
        const nextTripElement = upcomingContainer.querySelector('.upcoming-trip-item');

        if (!nextTripElement) {
            Swal.fire('No Upcoming Trips', 'There are no upcoming trips currently scheduled to request a cancellation for.', 'warning');
            return;
        }

        
        try {
            const response = await fetch('api/driver/request_cancellation.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    driver_id: currentUser.id, 
                    reason: reason 
                })
            });
            const result = await response.json();

            if (result.success) {
                Swal.fire('Request Sent', 'Your cancellation request has been submitted for review by the administrator.', 'success');
            } else {
                Swal.fire('Error', result.message || 'Failed to submit cancellation request.', 'error');
            }
        } catch (e) {
            console.error('Cancellation request error:', e);
            Swal.fire('Network Error', 'Could not connect to the server.', 'error');
        }
    }
}




function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if(modal) modal.style.display = 'flex';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if(modal) modal.style.display = 'none';
}

window.onclick = function(event) {
    if (event.target.classList.contains('custom-modal')) {
        closePassengerModal(); 
        event.target.style.display = 'none';
    }
}

function formatTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
}