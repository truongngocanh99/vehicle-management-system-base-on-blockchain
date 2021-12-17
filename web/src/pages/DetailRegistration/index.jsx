import React, {useState, useEffect} from 'react';
import {Row, Col, Card, Result, Typography} from 'antd';
import {PageContainer} from '@ant-design/pro-layout';
import Icon, {CarFilled, UserOutlined} from '@ant-design/icons';
import { fetchCurrentUser } from '@/helpers/Auth';
import {DEFAULT_HOST} from '@/host'
import axios from 'axios';
import moment from 'moment'
import CarDetail from './components/CarDetail';
import History from './components/History';
import {OwnerInfo} from '../ManageReg/components/CitizenInfomation';

export default (props) => {
    const [registration, setRegistration] = useState({});
    const [pageLoading, setPageLoading] = useState(true);
    const [cardLoading, setCardLoading] = useState(false)
    const [notFound, setNotFound] = useState(false);
    const user = fetchCurrentUser();
    const regId = props.match.params.id
    const config = {
        headers: {
            Authorization: 'Bearer ' + user.token
        }
    }

    const notF = <Result
        status="404"
        title="404"
        subTitle="Sorry, the page you visited does not exist."
    />

useEffect(() => {
    const url = DEFAULT_HOST + '/cars/' + regId;
    const f = async () => {
        try {
            const result = await axios.get(url, config);
            if (!result.data) setNotFound(true);
            const reg = result.data.Record;
            const userUrl = DEFAULT_HOST + '/users/' + reg.owner;
            const historyUrl = DEFAULT_HOST + '/cars/' + reg.id + '/history';
            const ownerResult = await axios.get(userUrl, config);
            const history = await axios.get(historyUrl, config);
            reg.owner = ownerResult.data.Record;
            const timeline = history.data.map((element) => {
                element.Value.time = moment(element.Timestamp.seconds.low * 1000)
                    .locale('en')
                    .format('D/MM/YYYY, hh:mm:ss A');
                return element.Value;
            });
            reg.history = timeline;
            setRegistration(reg);
            setPageLoading(false);
        } catch (error) {}
    };
    f();
}, []);
   

    return (
        <PageContainer loading={pageLoading}>
            {notFound ? (
                notF
            ) : (
                <>
                    <Row gutter={24}>
                        <Col lg={14} sm={24}>
                            <Card
                                loading={cardLoading}
                                title={
                                    <Typography.Text strong>
                                        <CarFilled /> Chi tiết xe
                                    </Typography.Text>
                                }
                                style={{ height: '100%', minHeight: '400px' }}
                            >
                                <CarDetail car={registration}></CarDetail>
                            </Card>
                        </Col>
                        <Col lg={10} sm={24}>
                            <Card
                                loading={cardLoading}
                                title={<Typography.Text strong><UserOutlined /> Chủ sở hữu</Typography.Text>}
                                style={{ height: '100%', minHeight: '400px', overflow: 'initial' }}
                            >
                                <OwnerInfo user={registration.owner}></OwnerInfo>
                            </Card>
                        </Col>
                    </Row>
                    <Row style={{ paddingTop: '24px' }}>
                        <Col span={24}>
                            <Card
                                loading={cardLoading}
                                title={<Typography.Text strong> Lịch sử</Typography.Text>}
                                style={{ minHeight: '400px' }}
                            >
                                <History loading={setCardLoading} watchState={setRegistration} history={registration.history}></History>
                            </Card>
                        </Col>
                    </Row>
                </>
            )}
        </PageContainer>
    );
}