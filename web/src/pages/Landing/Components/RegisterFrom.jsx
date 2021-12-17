import React, {useContext, useState, useEffect} from 'react';
import {Form, Input, DatePicker, Select, Button, Result, Space} from 'antd';
import {RetweetOutlined} from '@ant-design/icons'
import 'moment/locale/en-au';
import locale from 'antd/es/date-picker/locale/vi_VN';
import axios from 'axios';
import { DEFAULT_HOST } from '@/host';
import Modal from 'antd/lib/modal/Modal';

import {fetchCurrentUser} from '@/helpers/Auth';

const { Option } = Select;
const layout = {
    wrapperCol: {
        span: 16
    },
    labelCol: {
        span: 8
    }
}

const buttonCol = {
    wrapperCol: {
        span: 16,
        offset: 8
    }
}

export default ({disable, policeId, admin}) => {
    const [password, setPassword] = useState('');
    const [success, setSuccess] = useState(false);
    const [posting, setPosting] = useState(false);
    const [form] = Form.useForm();
    const [regrole, setRegrole] = useState('');
    const [ cities, setCities] = useState([]);
    const [districts, setDistricts] = useState([]);
    useEffect(() => {
        const c = async () => {
            setCities(await getCity());
        }
        c();
    }, [])
    const getCity = async () => {
        try {
            const url = DEFAULT_HOST + '/city/all';
            const result = await axios.get(url);
            return result.data;
        } catch (error) {
            console.log(error);
        }
    };
    const fetchDistrict = async (cityId) => {
        try {
            const url = DEFAULT_HOST + `/city/${cityId}/districts`;
            const result = await axios.get(url);
            // console.log(result.data);
            setDistricts(result.data);
        } catch (error) {
            console.log(error);
        }
    };
    const validate = async (field, value) => {
        const url =
            regrole === 'police'
                ? `${DEFAULT_HOST}/users/validatePolice?field=${field}&value=${value}`
                : `${DEFAULT_HOST}/users/validate?field=${field}&value=${value}`;
        try {
            const result = await axios.get(url);
            return result.data.valid;
        } catch (error) {
            return false;
        }
    }; 

    const handleFormFinish = async (value) => {
        setPosting(true);
        let suffix;
        const config = {};
        if ((value.role === 'citizen') | (typeof value.role === 'undefined')) suffix = 'citizen';
        else {
            suffix = 'police';
            const user = fetchCurrentUser();
            config.headers = {
                    Authorization: 'Bearer ' + user.token
                }
        }
        console.log(config);
        const url = DEFAULT_HOST + '/auth/registry/' + suffix;
        value.dateOfIdentity = value.dateOfIdentity.format('YYYY-MM-DD');
        value.dateOfBirth = value.dateOfBirth.format('YYYY-MM-DD');
        if (policeId) value.verifyPolice = policeId;
        else if (admin) value.verifyPolice = admin;
        try {
            const result = await axios.post(url, value, config);
            if (result.data.success) setSuccess(true);
        } catch (error) {
            setPosting(false);
            console.log(error);
        }
    };;

    return (
        <Form
            autoComplete="off"
            labelAlign="left"
            {...layout}
            onFinish={handleFormFinish}
            form={form}
        >
            {admin ? (
                <Form.Item name="role" label="Tài khản dành cho:">
                    <Select placeholder="Lựa chọn" onSelect={(value) => setRegrole(value)}>
                        <Option value="citizen">Công dân</Option>
                        <Option value="police">Cảnh sát giao thông</Option>
                    </Select>
                </Form.Item>
            ) : null}
            <Form.Item
                hasFeedback
                name="fullName"
                label="Họ và tên"
                rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
            >
                <Input placeholder="Nguyễn Văn A ..." disabled={posting}></Input>
            </Form.Item>
            <Form.Item
                hasFeedback
                name="phoneNumber"
                label="Số điện thoại"
                rules={[
                    { required: true, message: 'Vui lòng nhập địa số điện thoại' },
                    {
                        validator: async (rule, value) => {
                            if (!(await validate('phoneNumber', value)))
                                throw 'Số điện thoại đã được đăng ký';
                        },
                    },
                    {
                        pattern: /(03|07|08|09|01[2|6|8|9])+([0-9]{8})\b/,
                        message: 'SĐT không đúng định dạng',
                    },
                ]}
            >
                <Input placeholder="0942...." disabled={posting}></Input>
            </Form.Item>
            <Form.Item
                name="email"
                label="Email"
                hasFeedback
                rules={[
                    { type: 'email', message: 'Địa chỉ email không hợp lệ' },
                    { required: true, message: 'Vui lòng nhập địa chỉ email' },
                    {
                        validator: async (rule, value) => {
                            if (!(await validate('email', value))) throw 'Email đã được đăng ký';
                        },
                    },
                ]}
            >
                <Input placeholder="abcxyz@gmail.com......" disabled={posting}></Input>
            </Form.Item>
            <Form.Item
                name="dateOfBirth"
                label="Ngày sinh"
                hasFeedback
                rules={[{ required: true, message: 'Vui lòng nhập ngày' }]}
            >
                <DatePicker disabled={posting} locale={locale}></DatePicker>
            </Form.Item>
            <Form.Item
                name="identityCardNumber"
                label="Số CMND"
                hasFeedback
                rules={[
                    { pattern: /\d{9}\b/, message: 'Số cmnd không đúng' },
                    { required: true, message: 'Vui lòng nhập số cmnd' },
                    {
                        validator: async (rule, value) => {
                            if (!(await validate('identityCardNumber', value)))
                                throw 'Số cmnd này đã được đăng ký';
                        },
                    },
                ]}
            >
                <Input placeholder="123456789" disabled={posting}></Input>
            </Form.Item>
            <Form.Item
                name="placeOfIdentity"
                label="Nơi cấp CMND"
                hasFeedback
                rules={[{ required: true, message: 'Vui lòng nhập nơi cấp' }]}
            >
                <Input placeholder="Quận/Huyện, Tỉnh/Thành Phố" disabled={posting}></Input>
            </Form.Item>
            <Form.Item
                name="dateOfIdentity"
                label="Ngày cấp CMND"
                hasFeedback
                rules={[{ required: true, message: 'Vui lòng nhập ngày cấp cmnd' }]}
            >
                <DatePicker disabled={posting} locale={locale}></DatePicker>
            </Form.Item>
            <Form.Item
                name="city"
                label="Tỉnh,thành phố "
                hasFeedback
                rules={[{ required: true, message: 'Vui lòng chọn tỉnh, thành ' }]}
                wrapperCol={{ span: 18 }}
            >
                <Select
                    options={cities.map((city) => {
                        return {
                            label: city.name,
                            value: city.id,
                        };
                    })}
                    onSelect={(value) => {
                        fetchDistrict(value);
                    }}
                ></Select>
            </Form.Item>
            <Form.Item
                name="district"
                label="Quận/huyện"
                hasFeedback
                rules={[{ required: true, message: 'Vui lòng chọn quận/ huyện' }]}
                wrapperCol={{ span: 18 }}
            >
                <Select
                    options={districts.map((district) => {
                        return {
                            label: district.districtName,
                            value: district.id,
                        };
                    })}
                ></Select>
            </Form.Item>
            <Form.Item
                hasFeedback
                name="address"
                label="Địa chỉ"
                rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
            >
                <Input placeholder="Số nhà, đường/ấp, phường/xã..." disabled={posting}></Input>
            </Form.Item>
            <Form.Item
                name="password"
                label="Mật khẩu"
                hasFeedback
                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
            >
                <Input.Password
                    disabled={posting}
                    onChange={(e) => setPassword(e.target.value)}
                ></Input.Password>
            </Form.Item>
            <Form.Item
                label="Nhập lại mật khẩu"
                name="repassword"
                hasFeedback
                rules={[
                    { required: true, message: 'Vui lòng nhập mật khẩu' },
                    {
                        validator: async (rule, value) => {
                            if (value !== password) throw 'Mật khẩu không khớp';
                        },
                    },
                ]}
            >
                <Input.Password disabled={posting}></Input.Password>
            </Form.Item>
            <Form.Item {...buttonCol}>
                <Space>
                    <Button type="primary" htmlType="submit" loading={posting}>
                        {policeId ? 'Thêm' : 'Đăng ký ngay'}
                    </Button>
                    <Button type="default" htmlType="button" disabled={posting}>
                        <RetweetOutlined />
                        Làm lại
                    </Button>
                </Space>
            </Form.Item>
            <Modal visible={success} footer={null} onCancel={() => setSuccess(false)}>
                <Result
                    status="success"
                    title={policeId ? 'Thêm thành công' : 'Đăng ký thành công'}
                    subTitle={policeId ? null : 'Đăng nhập để bắt đầu đăng ký xe'}
                />
            </Modal>
        </Form>
    );
}

