import { Button, Typography } from 'antd';
import { QuestionCircleOutlined, LogoutOutlined } from '@ant-design/icons';
import React, { useContext } from 'react';
import { connect, SelectLang, history } from 'umi';
import styles from './index.less';
const ENVTagColor = {
  dev: 'orange',
  test: 'green',
  pre: '#87d068',
};
import { logout, fetchCurrentUser } from '@/helpers/Auth';

const GlobalHeaderRight = (props) => {
  const { theme, layout } = props;
  let className = styles.right;

  if (theme === 'dark' && layout === 'top') {
    className = `${styles.right}  ${styles.dark}`;
  }

  const user = fetchCurrentUser()

  const handleLogout = () => {
    logout();
    if (user.role === 'citizen')
      return history.push('/index');
    else return history.push('/index2');
  }

  return (
    <div className={className}>
      <Typography.Text style={{marginRight: '10px'}}>Xin chào <strong>{user.fullName}</strong></Typography.Text>
      <Typography.Link type='danger' onClick={handleLogout}>Đăng xuất <LogoutOutlined /></Typography.Link>
    </div>
  );
};

export default connect(({ settings }) => ({
  theme: settings.navTheme,
  layout: settings.layout,
}))(GlobalHeaderRight);
