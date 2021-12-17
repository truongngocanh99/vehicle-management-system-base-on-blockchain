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
    Tag
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
import CarTypeForm from './components/CarTypeForm';
import { createArrayTypeNode } from 'typescript';
import ButtonGroup from 'antd/lib/button/button-group';

export default () => {
    const [formVisible, setFormVisible] = useState(false);
    const [carTypeData, setCarTypeData] = useState([]);
    const [deleteCarType, setDeleteCarType] = useState(false);
    const [editCarType, setEditCarType] = useState({
        visible: false,
    });
    const [tloading, setTloading] = useState(true);
    const user = fetchCurrentUser();
    const config = {
        headers: {
            Authorization: 'Bearer ' + user.token,
        },
    };

    useEffect(() => {
        const f = async () => {
            setTloading(true);
            const url=  DEFAULT_HOST + '/carType/' ;
            const result = await axios.get(url, config);
            setCarTypeData(result.data);
            setTloading(false);
        };
        f();
    }, [editCarType, formVisible,deleteCarType]);
    const  handleDeleteClick = async (record) => {
        setTloading(true);
        const id= record.id;
        const url_delete = DEFAULT_HOST + '/carType/' +id ;
        const result = await axios.delete(url_delete, config);
        setDeleteCarType(true);
        if(result){
            setTloading(false);
            alert("Xóa thành công");

        }

    }
 
    const columns = [
        {
            title: 'ID',
            key: 'id',
            dataIndex: 'id',
            width:150
        },
        {
            title: 'Loại xe đăng ký',
            key: 'name',
            dataIndex: 'name',
            width:250
        },
        {
            title: 'Mô tả',
            key: 'description',
            dataIndex: 'description',
        },
        {
            title: 'Thao Tác',
            width:180,
            render: (text, record) => {
                return (
                    <div>
                       <Button type='primary' onClick={() => setEditCarType({visible:true,object: record})}>Sửa</Button> &nbsp;
                       <Button type='danger' onClick={() => handleDeleteClick(record)}>Xóa</Button>
                    </div>

                )  
                }  
        },
        
    ];

    return (
        <PageContainer>
            <Card>
                <Row gutter={1}>
                    <Col span={8}>
                        <Search
                            placeholder="Nội dung tìm kiếm"
                            allowClear
                            enterButton="Tìm kiếm"
                            size="middle"
                        />
                    </Col>
                   
                   
                    <Col offset={8} span={8}>
                        <Space style={{ float: 'right' }}>
                            <Button
                                type="primary"
                                style={{ float: 'right' }}
                                onClick={() => setFormVisible(true)}
                            >
                                <PlusOutlined />
                                Thêm đối tượng
                            </Button>
                        </Space>
                    </Col>
                </Row>
                <Divider></Divider>



                <Table loading={tloading} dataSource={carTypeData} columns={columns}></Table>
            </Card>
            <Modal
                centered
                title="Chỉnh sửa loại xe đăng kí"
                visible={editCarType.visible}
                footer={null}
                onCancel={() => setEditCarType({visible:false, ...editCarType})}
                destroyOnClose
            >
                <CarTypeForm disable ={() => setEditCarType(false)} defaultValue={editCarType.object} />
            </Modal>
            <Modal
                centered
                title="Thêm mới loại xe"
                visible={formVisible}
                footer={null}
                onCancel={() => setFormVisible(false)}
                destroyOnClose
            >
                <CarTypeForm disable={()=> setFormVisible(false)} /> 
            </Modal>
        </PageContainer>
    );
};

