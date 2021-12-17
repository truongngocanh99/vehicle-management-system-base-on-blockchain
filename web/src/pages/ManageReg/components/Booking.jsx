import React, { useState, useEffect } from 'react';
import { DatePicker,TimePicker,Form, Input, Button,Alert, Space,Typography,Result, Popconfirm, Divider,message } from 'antd';
import { DEFAULT_HOST } from '@/host';
import { fetchCurrentUser } from '@/helpers/Auth';
import axios from 'axios';
import 'moment/locale/en-au';
import locale from 'antd/es/date-picker/locale/vi_VN';
import Modal from 'antd/lib/modal/Modal';
import { useHistory } from 'react-router';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid' ;
import interactionPlugin from '@fullcalendar/interaction';
import moment from 'moment';
export default ({ registrationId, nextStep, backStep}) => {
    const [form] = Form.useForm();
    const [edit, setEdit] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [event, setEvent] = useState([]);
    const [eventLoad, setEventLoad] = useState(false);
    const [date, setDate] = useState();
    const user = fetchCurrentUser();
    const config = {
        headers: {
            Authorization: 'Bearer ' + user.token,
        },
    };
    useEffect(()=> {
        const urlEvent = DEFAULT_HOST + '/booking/getEventCalendar';
        const e = async() => {
            const result = await axios.get(urlEvent,config);
            setEvent(result.data);
            setEventLoad(true);
        }
        e();
    },[eventLoad]);
    const finish = async (value) => {
        setLoading(true);
        if(!edit){
        const url = DEFAULT_HOST + '/cars/' + registrationId + '/confirmRegistration';
        // try {
            const body = {
                date: date,
                timeType : value.timeType.format('hh:mm:ss')
            };
            const result = await axios.put(url, body, config);
            if (result.data.result=="success")setSuccess(true);
            if(result.data.result=="overload"){
                alert("Số lượng hồ sơ đã quá tải");
                setLoading(false);
            }
        // } catch (error) {
        //     console.log(error);
        //     alert('Lỗi không xác định!');
        // }
    } else{
        
        const url = DEFAULT_HOST + '/cars/' + registrationId + '/confirmRegistration_edit';
        try {
            const result = await axios.put(url, value, config);
            if (result){
                alert("Đã gửi yêu cầu cập nhật hồ sơ thành công");
                setLoading(false);
            } 
            else {
                setLoading(false);
                alert('Lỗi không xác định');
            }
        } catch (error) {
            console.log(error);
            setLoading(false);
            alert('Lỗi không xác định!!!!');
        }

        }
    };

  const handleDateClick = (date) => { 
    setDate(date.dateStr);
    message.info(`Bạn đã chọn ngày ${moment(date.dateStr,"YYYY-MM-DD").format("DD-MM-YYYY")}`);

  }
  return (
    <Form
            autoComplete="off"
            labelAlign="left"
            labelCol={{ span: 4, offset: 3 }}
            wrapperCol={{ span:18,offset:3}}
            style={{ marginTop: '30px' }}
            form={form}
            onFinish={finish}

        >
            
            {edit?(<Form.Item 
                name="content"
                label="Nội dung"
                rules={[{ required: true, message: 'Vui lòng nội dung cần cập nhật' }]}>
                <Input.TextArea placeholder="Nhập thông tin " rows={5}></Input.TextArea>
            </Form.Item>
            ):(
                <>
                {/* <Form.Item
                name="date"
                label="Ngày xử lý hồ sơ"
                rules={[{ required: true, message: 'Vui lòng nhập ngày xử lý hồ sơ' }]}
            >
                <DatePicker  locale={locale}></DatePicker>
            </Form.Item> */}
            <Form.Item>
            <FullCalendar
                    plugins={[ dayGridPlugin ,interactionPlugin]}
                    initialView="dayGridMonth"
                    weekends={false}
                    events={event}
                    dateClick={handleDateClick}
                    weekends={true}
                    hiddenDays={[0]}
                />
            </Form.Item>
                
                
            <Form.Item
                name="timeType"
                label="Chọn Giờ"
                rules={[{ required: true, message: 'Vui lòng chọn giờ' }]}
               
            >
                <TimePicker   width={200} locale={locale}></TimePicker>
            </Form.Item>          
            </>)
            }
            <Form.Item wrapperCol={{span: 18, offset: 3}}>
                {edit?(''):(
                    <Space style={{float: 'left'}}>
                            <Button type='primary' disabled={loading} onClick = {backStep} >Quay lại</Button>
                        </Space>
                )}
                
                <Space style={{float: 'right'}}>
                
                    {edit? (
                        <Space>
                            <Button type='primary' htmlType='submit' loading={loading}>Xác nhận</Button>
                            <Button type='danger' onClick = {() => {
                                setEdit(false);
                            }} >Trở về</Button>
                            
                        </Space>
                        
                    ):(
                        <div>
                        <Button type='default' disabled={loading} onClick={() => setEdit(true)}>Yêu cầu cập nhật hồ sơ</Button>
                        <Button type='primary' htmlType='submit' loading={loading}>Xác nhận lịch hẹn</Button>
                      
                        </div>
               
                        )

                    } 
                </Space>
            </Form.Item>
            <Modal visible={success} footer={null} onCancel={() => setSuccess(false)}>
                <Result
                    status="success"
                    title="Xếp lịch xử lý hồ sơ thành công"
                    subTitle="Đến văn phòng CSGT đúng lịch hẹn để xử lý hồ sơ"
                />
            </Modal>
            
        </Form>
        
    );
};
