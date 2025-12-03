// assets/js/history.js

document.addEventListener('DOMContentLoaded', () => {
    loadHistory();
});

async function loadHistory() {
    // 1. Check Login
    const user = JSON.parse(localStorage.getItem('m2m_user'));
    if (!user) {
        window.location.href = 'index.html'; 
        return;
    }

    try {
        // 2. Fetch Data
        const response = await fetch(`api/user/get_history.php?user_id=${user.id}`);
        const data = await response.json();

        if (data.success) {
            renderUpcoming(data.upcoming);
            renderPast(data.past);
        }
    } catch (error) {
        console.error('Error loading history:', error);
    }
}

function renderUpcoming(bookings) {
    const container = document.getElementById('upcoming-container');
    container.innerHTML = ''; 

    if (bookings.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#888; padding:20px;">No upcoming trips.</p>';
        return;
    }

    bookings.forEach(booking => {
        // Create the card
        const div = document.createElement('div');
        div.className = 'booking-card history-card';
        div.innerHTML = `
            <div class="trip-info">
                <h4>${booking.pickup_location} <i class="fas fa-arrow-right"></i> ${booking.dropoff_location}</h4>
                
                <p class="trip-date">
                    <i class="far fa-calendar"></i> ${booking.formatted_date} &nbsp; 
                    <i class="far fa-clock"></i> ${booking.formatted_time}
                </p>
                
                <p class="trip-date">Status: <span style="color:#E02B2B; font-weight:600;">${booking.status.toUpperCase()}</span></p>
                <div class="divider"></div>
                <button class="btn-cancel" onclick="cancelBooking(${booking.id})">Cancel Booking</button>
            </div>
        `;
        container.appendChild(div);
    });
}

function renderPast(bookings) {
    const container = document.getElementById('past-container');
    container.innerHTML = '';

    bookings.forEach(booking => {
        const statusClass = booking.status === 'cancelled' ? 'cancelled' : 'completed';
        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `
            <h4>${booking.pickup_location} <i class="fas fa-arrow-right"></i> ${booking.dropoff_location}</h4>
            <p class="trip-date">${booking.formatted_date} - ${booking.formatted_time}</p>
            <span class="status-badge ${statusClass}">${booking.status}</span>
        `;
        container.appendChild(div);
    });
}

// 3. Handle Cancellation
async function cancelBooking(bookingId) {
    if(!confirm("Are you sure you want to cancel this booking?")) return;

    try {
        const response = await fetch('api/routes/cancel_booking.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ booking_id: bookingId })
        });
        const result = await response.json();

        if (result.success) {
            alert("Booking Cancelled.");
            loadHistory(); // Reload lists
        } else {
            alert("Failed: " + result.message);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}