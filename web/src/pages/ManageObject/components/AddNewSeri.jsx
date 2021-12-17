import React, { useState, useEffect } from 'react';
import { Form, Select, Input, Button, Checkbox, Space, Card, Typography, Divider, Radio, message} from 'antd';
import { PlusOutlined, CloseCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import { DEFAULT_HOST } from '@/host';
import {fetchCurrentUser} from '@/helpers/Auth'
import _ from 'lodash'; 
import FormItem from 'antd/lib/form/FormItem';
const useForm = Form.useForm;

export default ({edit,disable}) => {
    const [seri, setSeri] = useState([]);
    const [loading, setLoading] = useState(false);
    const [carTypes, setCarType] = useState([]);
    const [carTypeOption, setCarTypeOption]= useState();
    const user = fetchCurrentUser();
    const [cities,setCity]= useState([]);
    const [cityOption, setCityOption]= useState();
    const [series, setSeries] = useState([]);
    const [seriCity,setSeriCity] = useState()
    const config = {
        headers: {
            Authorization: 'Bearer ' + user.token,
        }
    }
    const [form] = useForm();
    const formFinish = async (value) => {
        setLoading(true);
        try {
            const url2 = DEFAULT_HOST + '/object/addNewSeri/' + edit.id;
            const result =  await axios.put(url2,value, config);
            if(result){
                setLoading(false); 
            }
                   
        } catch (error) {
                console.log(error);
                setLoading(false);
        }
        
        disable();
    }
    useEffect(()=>{
        const r = async () => {
            const url=  DEFAULT_HOST + '/object/getSeriCity/' +edit.city;
            const result = await axios.get(url, config);
            setSeriCity(result.data)
        };
        r()
    },[])
    useEffect( () => {
        const url = DEFAULT_HOST + '/object/getSeri/' + edit.id;
        const s = async() =>{
            const result = await axios.get(url,config);
            setSeries(result.data);
        }
        s();
    },[])
    return (
        <Form
            labelCol={{ span: 8 }}
            labelAlign="left"
            onFinish={formFinish}
            form={form}
        >   
            <Form.Item
                name='newSeri'
                label="Ký hiệu seri"
                wrapperCol= {{span:20}}
                rules={[
                    {   required: true, message: 'Vui lòng nhập Seri mới'},
                    {   validator: async (rule, newSeri) => {
                        if(newSeri){
                            let seri1 = series.filter((a) => {
                                if(a == newSeri){
                                    throw 'Seri đã được sử dụng'
                                } 
                            })
                        }
                        if(newSeri){
                            let seri2 = seriCity.filter((a) => {
                                if(a == newSeri){
                                    throw 'Seri đã được sử dụng cho đối tượng khác'
                                } 
                            })
                        }
                        },
                    },
                ]}
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
                    Thêm Seri
                </Button>
            </Form.Item>
            
        </Form>
    );
};


