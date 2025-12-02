// assets/js/auth.js

document.addEventListener('DOMContentLoaded', () => {
    
    // --- LOGIN LOGIC ---
    const loginBtn = document.getElementById('btn-login');
    
    if (loginBtn) {
        loginBtn.addEventListener('click', async (e) => {
            e.preventDefault(); // Stop default button behavior

            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();
            const btnOriginalText = loginBtn.innerText;

            if (!email || !password) {
                alert("Please enter both email and password.");
                return;
            }

            // UI Feedback (Loading)
            loginBtn.innerText = "Logging in...";
            loginBtn.style.opacity = "0.7";

            try {
                const response = await fetch('api/auth/login.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (data.success) {
                    // 1. Save user info to LocalStorage (Browser Memory)
                    localStorage.setItem('m2m_user', JSON.stringify(data.user));
                    
                    // 2. Redirect based on Role
                    if (data.user.role === 'admin') {
                        window.location.href = 'admin.html';
                    } else if (data.user.role === 'driver') {
                        window.location.href = 'driver.html';
                    } else {
                        window.location.href = 'profile.html'; // Default for passengers
                    }
                } else {
                    alert(data.message || "Login failed");
                    loginBtn.innerText = btnOriginalText;
                    loginBtn.style.opacity = "1";
                }

            } catch (error) {
                console.error('Error:', error);
                alert("Server error. Please try again later.");
                loginBtn.innerText = btnOriginalText;
                loginBtn.style.opacity = "1";
            }
        });
    }

    // --- SIGNUP LOGIC ---
    // Note: We look for the form itself in signup.html
    const signupForm = document.querySelector('form'); 
    
    // We only run this if we are actually on the signup page (checks if 'name' input exists)
    const nameInput = document.getElementById('name');
    
    if (signupForm && nameInput) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Stop page reload

            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const submitBtn = signupForm.querySelector('button[type="submit"]');

            // Simple Validation
            if (password !== confirmPassword) {
                alert("Passwords do not match!");
                return;
            }

            if (password.length < 8) {
                alert("Password must be at least 8 characters.");
                return;
            }

            // UI Feedback
            const originalBtnText = submitBtn.innerText;
            submitBtn.innerText = "Creating Account...";
            
            try {
                const response = await fetch('api/auth/signup.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password })
                });

                const data = await response.json();

                if (data.success) {
                    alert("Account created! Please log in.");
                    window.location.href = 'index.html';
                } else {
                    alert(data.message);
                    submitBtn.innerText = originalBtnText;
                }

            } catch (error) {
                console.error('Error:', error);
                alert("Something went wrong. check console.");
                submitBtn.innerText = originalBtnText;
            }
        });
    }
});

// --- HELPER: LOGOUT FUNCTION ---
// You can call logout() from your profile page later
function logout() {
    localStorage.removeItem('m2m_user');
    window.location.href = 'index.html';
}