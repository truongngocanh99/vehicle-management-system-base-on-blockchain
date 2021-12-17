import React, { useState, useEffect } from 'react';
import { Form, Select, Input, Button, Checkbox, Space, Card, Typography, Divider, Radio, message} from 'antd';
import { PlusOutlined, CloseCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import { DEFAULT_HOST } from '@/host';
import {fetchCurrentUser} from '@/helpers/Auth'

const useForm = Form.useForm;

export default ({edit, disable}) => {
    const [numbers, setNumbers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [districts, setDistricts] = useState([])
    const user = fetchCurrentUser();
    const config = {
        headers: {
            Authorization: 'Bearer ' + user.token,
        }
    }
    const [form] = useForm();

    useEffect(() => {
        const f = async () => {
            const formData = {};
            formData.city = edit;
            setNumbers(edit.number);
            const districts = await fetchDistrict(edit.id);
            formData.districts = districts;
            setDistricts(districts)
            form.setFieldsValue(formData);
        }
        if(edit) {
            f();
        }
    }, [edit]);

    const fetchDistrict = async (cityId) => {
        try {
            const url = DEFAULT_HOST + '/city/' + cityId + '/district';
            const result = await axios.get(url, config);
            return result.data;
        } catch (error) {
            console.log(error);
        }
    }

    const formFinish = async (value) => {
        setLoading(true);
        const url = DEFAULT_HOST + '/city';
        let mess;
        if(edit) {
            const updateVa = updateValue(value);
            try {
                const result =  await axios.put(url,updateVa, config);       
                mess = "Thành công";        
            } catch (error) {
                console.log(error);
                mess = "Thất bại"
            }
        }
        else {
            try {
                const result =  await axios.post(url,value, config);
                mess = "Thành công"              
            } catch (error) {
                console.log(error);
                mess = "Thất bại"
            }
        }
        message.success(mess);
        disable();
    }

    const updateValue = (value) =>{
        const result = {}
        // console.log(edit);
        result.city = {...edit, ...value.city};
        result.districts = value.districts.map((district, index) => {
            return {
                ...districts[index], ...district
            }
        })
        return result;
    }

    const isAlreadyAxistNumber = async (number) => {
        const url = DEFAULT_HOST + '/city?number=' + number + (edit ? "&id=" + edit.id : "");
        const result = await axios.get(url, config);
        if (result.data.length > 0) return true;
        return false;
    }
    async function filter(arr, callback) {
        const fail = Symbol()
        return (await Promise.all(arr.map(async item => (await callback(item)) ? item : fail))).filter(i=>i!==fail)
      }

    return (
        <Form
            labelCol={{ span: 8 }}
            labelAlign="left"
            name="city"
            onFinish={formFinish}
            form={form}
        >
            <Form.Item name={['city', 'name']} 
            label="Tên tỉnh, thành phố"
            rules={[{ required: true, message: 'Vui lòng nhập tên tỉnh thành' }]}
        
            >
                <Input disabled={loading} placeholder="Ví dụ:Cần Thơ..."></Input>
            </Form.Item>
            <Form.Item name={['city', 'departmentName']} 
            label="Tên trụ sở CSGT"
            rules={[{ required: true, message: 'Vui lòng nhập tên tỉnh thành' }]}>
                <Input disabled={loading} placeholder="Ví dụ:Phòng CSGT TP Cần Thơ..."></Input>
            </Form.Item>
            <Form.Item name={['city', 'departmentEmail']} 
            label="Email trụ sở"
            rules={[{ required: true, message: 'Vui lòng nhập tên tỉnh thành' }]}
            >
                <Input disabled={loading} placeholder="Ví dụ:csgt65@gmail.com..."></Input>
            </Form.Item>
            <Form.Item name={['city', 'departmentPhone']}
             label="Số điện thoại trụ sở"
             rules={[{ required: true, message: 'Vui lòng nhập tên tỉnh thành' }]}
             >
                <Input disabled={loading} placeholder="Ví dụ:0292 ..."></Input>
            </Form.Item>
            <Form.Item name={['city', 'departmentAddress']} 
            label="Địa chỉ trụ sở"
            rules={[{ required: true, message: 'Vui lòng nhập tên tỉnh thành' }]}>
                <Input disabled={loading} placeholder="Nhâp địa chỉ trụ sở"></Input>
            </Form.Item>
            <Form.Item
                name={['city', 'number']}
                label="Ký hiệu biển số"
                rules={[
                    {
                        validator: async (rule, numbers) => {
                            const existNumbers = await filter(numbers, async (number) => {
                                return await isAlreadyAxistNumber(number);
                            });
                            console.log(existNumbers);
                            if (existNumbers.length > 0) {
                                const mess = existNumbers.reduce((mess, num) => mess + ', ' + num);
                                throw `Số ${mess} đã được sử dụng`;
                            }
                        },
                    },
                    {required : true}
                ]}
            >
                <Select
                    disabled={loading}
                    mode="tags"
                    placeholder="Ví dụ:65..."
                    notFoundContent={null}
                    onChange={setNumbers}
                ></Select>
            </Form.Item>
            
            <Form.List name="districts">
                {(fields, { add, remove }) => (
                    <>
                        {fields.map((field) => (
                            <>
                                <Card style={{paddingBottom: "0px"}}>
                                    <Form.Item
                                        {...field}
                                        name={[field.name, 'districtName']}
                                        rules={[{ required: true, message: 'Nhập tên quận/huyện' }]}
                                        wrapperCol={{ span: 24 }}
                                    >
                                        <Input disabled={loading} placeholder="Tên quận, huyện" />
                                    </Form.Item>

                                   
                                    {edit?null:<Form.Item wrapperCol={{ offset: 11 }}>
                                        <Button
                                            shape="circle"
                                            onClick={() => remove(field.name)}
                                            disabled={loading}
                                        >
                                            <CloseCircleOutlined />
                                        </Button>
                                    </Form.Item>}
                                </Card>
                            </>
                        ))}
                        <Form.Item>
                            <Button
                                type="dashed"
                                onClick={() => add()}
                                block
                                icon={<PlusOutlined />}
                            >
                                Thêm quận, huyện
                            </Button>
                        </Form.Item>
                    </>
                )}
            </Form.List>
            {edit ? (
                <Form.Item wrapperCol={{ offset: 8 }}>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        Sửa tỉnh, thành
                    </Button>
                </Form.Item>
            ) : (
                <Form.Item wrapperCol={{ offset: 8 }}>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        Thêm tỉnh, thành
                    </Button>
                </Form.Item>
            )}
        </Form>
    );
};
