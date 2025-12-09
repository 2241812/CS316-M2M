// assets/js/history.js

document.addEventListener('DOMContentLoaded', () => {
    loadHistory();

    // Attach event listener for closing the modal
    document.getElementById('close-history-payment').addEventListener('click', () => {
        document.getElementById('history-payment-modal').style.display = 'none';
    });

    // Attach event listener for the confirmation button
    document.getElementById('btn-confirm-history-payment').addEventListener('click', submitPaymentUpdate);
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
        const bookingStatusLower = booking.status ? booking.status.toLowerCase() : '';
        const paymentStatusLower = booking.payment_status ? booking.payment_status.toLowerCase() : '';

        const needsPayment = bookingStatusLower === 'pending' && paymentStatusLower !== 'paid';
        let actionButtonsHTML = '';
        
        const bookingStatusColor = bookingStatusLower === 'pending' ? '#E02B2B' : '#28a745';

        if (needsPayment) {
            actionButtonsHTML = `
                <button class="btn-pay" onclick="payBooking(${booking.id})" 
                        style="background-color: #007bff; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer; font-weight: 600;">
                    Pay Now
                </button>
                <button class="btn-cancel btn-secondary" onclick="cancelBooking(${booking.id})"
                        style="background-color: #ccc; color: #333; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer;">
                    Cancel Booking
                </button>
            `;
        } else {
            actionButtonsHTML = `
                <button class="btn-cancel" onclick="cancelBooking(${booking.id})"
                        style="background-color: #E02B2B; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer;">
                    Cancel Booking
                </button>
            `;
        }

        // Determine payment status color for display
        const paymentColor = needsPayment ? '#ffc107' : '#28a745'; // Yellow for Unpaid, Green for Paid

        const div = document.createElement('div');
        div.className = 'booking-card history-card';
        div.innerHTML = `
            <div class="trip-info">
                <h4>${booking.pickup_location} <i class="fas fa-arrow-right"></i> ${booking.dropoff_location}</h4>
                
                <p class="trip-date">
                    <i class="far fa-calendar"></i> ${booking.formatted_date} &nbsp; 
                    <i class="far fa-clock"></i> ${booking.formatted_time}
                </p>
                
                <p class="trip-date">Booking Status: <span style="color:${bookingStatusColor}; font-weight:600;">${booking.status.toUpperCase()}</span></p>
                <p class="trip-date">Payment Status: <span style="color:${paymentColor}; font-weight:600;">${booking.payment_status.toUpperCase()}</span></p>

                <div class="divider"></div>
                
                <div class="action-buttons-container" style="display:flex; gap: 10px; justify-content: flex-end; padding-top: 10px;">
                    ${actionButtonsHTML}
                </div>
            </div>
        `;
        container.appendChild(div);
    });
}

async function payBooking(bookingId) {
    const amountDue = 25.00; 

    document.getElementById('payment-booking-id').textContent = bookingId;
    document.getElementById('payment-amount-due').textContent = '₱' + amountDue.toFixed(2);
    document.getElementById('hidden-booking-id').value = bookingId;
    document.getElementById('history-payment-modal').style.display = 'flex';
    
    const method = 'online';
    document.getElementById('selected-history-payment-method').value = method;
    
    const btn = document.getElementById('btn-confirm-history-payment');
    btn.disabled = false;
    btn.innerText = 'Pay Online Now';

    // Highlight the payment option (assuming only one is present)
    document.querySelectorAll('.payment-option').forEach(el => el.classList.remove('selected'));
    const onlineOption = document.querySelector('.payment-option');
    if(onlineOption) {
        onlineOption.classList.add('selected');
    }
}

window.selectHistoryPayment = function(method, element) {
    document.querySelectorAll('.payment-option').forEach(el => el.classList.remove('selected'));
    element.classList.add('selected');
    document.getElementById('selected-history-payment-method').value = method;
    
    const btn = document.getElementById('btn-confirm-history-payment');
    btn.disabled = false;
    btn.innerText = 'Pay Online Now';
    
}

async function submitPaymentUpdate() {
    const bookingId = document.getElementById('hidden-booking-id').value;
    const method = document.getElementById('selected-history-payment-method').value || 'ONLINE'; 

    if(!bookingId) {
        Swal.fire('Error', 'Internal error: Missing booking ID.', 'error');
        return;
    }

    const btn = document.getElementById('btn-confirm-history-payment');
    const originalText = btn.innerText;
    
    // 1. Set UI to processing state
    btn.innerText = "Processing Payment...";
    btn.disabled = true;

    // 2. Add a short delay to simulate network latency
    await new Promise(resolve => setTimeout(resolve, 1000)); 

    try {
        // 3. ACTUAL API CALL TO UPDATE DATABASE
        const response = await fetch('api/user/update_payment.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                booking_id: bookingId,
                payment_method: method
            })
        });

        const result = await response.json();

        if(result.success) {
            document.getElementById('history-payment-modal').style.display = 'none';
            
            Swal.fire({
                title: 'Payment Successful! 💸',
                text: result.message,
                icon: 'success',
                confirmButtonText: 'Done'
            }).then(() => {
                // The key line: This runs after the user dismisses the success dialog
                window.location.reload(); 
            });

        } else {
            Swal.fire('Error', 'Payment Failed: ' + result.message, 'error');
            btn.innerText = originalText;
            btn.disabled = false;
        }

    } catch (e) {
        Swal.fire('Error', 'Network error. Could not connect to the server.', 'error');
        btn.innerText = originalText;
        btn.disabled = false;
    }
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

// 3. Handle Cancellation (Unchanged)
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