
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Auth.js loaded');
 
    const token = localStorage.getItem('token');
    if (token && window.location.pathname.includes('login.html')) {
        window.location.href = 'dashboard.html';
        return;
    }

    initializeAuthForms();
});

function initializeAuthForms() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const switchLink = document.getElementById('switchLink');

    if (!loginForm || !registerForm || !switchLink) {
        console.error('❌ Auth elements not found');
        return;
    }

    let isLogin = true;

    switchLink.addEventListener('click', (e) => {
        e.preventDefault();
        isLogin = !isLogin;
        
        if (isLogin) {
            loginForm.classList.remove('hidden');
            registerForm.classList.add('hidden');
            switchLink.textContent = 'Belum punya akun? Register';
        } else {
            loginForm.classList.add('hidden');
            registerForm.classList.remove('hidden');
            switchLink.textContent = 'Sudah punya akun? Login';
        }
    });

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleLogin();
    });

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleRegister();
    });
}

async function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const submitBtn = document.querySelector('#loginForm button[type="submit"]');
    
    if (!email || !password) {
        alert('Email dan password harus diisi!');
        return;
    }

    submitBtn.textContent = 'Logging in...';
    submitBtn.disabled = true;

    try {
        console.log('🔐 Attempting login...');
        
        const result = await AssignmentAPI.login({ email, password });
        console.log('✅ Login successful:', result);

        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        
        alert('Login berhasil!');
        window.location.href = 'dashboard.html';
        
    } catch (error) {
        console.error('❌ Login failed:', error);
        alert('Login gagal: ' + error.message);
    } finally {
        submitBtn.textContent = 'Login';
        submitBtn.disabled = false;
    }
}

async function handleRegister() {
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const submitBtn = document.querySelector('#registerForm button[type="submit"]');
    
    if (!email || !password) {
        alert('Email dan password harus diisi!');
        return;
    }

    if (password.length < 6) {
        alert('Password harus minimal 6 karakter!');
        return;
    }

    submitBtn.textContent = 'Registering...';
    submitBtn.disabled = true;

    try {
        console.log('👤 Attempting registration...');
        
        const result = await AssignmentAPI.register({ email, password });
        console.log('✅ Registration successful:', result);
        
        alert('Registrasi berhasil! Silakan login.');
        
        document.getElementById('loginForm').classList.remove('hidden');
        document.getElementById('registerForm').classList.add('hidden');
        document.getElementById('switchLink').textContent = 'Belum punya akun? Register';

        document.getElementById('registerEmail').value = '';
        document.getElementById('registerPassword').value = '';
        
    } catch (error) {
        console.error('❌ Registration failed:', error);
        alert('Registrasi gagal: ' + error.message);
    } finally {
        submitBtn.textContent = 'Register';
        submitBtn.disabled = false;
    }
}