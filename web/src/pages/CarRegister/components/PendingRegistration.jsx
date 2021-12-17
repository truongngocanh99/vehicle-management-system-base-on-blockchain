import React, {useState} from 'react';
import { Card, Descriptions, Typography, Button, Divider, Modal, Result, Popconfirm, Steps} from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import { LoadingOutlined, FormOutlined, UserOutlined, FileTextOutlined, CarFilled, CheckCircleFilled } from '@ant-design/icons';
import moment from 'moment';
import { REGISTRATION_FIELD } from './Constants';
import axios from 'axios';
import { DEFAULT_HOST } from '@/host';
import { fetchCurrentUser } from '@/helpers/Auth';

const {Step} = Steps;

const title = (
    <Typography.Text style={{ color: 'blue' }}>
        <CalendarOutlined twoToneColor="yellow" /> Đăng ký đang chờ đăng kiểm và xét duyệt
    </Typography.Text>
);
const label = (text) => {
    return <Typography.Text strong>{text}</Typography.Text>;
};
const defaultModal = {
    success: false,
    error: false,
};
export default ({ registration, reload }) => {
    const [modal, setModal] = useState(defaultModal);
    const [loading, setLoading] = useState(false);
    const {
        brand,
        model,
        color,
        year,
        capacity,
        engineNumber,
        chassisNumber,
        createTime,
        id,
        registeredCity,
        registeredDistrict,
        carType
    } = registration;
    console.log(registration);
    const user = fetchCurrentUser();
    const config = {
        headers: {
            Authorization: 'Bearer ' + user.token,
        },
    };

    if (typeof registration === 'undefined') return <Card></Card>;
    const registrationDate = moment(createTime).locale('en').format('D/MM/YYYY, hh:mm:ss');

    const handleCancel = async () => {
        setLoading(true);
        const url = DEFAULT_HOST + '/cars/' + id + '/rejectRegistration';
        try {
            const result = await axios.put(url, {}, config);
            setModal({
                ...modal,
                success: true,
            });

        } catch (error) {
            console.log(error);
            setModal({
                ...modal,
                error: true,
            });
        }
    };

    return (
        <Card title={title}>
            <Steps current={2} style={{paddingBottom: "30px",}}>
                <Step icon={<CheckCircleFilled />} title="Bước 1" description="Đăng ký tài khoản"/>
                <Step icon={<CheckCircleFilled />} title="Bước 2" description="Kê khai thông tin"/>
                <Step icon={<FileTextOutlined />} title="Bước 3" description="Chuẩn bị giấy tờ"/>
                <Step icon title="Bước 4" description="Đến trụ sở đăng ký"/>
                <Step icon title="Bước 5" description="Hoàn thành"/>
            </Steps>
            <Descriptions column={1} bordered>
                <Descriptions.Item label={label(REGISTRATION_FIELD.REG_ID.LABEL)}>
                    {id}
                </Descriptions.Item>
                <Descriptions.Item label={label(REGISTRATION_FIELD.REGISTRATION_DATE.LABEL)}>
                    Ngày {registrationDate}
                </Descriptions.Item>
                <Descriptions.Item label={label(REGISTRATION_FIELD.BRAND.LABEL)}>
                    {brand}
                </Descriptions.Item>
                <Descriptions.Item label={label(REGISTRATION_FIELD.MODEL.LABEL)}>
                    {model}
                </Descriptions.Item>
                <Descriptions.Item label={label(REGISTRATION_FIELD.COLOR.LABEL)}>
                    {color}
                </Descriptions.Item>
                <Descriptions.Item label={label(REGISTRATION_FIELD.YEAR.LABEL)}>
                    {year}
                </Descriptions.Item>
                <Descriptions.Item label={label(REGISTRATION_FIELD.CAPACITY.LABEL)}>
                    {capacity}
                </Descriptions.Item>
                <Descriptions.Item label={label(REGISTRATION_FIELD.CAR_TYPE.LABEL)}>
                    {carType?carType.name : null}
                </Descriptions.Item>
                <Descriptions.Item label={label(REGISTRATION_FIELD.CHASSIS_NUMBER.LABEL)}>
                    {chassisNumber}
                </Descriptions.Item>
                <Descriptions.Item label={label(REGISTRATION_FIELD.ENGINE_NUMBER.LABEL)}>
                    {engineNumber}
                </Descriptions.Item>
                <Descriptions.Item label={label("Tỉnh, thành đăng ký")}>
                    {registeredCity?registeredCity.name : null}
                </Descriptions.Item>
                <Descriptions.Item label={label("Quận/huyện")}>
                    {registeredDistrict?registeredDistrict.districtName : null}
                </Descriptions.Item>
            </Descriptions>
            <Divider></Divider>
            <Popconfirm onConfirm={handleCancel} cancelText='Hủy' okText="Có" title="Bạn có chắc muốn hủy bỏ đăng ký?">
                <Button type="primary" loading={loading} danger style={{ float: 'right' }}>
                    Huỷ bỏ đăng ký
                </Button>
            </Popconfirm>
            <Modal visible={modal.success} onCancel={() => {setModal(defaultModal); reload()}} footer={null}>
                <Result status='success' title="Hủy thành công" />
            </Modal>
        </Card>
    );
};
