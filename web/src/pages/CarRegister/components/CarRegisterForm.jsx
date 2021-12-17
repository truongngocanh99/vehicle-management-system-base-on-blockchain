import React, { useContext, useEffect, useState } from 'react';
import { Card, Form, Input, DatePicker, InputNumber, Button, Result, Modal, Space, Select, Steps, Divider } from 'antd';
import { LoadingOutlined, FormOutlined, UserOutlined, FileTextOutlined, CarFilled, CheckCircleFilled } from '@ant-design/icons';
import { DEFAULT_HOST } from '@/host';
import axios from 'axios';
import { REGISTRATION_FIELD } from './Constants'

const {Step} = Steps

import { fetchCurrentUser, logout } from '@/helpers/Auth';


export default (props) => {
    const [successModalVisible, setSucessModalVisible] = useState(false);
    const [ cities, setCities] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [carType, setCarType] = useState([]);
    const [tx, setTx] = useState({});
    const [posting, setPosting] = useState(false);
    const [cityPicked, setCityPicked] = useState(false);
    const { reload } = props;
    const auth = fetchCurrentUser()
    const config = {
        headers: {
            Authorization: `Bearer ${auth.token}`,
        },
    };

    useEffect(() => {
        const c = async () => {
            setCities(await getCity());
        }
        const o = async () => {
            setCarType(await getCarType());
        }
        c();
        o();
    }, [])


    const getCity = async () => {
        try {
            const url = DEFAULT_HOST + '/city';
            const result = await axios.get(url, config);
            return result.data;
        } catch (error) {
            console.log(error);
        }
    };
    const getCarType = async () => {
        try {
            const url = DEFAULT_HOST + '/carType';
            const result = await axios.get(url, config);
            return result.data;
        } catch (error) {
            console.log(error);
        }
    };
    const fetchDistrict = async (cityId) => {
        try {
            const url = DEFAULT_HOST + `/city/${cityId}/district`;
            const result = await axios.get(url, config);
            // console.log(result.data);
            setDistricts(result.data);
        } catch (error) {
            console.log(error);
        }
    };


    const formFinish = async (values) => {
        const url = `${DEFAULT_HOST}/cars/`;
        values.year = values.year.year();
        try {
            const result = await axios.post(url, values, config);
            setPosting(false);
            if (result.data.success && result.data.result.TxID) {
                // console.log(result.data)
                await setTimeout(()=> setTx(result.data.result, 3000));
                setSucessModalVisible(true);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const checkChassisNumber = async (rule, chassisNumber) => {
        try {
            const url = `${DEFAULT_HOST}/cars/checkChassisNumber?cn=${chassisNumber}`;
            const result = await axios.get(url, config);
            if (!result.data.valid) throw new Error('69');
        } catch (error) {
            if (error.message === '69') throw 'Số khung đã được đăng ký';
        }
    };

    const checkEngineNumber = async (rule, engineNumber) => {
        try {
            const url = `${DEFAULT_HOST}/cars/checkEngineNumber?en=${engineNumber}`;
            const result = await axios.get(url, config);
            if (!result.data.valid) throw new Error('69');
        } catch (error) {
            if (error.message === '69') throw 'Số máy đã được đăng ký';
        }
    };

    return (
        <Card title={props.title}>
            <Steps current={1} style={{paddingBottom: "30px",}}>
                <Step icon={<CheckCircleFilled />} title="Bước 1" description="Đăng ký tài khoản"/>
                <Step icon={<CarFilled />} title="Bước 2" description="Kê khai thông tin"/>
                <Step icon={<FileTextOutlined />} title="Bước 3" description="Chuẩn bị giấy tờ"/>
                <Step icon title="Bước 4" description="Đến trụ sở đăng ký"/>
                <Step icon title="Bước 5" description="Hoàn thành"/>
            </Steps>
            <Form
                autoComplete="off"
                labelAlign="left"
                labelCol={{ span: 8}}
                wrapperCol={{ span: 20 }}
                onFinish={formFinish}
                onFinishFailed={() => setPosting(false)}
            >
                <Form.Item
                    label={REGISTRATION_FIELD.BRAND.LABEL}
                    name={REGISTRATION_FIELD.BRAND.NAME}
                    rules={[{ required: true, message: 'Hãng sản xuất không được bỏ trống' }]}
                >
                    <Input disabled={posting} placeholder="VD: Vinfast..." />
                </Form.Item>
                <Form.Item
                    label={REGISTRATION_FIELD.MODEL.LABEL}
                    name={REGISTRATION_FIELD.MODEL.NAME}
                    rules={[{ required: true, message: 'Mẫu không được bỏ trống' }]}
                >
                    <Input disabled={posting} placeholder="VD: Lux SA2.0" />
                </Form.Item>
                <Form.Item
                    label={REGISTRATION_FIELD.COLOR.LABEL}
                    name={REGISTRATION_FIELD.COLOR.NAME}
                    rules={[{ required: true, message: 'Màu sơn không được bỏ trống' }]}
                >
                    <Input disabled={posting} placeholder="VD: Đen, Xám..." />
                </Form.Item>
                <Form.Item
                    label={REGISTRATION_FIELD.YEAR.LABEL}
                    name={REGISTRATION_FIELD.YEAR.NAME}
                    rules={[{ required: true, message: 'Chọn năm sản xuất' }]}
                >
                    <DatePicker disabled={posting} picker="year" placeholder="Chọn năm" />
                </Form.Item>
                <Form.Item
                    label={REGISTRATION_FIELD.CAPACITY.LABEL}
                    name={REGISTRATION_FIELD.CAPACITY.NAME}
                    rules={[
                        { required: true, message: 'Nhập dung tích xe' },
                        { type: 'number', message: 'Dung tích không hợp lệ' },
                    ]}
                >
                    <InputNumber disabled={posting} />
                </Form.Item>
                <Form.Item
                    name="registeredCity"
                    label="Tỉnh, thành đăng ký"
                    rules={[{ required: true, message: 'Vui lòng chọn tỉnh, thành đăng ký' }]}
                    wrapperCol={{ span: 18 }}
                >
                    <Select
                        options={cities.map((city) => {
                            return {
                                label: city.name,
                                value: city.id,
                            };
                        })}
                        onSelect={(value) => {
                            fetchDistrict(value);
                            setCityPicked(true);
                        }}
                    ></Select>
                </Form.Item>
                <Form.Item
                    name="registeredDistrict"
                    label="Quận/huyện"
                    rules={[{ required: true, message: 'Vui lòng chọn quận, huyện đăng ký' }]}
                    wrapperCol={{ span: 18 }}
                >
                    <Select
                        disabled={!cityPicked}
                        options={districts.map((district) => {
                            return {
                                label: district.districtName,
                                value: district.id,
                            };
                        })}
                    ></Select>
                </Form.Item>
                <Form.Item
                    label={REGISTRATION_FIELD.CAR_TYPE.LABEL}
                    name={REGISTRATION_FIELD.CAR_TYPE.NAME}
                    rules={[{ required: true, message: 'Vui lòng chọn loại xe đăng ký' }]}
                    wrapperCol={{ span: 18}}
                >
                    <Select
                        options={carType.map((carType) => {
                            return {
                                label: carType.name,
                                value: carType.id,
                            };
                        })}
                    ></Select>
                </Form.Item>
                <Form.Item
                    label={REGISTRATION_FIELD.CHASSIS_NUMBER.LABEL}
                    name={REGISTRATION_FIELD.CHASSIS_NUMBER.NAME}
                    hasFeedback
                    rules={[
                        { validator: checkChassisNumber },
                        { required: true, message: 'Nhập số khung' },
                    ]}
                >
                    <Input disabled={posting} placeholder="Số khung" />
                </Form.Item>
                <Form.Item
                    label={REGISTRATION_FIELD.ENGINE_NUMBER.LABEL}
                    name={REGISTRATION_FIELD.ENGINE_NUMBER.NAME}
                    hasFeedback
                    rules={[
                        { validator: checkEngineNumber },
                        { required: true, message: 'Nhập số máy' },
                    ]}
                >
                    <Input disabled={posting} placeholder="Số máy" />
                </Form.Item>
                <Form.Item wrapperCol={{ offset: 6, span: 6 }}>
                    <Button
                        style={{ width: '100%', overflow: 'visible' }}
                        htmlType="submit"
                        type="primary"
                        loading={posting}
                        onClick={() => setPosting(true)}
                    >
                        Đăng ký
                    </Button>
                </Form.Item>
            </Form>
            <Modal
                visible={successModalVisible}
                onCancel={() => {
                    setSucessModalVisible(false);
                    reload();
                }}
                footer={null}
            >
                <Result
                    status="success"
                    title="Đăng ký thành công"
                    subTitle={'Mã đăng ký: ' + tx.regId}
                ></Result>
            </Modal>
        </Card>
    );
};
