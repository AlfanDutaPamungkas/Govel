import axios from 'axios';
import { BASE_URL } from '../../utils/url';
import { getUser } from '../../utils/getUser';

const token = getUser();

export const createInvoiceAPI = async({queryKey}) => {
    const [_key, plan] = queryKey;
    const response = await axios.post(`${BASE_URL}/invoices/${plan}`, null, {
        headers : {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
}

export const listTransactionsAPI = async() => {
    const response = await axios.get(`${BASE_URL}/invoices/`, {
        headers : {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
}

export const listUserTransactionsAPI = async() => {
    const response = await axios.get(`${BASE_URL}/invoices/all`, {
        headers : {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
}