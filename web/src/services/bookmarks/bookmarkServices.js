import axios from 'axios';
import { BASE_URL } from '../../utils/url';
import { getUser } from '../../utils/getUser';

const token = getUser();

export const addBookmarkAPI = async({novelID}) => {
    const response = await axios.post(`${BASE_URL}/novels/${novelID}/bookmark`, {}, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
} 

export const listBookmarksAPI = async() => {
    const response = await axios.get(`${BASE_URL}/users/bookmark`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
}

export const deleteBookmarkAPI = async({bookmarkID}) => {
    const response = await axios.delete(`${BASE_URL}/users/bookmark/${bookmarkID}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
}