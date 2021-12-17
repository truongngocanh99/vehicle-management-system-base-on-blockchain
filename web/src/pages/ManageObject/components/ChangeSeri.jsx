import React, { useState, useEffect } from 'react';
import { Form, Select, Input, Button, Checkbox, Space, Card, Typography, Divider, Radio, message} from 'antd';
import { PlusOutlined, CloseCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import { DEFAULT_HOST } from '@/host';
import {fetchCurrentUser} from '@/helpers/Auth'
import _ from 'lodash'; 
import FormItem from 'antd/lib/form/FormItem';
import { SpaceContext } from 'antd/lib/space';
const useForm = Form.useForm;

export default ({change,disable}) => {
    const [series, setSeri] = useState([]);
    const [seriOption, setSeriOption]= useState();
    const [loading, setLoading] = useState(false);
    const user = fetchCurrentUser();
    const config = {
        headers: {
            Authorization: 'Bearer ' + user.token,
        }
    }
    const [form] = useForm();
    useEffect( () => {
        const url = DEFAULT_HOST + '/object/getSeri/' + change.id;
        const s = async() =>{
            const result = await axios.get(url,config);
        setSeri(result.data);
        }
        s();
    },[])
    function handleChange(value) {
        console.log(value);
        setSeriOption(value);
      }
    const formFinish = async (value) => {
        setLoading(true);
        try {
            const url2 = DEFAULT_HOST + '/object/changeSeri/' + change.id;
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
    
    return (
        <Form
            labelCol={{ span: 8 }}
            labelAlign="left"
            onFinish={formFinish}
            form={form}
        >   
            <Form.Item
                name='seriIndex'
                wrapperCol= {{span:20}}
                rules={[{ required: true, message: 'Vui lòng chọn seri' }]}
            >
                <Select   
                    value={seriOption}
                    placeholder="Chọn Seri"
                    style={{ width: '100%' }}
                    onChange={handleChange}
                >
                    {series.map((seri,index) => (
                        <option key={index} value={index}>{seri}</option>
                    ))}
                </Select>
            </Form.Item>
            <FormItem></FormItem>

            <Form.Item wrapperCol= {{span:20}}>
                
                <Button type="primary" htmlType="submit" loading={loading}>
                    Xác Nhận
                </Button>
            </Form.Item>
            
        </Form>
    );
};


