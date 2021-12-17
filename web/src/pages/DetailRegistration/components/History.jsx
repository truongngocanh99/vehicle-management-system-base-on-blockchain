import React from 'react';
import {Button, Popover, Table} from 'antd';
import { useEffect } from 'react';

const TIMELINE_ACTION_TYPE = [
    "Đăng ký lên hệ thống",
    "CSGT cấp biển số",
    "Huỷ đăng ký",
    "Yêu cầu chuyển đổi quyền sở hữu",
    "Thay đổi thông tin xe",
    "CSGT xác nhận chuyển quyền sở hữu",
    "Người nhận xác nhận quyền sở hữu",
    "Hủy chuyển quyền sở hũu",
    "Duyệt hồ sơ và xếp lịch hẹn",
];


export default ({history, watchState, loading}) => {
    useEffect(() => console.log(history),[]);
    // useEffect(() => console.log(history);
    const columns = [
        {
            title: 'Thời gian',
            dataIndex: 'time',
            key: 'time',
        },
        {
            title: 'Người thực hiện',
            dataIndex: 'user',
            key: 'user',
            render: (text, record) => {
                if (record.modifyUser.role === 'police')
                    return (
                        <Popover title="ID" content={record.modifyUser.id}>
                            {'CSGT. ' + record.modifyUser.fullName}
                        </Popover>
                    );
                    return (
                        <Popover title="ID" content={record.modifyUser.id}>
                            {record.modifyUser.fullName}
                        </Popover>
                    );
            },
        },
        {
            title: 'Nội dung',
            dataIndex: 'content',
            key: 'modifyType',
            render: (text, record) => {
                return TIMELINE_ACTION_TYPE[record.modifyType];
            },
        },
        {
            title: 'Xem trạng thái',
            render: (text, record) => {
                return (
                    <Button
                        onClick={() => {
                            loading(true);
                            watchState({
                                ...record,
                                history,
                            });
                            setTimeout(() => loading(false), 1000)
                        }}
                    >
                        Xem
                    </Button>
                );
            },
        },
    ];
    return (
        <Table  columns={columns} dataSource={history}></Table>
    )
}