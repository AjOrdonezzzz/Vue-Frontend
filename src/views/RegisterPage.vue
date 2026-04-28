    <template>
    <div class="auth-page">
        <div class="auth-left">
            <div class="auth-card">
                <h1>Create account</h1>
                <form @submit.prevent="handleRegister" novalidate>
                    <div class="form-group">
                        <label for="fullName">Full name</label>
                        <input
                            id="fullName"
                            v-model="form.fullName"
                            type="text"
                            :class="{ error: errors.fullName }"
                            @blur="validateFullName"
                        >
                        <span class="error-message">{{ errors.fullName }}</span>
                    </div>

                    <div class="form-group">
                        <label for="username">Username</label>
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
                        <label for="password">Password</label>
                        <input
                            id="password"
                            v-model="form.password"
                            type="password"
                            :class="{ error: errors.password }"
                            @blur="validatePassword"
                        >
                        <span class="error-message">{{ errors.password }}</span>
                    </div>

                    <div class="form-group">
                        <label for="confirmPassword">Confirm password</label>
                        <input
                            id="confirmPassword"
                            v-model="form.confirmPassword"
                            type="password"
                            :class="{ error: errors.confirmPassword }"
                            @blur="validateConfirmPassword"
                        >
                        <span class="error-message">{{ errors.confirmPassword }}</span>
                    </div>

                    <button type="submit" class="auth-btn" :disabled="isLoading">
                        {{ isLoading ? 'Creating...' : 'Register' }}
                    </button>

                    <p class="switch-prompt">
                        Already have an account?
                        <router-link to="/" class="switch-link">Log in</router-link>
                    </p>

                    <div
                        v-if="message.text"
                        :class="['message', message.type, { hidden: !message.show }]"
                    >
                        {{ message.text }}
                    </div>
                </form>
            </div>
        </div>

        <div class="auth-right">
            <div class="hero-circle">
                <img src="/images/ccs-logo.jpg" alt="CCS Logo" class="hero-logo">
            </div>
        </div>
    </div>
</template>

<script>
import { REGISTERED_USER_STORAGE_KEY } from '../utils/auth';

export default {
    name: 'RegisterPage',
    data() {
        return {
            form: {
                fullName: '',
                username: '',
                role: 'user',
                password: '',
                confirmPassword: ''
            },
            errors: {
                fullName: '',
                username: '',
                password: '',
                confirmPassword: ''
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
        validateFullName() {
            this.errors.fullName = this.form.fullName.trim() ? '' : 'Full name is required';
        },
        validateUsername() {
            this.errors.username = this.form.username.trim() ? '' : 'Username is required';
        },
        validatePassword() {
            this.errors.password = this.form.password.length >= 6 ? '' : 'Password must be at least 6 characters';
        },
        validateConfirmPassword() {
            this.errors.confirmPassword = this.form.confirmPassword === this.form.password
                ? ''
                : 'Passwords do not match';
        },
        validateForm() {
            this.validateFullName();
            this.validateUsername();
            this.validatePassword();
            this.validateConfirmPassword();

            return Object.values(this.errors).every((value) => !value);
        },
        handleRegister() {
            if (!this.validateForm()) return;

            this.isLoading = true;

            setTimeout(() => {
                localStorage.setItem(REGISTERED_USER_STORAGE_KEY, JSON.stringify({
                    fullName: this.form.fullName.trim(),
                    username: this.form.username.trim(),
                    role: this.form.role,
                    password: this.form.password
                }));

                this.message = {
                    text: 'Account created. You can now log in with your new username.',
                    type: 'success',
                    show: true
                };

                this.isLoading = false;

                setTimeout(() => {
                    this.$router.push('/');
                }, 1200);
            }, 700);
        }
    }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

.auth-page {
    display: grid;
    grid-template-columns: 1fr 1fr;
    width: 100%;
    min-height: 100vh;
    background: linear-gradient(135deg, #b27722 0%, #7a3902 45%, #211000 100%);
    font-family: 'Poppins', sans-serif;
}

.auth-left {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-right: 60px;
}

.auth-card {
    background: white;
    border-radius: 20px;
    padding: 50px;
    width: 70vh;
    min-height: 80vh;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.auth-card h1 {
    font-size: 32px;
    color: #18181b;
    margin-bottom: 26px;
}

.form-group {
    margin-bottom: 18px;
}

.form-group label {
    display: block;
    font-size: 13px;
    color: #666;
    margin-bottom: 8px;
    font-weight: 500;
}

.form-group input {
    width: 100%;
    padding: 12px 14px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 14px;
    font-family: 'Poppins', sans-serif;
    transition: all 0.3s ease;
}

.form-group input:focus {
    outline: none;
    border-color: #b27722;
    box-shadow: 0 0 0 3px rgba(178, 119, 34, 0.1);
}

.form-group input.error {
    border-color: #ef4444;
    background: #fff5f5;
}

.error-message {
    display: block;
    min-height: 16px;
    margin-top: 4px;
    font-size: 12px;
    color: #ef4444;
    font-weight: 500;
}

.auth-btn {
    width: 100%;
    margin-top: 10px;
    padding: 14px;
    border: none;
    border-radius: 999px;
    background: linear-gradient(135deg, #a89080 0%, #8a7a6a 100%);
    color: white;
    font-size: 15px;
    font-weight: 600;
    font-family: 'Poppins', sans-serif;
    cursor: pointer;
    transition: all 0.3s ease;
}

.auth-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.18);
}

.auth-btn:disabled {
    background: #ccc;
    cursor: not-allowed;
}

.switch-prompt {
    margin-top: 18px;
    font-size: 13px;
    text-align: center;
    color: #666;
}

.switch-link {
    color: #b27722;
    font-weight: 600;
    text-decoration: none;
}

.switch-link:hover {
    text-decoration: underline;
}

.message {
    margin-top: 16px;
    padding: 12px 16px;
    border-radius: 8px;
    font-size: 14px;
    text-align: center;
    font-weight: 600;
}

.message.success {
    background: #d1fae5;
    color: #065f46;
    border: 1px solid #6ee7b7;
}

.message.hidden {
    display: none;
}

.auth-right {
    display: flex;
    align-items: center;
    justify-content: center;
}

.hero-circle {
    width: 280px;
    height: 280px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: radial-gradient(circle at 30% 30%, rgba(255, 188, 92, 0.25), rgba(74, 31, 0, 0.1));
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25), 0 0 0 26px rgba(255, 255, 255, 0.03);
    overflow: hidden;
}

.hero-logo {
    width: 86%;
    height: 86%;
    object-fit: contain;
    border-radius: 50%;
    opacity: 0.95;
    filter: drop-shadow(0 10px 18px rgba(0, 0, 0, 0.2));
}

@media (max-width: 1024px) {
    .auth-left {
        padding-right: 40px;
    }

    .auth-card {
        width: 300px;
        padding: 45px;
        min-height: auto;
    }

    .hero-circle {
        width: 250px;
        height: 250px;
    }
}

@media (max-width: 900px) {
    .auth-page {
        grid-template-columns: 1fr;
    }

    .auth-left {
        padding-right: 0;
        justify-content: center;
    }

    .auth-right {
        display: none;
    }
}
</style>
