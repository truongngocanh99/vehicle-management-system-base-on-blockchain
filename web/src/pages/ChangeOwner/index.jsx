import React, { useContext, useState, useEffect } from 'react';
import { Card, Button, Row, Col,Typography, Divider } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import axios from 'axios';
import { DEFAULT_HOST } from '@/host';
import path from 'path'

import ChangeOwnerForm from './components/ChangeOwnerForm'
import TransferRequestForm from './components/TransferProcessForm';
import { fetchCurrentUser } from '@/helpers/Auth';

const changeOwnerFormTitle = <Typography.Text strong>Chuyển quyền sở hữu xe</Typography.Text>
const procedureChangeOwnerTitle  = <Typography.Text strong>Quy trình chuyển quyền sở hữu xe (sang tên xe)</Typography.Text>

export default () => {
    const [reload, setReload] = useState(0);
    const [hasTransferReqest, setHasTransferRequest] = useState(false);
    const [requests, setReqests] = useState([])
    
    const auth = fetchCurrentUser();
    
    const config = {
        headers: {
            Authorization: `Bearer ${auth.token}`,
        },
    };

    useEffect(() => {
        const f = async () => {
            const url = DEFAULT_HOST  + path.join('/users', auth.id, 'transferRequest');
            try {
                const result = await axios.get(url, config);
                if (result.data !== '') setReqests(result.data);
            } catch (error) {
                console.log(error);
            }
        }
        f();
    }, [reload]);

    useEffect(() => {
        if (requests.length === 0) return;
        if(requests[0].Key) setHasTransferRequest(true);
    }, [requests])

    const reloadF = () => {
        setReload(reload + 1);
    }

    return (
        <PageContainer>
            <Row gutter={20}>
                <Col md={{ span: 13 }} sm={{ span: 24 }}>
                    {hasTransferReqest
                        ? requests.map((request) => {
                              return (
                                  <>
                                      <Row>
                                          <Col span={24}>
                                              <TransferRequestForm
                                                  reload={reloadF}
                                                  request={request.Record}
                                              />
                                          </Col>
                                      </Row>
                                      <Divider />
                                  </>
                              );
                          })
                        : null}

                    <Row>
                        <Col span={24}>
                            <Card title={changeOwnerFormTitle}>
                                <ChangeOwnerForm reload={reloadF} />
                            </Card>
                        </Col>
                        <Divider />
                    </Row>
                </Col>
                <Col xl= {{span:11}} md={{ span: 11 }} sm={{ span: 24 }}>
                    <Card title={procedureChangeOwnerTitle}>
                        <Typography.Text>
                            <p>
                                <em>
                                    <strong>Bước 1: </strong>
                                </em>
                                Người b&aacute;n khai b&aacute;o v&agrave; nộp giấy chứng nhận đăng
                                k&yacute; xe
                            </p>

                            <p>
                                Trong thời hạn 07 ng&agrave;y, kể từ ng&agrave;y l&agrave;m giấy tờ
                                chuyển quyền sở hữu xe cho tổ chức, c&aacute; nh&acirc;n, chủ xe
                                c&oacute; tr&aacute;ch nhiệm trực tiếp hoặc ủy quyền cho c&aacute;
                                nh&acirc;n, tổ chức dịch vụ nộp giấy chứng nhận đăng k&yacute; xe
                                cho cơ quan đăng k&yacute; xe (Trường hợp bắt buộc phải đổi biển do
                                biển 3 số, 4 số hoặc kh&aacute;c hệ biển th&igrave; chủ xe phải nộp
                                lại cả biển số xe).
                            </p>

                            <p>
                                <br />
                                <strong>Bước 2</strong>: Người mua chuẩn bị 01 bộ hồ sơ, gồm:
                            </p>

                            <p>- Giấy khai đăng k&yacute; xe theo mẫu;</p>

                            <p>- Giấy tờ chuyển quyền sở hữu xe;</p>

                            <p>- Giấy tờ lệ ph&iacute; trước bạ xe;</p>

                            <p>
                                &nbsp;- Giấy chứng nhận thu hồi đăng k&yacute; xe, biển số xe (trừ
                                trường hợp sang t&ecirc;n trong c&ugrave;ng tỉnh ngay sau khi chuyển
                                quyền sở hữu xe).
                            </p>

                            <p>
                                <strong>Bước 3: </strong>Nộp hồ sơ trực tiếp tại trụ sở Ph&ograve;ng
                                Cảnh s&aacute;t giao th&ocirc;ng C&ocirc;ng an tỉnh, th&agrave;nh
                                phố trực thuộc Trung ương hoặc c&aacute;c điểm đăng k&yacute; xe của
                                Ph&ograve;ng.
                            </p>

                            <p>
                                <strong>Bước 4</strong>: Nộp lệ ph&iacute; đăng k&yacute; xe
                            </p>

                            <p>
                                <strong>Bước 5:</strong> Nhận giấy hẹn lấy Giấy chứng nhận đăng
                                k&yacute; xe
                            </p>

                            <p>
                                Biển số xe được cấp ngay sau khi tiếp nhận hồ sơ đăng k&yacute; xe
                                hợp lệ
                            </p>

                            <p>
                                Giấy chứng nhận đăng k&yacute; xe được cấp sau kh&ocirc;ng
                                qu&aacute; 2 ng&agrave;y l&agrave;m việc, kể từ ng&agrave;y nhận hồ
                                sơ hợp lệ.
                            </p>
                        </Typography.Text>
                    </Card>
                </Col>
            </Row>
        </PageContainer>
    );
};