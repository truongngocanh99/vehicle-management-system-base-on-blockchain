import React, { useState, useCallback } from 'react';
import { Card, Table, Input, Row, Col,message, Divider,Result, Badge, Button, Select, DatePicker, Space } from 'antd';
import { useHistory } from 'umi';
import { PageContainer } from '@ant-design/pro-layout';
import { AuditOutlined, SwapOutlined, SelectOutlined, BarChartOutlined } from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';
import Modal from 'antd/lib/modal/Modal';
moment.locale('en');

const {RangePicker} = DatePicker;

import Complete from './components/CompleteRegistration';
import ConFirm from './components/ConFirmRegistration';
import Information from './components/CitizenInfomation';
import TransferComfirm from './components/TransferConfirm';
import ThongKe from './components/thongke';

import { fetchCurrentUser } from '@/helpers/Auth';
import { DEFAULT_HOST } from '@/host';
import { useEffect } from 'react';

const { Search } = Input;
const { Option } = Select;

export default () => {
    const [data, setData] = useState([]);
    const [tloading, setTloading] = useState(false);
    const [ownerInfo, setOwnerInfo] = useState({});
    const [complete, setComplete] = useState({
        registration: {},
        visible: false,
    });
    const [confirm, setConFirm]= useState(false);
    const [loading,setLoading] = useState(false);
    const [search, setSeach] = useState({field: 'id'});
    const [thongke, setThongke] = useState(false);
    const [success,setSuccess] = useState(false);
    const [transfer, setTransfer] = useState({
        deal: {
            currentOwner: {},
            newOwner: {},
            car: {}
        },
    });
    const history = useHistory();
    const auth = fetchCurrentUser();
    const config = {
        headers: {
            Authorization: 'Bearer ' + auth.token,
        },
    };
    const [range, setRange] = useState({});

    useEffect(() => {
        fetchData();
    }, [complete, transfer,confirm]);


    const handleComplete = (registration) => {
        setComplete({
            registration: registration,
            visible: true
        });
    };
    const handleConfirm = async (registration) => {
        setLoading(true)
        const url = DEFAULT_HOST + '/cars/' + registration.id + '/acceptRegistration';
        try{
            const result = await axios.put(url, {}, config);
            if(result){
                setLoading(false);
                setConFirm(true);
                setSuccess(true);
                message.success("???? HO??N TH??NH ????NG K??");
            } else{
                alert("????ng k?? th???t b???i!")
                setLoading(false);
            }
            
        }catch(error){
            console.log(error);
        }
    };

    const handleOwnerClick = (owner) => {
        setOwnerInfo({
            ...owner,
            visible: true,
        });
    };

    const onSelectField = (value) => {
        setSeach({
            ...search,
            field: value,
        })
    }

    const handleSearch = async (value) => {
        if(value =="") return fetchData();
        setTloading(true)
        const temp = await getData(value);
        setData(temp);
        setTloading(false);
    } 

    const handleTransferClick = async (registration) => {
        const url = DEFAULT_HOST + '/cars/' + registration.id + '/transferDeal';
        try {
            const result = await axios.get(url, config);
            const deal = result.data;
            setTransfer({
                deal,
                visible: true
            });
        } catch (error) {
            console.log(error);
        }
    }

    const columns = [
        {
            title: 'M?? ????ng k??',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'Bi???n s???',
            dataIndex: 'registrationNumber',
            key: 'registrationNumber',
            render: (text, record) => {
                if (text === 'none') return "Ch??a c??"
                return text;
            },
        },
        {
            title: 'Ch??? s??? h???u',
            dataIndex: 'owner',
            key: 'owner',
            render: (text, record) => {
                return (
                    <a type="link" onClick={() => handleOwnerClick(record.owner)}>
                        {record.owner.fullName}
                    </a>
                );
            },
        },
        {
            title: 'H??ng xe',
            dataIndex: 'brand',
            key: 'brand',
        },
        {
            title: 'Ki???u xe',
            dataIndex: 'model',
            key: '',
        },
        {
            title: 'T??nh tr???ng ????ng k??',
            dataIndex: 'registrationState',
            key: 'registrationState',
            filters: [
                {text: '???? ????ng k??', value: 'registered'},
                {text: '??ang ?????i ki???m tra', value: 'pending'},
                {text: '??ang chuy???n quy???n s??? h???u', value: 'transferring_ownership'},
                {text: '???? h???y', value: 'rejected'}
            ],
            onFilter: (value, record) => record.registrationState.includes(value),
            render: (state) => {
                if (state === 'transferring_ownership')
                    return <Badge color="orange" text="??ang chuy???n quy???n s??? h???u"></Badge>;
                if (state === 'pending')
                    return <Badge color="blue" text="??ang ?????i ki???m tra"></Badge>;
                if (state === 'registered') return <Badge color="green" text="???? ????ng k??"></Badge>;
                if (state === 'rejected') return <Badge color="red" text="???? hu???"></Badge>;
            },
        },
        {
            title: 'Chi ti???t',
            render: (text, record) => {
                return (
                    <Button
                        type="default"
                        onClick={() => history.push('/police/read-registration/' + record.id)}
                        style={{width:100}}
                    >
                        <SelectOutlined />
                    </Button>
                );
            },
        },
        {
            title: null,
            render: (text, record) => {
                if (record.registrationState === 'registered' || record.registrationState === 'rejected') return null;
                if (record.registrationState === 'transferring_ownership')
                    return (
                        <Button
                            type="default"
                            style={{ backgroundColor: 'orange', color: 'white' }}
                            onClick={() => handleTransferClick(record)}
                        >
                            <SwapOutlined />
                        </Button>
                    );
                else {
                    if(record.modifyType == 8) {
                        return (
                                <Button type="primary" loading={loading} onClick={() => handleConfirm(record)}>
                                X??? l?? h??? s??
                            </Button>
                            
                            
                        );
                    }
                    else
                    return (
                        <Button type="primary" onClick={() => handleComplete(record)}>
                            Duy???t h??? s??
                        </Button>
                    );

                }
                    
            },
            width: 0
        },
    ];

    const fetchData = async () => {
        setTloading(true);
        try {
            const cars = await getData();
            if (cars.length === 0) {
                setTloading(false);    
                return
            };
            setData(() => {
                return cars.map((car) => {
                    return car;
                });
            });
            setTloading(false);
        } catch (error) {
            console.log(error);
            setTloading(false)
        }
    };

    const getData = async (searchValue) => {
        let url = DEFAULT_HOST + '/cars/by_city';
        if (searchValue) {
            url = `${url}?${search.field}=${searchValue}`
        }
        try {
            const result = await axios.get(url, config);
            return result.data;
        } catch (error) {
            console.log(error);
        }
    }

    const handleListed = async () => {
        setTloading(true);
        const dataa = await getData();
        const newDate = dataa.filter(cars => {
            const regDate = new Date(cars.registrationTime).setUTCHours(0,0,0,0);
            return regDate >= range.start && regDate <=  range.end;
        });
        setData(newDate);
        setTloading(false);
    };

    const handleRangeDate = (value) => {
        if (value == null) {
            fetchData();
            return;
        }
        if (value[0])
            setRange({
                ...range,
                start: new Date(value[0]._d).setUTCHours(0, 0, 0, 0)
            })
        if (value[1])
            setRange({
                ...range,
                end: new Date(value[1]._d).setUTCHours(0, 0, 0, 0)
            });
    };

    return (
        <PageContainer>
            <Card>
                <Row gutter={1}>
                    <Col span={3}>
                        <Select defaultValue='id' placeholder="T??m ki???m b???ng" style={{ width: '100%' }} onSelect={onSelectField}>
                            <Option value="id">M?? ????ng k??</Option>
                            <Option value="registrationNumber">Bi???n s??? xe</Option>
                            <Option value="ownerName">T??n ng?????i ????ng k??</Option>
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
                        <Space style={{float: 'right'}} >
                            <RangePicker onCalendarChange={handleRangeDate}></RangePicker>
                            <Button type='primary' onClick={handleListed}>Li???t k??</Button>
                        </Space>
                    </Col>
                </Row>
                <Divider></Divider>
                <Table columns={columns} dataSource={data} loading={tloading}></Table>
            </Card>
            <Complete
                visible={complete.visible}
                disable={() => setComplete({ ...complete, visible: false })}
                registration={complete.registration}
            ></Complete>
            {/* <ConFirm
                visible={confirm.visible}
                disable={() => setConFirm({ ...confirm, visible: false })}
                registration={confirm.registration}
            ></ConFirm> */}
            <Information
                visible={ownerInfo.visible}
                onCancel={() => {
                    setOwnerInfo({ ...ownerInfo, visible: false });
                }}
                user={ownerInfo}
            ></Information>
            <TransferComfirm
                visible={transfer.visible}
                disable={() => setTransfer({ ...transfer, visible: false })}
                deal={transfer.deal}
            ></TransferComfirm>
            <ThongKe visible={thongke} disable={() => setThongke(false)}></ThongKe>
        </PageContainer>
    );
};
