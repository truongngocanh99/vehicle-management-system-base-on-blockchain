import React, { useContext, useEffect, useState } from 'react';
import { DEFAULT_HOST } from '@/host';
import axios from 'axios';
import ReactDOM from 'react-dom';
import { Line } from '@ant-design/charts';
import { fetchCurrentUser, logout } from '@/helpers/Auth';


export default () => {
    const [data, setData] = useState([]);
    const user = fetchCurrentUser();
    const config = {
        headers: {
            Authorization: 'Bearer ' + user.token,
        },
    };
    const configChart = {
        data,
        xField: 'month',
        yField: 'value',
        seriesField: 'name',
        legend: {
          position: 'top',
        },
        smooth: true,
        // @TODO 后续会换一种动画方式
        animation: {
          appear: {
            animation: 'path-in',
            duration: 4000,
          },
        },
        width :700,
        color: ['#ab149e','#1979C9','#52c41a','#D62A0D','#FAA219'],
      };
    useEffect(()=> {
        const t = async () => {
            await dataTotal();
            await dataPending();
            await dataRegistered();
            await dataRejected();
            await dataTransfer();
        }
        
        t();
    },[]);
    const dataTotal= async () => {
        for ( var i=1; i<=12 ;i++){
            const totalUrl =`${DEFAULT_HOST}/cars/totalCar/` + i;
            const totalRS =  await axios.get(totalUrl,config);
            setData((data) => [...data, totalRS.data]);
        }
    }
    const dataPending = async () => {
        for ( var i=1; i<=12 ;i++){
            const pendingUrl =`${DEFAULT_HOST}/cars/carPending_month/` + i;
            const pendingRS =  await axios.get(pendingUrl,config);
            setData((data) => [...data, pendingRS.data]);
        }
    }
    const dataRejected = async () => {
        for ( var i=1; i<=12 ;i++){
            const rejectedUrl =`${DEFAULT_HOST}/cars/carRejected_month/` + i;
            const rejectedRS =  await axios.get(rejectedUrl,config);
            setData((data) => [...data, rejectedRS.data]);
        }
    }
    const dataRegistered = async () => {
        for ( var i=1; i<=12 ;i++){
            const registeredUrl =`${DEFAULT_HOST}/cars/carRegistered_month/` + i;
            const registeredRS =  await axios.get(registeredUrl,config);
            setData((data) => [...data, registeredRS.data]);
        }
    }
    const dataTransfer = async () => {
        for ( var i=1; i<=12 ;i++){
            const url =`${DEFAULT_HOST}/cars/transfer_month/` + i;
            const transferRS =  await axios.get(url,config);
            setData((data) => [...data, transferRS.data]);
        }
    }
    return (
        <div>
            <Line {...configChart} className ="analysisChart"/>
            <p className ="titleChart">Biểu đồ tổng quan trạng thái đăng ký xe biến thiên theo thời gian (tháng)</p>
            {/* <ul>
                // Mapping over array of friends
                {data.map((total, index) => (
                    // Setting "index" as key because name and age can be repeated, It will be better if you assign uniqe id as key
                    <li key={index}>
                        <span>name: {total.name}</span>{" "}
                        <span>Month: {total.month}</span>
                        <span>Value: {total.value}</span>
                    </li>
                ))}
                
            </ul> */}
        </div>
            
    )
}
