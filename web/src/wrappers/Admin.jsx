import React, { useContext } from 'react';
import { useHistory, Redirect } from 'umi';


export default ({children}) => {
    const history = useHistory();
    const auth = JSON.parse(localStorage.getItem('auth'));

    if(!auth) return <Redirect to='/index'></Redirect>;

    if(auth.role !== 'admin') return history.push('/404');

    return <>{children}</>
}