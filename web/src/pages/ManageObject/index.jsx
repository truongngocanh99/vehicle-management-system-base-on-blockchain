import React, { useState, useEffect } from 'react';
import {
    Card,
    Table,
    Input,
    Row,
    Col,
    Typography,
    Divider,
    Badge,
    Button,
    Select,
    DatePicker,
    Space,
    Modal,
    Tag,
    message
} from 'antd';
import { useHistory } from 'umi';
import { PageContainer } from '@ant-design/pro-layout';
import axios from 'axios';
import moment from 'moment';
import { PlusOutlined } from '@ant-design/icons';
import {fetchCurrentUser} from '@/helpers/Auth'
import { DEFAULT_HOST } from '@/host';
import _ from 'lodash'; 
moment.locale('en');
const { Search } = Input;
import ObjectForm from './components/ObjectForm';
import AddNewSeri from './components/AddNewSeri';
import { createArrayTypeNode } from 'typescript';
import ChangeSeri from './components/ChangeSeri'

export default () => {
    const [formVisible, setFormVisible] = useState(false);
    const [objectData, setObjectData] = useState([]);
    const [cities, setCities] = useState([]);
    const [cityOption,setCityOption] = useState("cantho");
    const [changeSeri, setChangeSeri] = useState({
        isChange : false
    })
    const [editObject, setEditObject] = useState({
        visible: false,
    });
    const [deleteCarType, setDeleteCarType] = useState(false);
    const [tloading, setTloading] = useState(true);
    const [searchField, setSearchField] = useState('seri');
    const user = fetchCurrentUser();
    const config = {
        headers: {
            Authorization: 'Bearer ' + user.token,
        },
    };

    useEffect(() => {
        const f = async () => {
            setTloading(true);
            const url=  DEFAULT_HOST + '/object/' + cityOption ;
            const result = await axios.get(url, config);
            setObjectData(result.data);
            setTloading(false);
        };
        f();
    }, [editObject, formVisible,cityOption,deleteCarType,changeSeri]);
   
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
   
    const handleSearch = async (value) => {
        setTloading(true);
        const objects = await getObjects();
        if (typeof objects !== 'undefined') {
            const searchResult = objects.filter(object => {
                return object[searchField].includes(value);
            })
            setObjectData(searchResult);
            setTloading(false);
        }
    }
    const getObjects = async () => {
        const url = DEFAULT_HOST + '/object/' + cityOption ;
            try {
                const result = await axios.get(url, config);
                return result.data;
            } catch (error) {
                
            }
    }
    function handleChange(value) {
        setCityOption(value);
      }
      const  handleDeleteClick = async (record) => {
        setTloading(true);
        const id= record.id;
        const url_delete = DEFAULT_HOST + '/object/' +id ;
        const result = await axios.delete(url_delete, config);
        setDeleteCarType(true);
        if(result){
            setTloading(false);
            message.success("X??a th??nh c??ng");

        }

    }  



    const columns = [
        {
            title: 'Lo???i xe',
            key: 'carType',
            dataIndex: 'carType',
            render: (text, record) => {
                if(record.carType.Record){return record.carType.Record.name}
                else return record.carType.name
            },
        },
        {
            title: 'Seri hi???n t???i',
            render:(text,record)=>{
                return <Tag color="#87d068"> {record.seri[record.currentseri_Index]}</Tag>
            }
        },
        {
            title: 'K?? hi???u seri',
            key: 'seri',
            dataIndex: 'seri',
            render: (text, record) => {
                const array_seri = _.split(record.seri,",");
                return array_seri.map((num, index) => {
                    if(record.count[index]>=5){
                        return (
                        <div>
                            <Tag color="red">{num}({record.count[index]})</Tag>
                        </div>
                        )
                    }
                    else{
                        return (
                            <div>
                                <Tag color="blue">{num}({record.count[index]})</Tag>
                            </div>
                            )
                    }
                });
                
            },
        },
        {
            title: 'Thao t??c',
            render: (text, record) => {
                    return(
                        <div>
                        <Button type="primary" onClick={() => setEditObject({visible: true, object: record})}>Th??m seri</Button> &nbsp;
                        <Button type='danger' onClick={() => handleDeleteClick(record)}>X??a</Button>&nbsp;
                        <Button type='default' onClick={() => setChangeSeri({isChange: true, object :record})}>Chuy???n seri</Button>
                        </div>
                    ) 
            },
        },
    ];

    return (
        <PageContainer>
            <Card>
                <Row gutter={1}>
                    <Col span={8}>
                        <Search
                            placeholder="T??m ki???m theo seri"
                            allowClear
                            enterButton="T??m ki???m"
                            size="middle"
                            onSearch={handleSearch}
                        />
                    </Col>
                    <Col offset={6} span={6}>
                        <Select
                            defaultValue="cantho"
                            value={cityOption}
                            placeholder="Ch???n th??nh ph???"
                            style={{ width: '100%' }}
                            onChange={handleChange}
                        >
                            {cities.map((city) => (
                                <option key={city.id} value={city.id}>{city.name}</option>
                            ))}
                        </Select>
                    </Col>
                   
                    <Col  span={4}>
                        <Space style={{ float: 'right' }}>
                            <Button
                                type="primary"
                                style={{ float: 'right' }}
                                onClick={() => setFormVisible(true)}
                            >
                                <PlusOutlined />
                                Th??m ?????i t?????ng
                            </Button>
                        </Space>
                    </Col>
                </Row>
                <Divider></Divider>



                <Table loading={tloading} dataSource={objectData} columns={columns}></Table>
            </Card>
            <Modal
                centered
                title="Th??m ?????i t?????ng"
                visible={formVisible}
                footer={null}
                onCancel={() => setFormVisible(false)}
                destroyOnClose
                width={600}
            >
                <ObjectForm disable={() => setFormVisible(false)} />
            </Modal>
            <Modal
                centered
                title="Th??m Seri M???i"
                visible={editObject.visible}
                footer={null}
                onCancel={() => setEditObject({ ...editObject, visible: false })}
                destroyOnClose
            >
                <AddNewSeri  disable={()=> setEditObject(false)} edit={editObject.object} />
            </Modal>
            <Modal
                bodyStyle={{ height: 200 }}
                width={200}
                centered
                visible={changeSeri.isChange}
                footer={null}
                onCancel={() => setChangeSeri({ ...changeSeri, isChange: false })}
                destroyOnClose
            >
                <ChangeSeri disable={()=> setChangeSeri(false)} change={changeSeri.object} />
            </Modal>
        </PageContainer>
    );
};