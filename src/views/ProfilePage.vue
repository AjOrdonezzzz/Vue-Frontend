<template>
    <div class="profile-layout">
        <sidebar :is-open="sidebarOpen" @toggle="sidebarOpen = !sidebarOpen"></sidebar>

        <div class="main-content">
            <app-header
                title="Profile Settings"
                :subtitle="currentDate"
                :show-back="true"
                :search-query="searchQuery"
                @update:search-query="searchQuery = $event"
            ></app-header>

            <div class="profile-content">
                <div class="page-header">
                    <h1 class="page-title">My Profile</h1>
                    <p class="page-subtitle">Upload your photo and update your personal details.</p>
                </div>

                <div v-if="matchesSearch" class="profile-grid">
                    <section class="profile-card profile-preview">
                        <div class="avatar-wrap">
                            <img v-if="form.avatar" :src="form.avatar" alt="Profile photo" class="avatar-image">
                            <div v-else class="avatar-placeholder">{{ initials }}</div>
                        </div>

                        <label class="upload-btn">
                            Upload Picture
                            <input type="file" accept="image/*" @change="handleImageUpload" hidden>
                        </label>

                        <h2>{{ form.fullName || 'Your Name' }}</h2>
                        <p>{{ form.role || 'Role' }}</p>
                    </section>

                    <section class="profile-card profile-form">
                        <div v-if="isLoading && !form.email" class="loading-overlay">Loading...</div>
                        
                        <div class="form-grid">
                            <label class="field">
                                <span>Full name</span>
                                <input v-model="form.fullName" type="text" placeholder="Enter your full name">
                            </label>

                            <label class="field">
                                <span>Role</span>
                                <input v-model="form.role" type="text" placeholder="Enter your role" disabled class="disabled-input">
                            </label>

                            <label class="field">
                                <span>Email</span>
                                <input v-model="form.email" type="email" placeholder="Enter your email">
                            </label>

                            <label class="field">
                                <span>Phone</span>
                                <input v-model="form.phone" type="text" placeholder="Enter your phone number">
                            </label>

                            <label class="field field-full">
                                <span>Bio</span>
                                <textarea v-model="form.bio" rows="4" placeholder="Write a short bio"></textarea>
                            </label>
                        </div>

                        <div class="actions">
                            <button class="save-btn" @click="saveProfile" :disabled="isLoading">
                                {{ isLoading ? 'Saving...' : 'Save Profile' }}
                            </button>
                            <span v-if="savedMessage" class="saved-message">{{ savedMessage }}</span>
                        </div>
                    </section>
                </div>

                <div v-else class="empty-state">
                    No profile details matched your search.
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import AppHeader from '../components/AppHeader.vue';
import Sidebar from '../components/Sidebar.vue';
import globalState from '../store/globalState';
import axios from 'axios';

