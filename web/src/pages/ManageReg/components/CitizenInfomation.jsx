import React from 'react';
import { Card, Descriptions, Modal  } from 'antd';
import moment from 'moment';
import './style.css';

const label = {
    fullName: "Họ và tên",
    dateOfBirth: "Ngày sinh",
    identityCardNumber: "Số CMND",
    phoneNumber: 'Số điện thoại',
    address: 'Địa chỉ',
    createTime: 'Ngày đăng ký'
}

export const OwnerInfo = ({ user }) => {
    return (
        <Descriptions bordered column={1}>
            <Descriptions.Item label={label.fullName}>{user.fullName}</Descriptions.Item>
            <Descriptions.Item label={label.dateOfBirth}>{user.dateOfBirth}</Descriptions.Item>
            <Descriptions.Item label={label.identityCardNumber}>
                {user.identityCardNumber}
            </Descriptions.Item>
            <Descriptions.Item label={label.phoneNumber}>{user.phoneNumber}</Descriptions.Item>
            <Descriptions.Item label={label.address}>{user.address}</Descriptions.Item>
            <Descriptions.Item label={label.createTime}>
                {moment(user.createTime).locale('en').format('D/MM/YYYY, hh:mm:ss A')}
            </Descriptions.Item>
        </Descriptions>
    );
};

export default (props) => {
    const { user } = props;

    return (
        <Modal visible={props.visible} onCancel={props.onCancel} footer={null} width={800}>
            <Card title='Thông tin người đăng ký'>
               <OwnerInfo user={user}></OwnerInfo>
            </Card>
        </Modal>
    )
}