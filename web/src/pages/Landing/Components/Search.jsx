import React, {useState, useEffect} from 'react';
import axios from 'axios';
import {Descriptions, Input, Spin, Alert, Card} from 'antd';
import { DEFAULT_HOST } from '@/host';

export default () => {
    const [car, setCar] = useState({});
    const [a, setA] = useState(false);
    const [contentVisible, setContentVisible] = useState(false);

    const handleSearch = async (value) => {
        const url = DEFAULT_HOST + '/cars/search?registrationNumber=' + value;
        try {
            const result = await axios.get(url);
            setCar(result.data);
            setA(false);
            setContentVisible(true);

        } catch (error) {
            setA(true);
            setContentVisible(true);
        }
    }

    return (
        <Card>
            <Input.Search placeholder="Nhập biển số xe" onSearch={handleSearch}></Input.Search>
            {
                contentVisible ? (
                    <>
                        {
                            a ? <Alert showIcon message="Không tìm thấy!"></Alert>:
                            <Descriptions column={1}>
                                <Descriptions.Item label="Hãng sản xuất">{car.brand}</Descriptions.Item>
                                <Descriptions.Item label="Mẫu xe">{car.model}</Descriptions.Item>
                                <Descriptions.Item label="Khu vực đăng ký">{car.registeredCity.name}</Descriptions.Item>
                            </Descriptions>
                        }
                    </>
                ) : null
            }
        </Card>
    )
}
