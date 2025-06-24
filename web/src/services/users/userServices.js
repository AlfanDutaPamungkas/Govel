import axios from 'axios';
import { BASE_URL } from '../../utils/url';
import { getUser } from '../../utils/getUser';

const token = getUser();

export const signInAPI = async({email, password}) => {
    const response = await axios.post(`${BASE_URL}/authentication/token`, {
        email,
        password
    });

    return response.data;
}

export const signUpAPI = async({username, email, password}) => {
    const response = await axios.post(`${BASE_URL}/authentication/user`, {
        username,
        email,
        password
    });

    return response.data;
}

export const profileAPI = async() => {
    const response = await axios.get(`${BASE_URL}/users`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    return response.data;
}

export const forgotPasswordAPI = async({email}) => {
    const response = await axios.post(`${BASE_URL}/authentication/forgot-password`, {
        email
    });

    return response.data;
}

export const resetPasswordAPI = async({password, token}) => {
    const response = await axios.patch(`${BASE_URL}/authentication/reset-password/${token}`, {
        password
    });

    return response.data;
}

export const updateProfileAPI = async({username, email}) => {
    const response = await axios.patch(`${BASE_URL}/users`, {
        username,
        email
    }, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    return response.data;
}

export const changePasswordAPI = async({old_password, new_password}) => {
    const response = await axios.patch(`${BASE_URL}/users/change-password`, {
        old_password,
        new_password
    }, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    return response.data;
}

export const checkAdminAPI = async() => {
    const response = await axios.get(`${BASE_URL}/admin/check`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    return response.data;
}
