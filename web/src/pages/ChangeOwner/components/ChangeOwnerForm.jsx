import React, { useContext, useState, useEffect } from 'react';
import { Form, Input, Select, Option, Spin, Button, Modal, Result, Divider, Typography, Space, } from 'antd';
import { DEFAULT_HOST } from '@/host';
import axios from 'axios';

import { fetchCurrentUser } from '@/helpers/Auth';


export default () => {
    const [selectLoading, setSelectLoading] = useState(true);
    const [buttonLoading, setButtonLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [cancelled, setCancelled] = useState(false);
    const [error, setError] = useState(false);
    const [newOwner, setNewOwner] = useState({});
    const [isPending, setPending] = useState(false);
    const [deal, setDeal] = useState({});
    const [options, setOptions] = useState([]);
    const [form] = Form.useForm();
    const [initLoading, setInitLoading] = useState(true);

    const [load, setReload] = useState(0);

    const auth = fetchCurrentUser();

    const config = {
        headers: {
            Authorization: `Bearer ${auth.token}`,
        },
    };

    const reload = () => setReload(load + 1);

    useEffect(() => {
        const f = async () => {
            const userId = auth.id;
            const url = `${DEFAULT_HOST}/users/${userId}/cars/transferring`;
            try {
                const result = await axios.get(url, config);
                // alert(JSON.stringify(result.data));
                if (result.data.length > 0) {
                    setDeal(result.data[0].Record);
                    form.setFieldsValue({
                        carId: result.data[0].Record.carId,
                        newOwnerId: result.data[0].Record.newOwner.id,
                        newOwnerName: result.data[0].Record.newOwner.fullName,
                        newOwnerPhoneNumber: result.data[0].Record.newOwner.phoneNumber,
                        newOwnerAddress: result.data[0].Record.newOwner.address,
                        // newOwnerAddress: result.data[0].Record.newOwner.address
                    });
                    setNewOwner(result.data[0].Record.newOwner);
                    setPending(true);
                    setInitLoading(false);
                } else {
                    form.resetFields();
                    setPending(false);
                    setInitLoading(false);
                    setButtonLoading(false);
                }
            } catch (error) {
                console.log(error);
            }
        };
        if (!modalVisible) f();
    }, [modalVisible, load]);

    useEffect(() => {
        setInitLoading(true);
        const f = async () => {
            const userId = auth.id;
            const url = `${DEFAULT_HOST}/users/${userId}/cars/registered`;
            if (options.length === 0) {
                try {
                    const result = await axios.get(url, config);
                    if (result.data.length > 0) {
                        const opts = result.data.map((element) => {
                            const label = `${element.brand} ${element.model} - ${element.registrationNumber}`;
                            return { label, value: element.id };
                        });
                        setOptions(opts);
                        setInitLoading(false);
                    } else {
                        console.log("Kh??ng c?? d??? li???u")
                        setSelectLoading(false);
                        setInitLoading(false);
                    }
                } catch (error) {
                    setButtonLoading(false);
                }
            }
        };
        f();
    }, [load]);

    useEffect(() => {
        if (options.length > 0) {
            setSelectLoading(false);
            setInitLoading(false);
        }
    }, [options]);

    const handleFormFinish = async (value) => {
        const newOwnerId = value.newOwnerId;
        const validateUrl = `${DEFAULT_HOST}/users/validateChangeOwner?id=${newOwnerId}`;
        try {
            const validRes = await axios.get(validateUrl, config);
            if (validRes.data.valid) {
                const postUrl = `${DEFAULT_HOST}/cars/${value.carId}/transferOwnership`;
                const body = {
                    newOwner: validRes.data.newOwnerId,
                };
                const result = await axios.post(postUrl, body, config);
                if (typeof result.data.TxID !== 'undefined') {
                    setModalVisible(true);
                } else {
                    setError(true);
                    setButtonLoading(false);
                }
            } else {
                setError(true);
                setButtonLoading(false);
            }
        } catch (error) {
            setError(true);
            setButtonLoading(false);
        }
    };

    const handleCancel = async () => {
        setButtonLoading(true);
        const url = DEFAULT_HOST + '/cars/transfer/' + deal.id + '/rejectTransfer';
        try {
            const result = await axios.post(url, {}, config);
            if (result.data.success) setCancelled(true);
            else setButtonLoading(false);
        } catch (error) {
            console.log(error);
        }
    };

    return initLoading ? (
        <Spin spinning={true} style={{ alignItems: 'center' }}></Spin>
    ) : (
        <Form
            labelAlign="left"
            autoComplete="off"
            labelCol={{ span: 9, offset: 1 }}
            wrapperCol={{ span: 13 }}
            layout="horizontal"
            onFinish={handleFormFinish}
            onFinishFailed={() =>
                setTimeout(function () {
                    setButtonLoading(false);
                }, 1500)
            }
            form={form}
        >
            <Form.Item
                label="Xe c???n chuy???n"
                name="carId"
                rules={[{ required: true, message: 'Ch???n xe c???n chuy???n' }]}
            >
                <Select
                    loading={selectLoading}
                    options={options}
                    notFoundContent={
                        <Result status='404' title="B???n ch??a ????ng k?? xe!">

                        </Result>
                    }
                    disabled={isPending}
                ></Select>
            </Form.Item>
            <Form.Item
                name="newOwnerId"
                label="ID ng?????i nh???n"
                rules={[{ required: true, message: 'Nh???p ID ng?????i nh???n' }]}
            >
                <Input disabled={isPending}></Input>
            </Form.Item>
            {isPending ? (
                <>
                    <Divider orientation='left'>Th??ng tin ng?????i nh???n</Divider>
                    <Form.Item name='newOwnerName' label='H??? v?? t??n'>
                        <Input readOnly></Input>
                    </Form.Item>
                    <Form.Item name='newOwnerPhoneNumber' label='S??? ??i???n tho???i'>
                        <Input readOnly></Input>
                    </Form.Item>
                    <Form.Item name='newOwnerAddress' label='?????a ch???'>
                        <Input readOnly></Input>
                    </Form.Item>
                </>
            ) : null}
            <Form.Item wrapperCol={{ offset: 0, span: 23 }}>
                <Space style={{float: 'right'}}>
                    <Button
                        type="primary"
                        disabled={isPending}
                        loading={buttonLoading}
                        onClick={() => setButtonLoading(true)}
                        htmlType="submit"
                        style={{ float: 'right' }}
                    >
                        {isPending ? '??ang ?????i ng?????i nh???n x??c nh???n' : 'G???i'}
                    </Button>
                    {isPending ? (
                        <Button
                            type="primary"
                            onClick={handleCancel}
                            danger
                            loading={buttonLoading}
                            style={{ float: 'right' }}
                        >
                            H???y y??u c???u
                        </Button>
                    ) : null}
                </Space>
            </Form.Item>
            <Modal
                visible={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    reload();
                    setButtonLoading(false);
                }}
                footer={null}
            >
                <Result
                    status="success"
                    title={'Th??nh c??ng'}
                    subTitle={`???? g???i y??u c???u ?????n ng?????i d??ng c?? ID ${form.getFieldValue('newOwnerId')}`}
                ></Result>
            </Modal>
            <Modal
                visible={error}
                onCancel={() => setError(false)}
                onOk={() => setError(false)}
                okText="Th???c hi???n l???i"
            >
                <Result
                    status="error"
                    title={'Th???t b???i'}
                    subTitle={`Sai th??ng tin ng?????i nh???n`}
                ></Result>
            </Modal>
            <Modal
                visible={cancelled}
                onCancel={() => {
                    setCancelled(false);
                    reload();
                }}
                footer={null}
            >
                <Result
                    status="success"
                    title={'Th??nh c??ng'}
                    subTitle={`???? h???y y??u c???u chuy???n quy???n s??? h???u xe`}
                ></Result>
            </Modal>
        </Form>
    );
};