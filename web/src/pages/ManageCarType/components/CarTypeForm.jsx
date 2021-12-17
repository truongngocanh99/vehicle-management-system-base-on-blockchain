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
import { set } from '@umijs/deps/compiled/lodash';

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
        span: 24,
    }
}

export default ({defaultValue, disable}) => {
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
        const f = async () => {
            setCurrent(defaultValue);
            form.setFieldsValue(defaultValue);
        }
        if(defaultValue){
            f()
        }
    }, [defaultValue]);

    const handleFormFinish = async (value) => {
        setPosting(true);
        if(defaultValue) {
            try {
                const url = DEFAULT_HOST + '/carType/'+current.id;
                const result =  await axios.put(url,value, config);       
                if (result.data.success) setSuccess(true);
            } catch (error) {
                console.log(error);
            }
        }
        else {
            try {
                const url2 = DEFAULT_HOST + '/carType/';
                const result =  await axios.post(url2,value, config);    
                if (result.data.success) setSuccess(true);         
            } catch (error) {
                console.log(error);
            }
        }
        disable();
        
    };

    return (
        <Form
            autoComplete="off"
            labelAlign="left"
            {...layout}
            onFinish={handleFormFinish}
            form={form}
        >   
            {defaultValue?(
                <Form.Item name='id' label='ID'>
                <Input readOnly></Input>
            </Form.Item>
            ):null}
            <Form.Item
                name="name"
                label="Loại xe"
                rules={[{ required: true, message: 'Vui lòng nhập tên loại xe đăng ký' }]}
            >
                <Input placeholder="Xe bán tải ..." readOnly={posting}></Input>
            </Form.Item>
            <Form.Item
                name="description"
                label="Mô tả"
                rules={[{ required: true, message: 'Vui lòng nhập mô tả chi tiết' }]}
            >
                <Input.TextArea rows={5} ></Input.TextArea>
            </Form.Item>
            {defaultValue ? (
                <Form.Item wrapperCol={{ offset: 8 }}>
                    <Button type="primary" htmlType="submit" loading={posting}>
                        Xác nhận
                    </Button>
                </Form.Item>
            ) : (
                <Form.Item wrapperCol={{ offset: 8 }}>
                    <Button type="primary" htmlType="submit" loading={posting}>
                        Thêm Mới
                    </Button>
                </Form.Item>
            )}
        </Form>
    );
};

