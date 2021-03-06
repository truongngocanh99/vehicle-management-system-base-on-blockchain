import React, { useState, useCallback } from 'react';
import { Card, Table, Input, Row, Col, Typography, Divider, Badge, Button, Select, Space, Modal, Tag, Popover, Descriptions } from 'antd';
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

const {Search} = Input

export default () => {
    const [pageLoading, setPageLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [editModal, setEditModal] = useState(false);
    const [registerModal, setRegisterModal] = useState(false);
    const [tableLoading, setTableLoading] = useState(false);
    const [editRow, setEditRow] = useState({});
    const [searchField, setSearchField] = useState('phoneNumber');
    const user = fetchCurrentUser();
    const config = {
        headers: {
            Authorization: 'Bearer ' + user.token,
        }
    }
    useEffect(() => {
        const f = async () => {
            const users = await getUsers();
            setUsers(users);
            setPageLoading(false);
        }
        f();
    }, [editModal, registerModal])

    const handleEditClick = (record) => {
        setEditRow(record);
        setEditModal(true);
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
        const url = DEFAULT_HOST + '/users/by_city';
            try {
                const result = await axios.get(url, config);
                return result.data;
            } catch (error) {
                
            }
    }

    const columns = [
        {
            title: "T??n ng?????i d??ng",
            dataIndex: 'fullName',
            key: 'fullName',
        },
        {
            title: "S??? ??i???n tho???i",
            dataIndex: 'phoneNumber',
            key: 'phoneNumber',
            ellipsis: true,
        },
        {
            title: "?????a ch???",
            dataIndex: 'address',
            key: 'address',
        },{
          title: "X??c th???c",
          render: (text, record) => {
              if (!record.verified) return <Tag color="warning">Ch??a x??c th???c</Tag>;
              else
                  return (
                      <Popover title="Ng?????i x??c th???c" content={
                          (<Descriptions size='small' style={{width: "400px"}} column={1} bordered> 
                              <Descriptions.Item label="H??? v?? t??n">{record.verifyPolice.fullName}</Descriptions.Item>
                              <Descriptions.Item label="ID">{record.verifyPolice.id}</Descriptions.Item>
                          </Descriptions>)
                      }>
                          <Tag color="success">???? x??c th???c</Tag>
                      </Popover>
                  )
          }
        },
        {
            title: "Thao t??c",
            render: (text, record) => {
                if (!record.verified)
                    return <Button type='default' onClick={() => handleEditClick(record)}>X??c th???c ngay</Button>
                else
                    return <Button type='default' onClick={() => handleEditClick(record)}>Chi ti???t</Button>
            }
        }
    ]

    return (
        <PageContainer loading={pageLoading}>
            <Card>
                <Row gutter={1}>
                    <Col span={3}>
                        <Select onChange={handleChangeSearchType} placeholder="T??m ki???m b???ng" style={{ width: '100%' }}>
                            <Select.Option value="phoneNumber">S??? ??i???n tho???i</Select.Option>
                            <Select.Option value="identityCardNumber">S??? CMND</Select.Option>
                            <Select.Option value="fullName">H??? v?? t??n</Select.Option>
                            <Select.Option value="id">ID</Select.Option>
                        </Select>
                    </Col>
                    <Col span={8}>
                        <Search
                            placeholder="N???i dung t??m ki???m"
                            allowClear
                            enterButton="T??m ki???m"
                            size="middle"
                            onSearch={handleSearch}
                        />
                    </Col>
                    <Col offset={5} span={8}>
                        <Space style={{ float: 'right' }}>
                            <Button type="primary" style={{ float: 'right' }} onClick={() => setRegisterModal(true)}>
                                <PlusOutlined />
                                Th??m ng?????i d??ng
                            </Button>
                        </Space>
                    </Col>
                </Row>
                <Divider></Divider>
                <Table tableLayout='fixed' loading={tableLoading} columns={columns} dataSource={users}></Table>
            </Card>
            <Modal
                width={650}
                visible={editModal}
                footer={null}
                onCancel={() => setEditModal(false)}
                title={editRow.verified ? "Chi ti???t ng?????i d??ng" : "X??c th???c ng?????i d??ng"}
                destroyOnClose
                centered
            >
                <EditFrom onCancel={() => setEditModal(false)} defaultValue={editRow} />
            </Modal>
            <Modal
                width={550}
                footer={null}
                visible={registerModal}
                title="Th??m ng?????i d??ng"
                onCancel={() => setRegisterModal(false)}
                destroyOnClose
                centered
            >
                <RegisterForm policeId={user.id}></RegisterForm>
            </Modal>
        </PageContainer>
    );
}