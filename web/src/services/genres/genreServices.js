import axios from 'axios';
import { BASE_URL } from '../../utils/url';
import { getUser } from '../../utils/getUser';

const token = getUser();

export const listGenresAPI = async() => {
    const response = await axios.get(`${BASE_URL}/genres`);
    return response.data;
}

export const addGenreAPI = async({name}) => {
    const response = await axios.post(`${BASE_URL}/genres`, {
        name
    } , {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
}

export const deleteGenreAPI = async({queryKey}) => {
    const [_key, genreID] = queryKey;
    const response = await axios.delete(`${BASE_URL}/genres/${genreID}`, {
        headers : {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
}