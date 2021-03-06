import React, {useState, useEffect} from 'react';
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
    };

    return (
        <Form
            autoComplete="off"
            labelAlign="left"
            {...layout}
            onFinish={handleFormFinish}
            form={form}
        >
            {admin ? (
                <Form.Item name="role" label="T??i kh???n d??nh cho:">
                    <Select placeholder="L???a ch???n" onSelect={(value) => setRegrole(value)}>
                        <Option value="citizen">C??ng d??n</Option>
                        <Option value="police">C???nh s??t giao th??ng</Option>
                    </Select>
                </Form.Item>
            ) : null}
            <Form.Item
                hasFeedback
                name="fullName"
                label="H??? v?? t??n"
                rules={[{ required: true, message: 'Vui l??ng nh???p t??n' }]}
            >
                <Input placeholder="Nguy???n V??n A ..." disabled={posting}></Input>
            </Form.Item>
            <Form.Item
                hasFeedback
                name="phoneNumber"
                label="S??? ??i???n tho???i"
                rules={[
                    { required: true, message: 'Vui l??ng nh???p ?????a s??? ??i???n tho???i' },
                    {
                        validator: async (rule, value) => {
                            if (!(await validate('phoneNumber', value)))
                                throw 'S??? ??i???n tho???i ???? ???????c ????ng k??';
                        },
                    },
                    {
                        pattern: /^(0)[0,9]{10,11}$/,
                        message: 'S??T kh??ng ????ng ?????nh d???ng',
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
                    { type: 'email', message: '?????a ch??? email kh??ng h???p l???' },
                    { required: true, message: 'Vui l??ng nh???p ?????a ch??? email' },
                    {
                        validator: async (rule, value) => {
                            if (!(await validate('email', value))) throw 'Email ???? ???????c ????ng k??';
                        },
                    },
                ]}
            >
                <Input placeholder="abcxyz@gmail.com......" disabled={posting}></Input>
            </Form.Item>
            <Form.Item
                name="dateOfBirth"
                label="Ng??y sinh"
                hasFeedback
                rules={[{ required: true, message: 'Vui l??ng nh???p ng??y' }]}
            >
                <DatePicker disabled={posting} locale={locale}></DatePicker>
            </Form.Item>
            <Form.Item
                name="identityCardNumber"
                label="S??? CMND"
                hasFeedback
                rules={[
                    { pattern: /\d{9}\b/, message: 'S??? cmnd kh??ng ????ng' },
                    { required: true, message: 'Vui l??ng nh???p s??? cmnd' },
                    {
                        validator: async (rule, value) => {
                            if (!(await validate('identityCardNumber', value)))
                                throw 'S??? cmnd n??y ???? ???????c ????ng k??';
                        },
                    },
                ]}
            >
                <Input placeholder="123456789" disabled={posting}></Input>
            </Form.Item>
            <Form.Item
                name="placeOfIdentity"
                label="N??i c???p CMND"
                hasFeedback
                rules={[{ required: true, message: 'Vui l??ng nh???p n??i c???p' }]}
            >
                <Input placeholder="Qu???n/Huy???n, T???nh/Th??nh Ph???" disabled={posting}></Input>
            </Form.Item>
            <Form.Item
                name="dateOfIdentity"
                label="Ng??y c???p CMND"
                hasFeedback
                rules={[{ required: true, message: 'Vui l??ng nh???p ng??y c???p cmnd' }]}
            >
                <DatePicker disabled={posting} locale={locale}></DatePicker>
            </Form.Item>
            <Form.Item
                name="city"
                label="T???nh,th??nh ph??? "
                rules={[{ required: true, message: 'Vui l??ng ch???n t???nh, th??nh ' }]}
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
                        setCityPicked(true);
                    }}
                ></Select>
            </Form.Item>
            <Form.Item
                name="district"
                label="Qu???n/huy???n"
                rules={[{ required: true, message: 'Vui l??ng ch???n qu???n, huy???n' }]}
                wrapperCol={{ span: 18 }}
            >
                <Select
                    disabled={!cityPicked}
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
                label="?????a ch???"
                rules={[{ required: true, message: 'Vui l??ng nh???p ?????a ch???' }]}
            >
                <Input placeholder="S??? nh??, ???????ng/???p, ph?????ng/x??..." disabled={posting}></Input>
            </Form.Item>
            <Form.Item
                name="password"
                label="M???t kh???u"
                hasFeedback
                rules={[{ required: true, message: 'Vui l??ng nh???p m???t kh???u' }]}
            >
                <Input.Password
                    disabled={posting}
                    onChange={(e) => setPassword(e.target.value)}
                ></Input.Password>
            </Form.Item>
            <Form.Item
                label="Nh???p l???i m???t kh???u"
                name="repassword"
                hasFeedback
                rules={[
                    { required: true, message: 'Vui l??ng nh???p m???t kh???u' },
                    {
                        validator: async (rule, value) => {
                            if (value !== password) throw 'M???t kh???u kh??ng kh???p';
                        },
                    },
                ]}
            >
                <Input.Password disabled={posting}></Input.Password>
            </Form.Item>
            <Form.Item {...buttonCol}>
                <Space>
                    <Button type="primary" htmlType="submit" loading={posting}>
                        {policeId ? 'Th??m' : '????ng k?? ngay'}
                    </Button>
                    <Button type="default" htmlType="button" disabled={posting}>
                        <RetweetOutlined />
                        L??m l???i
                    </Button>
                </Space>
            </Form.Item>
            <Modal visible={success} footer={null} onCancel={() => setSuccess(false)}>
                <Result
                    status="success"
                    title={policeId ? 'Th??m th??nh c??ng' : '????ng k?? th??nh c??ng'}
                    subTitle={policeId ? null : '????ng nh???p ????? b???t ?????u ????ng k?? xe'}
                />
            </Modal>
        </Form>
    );
}

