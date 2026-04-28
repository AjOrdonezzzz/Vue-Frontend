
<template>
    <div class="login-page">
        <div class="login-left">
            <div class="login-card">
                <h1>Log in</h1>
                <p class="login-subtitle">Sign in to continue to the CCS profiling system.</p>

                <form @submit.prevent="handleLogin" novalidate>
                    <div class="form-group">
                        <label for="username">Your username</label>
                        <input
                            id="username"
                            v-model="form.username"
                            type="text"
                            :class="{ error: errors.username }"
                            @blur="validateUsername"
                        >
                        <span class="error-message">{{ errors.username }}</span>
                    </div>

                    <div class="form-group">
                        <label for="password">Your password</label>
                        <input
                            id="password"
                            v-model="form.password"
                            type="password"
                            :class="{ error: errors.password }"
                            @blur="validatePassword"
                        >
                        <span class="error-message">{{ errors.password }}</span>
                    </div>

                    <div class="checkbox-group">
                        <input
                            id="remember"
                            v-model="form.remember"
                            type="checkbox"
                        >
                        <label for="remember">Remember me</label>
                    </div>

                    <button type="submit" class="login-btn" :disabled="isLoading">
                        {{ isLoading ? 'Logging in...' : 'Log in' }}
                    </button>

                    <div
                        v-if="message.text"
                        :class="['message', message.type, { hidden: !message.show }]"
                    >
                        {{ message.text }}
                    </div>
                </form>
            </div>
        </div>

        <div class="login-right">
            <div class="hero-copy">
                <p class="eyebrow">CCS Department</p>
                <h2>Access your profiling dashboard and manage student records securely.</h2>
            </div>

            <div class="login">
                <div class="logo-circle">
                    <img src="/images/ccs-logo.jpg" alt="CCS Logo" class="logo-image">
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import globalState from '../store/globalState';
import axios from 'axios';
import { setStoredUser } from '../utils/auth';

export default {
    name: 'LoginPage',
    data() {
        return {
            form: {
                username: '',
                password: '',
                remember: false
            },
            errors: {
                username: '',
                password: ''
            },
            message: {
                text: '',
                type: '',
                show: false
            },
            isLoading: false
        };
    },
    methods: {
        validateUsername() {
            this.errors.username = this.form.username.trim()
                ? ''
                : 'Username is required';
        },
        validatePassword() {
            this.errors.password = this.form.password
                ? ''
                : 'Password is required';
        },
        validateForm() {
            this.validateUsername();
            this.validatePassword();

            return !this.errors.username && !this.errors.password;
        },
        async handleLogin() {
            if (!this.validateForm()) return;

            this.isLoading = true;
            this.message.show = false;

            try {
                // 1. Send the data to your Laravel API
                const response = await axios.post('http://127.0.0.1:8000/api/login', {
                    username: this.form.username,
                    password: this.form.password
                });

                // 2. Laravel returns the user and a token
                const { user, token } = response.data;

                this.message = {
                    text: `Welcome back, ${user.fullName}!`,
                    type: 'success',
                    show: true
                };

                // 3. Save to central auth storage for the Navigation Guard
                setStoredUser(user, token);
                globalState.setUser(user, token);

                // 4. Redirect
                setTimeout(() => {
                    this.$router.push('/dashboard');
                }, 800);

            } catch (error) {
                console.error('Login error:', error);
                this.message = {
                    text: error.response?.data?.message || 'Unauthorized: Invalid username or password.',
                    type: 'error',
                    show: true
                };
                this.errors.password = 'Check credentials';
            } finally {
                this.isLoading = false;
            }
        },
        loadSavedUser() {
            const savedUser = localStorage.getItem('user');
            if (savedUser) {
                const user = JSON.parse(savedUser);
                this.form.username = user.username || '';
                this.form.remember = user.rememberMe || false;
            }
        }
    },
    mounted() {
        this.loadSavedUser();
    }
};
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

html, body {
    width: 100%;
    height: 100%;
    font-family: 'Poppins', sans-serif;
}

body {
    background: linear-gradient(135deg, #b27722 0%, #7a3902 45%, #211000 100%);
}

#app {
    width: 100%;
    height: 100%;
}

.login-page {
    display: grid;
    grid-template-columns: 1fr 1fr;
    width: 100%;
    min-height: 100vh;
    background: linear-gradient(135deg, #b27722 0%, #7a3902 45%, #211000 100%);
}

.login-left {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 40px 48px 40px 40px;
}

.login-card {
    background: rgba(255, 255, 255, 0.96);
    border-radius: 24px;
    padding: 42px 38px;
    width: 100%;
    max-width: 460px;
    min-height: auto;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.18);
    display: flex;
    flex-direction: column;
    justify-content: center;
    backdrop-filter: blur(6px);
}

