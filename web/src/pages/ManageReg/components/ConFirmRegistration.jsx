import React from 'react';
import { Modal, Steps } from 'antd';
import { IdcardFilled,AuditOutlined, CheckCircleFilled, CheckOutlined } from '@ant-design/icons';
import { useState } from 'react';

import Success from './Success';

import { useEffect } from 'react';

const { Step } = Steps;


export default ({ visible, disable, registration }) => {
    return (
        // <Modal
        //     onCancel={() => disable()}
        //     visible={visible}
        //     width={500}
        //     title="Xử lý hồ sơ"
        //     footer={null}
        //     style={{ top: 20 }}
        //     destroyOnClose={true}
        // >
        //     <Success regId={registration.id}/>
        // </Modal>
        <Success regId={registration.id}/>
    );
};