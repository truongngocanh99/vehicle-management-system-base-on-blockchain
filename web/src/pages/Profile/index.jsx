import React from 'react';
import {Card, Tabs, Form, Input, Col, Row} from 'antd';
import { PageContainer } from '@ant-design/pro-layout';

import Profile from './components/Profile';
import { fetchCurrentUser } from '@/helpers/Auth';
import ChangePassword from './components/ChangePassword';

const tabcol = {
    xl: {
        span: 22
    },
    md: {
        span: 18
    },
    sm: {
        span: 24
    }
}

const { TabPane } = Tabs;
export default () => {
    const user = fetchCurrentUser();

    return (
        <PageContainer>
                <Row>
                    <Col {...tabcol}>
                        <Card bordered>
                            <Tabs tabPosition="left">
                                <TabPane tab="Thông tin cá nhân" key="1">
                                    <Profile user={user}></Profile>
                                </TabPane>
                                <TabPane tab="Đổi mật khẩu" key="2">
                                    <ChangePassword></ChangePassword>
                                </TabPane>
                            </Tabs>
                        </Card>
                    </Col>
                </Row>
        </PageContainer>
    );
}