import React, { useState, useCallback, useEffect } from 'react';
import {Card, Tabs, Form, Input, Col, Row, Space} from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import { fetchCurrentUser } from '@/helpers/Auth';
import {LineChartOutlined,AreaChartOutlined,BarChartOutlined,PieChartOutlined,UserAddOutlined,TeamOutlined,ReconciliationOutlined,CarOutlined} from '@ant-design/icons'
import axios from 'axios';
import { DEFAULT_HOST } from '@/host';
import './index.less'
import AnalysisChart from './components/AnalysisChart';
export default () => {
    const user = fetchCurrentUser();
    const config = {
        headers: {
            Authorization: 'Bearer ' + user.token,
        }
    }
    const [totalUser, setTotalUser] = useState();
    const [userMonth, setUserMonth] = useState();
    const [totalCar, setTotalCar] = useState();
    const [carMonth,setCarMonth] = useState();
    const [carPending,setCarPending] = useState();
    const [carRegistered, setCarRegistered] = useState();
    const [carRejected, setCarRejected] = useState();
    const [carTransfer, setCarTransfer] = useState();
    useEffect (() =>{
        const f = async() =>{
         const url = DEFAULT_HOST +'/users/by_city';
         const url2 =  DEFAULT_HOST +'/users/CityAndMonth';
         const url3 = DEFAULT_HOST + '/cars/by_city';
         const url4 = DEFAULT_HOST + '/cars/CityAndMonth';
         const url5 = DEFAULT_HOST + '/cars/CityAndMonth_Pending';
         const url6 = DEFAULT_HOST + '/cars/CityAndMonth_Registered';
         const url7 = DEFAULT_HOST + '/cars/CityAndMonth_Rejected';
         const url8 = DEFAULT_HOST + '/cars/CityAndMonth_Transfer';
         
         try {
            const result = await axios.get(url,config);
            setTotalUser(result.data.length);
            const result2 = await axios.get(url2,config);
            setUserMonth(result2.data.length);
            const result3 = await axios.get(url3,config);
            setTotalCar(result3.data.length)
            const result4 = await axios.get(url4,config);
            setCarMonth(result4.data.length)
            const result5 = await axios.get(url5,config);
            setCarPending(result5.data.length)
            const result6 = await axios.get(url6,config);
            setCarRegistered(result6.data.length);
            const result7 = await axios.get(url7,config);
            setCarRejected(result7.data.length);
            const result8 = await axios.get(url8,config);
            setCarTransfer(result8.data.length);
            
 
         } catch (error) {
             console.log(error);
         }

        }
        f();
    },[]);
    return (
        <PageContainer>
            <Space direction="vertical">
               
                <Card title="Thống kê đăng ký xe" >
                    <Row>
                        <Col span={7} className="tk3" >
                      
                       
                            <div className="image_tk" > 
                            <ReconciliationOutlined />
                            </div>
                            <div className="text_tk">
                                <b>{totalCar}</b>
                                <p>Đăng ký xe trong hệ thống</p>
                                  
                            </div>   
                            
                        </Col>
                        <Col span={7} className="tk4" offset={1} >
                            <div className="image_tk" > 
                                <CarOutlined />
                            </div>
                            <div className="text_tk">
                                <b>{carMonth}</b>
                                <p>Đăng ký xe trong tháng</p>
                            </div>
                                
                        </Col>
                        <Col span={7} className="tk5" offset={1}>
                            <div className="image_tk" > 
                                <PieChartOutlined />
                            </div>
                            <div className="text_tk">
                                <b>{carPending}</b>
                                <p>Đăng ký xe đang đợi xử lý  </p>
                            </div>
                                    
                        </Col>
                        <Col span={7} className="tk6">
                        <div className="image_tk" > 
                            <BarChartOutlined />
                             </div>
                            <div className="text_tk">
                                <b>{carRegistered}</b>
                                <p>Đăng ký xe đã hoàn thành  </p>
                            </div>
                            
                            
                        </Col>
                        <Col span={7} className="tk7" offset={1}> 
                            <div className="image_tk" > 
                                <AreaChartOutlined />
                             </div>
                            <div className="text_tk">
                                <b>{carRejected}</b>
                                <p>Đăng ký xe đã bị hủy</p>
                            </div>  
                           
                        </Col>
                        <Col span={7} className="tk8" offset={1}>
                            <div className="image_tk" > 
                                <LineChartOutlined />
                             </div>
                        <div className="text_tk">
                                <b>{carTransfer}</b>
                                <p>Đăng ký chuyển sở hữu  </p>
                            </div>
                            
                        </Col>
                    </Row>
                   
                    <AnalysisChart></AnalysisChart>
                   
                    
                </Card>
                <Card title="Thống kê người dùng" >
                    <Row >
                        <Col span={11} className="tk1">
                        <div className="image_tk" > 
                            <TeamOutlined />
                             </div>
                        <div className="text_tk_user">
                            <b>{totalUser}</b>
                            <p>Người dùng trong hệ thống  </p>
                        </div>
                           
                        </Col>
                        <Col span={11} className="tk2" offset={1}>
                        <div className="image_tk" > 
                            <UserAddOutlined />
                             </div>
                        <div className="text_tk_user">
                                <b>{userMonth}</b>
                                <p>Người dùng mới đăng ký trong tháng  </p>
                            </div>
                           
                        </Col>
                    </Row>
                    
              
                </Card>
            </Space>
              
              

        </PageContainer>
    );
}