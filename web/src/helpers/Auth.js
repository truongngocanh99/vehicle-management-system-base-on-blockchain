import axios from 'axios';
import { DEFAULT_HOST } from '@/host';


export const login = (token, user) => {
    const dataToStore = {token: token, ...user}
    localStorage.setItem('auth', JSON.stringify(dataToStore));
}

export const logout = () => {
    localStorage.removeItem('auth');
}

export const fetchCurrentUser = () => {
    return JSON.parse(localStorage.getItem('auth')); 
}