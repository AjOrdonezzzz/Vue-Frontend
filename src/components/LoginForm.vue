
<template>
    <div class="login-wrapper">
        <div class="login-container">
            <div class="login-section">
                <h1>Log in</h1>
                <form @submit.prevent="handleLogin" novalidate>
                    <div class="form-group">
                        <label for="username">Your username</label>
                        <input 
                            id="username"
                            v-model="form.username"
                            type="text"
                            placeholder="gwillano"
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
                            placeholder="••••••••"
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

        <div class="circle-section">
            <img src="https://via.placeholder.com/250" alt="Logo" class="circle">
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import globalState from '../store/globalState';
import { setStoredUser } from '../utils/auth';
export default {
    name: 'LoginForm',
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
            isLoading: false,
            validUsers: {
                'admin': 'password123',
                'gwillano': 'demo123',
                'user': 'user123'
            }
        };
    },
    methods: {
        validateUsername() {
            if (!this.form.username.trim()) {
                this.errors.username = 'Username is required';
            } else {
                this.errors.username = '';
            }
        },
        validatePassword() {
            if (!this.form.password) {
                this.errors.password = 'Password is required';
            } else {
                this.errors.password = '';
            }
        },
        validateForm() {
            this.errors.username = '';
            this.errors.password = '';

            if (!this.form.username.trim()) {
                this.errors.username = 'Username is required';
            }
            if (!this.form.password) {
                this.errors.password = 'Password is required';
            }

            return !this.errors.username && !this.errors.password;
        },


    // Inside your methods:
    async handleLogin() {
        if (!this.validateForm()) return;

        this.isLoading = true;
        this.message.show = false;

        try {
            // 1. Send request to Laravel
            const response = await axios.post('http://127.0.0.1:8000/api/login', {
                username: this.form.username,
                password: this.form.password
            });

            // 2. Save token and user info through shared auth helpers
            setStoredUser(response.data.user, response.data.token);
            globalState.setUser(response.data.user, response.data.token);

            this.message = {
                text: `Welcome back, ${response.data.user.username}! 🎉`,
                type: 'success',
                show: true
            };

            // 3. Redirect to Dashboard after a short delay
            setTimeout(() => {
                this.$router.push('/dashboard');
            }, 1500);

        } catch (error) {
            console.error('Login error:', error);
            this.message = {
                text: error.response?.data?.message || 'Invalid credentials or server error.',
                type: 'error',
                show: true
            };
        } finally {
            this.isLoading = false;
        }
    },
        loadSavedUser() {
            const savedUser = localStorage.getItem('user');
            if (savedUser) {
                const user = JSON.parse(savedUser);
                this.form.username = user.username;
                this.form.remember = user.rememberMe || false;
            }
        }
    },
    mounted() {
        this.loadSavedUser();
    }
};
</script>

<style scoped>
.login-wrapper {
    display: flex;
    align-items: center;
    gap: 40px;
    max-width: 1000px;
    width: 100%;
}

.login-container {
    background: white;
    border-radius: 20px;
    padding: 50px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    flex: 1;
    max-width: 400px;
}

.login-section {
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.login-section h1 {
    font-size: 28px;
    margin-bottom: 30px;
    color: #1a1a1a;
    text-align: center;
    font-weight: 700;
    letter-spacing: -0.5px;
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    font-size: 14px;
    color: #555;
    margin-bottom: 8px;
    font-weight: 600;
    letter-spacing: -0.3px;
}

.form-group input[type="text"],
.form-group input[type="password"] {
    width: 100%;
    padding: 12px 16px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 14px;
    font-family: 'Poppins', sans-serif;
    transition: all 0.3s ease;
    background: #f9f9f9;
}

.form-group input[type="text"]:focus,
.form-group input[type="password"]:focus {
    outline: none;
    border-color: #b27722;
    background: white;
    box-shadow: 0 0 0 3px rgba(178, 119, 34, 0.1);
}

.form-group input.error {
    border-color: #ef4444;
    background: #fff5f5;
}

.error-message {
    font-size: 12px;
    color: #ef4444;
    margin-top: 4px;
    display: block;
    min-height: 16px;
    font-weight: 500;
}

.checkbox-group {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 20px;
}

.checkbox-group input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
    accent-color: #b27722;
}

.checkbox-group label {
    margin: 0;
    font-size: 14px;
    color: #555;
    cursor: pointer;
    font-weight: 500;
}

.login-btn {
    width: 100%;
    padding: 14px;
    background: linear-gradient(135deg, #b27722 0%, #8a5a1a 100%);
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 700;
    font-family: 'Poppins', sans-serif;
    cursor: pointer;
    transition: all 0.3s ease;
    letter-spacing: -0.3px;
}

.login-btn:hover:not(:disabled) {
    background: linear-gradient(135deg, #b97817 0%, #6b440c 100%);
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(151, 99, 26, 0.3);
}

.login-btn:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
}

.message {
    margin-top: 16px;
    padding: 12px 16px;
    border-radius: 8px;
    font-size: 14px;
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
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.circle-section {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
}

.circle {
    width: 250px;
    height: 250px;
    border-radius: 50%;
    object-fit: cover;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

@media (max-width: 768px) {
    .login-wrapper {
        flex-direction: column;
        gap: 30px;
    }

    .circle-section {
        display: none;
    }

    .login-container {
        padding: 30px 20px;
        max-width: 100%;
    }

    .login-section h1 {
        font-size: 24px;
        margin-bottom: 25px;
    }
}
</style>
