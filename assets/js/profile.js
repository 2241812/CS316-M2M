// assets/js/profile.js

// Global variables
let currentUser = JSON.parse(localStorage.getItem('m2m_user'));

// --- MODAL & LOGOUT HELPERS ---

// Helper function to open a modal
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if(modal) modal.style.display = 'flex';
}

// Helper function to close a modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if(modal) modal.style.display = 'none';
}

// Universal logout function
function logout() {
    localStorage.removeItem('m2m_user');
    // Assuming the login page is index.html
    window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', () => {
    // 1. User/Role Check
    if (!currentUser || !currentUser.role) {
        logout(); // Redirect to login if not logged in
        return;
    }


    loadProfileData();

    document.getElementById('btn-edit-profile').addEventListener('click', () => {
        // Pre-fill fields before opening
        document.getElementById('edit-name').value = currentUser.name || '';
        document.getElementById('edit-email').value = currentUser.email || '';
        openModal('edit-profile-modal');
    });
    document.getElementById('btn-change-password').addEventListener('click', () => openModal('password-modal'));
    
    // Check if the driver-specific button exists (it must be added to profile.html)
    const btnVehicleInfo = document.getElementById('btn-view-vehicle-info');
    if (btnVehicleInfo) {
        // 3. Role-specific element visibility
        if (currentUser.role === 'driver') {
            btnVehicleInfo.style.display = 'flex'; // Show for drivers
            btnVehicleInfo.addEventListener('click', () => openModal('vehicle-modal'));
        } else {
            btnVehicleInfo.style.display = 'none'; // Hide for users and admins
        }
    }


    // 4. Setup Modal Close Buttons
    document.getElementById('close-edit-profile').addEventListener('click', () => closeModal('edit-profile-modal'));
    document.getElementById('close-password').addEventListener('click', () => closeModal('password-modal'));
    
    // NOTE: You must add a close button for the vehicle modal in profile.html
    const closeVehicleModal = document.getElementById('close-vehicle-modal');
    if(closeVehicleModal) closeVehicleModal.addEventListener('click', () => closeModal('vehicle-modal'));

    // Close modals when clicking outside
    window.onclick = function(event) {
        if (event.target.classList.contains('custom-modal')) {
            event.target.style.display = 'none';
        }
    };

    // 5. Setup Logout Buttons
    document.querySelectorAll('.btn-logout').forEach(btn => {
        btn.addEventListener('click', logout);
    });

    // 6. Setup Form Submissions
    document.getElementById('editProfileForm').addEventListener('submit', handleEditProfile);
    handlePasswordChange(); // Attach password change logic
});

// --- DATA LOADING LOGIC ---
async function loadProfileData() {
    // Display basic info from local storage
    document.getElementById('display-name').textContent = currentUser.name || 'N/A';
    document.getElementById('display-email').textContent = currentUser.email || 'N/A';
    
    // Only attempt to load driver-specific data if the role is 'driver'
    if (currentUser.role === 'driver' && currentUser.id) {
        try {
            // NOTE: You must create this API file (api/driver/get_profile.php)
            const response = await fetch(`api/driver/get_profile.php?id=${currentUser.id}`); 
            const result = await response.json();

            if (result.success) {
                const vehicle = result.vehicle_info;

                // Update Vehicle Info Modal
                const plate = vehicle.plate_number || 'N/A';
                const model = vehicle.model_type || 'N/A';
                const capacity = vehicle.capacity ? vehicle.capacity + ' Seats' : 'N/A';

                // NOTE: These IDs must be present in the vehicle-modal div in profile.html
                document.getElementById('modal-vehicle-plate').textContent = plate;
                document.getElementById('modal-vehicle-model').textContent = model;
                document.getElementById('modal-vehicle-capacity').textContent = capacity;

            } else {
                console.warn('Failed to load driver details:', result.message);
            }
        } catch (e) {
            console.error('Network or parsing error:', e);
        }
    }
}

// --- EDIT PROFILE LOGIC ---
async function handleEditProfile(e) {
    e.preventDefault();
    
    const newName = document.getElementById('edit-name').value;
    const newEmail = document.getElementById('edit-email').value;

    if (!currentUser.id) return;

    try {
        const response = await fetch('api/user/edit_profile.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: currentUser.id,
                name: newName,
                email: newEmail,
                role: currentUser.role 
            })
        });
        const result = await response.json();

        if (result.success) {
            // Update local storage and DOM
            currentUser.name = newName;
            currentUser.email = newEmail;
            localStorage.setItem('m2m_user', JSON.stringify(currentUser));
            
            document.getElementById('display-name').textContent = newName;
            document.getElementById('display-email').textContent = newEmail;

            closeModal('edit-profile-modal');
            Swal.fire('Success', 'Profile updated successfully!', 'success');
        } else {
            Swal.fire('Error', result.message || 'Failed to update profile.', 'error');
        }
    } catch (err) {
        console.error(err);
        Swal.fire('Error', 'Failed to connect to the server.', 'error');
    }
}


function handlePasswordChange() {
    document.getElementById('changePasswordForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const user = JSON.parse(localStorage.getItem('m2m_user'));
        const currentPass = document.getElementById('current-pass').value;
        const newPass = document.getElementById('new-pass').value;
        const confirmPass = document.getElementById('confirm-new-pass').value;

        if (newPass !== confirmPass) {
            Swal.fire('Warning', 'New passwords do not match', 'warning');
            return;
        }

        try {
            const response = await fetch('api/user/change_password.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: user.id,
                    current_password: currentPass,
                    new_password: newPass
                })
            });
            const result = await response.json();

            if (result.success) {
                closeModal('password-modal'); // Use helper function
                document.getElementById('changePasswordForm').reset();
                Swal.fire('Success', 'Password changed successfully', 'success');
            } else {
                Swal.fire('Error', result.message, 'error');
            }
        } catch (err) {
            console.error(err);
            Swal.fire('Error', 'Failed to change password', 'error');
        }
    });
}