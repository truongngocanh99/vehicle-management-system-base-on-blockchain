import React, { useState, useCallback } from 'react';
import { Card, Table, Input, Row, Col, Typography, Divider, Badge, Button, Select, Space, Modal, Tag } from 'antd';
import { useHistory } from 'umi';
import { PageContainer } from '@ant-design/pro-layout';
import { PlusOutlined} from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';
import { useEffect } from 'react';
import { fetchCurrentUser } from '@/helpers/Auth';
import { DEFAULT_HOST } from '@/host';

import EditFrom from './Components/EditFrom';
import RegisterForm from '../Landing/Components/RegisterFrom'

const {Search} = Input;

const ROLE_LABEL = {
    police: "CSGT",
    citizen: "Công dân"
}

export default () => {
    const [pageLoading, setPageLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [editModal, setEditModal] = useState(false);
    const [registerModal, setRegisterModal] = useState(false);
    const [editRow, setEditRow] = useState({});
    const [tableLoading, setTableLoading] = useState(false);
    const [searchField, setSearchField] = useState('phoneNumber');
    const user = fetchCurrentUser();
    const config = {
        headers: {
            Authorization: 'Bearer ' + user.token,
        }
    }
    useEffect(() => {
        const f = async () => {
            const url = DEFAULT_HOST + '/users';
            try {
                const result = await axios.get(url, config);
                console.log(result.data);
                setUsers(result.data);
                setPageLoading(false);
            } catch (error) {
                
            }
        }
        f();
    }, [editModal, registerModal])

    const handleEditClick = (record) => {
        setEditRow(record);
        setEditModal(true);
    }

    const handleFormFinish = (value) => {
        
    }
    const handleChangeSearchType = (value) => {
        setSearchField(value);
    }
    const handleSearch = async (value) => {
        setTableLoading(true);
        const users = await getUsers();
        if (typeof users !== 'undefined') {
            const searchResult = users.filter(user => {
                return user[searchField].includes(value);
            })
            setUsers(searchResult);
            setTableLoading(false);
        }
    }
    const getUsers = async () => {
        const url = DEFAULT_HOST + '/users';
            try {
                const result = await axios.get(url, config);
                return result.data;
            } catch (error) {
                
            }
    }
    const columns = [
        {
            title: "Tên người dùng",
            dataIndex: 'fullName',
            key: 'fullName',
            ellipsis: true,
            width:150
        },
        {
            title: "Số điện thoại",
            dataIndex: 'phoneNumber',
            key: 'phoneNumber',
            ellipsis: true,
            width:130
        },
        {
            title: "Địa chỉ",
            dataIndex: 'address',
            key: 'address',
            width:300
        },
        {
            title: "Vai trò",
            dataIndex: 'role',
            width:90,
            key: 'role',
            render: (text, record) => {
                return ROLE_LABEL[text];
            }
        },
        {
          title: "Xác thực",
          width:150,
          render: (text, record) => {
                if (!record.verified)
                    return <Tag color='warning'>Chưa xác thực</Tag>
                else
                    return <Tag color='success'>Đã xác thực</Tag>
          }  
        },
        {
            title: "Thao tác",
            width:150,
            render: (text, record) => {
                if (!record.verified)
                    return <Button type='link' onClick={() => handleEditClick(record)}>Xác thực ngay</Button>
                else
                    return <Button type='link' onClick={() => handleEditClick(record)}>Chỉnh sửa</Button>
            }
        }
    ]

    return (
        <PageContainer loading={pageLoading}>
            <Card>
                <Row gutter={1}>
                    <Col span={3}>
                        <Select onChange={handleChangeSearchType} placeholder="Tìm kiếm bằng" style={{ width: '100%' }}>
                            <Select.Option value="phoneNumber">Số điện thoại</Select.Option>
                            <Select.Option value="identityCardNumber">Số CMND</Select.Option>
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
                            <Button type="primary" style={{ float: 'right' }} onClick={() => setRegisterModal(true)}>
                                <PlusOutlined />
                                Thêm người dùng
                            </Button>
                        </Space>
                    </Col>
                </Row>
                <Divider></Divider>
                <Table loading={tableLoading} columns={columns} dataSource={users}></Table>
            </Card>
            <Modal
                visible={editModal}
                footer={null}
                onCancel={() => setEditModal(false)}
                title={editRow.verified ? "Chỉnh sửa người dùng" : "Xác thực người dùng"}
                destroyOnClose
                centered
            >
                <EditFrom onCancel={() => setEditModal(false)} defaultValue={editRow} />
            </Modal>
            <Modal
                footer={null}
                visible={registerModal}
                title="Thêm người dùng"
                onCancel={() => setRegisterModal(false)}
                destroyOnClose
                centered
            >
                <RegisterForm admin policeId={user.id}></RegisterForm>
            </Modal>
        </PageContainer>
    );
}