document.addEventListener('DOMContentLoaded', () => {

    // 1. CHECK IF MAP EXISTS
    // We only run this code if we are on the map page
    const mapElement = document.getElementById('map');
    if (!mapElement) return;

    // 2. INITIALIZE MAP
    // Default view centered on Baguio City
    const map = L.map('map').setView([16.4023, 120.5960], 13);

    // Add OpenStreetMap Tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // 3. LOAD ROUTE DATA
    fetchRouteData(map);

    // 4. SETUP UI INTERACTIONS
    setupPassengerCounter();
    setupBookingButton();
});

/* =========================================
   FUNCTION: FETCH & DRAW ROUTE
   ========================================= */
async function fetchRouteData(map) {
    try {
        const response = await fetch('api/routes/get_routes.php');
        const json = await response.json();

        if (json.success && json.data) {
            const route = json.data;

            // Update the UI Text (Start/End Locations)
            document.getElementById('route-start').innerText = route.start_location;
            document.getElementById('route-end').innerText = route.end_location;

            // Draw the line using Leaflet Routing Machine
            L.Routing.control({
                waypoints: [
                    L.latLng(route.start_lat, route.start_lng), // From Database
                    L.latLng(route.end_lat, route.end_lng)      // From Database
                ],
                lineOptions: {
                    styles: [{ color: '#E02B2B', opacity: 0.8, weight: 5 }] // Red Line
                },
                createMarker: function() { return null; }, // Hide default markers (optional)
                addWaypoints: false,       // User cannot add stops
                draggableWaypoints: false, // User cannot drag points
                fitSelectedRoutes: true,   // Zoom map to fit the route
                show: false                // Hide the text instructions box
            }).addTo(map);

        } else {
            console.error("No route data found:", json.message);
        }
    } catch (error) {
        console.error("Error fetching routes:", error);
    }
}

/* =========================================
   FUNCTION: PASSENGER COUNTER (+/-)
   ========================================= */
function setupPassengerCounter() {
    const display = document.getElementById('passenger-count');
    const btnInc = document.getElementById('btn-increase');
    const btnDec = document.getElementById('btn-decrease');
    let count = 1;

    if (btnInc && btnDec && display) {
        btnInc.addEventListener('click', () => {
            if (count < 10) { // Max 10 passengers
                count++;
                display.innerText = count;
            }
        });

        btnDec.addEventListener('click', () => {
            if (count > 1) { // Min 1 passenger
                count--;
                display.innerText = count;
            }
        });
    }
}

/* =========================================
   FUNCTION: HANDLE BOOKING (Confirm Button)
   ========================================= */
function setupBookingButton() {
    const confirmBtn = document.getElementById('btn-confirm');

    if (confirmBtn) {
        confirmBtn.addEventListener('click', async () => {
            
            // A. Get User ID from LocalStorage (Saved during login)
            const user = JSON.parse(localStorage.getItem('m2m_user'));
            
            if (!user || !user.id) {
                alert("You must be logged in to book a ride.");
                window.location.href = 'index.html';
                return;
            }

            // B. Prepare Data to Send
            const bookingData = {
                user_id: user.id,
                route_start: document.getElementById('route-start').innerText,
                route_end: document.getElementById('route-end').innerText,
                passengers: document.getElementById('passenger-count').innerText
            };

            // UI Feedback
            const originalText = confirmBtn.innerText;
            confirmBtn.innerText = "Processing...";
            confirmBtn.disabled = true;

            // C. Send to PHP Backend
            try {
                const response = await fetch('api/routes/book_ride.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(bookingData)
                });

                const result = await response.json();

                if (result.success) {
                    alert("Booking Confirmed! Reference ID: " + result.booking_id);
                    window.location.href = 'history.html'; // Redirect to history
                } else {
                    alert("Booking Failed: " + result.message);
                    resetButton(confirmBtn, originalText);
                }

            } catch (error) {
                console.error('Booking Error:', error);
                alert("An error occurred. Please try again.");
                resetButton(confirmBtn, originalText);
            }
        });
    }
}

// Helper to reset button state on error
function resetButton(btn, text) {
    btn.innerText = text;
    btn.disabled = false;
}