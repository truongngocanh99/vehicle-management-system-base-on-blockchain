import React, {useState, useEffect} from 'react';
import {Result, Spin} from 'antd';
import Icon from '@ant-design/icons';
import { DEFAULT_HOST } from '@/host';
import axios from 'axios';
import { fetchCurrentUser } from '@/helpers/Auth';
export default ({regId}) => {
    const [registration, setRegistration] = useState({});
    const user = fetchCurrentUser();
    const config = {
        headers: {
            Authorization: 'Bearer ' + user.token
        }
    }

    useEffect(() => {
        const f = async () => {
            const url = DEFAULT_HOST + '/cars/' + regId;
            try {
                const result = await axios.get(url, config);
                if (result.data) setRegistration(result.data.Record)  
            } catch (error) {
                console.log(error);
            }
        }
        if(regId) f();
    }, [regId])

    return (
        "Sao o day"
        // <Spin spinning={typeof registration.registrationNumber === 'undefined'}>
        //     <Result
        //     status='success'
        //     title={'ĐÃ HOÀN THÀNH ĐĂNG KÝ. BIỂN SỐ XE ' +  registration.registrationNumber}
        //     subTitle='Vui lòng nhận giấy đăng ký xe và biển số vào 3 ngày nữa tại văn phòng CSGT'
        //     >
        //     </Result>
        // </Spin>
    )
}