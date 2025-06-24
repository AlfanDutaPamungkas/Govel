import axios from 'axios';
import { BASE_URL } from '../../utils/url';
import { getUser } from '../../utils/getUser';

const token = getUser();

export const listNovelsAPI = async({queryKey}) => {
    let URL = `${BASE_URL}/novels`;
    const [_key, params, value] = queryKey;
    if (params == "sort_by") {
        URL += `?sort_by=${value}`
    }else if (params == "search") {
        URL += `?search=${value}`
    }

    const response = await axios.get(`${URL}`);
    return response.data;
}

export const listNovelsFromGenreAPI = async({queryKey}) => {
    const [_key, genreID] = queryKey;
    const response = await axios.get(`${BASE_URL}/genres/${genreID}/novels`);
    return response.data;
}

export const detailNovelAPI = async({queryKey}) => {
    const [_key, novelID] = queryKey;
    const response = await axios.get(`${BASE_URL}/novels/${novelID}`, {
        headers : {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
}

export const addNovelAPI = async(formData) => {
    const response = await axios.post(`${BASE_URL}/novels`, formData , {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
        }
    });

    return response.data;
}

export const editNovelAPI = async ({ novelID, title, author, synopsis, genre_ids }) => {
  const response = await axios.patch(`${BASE_URL}/novels/${novelID}`, {
    title,
    author,
    synopsis,
    genre_ids,
  }, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

export const deleteNovelAPI = async({queryKey}) => {
    const [_key, novelID] = queryKey;
    const response = await axios.delete(`${BASE_URL}/novels/${novelID}`, {
        headers : {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
}
