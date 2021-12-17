import React, { useState, useEffect, useContext } from 'react';
import { Card, Descriptions, Divider, Typography, Timeline } from 'antd';
import { DESCRIPTION_LABEL } from './Constants';
import { DEFAULT_HOST } from '@/host';
import axios from 'axios';
import moment from 'moment';
import { fetchCurrentUser } from '@/helpers/Auth'

const TIMELINE_ACTION_TYPE = [
    "Kê khai thông tin xe",
    "CSGT xử lí hồ sơ, bấm biển số",
    "Huỷ đăng ký",
    "Yêu cầu chuyển đổi quyền sở hữu",
    "Thay đổi thông tin xe",
    "CSGT xác nhận chuyển quyền sở hữu",
    "Người nhận xác nhận quyền sở hữu",
    "Hủy chuyển quyền sở hũu",
    "CSGT kiểm tra, duyệt hồ sơ",
]

export default (props) => {
    const [timeline, setTimeline] = useState([]);
    const [car, setCar] = useState({});
    const [loading, setLoading] = useState(true);
    const auth = fetchCurrentUser();

    const config = {
        headers: {
            Authorization: `Bearer ${auth.token}`,
        }
    }
    
    const title = <Typography.Text strong>{`${car.brand} ${car.model}`}</Typography.Text>

    useEffect(() => {
        setLoading(true);
        const fetchTimeline = async () => {
            const url = `${DEFAULT_HOST}/cars/${car.id}/history`;
            try {
                const result = await axios.get(url, config);
                if (result.data.length > 0) {
                    const arr =result.data;
                    const tl = arr.map(element => {
                        element.Value.time = moment(element.Timestamp.seconds.low * 1000).locale('en').format("D/MM/YYYY, hh:mm:ss A");
                        return element.Value;
                    })
                    setTimeline(tl.reverse());
                    setLoading(false);
                }
            } catch(error) {
                console.log(error);
            }
        }
        fetchTimeline();
    }, [car])

    useEffect(() => {
        setCar({...props.car});
    }, [props]);
    
    return (
    <Card size='small' title={title} loading={loading} >
            <Descriptions column={2} bordered style={{borderColor: 'white'}}>
                <Descriptions.Item label={DESCRIPTION_LABEL.REGISTRATION_DATE}>
                    Ngày {car.registrationDate}
                </Descriptions.Item>
                <Descriptions.Item label={DESCRIPTION_LABEL.BRAND}>
                    {car.brand}
                </Descriptions.Item>
                <Descriptions.Item label={DESCRIPTION_LABEL.MODEL}>
                    {car.model}
                </Descriptions.Item>
                <Descriptions.Item label={DESCRIPTION_LABEL.COLOR}>
                    {car.color}
                </Descriptions.Item>
                <Descriptions.Item label={DESCRIPTION_LABEL.YEAR}>
                    {car.year}
                </Descriptions.Item>
                <Descriptions.Item label={DESCRIPTION_LABEL.CAPACITY}>
                    {car.capacity}
                </Descriptions.Item>
                <Descriptions.Item label={DESCRIPTION_LABEL.CHASSIS_NUMBER}>
                    {car.chassisNumber}
                </Descriptions.Item>
                <Descriptions.Item label={DESCRIPTION_LABEL.ENGINE_NUMBER}>
                    {car.engineNumber}
                </Descriptions.Item>
                <Descriptions.Item label={DESCRIPTION_LABEL.REGISTRATION_NUMBER}>
                    {car.registrationNumber}
                </Descriptions.Item>
                <Descriptions.Item label={DESCRIPTION_LABEL.CAR_TYPE}>
                    {car.carType?car.carType.name: null}
                </Descriptions.Item>
            </Descriptions>
            <Divider/>
            <Typography.Text strong>Lịch sử đăng ký</Typography.Text>
            <Timeline style={{marginTop: '1rem'}} mode='left'>
                {
                    timeline.map(tl => {
                        return (<Timeline.Item label={"Ngày " + tl.time}>{TIMELINE_ACTION_TYPE[tl.modifyType]}</Timeline.Item>)
                    })
                }
            </Timeline>
        </Card>
    )
}