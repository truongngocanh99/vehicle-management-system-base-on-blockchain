import React from 'react';
import { Redirect } from 'umi';

export default (props) => {
    const auth = JSON.parse(localStorage.getItem('auth'));
    if (auth === null) {
        return <div>{props.children}</div>
    }
    else return <Redirect to='/app/car-register'></Redirect>
}