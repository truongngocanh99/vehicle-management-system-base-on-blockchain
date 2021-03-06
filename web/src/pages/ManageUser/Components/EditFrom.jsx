import React, {useState, useEffect} from 'react';
import {Form, Input, DatePicker, Select, Button, Result, Space} from 'antd';
import {RetweetOutlined, EditOutlined} from '@ant-design/icons'
import 'moment/locale/en-au';
import moment from 'moment';
import locale from 'antd/es/date-picker/locale/vi_VN';
import axios from 'axios';
import { DEFAULT_HOST } from '@/host';
import Modal from 'antd/lib/modal/Modal';
import { fetchCurrentUser } from '@/helpers/Auth';

const layout = {
    wrapperCol: {
        span: 17
    },
    labelCol: {
        span: 7
    }
}

const buttonCol = {
    wrapperCol: {
        span: 24,
    }
}
// kiem tra co chinh sua khong
const isModified = (currentValue, newValue) => {
    let isModified = false;
    
    Object.keys(newValue).forEach(attr => {
        if(['dateOfBirth', 'dateOfIdentity'].includes(attr)){
            if(moment(currentValue[attr]).format('YYYY-MM-DD') !== newValue[attr])
                return isModified = true;
            return
        }
        if(currentValue[attr] !== newValue[attr]) 
        {
            isModified = true;
            console.log(attr);
        }
    })
    return isModified;
}

