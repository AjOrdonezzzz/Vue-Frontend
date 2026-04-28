import { reactive, readonly } from 'vue';
import { getStoredUser, setStoredUser, clearStoredUser } from '../utils/auth';

const state = reactive({
    user: getStoredUser()
});

function setUser(user, token = null) {
    state.user = user;
    setStoredUser(user, token);
}

function clearUserState() {
    state.user = null;
    clearStoredUser();
}

function refreshUser() {
    state.user = getStoredUser();
}

export default {
    state: readonly(state),
    setUser,
    clearUserState,
    refreshUser
};
