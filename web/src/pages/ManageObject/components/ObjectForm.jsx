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
    const [seriCity,setSeriCity] = useState(["0"]);
    const [existCT,setExistCT] = useState([]);
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
      useEffect(()=>{
        const r = async () => {
            const url=  DEFAULT_HOST + '/object/getSeriCity/' +cityOption;
            const result = await axios.get(url, config);
            setSeriCity(result.data)
        };
        r()
    },[cityOption])
    useEffect(()=>{
        const x = async () => {
            const url=  DEFAULT_HOST + '/object/isExist/' +cityOption;
            const result = await axios.get(url, config);
            setExistCT(result.data)
        };
        x()
    },[cityOption])
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
                label='T???nh th??nh ????ng k??'
                wrapperCol= {{span:20, offset:2}}
                rules={[{ required: true, message: 'Vui l??ng ch???n t???nh th??nh' }]}
            >
               <Select
                    placeholder="Ch???n t???nh th??nh ????ng k??"
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
                label='Lo???i xe ????ng k??'
                wrapperCol= {{span:20, offset:3}}
                rules={[{ required: true, message: 'Vui l??ng ch???n lo???i xe ????ng k??' },
                        {   validator: async (rule, carType) => {
                                if(carType){
                                    let seri2 = existCT.filter((a) => {
                                        if(a == carType){
                                            throw 'Lo???i xe n??y ???? ???????c ????ng k??'
                                        } 
                                    })
                                }
                                },
                            },
                ]}
            >
               <Select
                    placeholder="Ch???n lo???i xe ????ng k??"
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
                label="K?? hi???u seri"
                wrapperCol= {{span:20}}
                rules={[{ required: true, message: 'Vui l??ng nh???p seri' },
                {   validator: async (rule, newSeri) => {
                        if(seri){
                            let seri2 = seriCity.filter((a) => {
                                if(a == seri){
                                    throw 'Seri ???? ???????c s??? d???ng'
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
                    placeholder="V?? d???:A, B..."
                    notFoundContent={null}
                    onChange={setSeri}
                ></Select>
            </Form.Item>
       
            <Form.Item wrapperCol={{ offset: 8 }}>
                <Button type="primary" htmlType="submit" loading={loading}>
                    Th??m ?????i t?????ng
                </Button>
            </Form.Item>
            
        </Form>
    );
};