.login-card h1 {
    font-size: 34px;
    text-align: center;
    margin-bottom: 10px;
    color: #1a1a1a;
    font-weight: 700;
    line-height: 1.2;
}

.login-subtitle {
    text-align: center;
    font-size: 14px;
    color: #666;
    margin-bottom: 28px;
    line-height: 1.5;
}

.login-card form {
    width: 100%;
    max-width: 100%;
}

.form-group {
    margin-bottom: 18px;
}

.form-group label {
    display: block;
    font-size: 13px;
    color: #5f5f5f;
    margin-bottom: 8px;
    font-weight: 600;
}

.form-group input[type="text"],
.form-group input[type="password"] {
    width: 100%;
    height: 48px;
    padding: 12px 14px;
    border: 1px solid #d6d6d6;
    border-radius: 10px;
    font-size: 14px;
    font-family: 'Poppins', sans-serif;
    transition: all 0.25s ease;
    background: #ffffff;
}

.form-group input[type="text"]:focus,
.form-group input[type="password"]:focus {
    outline: none;
    border-color: #a5671e;
    box-shadow: 0 0 0 4px rgba(178, 119, 34, 0.12);
}

.form-group input.error {
    border-color: #ef4444;
    background: #fff5f5;
}

.error-message {
    font-size: 12px;
    color: #ef4444;
    margin-top: 6px;
    display: block;
    min-height: 16px;
    font-weight: 500;
}

.checkbox-group {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 22px;
    margin-top: 6px;
}

.checkbox-group input[type="checkbox"] {
    width: 16px;
    height: 16px;
    cursor: pointer;
    accent-color: #a5671e;
}

.checkbox-group label {
    margin: 0;
    font-size: 13px;
    color: #555;
    cursor: pointer;
    font-weight: 500;
}

.login-btn {
    width: 100%;
    height: 48px;
    padding: 12px 16px;
    background: linear-gradient(135deg, #9b866f 0%, #87725f 100%);
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 15px;
    font-weight: 600;
    font-family: 'Poppins', sans-serif;
    cursor: pointer;
    transition: all 0.25s ease;
    margin-top: 4px;
}

.login-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.16);
    filter: brightness(1.03);
}

.login-btn:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
}

.message {
    margin-top: 16px;
    padding: 12px 14px;
    border-radius: 10px;
    font-size: 13px;
    text-align: center;
    animation: slideDown 0.3s ease;
    font-weight: 600;
}

.message.success {
    background: #d1fae5;
    color: #065f46;
    border: 1px solid #6ee7b7;
}

.message.error {
    background: #fee2e2;
    color: #991b1b;
    border: 1px solid #fca5a5;
}

.message.hidden {
    display: none;
}

@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-8px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.login-right {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    padding: 40px 56px 40px 20px;
}

.hero-copy {
    max-width: 520px;
    margin-bottom: 26px;
    color: #111;
}

.eyebrow {
    font-size: 15px;
    font-weight: 500;
    margin-bottom: 6px;
    color: #1d1d1d;
}

.hero-copy h2 {
    font-size: 22px;
    line-height: 1.45;
    font-weight: 700;
    color: #111;
}

.login {
    width: 100%;
    display: flex;
    justify-content: center;
}

.logo-circle {
    width: 250px;
    height: 250px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: radial-gradient(circle at 30% 30%, rgba(255, 188, 92, 0.25), rgba(74, 31, 0, 0.1));
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25), 0 0 0 24px rgba(255, 255, 255, 0.03);
    overflow: hidden;
}

.logo-image {
    width: 86%;
    height: 86%;
    object-fit: contain;
    border-radius: 50%;
    opacity: 0.95;
    filter: drop-shadow(0 10px 18px rgba(0, 0, 0, 0.18));
}

@media (max-width: 1100px) {
    .login-left {
        padding-right: 30px;
    }

    .login-right {
        padding-right: 30px;
    }

    .login-card {
        max-width: 410px;
        padding: 36px 30px;
    }

    .hero-copy h2 {
        font-size: 20px;
    }

    .logo-circle {
        width: 220px;
        height: 220px;
    }
}

@media (max-width: 768px) {
    .login-page {
        grid-template-columns: 1fr;
        padding: 20px;
    }

    .login-left {
        padding: 0;
        justify-content: center;
    }

    .login-right {
        display: none;
    }

    .login-card {
        max-width: 100%;
        padding: 32px 24px;
        border-radius: 20px;
    }

    .login-card h1 {
        font-size: 30px;
    }
}
</style>
