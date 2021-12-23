export default [
  {
    path: '/',
    component: '../layouts/AuthLayout',
    routes: [
      {
        exact: true,
        name: 'landing',
        path: '/index',
        wrappers: ['@/wrappers/LandingWrappers'],
        component: './Landing'
      },
      {
        exact: true,
        name: 'landing',
        path: '/index2',
        component: './LandingAdmin'
      },
      {
        path: '/app',
        component: '../layouts/BasicLayout',
        wrappers: ['@/wrappers/Citizen'],
        routes: [
          {
            path: '/app',
            redirect: '/app/car-register'
          },
          {
            exact: true,
            name: 'RegistryCar',
            icon: 'FormOutlined',
            path: '/app/car-register',
            component: './CarRegister'
          },
          {
            exact: true, 
            name: "ChangeOwner",
            icon: 'SwapRightOutlined',
            path: '/app/change-owner',
            component: './ChangeOwner'
          },
          {
            exact: true, 
            name: "RegisteredCar",
            icon: 'CarOutlined',
            path: '/app/registered-car',
            component: './RegisteredCar'
          },
          {
            exact: true, 
            name: "profile",
            icon: 'UserOutlined',
            path: '/app/profile',
            component: './Profile'
          },

          {
            component: './404',
          },
        ],
      },
      {
        path: '/police',
        component: '../layouts/BasicLayout',
        wrappers: ['@/wrappers/Police'],
        routes: [
          {
            path: '/police',
            redirect: '/police/manage-registration'
          },
          {
            exact: true,
            path: '/police/manage-registration',
            component: './ManageReg',
            icon: 'CarOutlined',
            name: "manage-reg"
          },{
            exact: true,
            path: '/police/manage-citizen',
            name: 'manage-citizen',
            icon: 'TeamOutlined',
            component: './ManageCitizen',
          },
          {
            path: '/police/read-registration/:id',
            component: './DetailRegistration',
            name: 'read',
            hideInMenu: true,
          },
          {
            exact: true,
            path: '/police/manage-booking',
            name: 'manage-booking',
            icon: 'ScheduleOutlined',
            component: './ManageBooking',
          },
          {
            exact: true,
            path: '/police/analysis',
            component: './Analysis',
            icon: 'PieChartOutlined',
            name: 'analysis'
          },
          {
            exact: true, 
            name: "profile",
            icon: 'UserOutlined',
            path: '/police/profile',
            component: './Profile'
          },
          // {
          //   exact: true, 
          //   name: "help",
          //   icon: 'QuestionCircleOutlined',
          //   path: '/police/help',
          //   component: './RegisteredCar'
          // },
        ]
      },{
        path: '/admin',
        component: '../layouts/BasicLayout',
        wrappers: ['@/wrappers/Admin'],
        routes: [
          {
            path: '/admin',
            redirect: '/admin/manage-object'
          },
          {
            exact: true,
            path: '/admin/manager-user',
            component: './ManageUser',
            name: 'manage-user'
          },
          {
            exact: true,
            path: '/admin/manager-city',
            component: './ManageCity',
            name: 'manage-city'
          },
          {
            exact: true,
            path: '/admin/manage-object',
            component: './ManageObject',
            name: 'manage-object'
          },
          {
            exact: true,
            path: '/admin/manage-cartype',
            component: './ManageCarType',
            name: 'manage-cartype'
          },
       
         
        ]
      },
      {
        path: '/404',
        component: './404',
      },
    ],
  },
  {
    component: './404',
  },

];
