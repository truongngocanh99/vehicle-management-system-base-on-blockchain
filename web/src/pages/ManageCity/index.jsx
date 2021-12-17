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
import CityForm from './components/CityForm';

export default () => {
    const [formVisible, setFormVisible] = useState(false);
    const [cityData, setCityData] = useState([]);
    const [editCity, setEditCity] = useState({
        visible: false,
    });
    const [tableLoading, setTableLoading] = useState(false);
    const [searchField, setSearchField] = useState('phoneNumber');
    const [tloading, setTloading] = useState(true);
    const user = fetchCurrentUser();
    const config = {
        headers: {
            Authorization: 'Bearer ' + user.token,
        },
    };

    useEffect(() => {
        const f = async () => {
            const cities = await fetchCity();
            setCityData(cities);
            setTloading(false);
        };
        f();
    }, [editCity, formVisible]);
    const handleChangeSearchType = (value) => {
        setSearchField(value);
    }

    const handleSearch = async (value) => {
        setTableLoading(true);
        const cities = await fetchCity();
        if (typeof cities !== 'undefined') {
            const searchResult = cities.filter(city => {
                return city[searchField].includes(value);
            })
            setCityData(searchResult);
            setTableLoading(false);
        }
    }
    const fetchCity = async () => {
        try {
            setTloading(true);
            const url = DEFAULT_HOST + '/city';
            const result = await axios.get(url, config);
            return result.data;
        } catch (error) {
            console.log(error);
        }
    };
    const columns = [
        {
            title: 'Tên tỉnh, thành',
            key: 'name',
            dataIndex: 'name',
            width:150
        },
        {
            title: 'Số hiệu biển số',
            width:350,
            key: 'number',
            dataIndex: 'number',
            render: (text, record) => {
                const array_number = _.split(record.number,",")
                return array_number.map((num) => {
                    return <Tag>{num}</Tag>;
                });
            },
        },
        {
            title: 'Địa chỉ trụ sở',
            key: 'departmentAddress',
            dataIndex: 'departmentAddress',
            width:350,
        },
        {
            title: 'Chỉnh sửa',
            render: (text, record) => {
                return <Button type="link" onClick={() => setEditCity({visible: true, city: record})}>Chỉnh sửa</Button>;
            },
        },
    ];

    return (
        <PageContainer>
            <Card>
                <Row gutter={1}>
                    <Col span={3}>
                        <Select
                            placeholder="Tìm kiếm bằng"
                            style={{ width: '100%' }}
                            onChange={handleChangeSearchType}
                        >
                            <Option value="number">Số hiệu</Option>
                            <Option value="name">Tên tỉnh thành</Option>
                        </Select>
                    </Col>
                    <Col span={8}>
                        <Search
                            placeholder="Nội dung tìm kiếm"
                            allowClear
                            enterButton="Tìm kiếm"
                            size="middle"
                            onSearch={handleSearch}
                        />
                    </Col>
                    <Col offset={5} span={8}>
                        <Space style={{ float: 'right' }}>
                            <Button
                                type="primary"
                                style={{ float: 'right' }}
                                onClick={() => setFormVisible(true)}
                            >
                                <PlusOutlined />
                                Thêm tỉnh, thành
                            </Button>
                        </Space>
                    </Col>
                </Row>
                <Divider></Divider>
                <Table loading={tableLoading} dataSource={cityData} columns={columns}></Table>
            </Card>
            <Modal
                width={500}
                centered
                title="Thêm tỉnh, thành phố"
                visible={formVisible}
                footer={null}
                onCancel={() => setFormVisible(false)}
                destroyOnClose
            >
                <CityForm disable={() => setFormVisible(false)} />
            </Modal>
            <Modal
                width={500}
                centered
                title="Chỉnh sửa tỉnh, thành phố"
                visible={editCity.visible}
                footer={null}
                onCancel={() => setEditCity({ ...editCity, visible: false })}
                destroyOnClose
            >
                <CityForm disable={()=> setEditCity(false)} edit={editCity.city} />
            </Modal>
        </PageContainer>
    );
};