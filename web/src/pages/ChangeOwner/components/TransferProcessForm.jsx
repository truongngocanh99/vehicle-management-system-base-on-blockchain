import React, { useContext, useState, useEffect } from 'react';
import { Card, Descriptions , Button, Typography, Divider, Modal, Result, Alert, Input, Form} from 'antd';
import { SwapOutlined } from '@ant-design/icons'
import { DEFAULT_HOST } from '@/host';
import path from 'path';
import axios from 'axios';
import moment from 'moment'

import {DESCRIPTION_LABEL} from '../../RegisteredCar/components/Constants'
import { fetchCurrentUser } from '@/helpers/Auth';
import { all } from '@umijs/deps/compiled/deepmerge';

const Title = <Typography.Text strong type='warning' ><SwapOutlined /> Xác nhận chuyển quyền sở hữu xe</Typography.Text>


export default ({request, reload}) => {
    const [car, setCar] = useState({});
    const [carOnwer, setCarOnwer] = useState({});
    const [confirming, setConfirming] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [reject, setReject] = useState(false);
    const auth = fetchCurrentUser();
    
    const config = {
        headers: {
            Authorization: `Bearer ${auth.token}`,
        },
    };
    // alert(JSON.stringify(request));
   
    useEffect(() => {
        const f = async () => {
            const getCarUrl = DEFAULT_HOST + path.join('/cars', request.carId);
            try {
                const result = await axios.get(getCarUrl, config);
                if(result.data.Key) setCar(result.data.Record);
                
            } catch (error) {
                console.log(error);
            }
        }
        f();
    }, []);
    
    useEffect(() => {
        const f = async () => {
            const getCarOwnerUrl = DEFAULT_HOST + path.join('/users', request.currentOwner);
            try {
                const result = await axios.get(getCarOwnerUrl, config);
                setCarOnwer(result.data.Record);
                if(result.data.Key) form.setFieldsValue(result.data.Record);
            } catch (error) {
                console.log(error);
            }
        }
        if(car.id) f();
    }, [car])

    const rejectTransfer = async ()  => {
        setConfirming(true);
       
        const rejectUrl = DEFAULT_HOST + path.join('/cars', 'transfer', request.id, 'rejectTransfer');
        try {
            const result = await axios.post(rejectUrl, {}, config);
            if (result.data.success) {
                setModalVisible(true);
                setReject(true);
            }
            else {
                setConfirming(false);
                setReject(true);
            }
        } catch (error) {
            setConfirming(false)
            console.log(error)
        }
    }
    const handleConfirm = async () => {
        setConfirming(true);
        const confirmUrl = DEFAULT_HOST + path.join('/cars', 'transfer', request.id, 'approveTransfer');
        try {
            const result = await axios.post(confirmUrl, {}, config);
            if (result.data.success) {
                setModalVisible(true);
            }
            else {
                setConfirming(false);
            }
        } catch (error) {
            setConfirming(false)
            console.log(error)
        }
    }


    return (
        <Card title={Title} style={{ alignItems: 'center' }}>
            <p>
                Anh(Chị) có một yêu cầu chuyển quyền sở hữu xe đến từ {carOnwer.fullName}, xem kỹ thông tin
                trước khi xác nhận.
            </p>
            <br />
            <Descriptions column={{ xs: 1, md: 1 }} bordered={true}>
                <Descriptions.Item label={DESCRIPTION_LABEL.REGISTRATION_DATE}>
                    {moment(car.registrationTime).locale('en').format('D/MM/YYYY, hh:mm:ss A')}
                </Descriptions.Item>
                <Descriptions.Item label={DESCRIPTION_LABEL.BRAND}>{car.brand}</Descriptions.Item>
                <Descriptions.Item label={DESCRIPTION_LABEL.MODEL}>{car.model}</Descriptions.Item>
                <Descriptions.Item label={DESCRIPTION_LABEL.COLOR}>{car.color}</Descriptions.Item>
                <Descriptions.Item label={DESCRIPTION_LABEL.YEAR}>{car.year}</Descriptions.Item>
                <Descriptions.Item label={DESCRIPTION_LABEL.CAPACITY}>
                    {car.capacity}
                </Descriptions.Item>
                <Descriptions.Item label={DESCRIPTION_LABEL.CHASSIS_NUMBER}>
                    {car.chassisNumber}
                </Descriptions.Item>
                <Descriptions.Item label={DESCRIPTION_LABEL.ENGINE_NUMBER}>
                    {car.engineNumber}
                </Descriptions.Item>
                <Descriptions.Item label={DESCRIPTION_LABEL.REGISTRATION_NUMBER}>
                    {car.registrationNumber}
                </Descriptions.Item>
                <Descriptions.Item label={'Chủ xe hiện tại'}>
                    <Form form={form} labelCol={{span: 9}}>
                        <Form.Item name="fullName" label="Họ và tên">
                            <Input readOnly></Input>
                        </Form.Item>
                        <Form.Item name="phoneNumber" label="Số điện thoại">
                            <Input readOnly></Input>
                        </Form.Item>
                        <Form.Item name="address" label="Địa chỉ">
                            <Input readOnly></Input>
                        </Form.Item>
                    </Form>
                </Descriptions.Item>
            </Descriptions>
            <br />
            {request.state === 0 ? (
                <>
                    <Button
                        type="primary"
                        style={{ float: 'right', margin: 5 }}
                        loading={confirming}
                        onClick={handleConfirm}
                    >
                        Đồng ý nhận xe
                    </Button>
                    <Button type="primary" danger 
                            style={{ float: 'right', margin: 5 }}
                            loading={confirming}
                            onClick={rejectTransfer}>
                        Hủy bỏ
                    </Button>
                </>
            ) : (
                <Alert
                    type="success"
                    message={reject ? (`Yêu cầu chuyển quyền sở hữu xe đã bị hủy`) :(`Đã chấp nhận sang tên`)}
                    description={reject ? (` `) :(`Vui lòng đến trụ sở CSGT tại nơi đăng ký để hoàn tất thủ tục và nhận giấy đăng ký xe`)}
                ></Alert>
            )}
            <Modal
                visible={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    reload();
                }}
                footer={null}
            >
                <Result
                    status="success"
                    title={'Thành công'}
                    subTitle={reject ? (`Hủy thành công`) :(`Đến trụ sở CSGT tại nơi đăng ký để xác nhận thông tin và nhận giấy tờ xe mới`)}
                ></Result>
            </Modal>
        </Card>
    );
}