export default {
    name: 'ProfilePage',
    components: { AppHeader, Sidebar },
    data() {
        return {
            sidebarOpen: true,
            currentDate: '',
            searchQuery: '',
            isLoading: false,
            form: {
                fullName: '',
                role: '',
                email: '',
                phone: '',
                bio: '',
                avatar: ''
            },
            savedMessage: ''
        };
    },
    computed: {
        initials() {
            if (!this.form.fullName) return 'SA';
            return this.form.fullName
                .split(' ')
                .filter(Boolean)
                .slice(0, 2)
                .map((part) => part[0]?.toUpperCase() || '')
                .join('');
        },
        matchesSearch() {
            const query = this.searchQuery.trim().toLowerCase();
            if (!query) return true;

            return [
                this.form.fullName,
                this.form.role,
                this.form.email,
                this.form.phone,
                this.form.bio
            ].some((value) => String(value || '').toLowerCase().includes(query));
        }
    },
    methods: {
        async fetchProfile() {
            this.isLoading = true;
            const token = localStorage.getItem('user_token');
            
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/v1/user-profile', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                const data = response.data;
                this.form = {
                    fullName: data.name || '',
                    role: data.role || '',
                    email: data.email || '',
                    phone: data.phone || '',
                    bio: data.bio || '',
                    avatar: data.avatar_url || ''
                };
            } catch (error) {
                console.error("Profile load failed:", error);
            } finally {
                this.isLoading = false;
            }
        },

        async saveProfile() {
            this.isLoading = true;
            const token = localStorage.getItem('user_token');

            try {
                await axios.put('http://127.0.0.1:8000/api/v1/user-profile/update', {
                    name: this.form.fullName,
                    email: this.form.email,
                    phone: this.form.phone,
                    bio: this.form.bio,
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                this.savedMessage = 'Profile updated successfully!';
                
                // Update Global State so Header/Sidebar reflect changes
                globalState.setUser({
                    ...globalState.state.user,
                    fullName: this.form.fullName
                }, token);

                setTimeout(() => { this.savedMessage = ''; }, 3000);
            } catch (error) {
                this.savedMessage = 'Error updating profile.';
                console.error(error);
            } finally {
                this.isLoading = false;
            }
        },

        handleImageUpload(event) {
            const file = event.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => { this.form.avatar = reader.result; };
            reader.readAsDataURL(file);
        },

        getFormattedDate() {
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            return new Date().toLocaleDateString('en-US', options);
        }
    },
    mounted() {
        this.currentDate = this.getFormattedDate();
        this.fetchProfile();
    }
};
</script>

<style scoped>
/* Keeping your existing styles */
.profile-layout {
    display: flex;
    min-height: 100vh;
    background: linear-gradient(135deg, #b27722 0%, #7a3902 45%, #211000 100%);
    font-family: 'Poppins', sans-serif;
}

.main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.profile-content {
    padding: 24px 32px 40px;
}

.page-header {
    margin-bottom: 26px;
    color: white;
}

.page-title {
    font-size: 38px;
    margin-bottom: 8px;
}

.page-subtitle {
    font-size: 15px;
    opacity: 0.85;
}

.profile-grid {
    display: grid;
    grid-template-columns: 320px 1fr;
    gap: 24px;
}

.empty-state {
    padding: 40px;
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.9);
    color: #7a4a12;
    font-weight: 600;
    text-align: center;
}

.profile-card {
    background: white;
    border-radius: 22px;
    padding: 24px;
    box-shadow: 0 10px 28px rgba(0, 0, 0, 0.12);
    position: relative;
}

.profile-preview {
    text-align: center;
}

.avatar-wrap {
    width: 160px;
    height: 160px;
    margin: 0 auto 18px;
}

.avatar-image,
.avatar-placeholder {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
}

.avatar-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #f4c78f, #a45b12);
    color: white;
    font-size: 42px;
    font-weight: 700;
}

.upload-btn {
    display: inline-block;
    margin-bottom: 18px;
    padding: 10px 16px;
    border-radius: 999px;
    background: #8a5a20;
    color: white;
    cursor: pointer;
    font-weight: 600;
}

.profile-preview h2 {
    font-size: 24px;
    color: #1a1a1a;
    margin-bottom: 8px;
}

.profile-preview p {
    color: #666;
    text-transform: capitalize;
}

.form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px;
}

.field {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.field span {
    color: #555;
    font-size: 14px;
    font-weight: 600;
}

.field input,
.field textarea {
    width: 100%;
    padding: 12px 14px;
    border: 1px solid #ddd;
    border-radius: 12px;
    font: inherit;
}

.disabled-input {
    background-color: #f5f5f5;
    cursor: not-allowed;
    color: #888;
}

.field-full {
    grid-column: 1 / -1;
}

.actions {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-top: 20px;
}

.save-btn {
    padding: 12px 24px;
    border: none;
    border-radius: 999px;
    background: linear-gradient(135deg, #8a5a20 0%, #5e3a12 100%);
    color: white;
    font: inherit;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.2s;
}

.save-btn:disabled {
    opacity: 0.6;
    cursor: wait;
}

.saved-message {
    color: #0f766e;
    font-weight: 600;
}

@media (max-width: 900px) {
    .profile-grid {
        grid-template-columns: 1fr;
    }
}
</style>