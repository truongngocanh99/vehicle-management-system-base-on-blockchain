import React, { useState, useEffect } from 'react';
import { Form, Select, Input, Button, Checkbox, Space, Card, Typography, Divider, Radio, message} from 'antd';
import { PlusOutlined, CloseCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import { DEFAULT_HOST } from '@/host';
import {fetchCurrentUser} from '@/helpers/Auth'
import _ from 'lodash'; 
import FormItem from 'antd/lib/form/FormItem';
const useForm = Form.useForm;

export default ({disable}) => {
    const [seri, setSeri] = useState([]);
    const [loading, setLoading] = useState(false);
    const [ carTypes, setCarType] = useState([]);
    const [carTypeOption, setCarTypeOption]= useState();
    const user = fetchCurrentUser();
    const [cities,setCity]= useState([]);
    const [cityOption, setCityOption]= useState();
    const [validate, setValidate]= useState();

    const config = {
        headers: {
            Authorization: 'Bearer ' + user.token,
        }
    }
    const [form] = useForm();
    useEffect (() => {
        const url = DEFAULT_HOST +'/carType';
        const f = async () =>{
            const result = await axios.get(url);
            setCarType(result.data);
                          
            }
            f();
        
    },[]);
    useEffect (() => {
        const url = DEFAULT_HOST +'/city/all';
        const c = async () =>{
            const result = await axios.get(url);
            setCity(result.data);
                          
            }
            c();
        
    },[]);

    function handleChange(value) {
        setCarTypeOption(value);
      }
      function handleChangeCity(value) {
        setCityOption(value);
      }
    const formFinish = async (value) => {
        setLoading(true);
        try {
            const url2 = DEFAULT_HOST + '/object/';
            const result =  await axios.post(url2,value, config);
            if(result){
                setLoading(false); 
            }
                   
        } catch (error) {
                console.log(error);
                setLoading(false);
        }
        
        disable();
    }
    
    return (
        <Form
            labelCol={{ span: 8 }}
            labelAlign="left"
            onFinish={formFinish}
            form={form}
        >   
           <FormItem 
                name='city'
                label='Tỉnh thành đăng ký'
                wrapperCol= {{span:20, offset:2}}
                rules={[{ required: true, message: 'Vui lòng chọn tỉnh thành' }]}
            >
               <Select
                    placeholder="Chọn tỉnh thành đăng kí"
                    style={{ width: '100%' }}
                    onChange={handleChangeCity}
                    >
                        {cities.map((city) => (
                            <option key={city.id} value={city.id}>{city.name}</option>
                        ))}
                </Select>
            </FormItem>
            <FormItem 
                name='carType'
                label='Loại xe đăng ký'
                wrapperCol= {{span:20, offset:3}}
                rules={[{ required: true, message: 'Vui lòng chọn loại xe đăng ký' }]}
            >
               <Select
                    placeholder="Chọn loại xe đăng kí"
                    style={{ width: '100%' }}
                    onChange={handleChange}
                    >
                        {carTypes.map((carType) => (
                            <option key={carType.id} value={carType.id}>{carType.name}</option>
                        ))}
                </Select>
            </FormItem>

           
            
            <Form.Item
                name='seri'
                label="Ký hiệu seri"
                wrapperCol= {{span:20}}
                rules={[{ required: true, message: 'Vui lòng nhập seri' }]}
            >
                <Select
                    disabled={loading}
                    mode="tags"
                    placeholder="Ví dụ:A, B..."
                    notFoundContent={null}
                    onChange={setSeri}
                ></Select>
            </Form.Item>
       
            <Form.Item wrapperCol={{ offset: 8 }}>
                <Button type="primary" htmlType="submit" loading={loading}>
                    Thêm đối tượng
                </Button>
            </Form.Item>
            
        </Form>
    );
};


