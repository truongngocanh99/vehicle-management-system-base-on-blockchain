import React, { useContext, useEffect, useState } from 'react';
import { Card, Form, Input, DatePicker, InputNumber, Space, Button, Popconfirm, message, Divider} from 'antd';
import path from 'path';
import { DEFAULT_HOST } from '@/host';
import axios from 'axios';
import { REGISTRATION_FIELD } from './Constants'

import { fetchCurrentUser, logout } from '@/helpers/Auth';
import { result } from 'lodash';


export default (props) => {
    const [edit, setEdit] = useState(false);
    const [registration, setRegistration] = useState({});
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

    const user = fetchCurrentUser()

    const config = {
        headers: {
            Authorization: 'Bearer ' + user.token
        }
    }

    const {nextStep, disable}= props;

    useEffect(() => {
        if(props.registration) setRegistration(props.registration); 
    },[]);

    useEffect(()=> {
        registration.capacity = Number.parseInt(registration.capacity);
        form.setFieldsValue(registration);
    },[registration])

    const handleReject = async () => {
        setLoading(true);
        const url = DEFAULT_HOST + '/cars/' + registration.id + '/rejectRegistration';
        try {
            const result = await axios.put(url, {}, config);
            if (result.data.TxID) {
                message.success("Hủy đăng ký thành công");
                disable();
            }
        } catch (error) {
            
        }
    }

    const onFinish = async (value) => {
        setLoading(true);
        if (!edit) return setTimeout(() => nextStep(), 2000);
        const url = DEFAULT_HOST + '/cars/' + registration.id;
        try {
            const result = await axios.put(url, value, config);
            if (result.data.success) nextStep();
            else {
                setLoading(false);
                alert('Lỗi không xác định');
            }
        } catch (error) {
            console.log(error);
            setLoading(false);
            alert('Lỗi không xác định');
        }
    };

    return (
        <Form
            autoComplete="off"
            labelAlign="left"
            labelCol={{ span: 6, offset: 3 }}
            wrapperCol={{ span: 12 }}
            onFinishFailed={() => setEdit(false)}
            onFinish={onFinish}
            form={form}
            style={{marginTop: '30px'}}
        >
            <Form.Item
                label={REGISTRATION_FIELD.BRAND.LABEL}
                name={REGISTRATION_FIELD.BRAND.NAME}
                rules={[{ required: true, message: 'Hãng sản xuất không được bỏ trống' }]}
            >
                <Input disabled={!edit} placeholder="VD: Vinfast..." />
            </Form.Item>
            <Form.Item
                label={REGISTRATION_FIELD.MODEL.LABEL}
                name={REGISTRATION_FIELD.MODEL.NAME}
                rules={[{ required: true, message: 'Mẫu không được bỏ trống' }]}
            >
                <Input disabled={!edit} placeholder="VD: Lux SA2.0" />
            </Form.Item>
            <Form.Item
                label={REGISTRATION_FIELD.COLOR.LABEL}
                name={REGISTRATION_FIELD.COLOR.NAME}
                rules={[{ required: true, message: 'Màu sơn không được bỏ trống' }]}
            >
                <Input disabled={!edit} placeholder="VD: Hồng, Tím..." />
            </Form.Item>
            <Form.Item
                label={REGISTRATION_FIELD.CAPACITY.LABEL}
                name={REGISTRATION_FIELD.CAPACITY.NAME}
                rules={[
                    { required: true, message: 'Nhập dung tích xe' },
                    { type: 'number', message: 'Dung tích không hợp lệ' },
                ]}
            >
                <InputNumber disabled={!edit} />
            </Form.Item>
            <Form.Item
                label={REGISTRATION_FIELD.CHASSIS_NUMBER.LABEL}
                name={REGISTRATION_FIELD.CHASSIS_NUMBER.NAME}
                hasFeedback
                rules={[
                    { required: true, message: 'Nhập số khung' },
                ]}
            >
                <Input disabled={!edit} placeholder="Số khung" />
            </Form.Item>
            <Form.Item
                label={REGISTRATION_FIELD.ENGINE_NUMBER.LABEL}
                name={REGISTRATION_FIELD.ENGINE_NUMBER.NAME}
                hasFeedback
                rules={[
                    { required: true, message: 'Nhập số máy' },
                ]}
            >
                <Input disabled={!edit} placeholder="Số máy" />
            </Form.Item>
            {/* <Form.Item
                label={REGISTRATION_FIELD.CAR_TYPE.LABEL}
                name={REGISTRATION_FIELD.CAR_TYPE.NAME}
                rules={[{ required: true, message: 'Loại xe không được bỏ trống' }]}
            >
                <Input disabled={!edit} placeholder="{registration.carType?registration.carType.name: null}" />
            </Form.Item> */}
            <Divider></Divider>
            <Form.Item wrapperCol={{span: 18, offset: 3}}>
                <Popconfirm okText="Huỷ" cancelText='Huỷ bỏ' onConfirm={handleReject} title='Hủy bỏ đăng ký này?'>
                    <Button style={{float: 'left'}} type='primary' loading={loading} danger>Xóa đăng ký</Button>
                </Popconfirm>
                <Space style={{float: 'right'}}>
                    <Button type='default' disabled={loading} onClick={() => setEdit(true)}>Chỉnh sửa</Button>
                    <Button type='primary' htmlType='submit' loading={loading}>Tiếp tục</Button>
                </Space>
            </Form.Item>
        </Form>
    );
};
