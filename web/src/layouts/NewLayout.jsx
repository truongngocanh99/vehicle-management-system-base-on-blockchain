import React from 'react';
import { Layout, Form, Menu } from 'antd';
const { Header, Content, Footer } = Layout;

export default (props) => {
    return (
        <Layout>
            <Header style={{ position: 'fixed', zIndex: 1, width: '100%' }}>
                <div className="logo" />
                <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['1']}>
                    <Menu.Item key="1">Đăng ký xe</Menu.Item>
                    <Menu.Item key="2">Sang tên xe</Menu.Item>
                    <Menu.Item key="3">Quản lí xe</Menu.Item>
                </Menu>
            </Header>
            <Content>
                {props.children}
            </Content>
        </Layout>
    );
}