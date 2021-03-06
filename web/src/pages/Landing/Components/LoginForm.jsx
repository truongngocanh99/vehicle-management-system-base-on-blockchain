import React, {useEffect, useState, useContext } from 'react';
import { Alert, Form, Button, Input, Checkbox } from 'antd';
import axios from 'axios';
import { history } from 'umi';

import {login, fetchCurrentUser } from '@/helpers/Auth'

const serverUrl = 'http://localhost:3000/';

const LoginForm = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [buttonLoading, setButtonLoading] = useState(false);
    const [failed, setFailed] = useState(false);
    const [exist, setExist] = useState(false);
    const [isActive, setIsActive] = useState(false);
    const auth = fetchCurrentUser()

    const handleUsernameInput = (event) => {
        setUsername(event.target.value);
    }
    const handlePasswordInput = (event) => {
        setPassword(event.target.value);
    }

    const formFinish = async (values) => {
        setButtonLoading(true);
        let result
        try {
            result = await axios({
                method: 'post',
                url: serverUrl + 'auth/login',
                data: values,
            });
            console.log(result);
            if (result.data.success) {
                const user = result.data.data.user;
                const token = result.data.data.token;
                login(token, user);
                if (user.role === 'citizen') history.push('/app');
                if (user.role === 'police') history.push('/police');
                if (user.role === 'admin') history.push('/admin');
            }
            else if (!result.data.success && result.data.message =="Tài khoản chưa được kích hoạt"){
                setIsActive(true);// chua kich hoat
                setButtonLoading(false);
            }
            else if (!result.data.success && result.data.message =="Tài khoản không tồn tại"){
                setExist(true);// chua ton tai
                setButtonLoading(false);
            }
            else {
                setFailed(true);
                setButtonLoading(false);
            }
        } catch (error) {
            console.log(error);
            setButtonLoading(false);
            setFailed(true);
        }
    }
  
    return (
        <Form
            name="basic"
            initialValues={{remember: true,}}
            style={{border: true}}
            onFinish={formFinish}
            labelCol={{span: 6}}
            wrapperCol={{span: 18}}
        >
            <Form.Item
                label="Số điện thoại"
                name="phoneNumber"
                rules={[
                    {
                        required: true,
                        message: 'SDT không được để trống',
                    },
                ]}
            >
                <Input value={username} onChange={handleUsernameInput} />
            </Form.Item>

            <Form.Item
                label="Mật khẩu"
                name="password"
                rules={[
                    {
                        required: true,
                        message: 'Mật khẩu không được để trống',
                    },
                ]}
            >
                <Input.Password value={password} onChange={handlePasswordInput} />
            </Form.Item>

            <Form.Item wrapperCol={{offset: 6, span: 16}}>
                <Button 
                    type="primary"
                    style={{height:'35', width: '15  0px', marginRight: 0}}
                    htmlType='submit'
                    loading={buttonLoading}
                >
                    Đăng nhập
                </Button>
            </Form.Item>
            {exist ? <Alert type='error' message='Tài khoản chưa tồn tại'></Alert> : null}
            {isActive ? <Alert type='error' message='Tài khoản chưa được kích hoạt'></Alert> : null}
            {failed ? <Alert type='error' message='Tài khoản hoặc mật khẩu không đúng'></Alert> : null}
        </Form>
    )
  }

  
export default LoginForm;