import React, { useContext, useEffect, useState } from 'react';
import {Modal,message, Form, Input, Button} from 'antd';
import axios from 'axios';
import {fetchCurrentUser} from '@/helpers/Auth';
import { DEFAULT_HOST } from '@/host';

export default () => {
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const user = fetchCurrentUser();
    const [form] = Form.useForm();
    const config = {
        headers: {
            Authorization: 'Bearer ' + user.token
        }
    }
    const onReset = () => {
        form.resetFields();
      };
    const handleFormFinish = async (value) => {
       setLoading(true);

        try {
            const url = DEFAULT_HOST + '/users/me/changePassword';
            const result = await  axios.put(url, value ,config);
            if(result.messeage="success") message.success("Đổi mật khẩu thành công");
            setLoading(false);

        } catch (error) {
            console.log(error);   
            setLoading(false);  
        }   
    };

    return (
        <Form labelCol={{ span: 8 }} wrapperCol={{ span: 8 }} onFinish={handleFormFinish} >
            <Form.Item 
                label="Mật khẩu cũ" 
                name='password'
                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu cũ' }]}
                >
                <Input type="password"></Input>
            </Form.Item>
            <Form.Item label="Mật khẩu mới" 
            name='newPassword'
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới' }]}
            >
                <Input type="password" onChange={(e) => setNewPassword(e.target.value)}></Input>
            </Form.Item>
            <Form.Item
                name='repassword'
                hasFeedback
                label="Nhập lại mật khẩu mới"
                rules={[
                    {
                        validator: async (rule, value) => {
                            if (value !== newPassword) throw 'Mật khẩu không khớp';
                            return;
                        },
                    },
                    { required: true },
                ]}
            >
                <Input type="password"></Input>
            </Form.Item>
            <Form.Item wrapperCol={{ offset: 8 }}>
                <Button htmlType="submit" type="primary"  loading={loading} onClick={onReset}>  
                    Đổi mật khẩu
                </Button>
            </Form.Item>
        </Form>
    );
};