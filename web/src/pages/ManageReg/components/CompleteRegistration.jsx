import React from 'react';
import { Modal, Steps } from 'antd';
import { IdcardFilled,CarOutlined,AuditOutlined, CheckCircleFilled,ScheduleOutlined, CheckOutlined } from '@ant-design/icons';
import { useState } from 'react';

import OwnerForm from './OwnerInfomation'
import RegFrom from './CarRegisterForm';
import BookForm from './Booking'
import { useEffect } from 'react';

const { Step } = Steps;

const step = {
    check: 'Kiểm tra xe',
    generateNumber: 'Kiểm tra thông tin người đăng ký',
    booking: 'Xếp lịch xử lí',
};


export default ({ visible, disable, registration }) => {
    const [currentTitle, setCurrentTitle] = useState(step.check);
    const [currentStep, setCurrentStep] = useState(0);
    const [back,setBack] = useState(false);

    const nextStep = () => {
        setCurrentStep(currentStep + 1);
    }
    const backStep = () => {
        setCurrentStep(currentStep - 1);
    }
    const content = () => {
        if (currentStep === 0) return <RegFrom disable={disable} registration={registration} nextStep={nextStep}></RegFrom>;
        if (currentStep === 1) return <OwnerForm disable={disable} registrationId={registration.id} owner={registration.owner} nextStep={nextStep}backStep={backStep}></OwnerForm>;
        if (currentStep === 2) return <BookForm disable={disable} registrationId={registration.id}  backStep={backStep}></BookForm>;
    }

    return (
        <Modal
            afterClose={() => setCurrentStep(0)}
            onCancel={() => disable()}
            visible={visible}
            width={800}
            title="Duyệt hồ sơ"
            footer={null}
            style={{ top: 20 }}
            destroyOnClose={true}
        >
            <Steps style={{ paddingLeft: '20px', paddingRight: '20px', paddingTop:'20px'}} current={currentStep}>
                <Step icon={<CarOutlined />} title="Kiểm tra xe"></Step>
                <Step icon={<IdcardFilled />} title="TT chủ sở hữu"></Step>
                <Step icon={<ScheduleOutlined />} title="Xếp lịch xử lý"></Step>
            </Steps>
            {content()}
        </Modal>
    );
};
