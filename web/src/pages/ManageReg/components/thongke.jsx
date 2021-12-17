import React from 'react';
import {Button} from 'antd';
import axios from 'axios';
import Modal from 'antd/lib/modal/Modal';

export default ({visible, disable}) => {
    return (
        <Modal width='1000px' visible={visible} onCancel={disable} footer={null} title="Thống kê đăng ký xe">
            
        </Modal>
    );
}