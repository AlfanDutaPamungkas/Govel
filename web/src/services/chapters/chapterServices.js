import axios from 'axios';
import { BASE_URL } from '../../utils/url';
import { getUser } from '../../utils/getUser';

const token = getUser();

export const detailChapterAPI = async({queryKey}) => {
    const [_key, novelID, slug] = queryKey;
    const response = await axios.get(`${BASE_URL}/novels/${novelID}/chapters/${slug}`, {
        headers : {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
}

export const unlockChapterAPI = async({queryKey}) => {
    const [_key, novelID, slug] = queryKey;
    const response = await axios.post(`${BASE_URL}/novels/${novelID}/chapters/${slug}/unlock`, {}, {
        headers : {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
}

export const addChapterAPI = async({novelID, title, content, chapter_number, is_locked, price}) => {
    const response = await axios.post(`${BASE_URL}/novels/${novelID}/chapters`, {
        title,
        content,
        chapter_number,
        is_locked,
        price
    }, {
        headers : {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
}


export const editChapterAPI = async({novelID, slug, title, content, chapter_number, is_locked, price}) => {
    const response = await axios.patch(`${BASE_URL}/novels/${novelID}/chapters/${slug}`, {
        title,
        content,
        chapter_number,
        is_locked,
        price
    }, {
        headers : {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
}

export const deleteChapterAPI = async({queryKey}) => {
    const [_key, novelID, slug] = queryKey;
    const response = await axios.delete(`${BASE_URL}/novels/${novelID}/chapters/${slug}`, {
        headers : {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
}
