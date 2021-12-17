/**
 * Ant Design Pro v4 use `@ant-design/pro-layout` to handle Layout.
 * You can view component api by:
 * https://github.com/ant-design/ant-design-pro-layout
 */
import ProLayout, { DefaultFooter } from '@ant-design/pro-layout';
import React, { useContext } from 'react';
import { Link, useIntl, connect, history, Redirect } from 'umi';
import { GithubOutlined } from '@ant-design/icons';
import { Result, Button } from 'antd';
import Authorized from '@/utils/Authorized';
import RightContent from '@/components/GlobalHeader/RightContent';
import { getMatchMenu } from '@umijs/route-utils';
import logo from '../assets/logo.png';

import AuthContext from '@/context/AuthContext';

const noMatch = (
    <Result
        status={403}
        title="403"
        subTitle="Sorry, you are not authorized to access this page."
        extra={
            <Button type="primary">
                <Link to="/user/login">Go Login</Link>
            </Button>
        }
    />
);

/**
 * use Authorized check all menu item
 */
const menuDataRender = (menuList) => {
    const role = 'sadasd';
    return menuList.filter((item) => {
        const localItem = {
            ...item,
            children: item.children ? menuDataRender(item.children) : undefined,
        };
        if (typeof item.authority === 'object' && !item.authority.includes(role)) return false;
        return localItem;
    });
};

const defaultFooterDom = (
    <DefaultFooter
        copyright={`${new Date().getFullYear()} Trương Ngọc Ánh`}
        links={null}
    />
);

const BasicLayout = (props) => {
    const { children, settings } = props;
    const { formatMessage } = useIntl();
    return (
        <ProLayout
            fixSiderbar
            logo={logo}
            formatMessage={formatMessage}
            {...props}
            {...settings}
            siderWidth={250}
            onMenuHeaderClick={() => history.push('/')}
            menuItemRender={(menuItemProps, defaultDom) => {
                if (menuItemProps.isUrl || !menuItemProps.path) {
                    return defaultDom;
                }

                return <Link to={menuItemProps.path}>{defaultDom}</Link>;
            }}
            breadcrumbRender={(routers = []) => [
                {
                    path: '/',
                    breadcrumbName: formatMessage({
                        id: 'menu.home',
                    }),
                },
                ...routers,
            ]}
            itemRender={(route, params, routes, paths) => {
                const first = routes.indexOf(route) === 0;
                return first ? (
                    <Link to={paths.join('/')}>{route.breadcrumbName}</Link>
                ) : (
                    <span>{route.breadcrumbName}</span>
                );
            }}
            footerRender={() => defaultFooterDom}
            menuDataRender={menuDataRender}
            rightContentRender={() => <RightContent />}
            title={'DRIVECHAIN'}
            layout='side'
        >
            {children}
        </ProLayout>
    );
};

export default BasicLayout;
