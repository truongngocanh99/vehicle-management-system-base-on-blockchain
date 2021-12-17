import React from 'react';
import TweenOne from 'rc-tween-one';
import { Menu, Modal } from 'antd';
import { getChildrenToRender } from './utils';
import LoginForm from './Components/LoginForm';
import RegisterForm from './Components/RegisterFrom';
import Search from './Components/Search'

const { Item, SubMenu } = Menu;

class Header extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      phoneOpen: undefined,
      searchModal: false,
      signupModal: false,
      signinModal: false,
    };
  }

  phoneClick = () => {
    const phoneOpen = !this.state.phoneOpen;
    this.setState({
      phoneOpen,
    });
  };

  searchClick = () => {
    this.setState({
      searchModal: true,
    })
  }
  searchOut = () => {
    this.setState({
      searchModal: false,
    })
  }


  signinClick = () => {
    this.setState({
      signinModal: true,
    });
  };
  signinOut = () => {
    this.setState({
      signinModal: false,
    });
  }


  signupClick = () => {
    this.setState({
      signupModal: true,
    })
  }
  signupOut = () => {
    this.setState({
      signupModal: false,
    });
  }


  render() {
    const { dataSource, isMobile, ...props } = this.props;
    const { phoneOpen } = this.state;
    const navData = dataSource.Menu.children;
    const navChildren = navData.map((item) => {
      const { children: a, subItem, ...itemProps } = item;
      if (subItem) {
        return (
          <SubMenu
            key={item.name}
            {...itemProps}
            title={
              <div
                {...a}
                className={`header0-item-block ${a.className}`.trim()}
              >
                {a.children.map(getChildrenToRender)}
              </div>
            }
            popupClassName="header0-item-child"
          >
            {subItem.map(($item, ii) => {
              const { children: childItem } = $item;
              const child = childItem.href ? (
                <a {...childItem}>
                  {childItem.children.map(getChildrenToRender)}
                </a>
              ) : (
                <div {...childItem}>
                  {childItem.children.map(getChildrenToRender)}
                </div>
              );
              return (
                <Item key={$item.name || ii.toString()} {...$item}>
                  {child}
                </Item>
              );
            })}
          </SubMenu>
        );
      }
      let click;
      if(item.action === 'signin') click = this.signinClick;
      if(item.action === 'signup') click = this.signupClick;
      if(item.action === 'search') click = this.searchClick;
      return (
        <Item key={item.name} {...itemProps}>
          <a {...a} className={`header0-item-block ${a.className}`.trim()} onClick={click}>
            {a.children.map(getChildrenToRender)}
          </a>
        </Item>
      );
    });
    const moment = phoneOpen === undefined ? 300 : null;
    return (
      <TweenOne
        component="header"
        animation={{ opacity: 0, type: 'from' }}
        {...dataSource.wrapper}
        {...props}
      >
        <div
          {...dataSource.page}
          className={`${dataSource.page.className}${phoneOpen ? ' open' : ''}`}
        >
          <TweenOne
            animation={{ x: -30, type: 'from', ease: 'easeOutQuad' }}
            {...dataSource.logo}
          >
            <img width="100%" src={dataSource.logo.children} alt="img" />
          </TweenOne>
          {isMobile && (
            <div
              {...dataSource.mobileMenu}
              onClick={() => {
                this.phoneClick();
              }}
            >
              <em />
              <em />
              <em />
            </div>
          )}
          <TweenOne
            {...dataSource.Menu}
            animation={
              isMobile
                ? {
                    height: 0,
                    duration: 300,
                    onComplete: (e) => {
                      if (this.state.phoneOpen) {
                        e.target.style.height = 'auto';
                      }
                    },
                    ease: 'easeInOutQuad',
                  }
                : null
            }
            moment={moment}
            reverse={!!phoneOpen}
          >
            <Menu
              mode={isMobile ? 'inline' : 'horizontal'}
              defaultSelectedKeys={['sub0']}
              theme="dark"
            >
              {navChildren}
            </Menu>
          </TweenOne>
        </div>
        <Modal
          onCancel={this.signinOut}
          destroyOnClose visible={this.state.signinModal}
          title='Đăng nhập'
          footer={null}
        >
            <LoginForm></LoginForm>
        </Modal>
        <Modal
          centered
          style={{top:0}}
          onCancel={this.signupOut}
          destroyOnClose visible={this.state.signupModal}
          title='Đăng ký'
          footer={null}
        >
            <RegisterForm></RegisterForm>
        </Modal>
        <Modal
          centered
          style={{top:0}}
          onCancel={this.searchOut}
          destroyOnClose visible={this.state.searchModal}
          title='Tra cứu xe bằng biển số'
          footer={null}
        >
            <Search/>
        </Modal>
      </TweenOne>
    );
  }
}

export default Header;
