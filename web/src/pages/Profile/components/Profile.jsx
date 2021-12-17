import React, { useState, useEffect } from 'react';
import { Form, Input, DatePicker, Select, Button, Result, Space, Card, Tag, Typography } from 'antd';
import { CheckCircleFilled, UserAddOutlined } from '@ant-design/icons';
import moment from 'moment';
import 'moment/locale/en-au';
import locale from 'antd/es/date-picker/locale/vi_VN';
import axios from 'axios';
import { DEFAULT_HOST } from '@/host';
import Modal from 'antd/lib/modal/Modal';
import { fetchCurrentUser, logout } from '@/helpers/Auth';
const layout = {
    wrapperCol: {
        span: 30,
    },
    labelCol: {
        span: 8,
    },
};

const buttonCol = {
    wrapperCol: {
        span: 16,
        offset: 8,
    },
};

export default ({ user }) => {
    const [form] = Form.useForm();
    useEffect(() => {
        if (!user) return;
        user.dateOfIdentity = moment(user.dateOfIdentity, 'DD-MM-YYYY');
        user.dateOfBirth = moment(user.dateOfBirth, 'DD-MM-YYYY');
        form.setFieldsValue(user);
    }, []);
    

    return (
        
        <Card>
            <Form autoComplete="off" labelAlign="left" {...layout} form={form} labelAlign="right">
                <Form.Item name='id' label='ID'>
                    <Input readOnly></Input>
                </Form.Item>
                <Form.Item
                    name="fullName"
                    label="Họ và tên"
                    rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
                >
                    <Input placeholder="Nguyễn Văn A ..." readOnly></Input>
                </Form.Item>
                <Form.Item
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
                    <Input placeholder="0942...." readOnly></Input>
                </Form.Item>
                <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                        { type: 'email', message: 'Địa chỉ email không hợp lệ' },
                        { required: true, message: 'Vui lòng nhập địa chỉ email' },
                        {
                            validator: async (rule, value) => {
                                if (!(await validate('email', value)))
                                    throw 'Email đã được đăng ký';
                            },
                        },
                    ]}
                >
                    <Input placeholder="abcxyz@gmail.com......" readOnly></Input>
                </Form.Item>
                <Form.Item
                    name="dateOfBirth"
                    label="Ngày sinh"
                    rules={[{ required: true, message: 'Vui lòng nhập ngày' }]}
                >
                    <DatePicker locale={locale}></DatePicker>
                </Form.Item>
                <Form.Item
                    name="identityCardNumber"
                    label="Số CMND"
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
                    <Input placeholder="123456789" readOnly></Input>
                </Form.Item>
                <Form.Item
                    name="placeOfIdentity"
                    label="Nơi cấp CMND"
                    rules={[{ required: true, message: 'Vui lòng nhập nơi cấp' }]}
                >
                    <Input placeholder="Hòa Bình, Bạc Liêu" readOnly></Input>
                </Form.Item>
                <Form.Item
                    name="dateOfIdentity"
                    label="Ngày cấp CMND"
                    rules={[{ required: true, message: 'Vui lòng nhập ngày cấp cmnd' }]}
                >
                    <DatePicker readOnly locale={locale}></DatePicker>
                </Form.Item>
                <Form.Item
                    name="address"
                    label="Địa chỉ"
                    rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
                >
                    <Input ></Input>
                </Form.Item>
                <Form.Item {...buttonCol}>
                    <Space>
                        {user.verified ? (
                            <Tag color="success">
                                <CheckCircleFilled /> Thông tin đã được xác thực
                            </Tag>
                        ) : (
                            <>
                                <Tag color="warning">Thông tin chưa được xác thực</Tag>
                                <Typography.Text type='secondary'>
                                    * Đến trụ sở CSGT gần nhất để xác thực thông tin
                                </Typography.Text>
                            </>
                        )}
                    </Space>
                </Form.Item>
            </Form>
        </Card>
    );
};