export default ({ defaultValue, onCancel}) => {
    const [current, setCurrent] = useState(defaultValue);
    const [edit, setEdit] = useState({
        value: {},
        isEditing: false,
    });
    const [success, setSuccess] = useState(false);
    const [posting, setPosting] = useState(false);
    const [form] = Form.useForm();
    const user = fetchCurrentUser();
    const config = {
        headers: {
            Authorization: 'Bearer ' + user.token
        }
    }

    useEffect(() => {
        setCurrent({
            ...defaultValue,
            dateOfIdentity: moment(defaultValue.dateOfIdentity, 'YYYY-MM-DD'),
            dateOfBirth: moment(defaultValue.dateOfBirth,'YYYY-MM-DD'),
            isConverted: true,
        });
    }, [defaultValue]);

    useEffect(() => {
        if (current.isConverted) form.setFieldsValue(current);
    }, [current]);
    
    const validate = async (field, value) => {
        const url = `${DEFAULT_HOST}/users/validate?field=${field}&value=${value}`;
        try {
            const result = await axios.get(url);
            return result.data.valid;
        } catch (error) {
            return false;
        }
    };
    // console.log(current);
    const handleFormFinish = async (value) => {
        setPosting(true);
        if(!current.verified){
            const success = await verifyUser(current.id);
            if (success) setSuccess(true);
        }
        const url = DEFAULT_HOST + '/users/' + current.id;
        value.dateOfIdentity = value.dateOfIdentity.format('YYYY-MM-DD');
        value.dateOfBirth = value.dateOfBirth.format('YYYY-MM-DD');
        if (!isModified(current, value)) return setTimeout(() => setSuccess(true), 1500);
        try {
            const result = await axios.put(url, value, config);
            if (result.data.success) setSuccess(true);
        } catch (error) {
            console.log(error);
        }
    };

    const verifyUser = async (userId) => {
        const url = DEFAULT_HOST + '/users/' + userId+ '/verify';
        try {
            const result = await axios.put(url, {}, config);
            if (result.data.success) return true;
            return false
        } catch (error) {
           return false; 
        }
    }

    return (
        <Form
            autoComplete="off"
            labelAlign="left"
            {...layout}
            onFinish={handleFormFinish}
            form={form}
        >
            <Form.Item name='id' label='ID'>
                <Input readOnly></Input>
            </Form.Item>
            <Form.Item
                name="fullName"
                label="H??? v?? t??n"
                rules={[{ required: true, message: 'Vui l??ng nh???p t??n' }]}
            >
                <Input placeholder="Nguy???n V??n A ..." disabled={posting || !edit.isEditing}></Input>
            </Form.Item>
            <Form.Item
                name="phoneNumber"
                label="S??? ??i???n tho???i"
                rules={[
                    { required: true, message: 'Vui l??ng nh???p ?????a s??? ??i???n tho???i' },
                    {
                        validator: async (rule, value) => {
                            if (value === current.phoneNumber) return;
                            if (!(await validate('phoneNumber', value)))
                                throw 'S??? ??i???n tho???i ???? ???????c ????ng k??';
                        },
                    },
                    {
                        pattern: /(03|07|08|09|01[2|6|8|9])+([0-9]{8})\b/,
                        message: 'S??T kh??ng ????ng ?????nh d???ng',
                    },
                ]}
            >
                <Input placeholder="0942...." disabled={posting || !edit.isEditing}></Input>
            </Form.Item>
            <Form.Item
                name="email"
                label="Email"
                rules={[
                    { type: 'email', message: '?????a ch??? email kh??ng h???p l???' },
                    { required: true, message: 'Vui l??ng nh???p ?????a ch??? email' },
                    {
                        validator: async (rule, value) => {
                            if (value === current.email) return;
                            if (!(await validate('email', value))) throw 'Email ???? ???????c ????ng k??';
                        },
                    },
                ]}
            >
                <Input
                    placeholder="abcxyz@gmail.com......"
                    disabled={posting || !edit.isEditing}
                ></Input>
            </Form.Item>
            <Form.Item
                name="dateOfBirth"
                label="Ng??y sinh"
                rules={[{ required: true, message: 'Vui l??ng nh???p ng??y' }]}
            >
                <DatePicker disabled={posting || !edit.isEditing} locale={locale}></DatePicker>
            </Form.Item>
            <Form.Item
                name="identityCardNumber"
                label="S??? CMND"
                rules={[
                    { pattern: /\d{9}\b/, message: 'S??? cmnd kh??ng ????ng' },
                    { required: true, message: 'Vui l??ng nh???p s??? cmnd' },
                    {
                        validator: async (rule, value) => {
                            if (value === current.identityCardNumber) return;
                            if (!(await validate('identityCardNumber', value)))
                                throw 'S??? cmnd n??y ???? ???????c ????ng k??';
                        },
                    },
                ]}
            >
                <Input placeholder="123456789" disabled={posting || !edit.isEditing}></Input>
            </Form.Item>
            <Form.Item
                name="placeOfIdentity"
                label="N??i c???p CMND"
                rules={[{ required: true, message: 'Vui l??ng nh???p n??i c???p' }]}
            >
                <Input
                    placeholder="H??a B??nh, B???c Li??u"
                    disabled={posting || !edit.isEditing}
                ></Input>
            </Form.Item>
            <Form.Item
                name="dateOfIdentity"
                label="Ng??y c???p CMND"
                rules={[{ required: true, message: 'Vui l??ng nh???p ng??y c???p cmnd' }]}
            >
                <DatePicker disabled={posting || !edit.isEditing} locale={locale}></DatePicker>
            </Form.Item>
            <Form.Item
                name="address"
                label="?????a ch???"
                rules={[{ required: true, message: 'Vui l??ng nh???p ?????a ch???' }]}
            >
                <Input
                    placeholder="H??a B??nh, B???c Li??u"
                    disabled={posting || !edit.isEditing}
                ></Input>
            </Form.Item>
            <Form.Item {...buttonCol}>
                <Button
                    style={{ float: 'left' }}
                    type="default"
                    htmlType="button"
                    disabled={!edit.isEditing || posting}
                    onClick={() => form.setFieldsValue(current)}
                >
                    <RetweetOutlined />
                    Kh??i ph???c
                </Button>
                <Space style={{ float: 'right' }}>
                    <Button
                        style={{ float: 'right' }}
                        type="default"
                        htmlType="button"
                        disabled={edit.isEditing}
                        onClick={() => setEdit({ ...edit, isEditing: true })}
                    >
                        <EditOutlined />
                        Ch???nh s???a
                    </Button>
                    {defaultValue.verified ? (
                        <Button
                            style={{ float: 'right' }}
                            type="primary"
                            htmlType="submit"
                            loading={posting}
                            disabled={!edit.isEditing}
                        >
                            X??c nh???n
                        </Button>
                    ) : (
                        <Button
                            style={{ float: 'right' }}
                            type="primary"
                            htmlType="submit"
                            loading={posting}
                            onClick={() => verifyUser(defaultValue.id)}
                        >
                            X??c th???c
                        </Button>
                    )}
                </Space>
            </Form.Item>
            <Modal
                visible={success}
                footer={null}
                onCancel={() => {
                    setSuccess(false);
                    onCancel();
                }}
            >
                <Result status="success" title={current.verified ? "Ch???nh s???a th??ng tin th??nh c??ng" : "???? x??c th???c ng?????i d??ng"} />
            </Modal>
        </Form>
    );
};