// import React, { useState, useCallback } from 'react';
// import { Card, Table, Input, Row, Col, Divider, Button, Select, Space, Modal, Tag, DatePicker} from 'antd';
// import { PageContainer } from '@ant-design/pro-layout';
// import { PlusOutlined} from '@ant-design/icons';
// import axios from 'axios';
// import moment from 'moment';
// import { useEffect } from 'react';
// import { fetchCurrentUser } from '@/helpers/Auth';
// import { DEFAULT_HOST } from '@/host';
// import BookForm from './components/BookingForm'
// const {RangePicker} = DatePicker;


// const {Search} = Input

// export default () => {
//     const [data, setData] = useState([]);
//     const [pageLoading, setPageLoading] = useState(false);
//     const [detailRow, setDetailRow] = useState({});
//     const [detail,setDeTail] = useState(false);
//     const [range, setRange] = useState({});
//     const user = fetchCurrentUser();
//     const config = {
//         headers: {
//             Authorization: 'Bearer ' + user.token,
//         }
//     }
//     useEffect(() => {
//         fetchData();
//     }, [detail]);
//     const handleDetailClick = (record) => {
//         setDetailRow(record);
//         setDeTail(true);
//     }
//     const handleRangeDate = (value) => {
//         if (value == null) {
//             fetchData();
//             return;
//         }
//         if (value[0])
//             setRange({
//                 ...range,
//                 // start: new Date(value[0]).getTime()
//                 start: moment(value[0],"DD-MM-YYYY").toDate().getTime()
//             })
//         if (value[1])
//             setRange({
//                 ...range,
//                 end: moment(value[1],"DD-MM-YYYY").toDate().getTime()

//             });
//     };
   
//     const fetchData = async () => {
//         setPageLoading(true);
//         try {
//             const cars = await getData();
//             if (cars.length === 0) {
//                 setPageLoading(false);    
//                 return
//             };
//             setData(() => {
//                 return cars.map((car) => {
//                     return car;
//                 });
//             });
//             setPageLoading(false);
//         } catch (error) {
//             console.log(error);
//             setPageLoading(false)
//         }
//     };
//     const getData = async (searchValue) => {
//         let url = DEFAULT_HOST + '/booking/search_all';
//         if (searchValue) {
//             url = `${url}?date=${searchValue}`
//         }
//         try {
//             const result = await axios.get(url, config);
//             return result.data;
//         } catch (error) {
//             console.log(error);
//         }
//     }
//     const handleListed = async () => {
//         setPageLoading(true);
//         const data_range = await getData();
//         const newDate = data_range.filter(schedule => {
//             const regDate = moment(schedule.date, "DD-MM-YYYY").toDate().getTime();
//             return regDate >= range.start && regDate <=  range.end;
//         });
//         setData(newDate);
//         setPageLoading(false);
//     }; 
//     const columns = [
       
//         {
//             title: "Ngày",
//             dataIndex: 'date',
//             key: 'date',
//         },
//         {
//             title: "Số  hồ sơ",
//             dataIndex: 'currentNumber',
//             key: 'currentNumber',
//             ellipsis: true,
//         },
//         {
//             title: "Chi Tiết",
//             render: (text, record) => {
//                 return (
//                        <Button type='primary' onClick={() => handleDetailClick(record)}>Chi Tiết</Button>      
//                 )  
//             }  
//         }
//     ]
//     return (
//         <PageContainer >
//         <Card>
//                 <Row gutter={1}>
//                     <Col offset={15} span={8}>
//                         <Space style={{float: 'right'}} >
//                             <RangePicker onCalendarChange={handleRangeDate}></RangePicker>
//                             <Button type='primary' onClick={handleListed}>Liệt kê</Button>
//                         </Space>
//                     </Col>
                   
//                 </Row>
//                 <Divider></Divider>
                

//                 <Table  loading={pageLoading} dataSource={data} columns={columns}></Table>
//             </Card>
           
//             <Modal
//                 width={900}
//                 centered
//                 title={`Lịch hẹn trong ngày  ` + detailRow.date }
//                 visible={detail}
//                 footer={null}
//                 onCancel={() => setDeTail(false)}
//                 destroyOnClose
//             >
//                 <BookForm  initValue={detailRow} />
//             </Modal>
//         </PageContainer>
//     );
// }

import React, { useState, useCallback } from 'react';
import { Table,  Modal, Tag} from 'antd';
import axios from 'axios';
import moment from 'moment';
import { useEffect } from 'react';
import { fetchCurrentUser } from '@/helpers/Auth';
import { DEFAULT_HOST } from '@/host';
import { useHistory } from 'react-router';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid' ;
import interactionPlugin from '@fullcalendar/interaction';

export default () => {
    const [event, setEvent] = useState([]);
    const [eventLoad, setEventLoad] = useState(false);
    const [detail,setDetail] = useState(false);
    const user = fetchCurrentUser();
    const [pageLoading, setPageLoading] = useState(false);
    const [date,setDate]=useState();
    const [data, setData] = useState([]);
    const config = {
        headers: {
            Authorization: 'Bearer ' + user.token,
        }
    }

    useEffect(()=> {
        const urlEvent = DEFAULT_HOST + '/booking/getEventCalendar';
        const e = async() => {
            const result = await axios.get(urlEvent,config);
            setEvent(result.data);
            setEventLoad(true);
        }
        e();
    },[eventLoad]);
    const handleDateClick = (date) => { 
        setDate(date.dateStr);
        setDetail(true);
       
      }
      const columns = [
        {
            title: "ID",
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: "Giờ xử lí",
            dataIndex: 'timeType',
            key: 'timeType',
            render:(text,record) =>{
                return record.timeType +"," + moment(record.date, "YYYY-MM-DD").format("DD-MM-YYYY");
            }
        },
        {
            title: "Số thứ tự",
            dataIndex: 'ordinalNumber',
            key: 'ordinalNumber',
            width:50
        },
        {
            title: "Đối tượng xử lí",
            render:(text,record) =>{
                return record.carId.brand +" " + record.carId.model;
            }
        },
        {
            title: "Người đặt lịch",
            dataIndex: 'userId',
            key: 'userId',
        },
        {
            title: "Trạng thái",
            render: (text, record) => {
                if(record.status == 0){
                    return <Tag color="blue">Mới</Tag>
                }
                if(record.status == 1){
                    return <Tag color="green">Hoàn Thành</Tag>
                }
                else{
                    return <Tag color="red">Đã Hủy</Tag>
                }
                
            }
        }
    ]
    useEffect(()=> {
        setPageLoading(true);
        const url = DEFAULT_HOST + '/booking/' + date+'/booking' ;
        console.log("Url: ",url);
        const f = async() =>{
            const result = await axios.get(url,config);
            setData(result.data);

        };
        f();
        console.log(data);
        setPageLoading(false);

    },[date,detail]);
    const handleOk = () => {
        setDetail(false);
      };
    
      const handleCancel = () => {
        setDetail(false);
      };
    return (
        <div>
             <FullCalendar
                plugins={[ dayGridPlugin ,interactionPlugin]}
                initialView="dayGridMonth"
                weekends={false}
                events={event}
                dateClick={handleDateClick}
                weekends={true}
                hiddenDays={[0]}
                
            />
             <Modal
                title={'Chi tiết lịch hẹn ' + moment(date,"YYYY-MM-DD").format("DD-MM-YYYY")}
                visible={detail}
                onOk={handleOk} 
                onCancel={handleCancel}
                width={800}
        >
            <Table   dataSource={data} columns={columns}></Table>
            </Modal>
        </div>
       
    );
}