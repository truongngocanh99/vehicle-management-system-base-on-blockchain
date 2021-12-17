import React, { useState, useEffect } from 'react';
import { useHistory, Redirect } from 'umi';
import { logout, login } from '@/helpers/Auth';
import axios from 'axios';

const REDIRECT_PATH = {
    citizen: '/app',
    police: '/police',
    admin: '/admin',
}

const AuthLayout = (props) => {
    const history = useHistory();
    const user = JSON.parse(localStorage.getItem('auth'));

    useEffect(() => {
        const f = async () => {
            const appName = history.location.pathname.split('/')[1];
            try {
                const result = await axios.get('http://localhost:3000/users/me', {
                    headers: {
                        Authorization: 'Bearer ' + user.token
                    }
                });
                login(user.token, result.data);
                if (history.location.pathname === '/') history.push(REDIRECT_PATH[user.role]);
            } catch (error) {
                logout();
                console.log(history.location.pathname)
                if ( history.location.pathname === '/index2' ) return;
                if (history.location.pathname !== '/index') history.push('/index');
            }
        }
        f();
    }, [history.location.pathname])
    return <>{props.children}</>;
}


export default AuthLayout;