import React, { useContext, useEffect, useState } from 'react';
import { Card, Row, Col, Typography, Spin, Steps } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import { LoadingOutlined, FormOutlined, UserOutlined, FileTextOutlined, CarFilled } from '@ant-design/icons';
import axios from 'axios';
import { history } from 'umi';

import { DEFAULT_HOST } from '@/host';
import CarRegisterForm from './components/CarRegisterForm';
import Description from './components/PendingRegistration';
import { fetchCurrentUser, logout } from '@/helpers/Auth';

const icon = <LoadingOutlined style={{ fontSize: 24 }} spin />;
const {Step} = Steps;

const mainTitle = <Typography.Text strong><FormOutlined/> Kê khai đăng ký</Typography.Text>;
const subTitle = <Typography.Text strong>Quy trình đăng ký xe online</Typography.Text>;

export default () => {
    const [spin, setSpin] = useState(true);
    const [pending, setPending] = useState(false);
    const [registration, setRegistration] = useState({});
    const [reload, setReload] = useState(0);
    const [currentStep, setCurrentStep] = useState(2);

    const auth = fetchCurrentUser();

    useEffect(() => {
        const f = async () => {
            const pendingUrl = `${DEFAULT_HOST}/users/${auth.id}/cars/pending`;
            try {
                const response = await axios.get(pendingUrl, {
                    headers: {
                        Authorization: `Bearer ${auth.token}`,
                    },
                });
                const pendingRegistration = response.data;
                if (pendingRegistration.length === 0 || pendingRegistration.error) {
                    setPending(false);
                    setSpin(false);
                } else {
                    setSpin(false);
                    setPending(true);
                    setRegistration(pendingRegistration);
                }
            } catch (error) {
                setSpin(false);
                setPending(true);
            }
        };
        f();
    }, [reload]);

    return (
        <PageContainer>
            <Row>
                <Col span={12} >
                    <Spin spinning={spin} indicator={icon} style={{ backgroundColor: 'white' }}>
                        {pending ? (
                            <Description
                                reload={() => setReload(reload + 1)}
                                registration={registration}
                            />
                        ) : (
                            <CarRegisterForm
                                reload={() => setReload(reload + 1)}
                                title={mainTitle}
                            />
                        )}
                    </Spin>
                </Col>
                <Col span={12} style={{ paddingLeft: '20px' }}>
                    <Card title={subTitle}>
                        <div
                        >
                            <p>
                                Gồm những bước sau:
                            </p>
                            <p>
                                <strong>
                                    Bước 1: Chủ xe đăng ký tài khoản trên hệ thống
                                </strong>
                            </p>
                            <p>
                                Truy cập trang https://drivechain.vn, click vào "ĐĂNG KÝ" để đăng ký tài khoản. Lưu ý nhập đúng thông tin, khi CSGT xác thực tài khoản 
                                nếu thông tin chủ xe sai quá 30% sẽ bị xóa tài khoản và cấm đăng ký 30 ngày.
                            </p>
                            <p>
                                <strong>
                                    Bước 2: Chủ xe kê khai thông tin xe
                                </strong>
                            </p>
                            <p>
                                Chủ xe đăng nhập vào hệ thống, điền đủ thông tin xe lên Form "Đăng ký xe" (Có thể tìm thấy ngay trên trang web sau khi đăng nhập).
                                Click vào đăng ký.Sau đó đợi Phòng CSGT xét duyệt và xếp lịch hẹn.
                            </p>
                            <p>
                                <strong>Bước 3: Chuẩn bị hồ sơ theo quy định</strong>
                            </p>
                            Người d&acirc;n c&oacute; nhu cầu đăng k&yacute; xe cần chuẩn bị giấy tờ
                            của xe như sau:
                            <p>- Chứng từ lệ phí trước bạ</p>
                            <p>- Chứng từ nguồn gốc của xe.</p>
                            <p>- Giấy tờ của chủ xe.</p>
                            <p>
                                <strong>
                                    Bước 4: Mang xe v&agrave; giấy tờ đến trực tiếp cơ quan đăng
                                    k&yacute; xe{' '}
                                </strong>
                            </p>
                            <p>
                                Theo Điều 6 Th&ocirc;ng tư 58, chủ xe phải đưa xe đến cơ quan đăng
                                k&yacute; xe để kiểm tra đối với xe đăng k&yacute; lần đầu.
                                C&aacute;n bộ, chiến sĩ l&agrave;m nhiệm vụ đăng k&yacute; xe kiểm
                                tra hồ sơ v&agrave; thực tế xe đầy đủ đ&uacute;ng quy định, sau
                                đ&oacute; hướng dẫn chủ xe bấm chọn biển số tr&ecirc;n hệ thống đăng
                                k&yacute; xe.
                            </p>
                            <p>
                                <strong>
                                    Bước 5: Chủ xe nhận giấy hẹn trả giấy chứng nhận đăng k&yacute;
                                    xe, nộp lệ ph&iacute; đăng k&yacute; xe v&agrave; nhận biển số
                                </strong>
                            </p>
                            <p>
                                Sau khi kiểm tra hồ sơ v&agrave; thực tế xe, c&aacute;n bộ, chiến sĩ
                                l&agrave;m nhiệm vụ đăng k&yacute; xe ho&agrave;n thiện hồ sơ
                                v&agrave; cấp Giấy chứng nhận đăng k&yacute; xe.
                            </p>
                            <p>
                                Biển số xe được cấp ngay sau khi nhận hồ sơ hợp lệ. Giấy chứng nhận
                                đăng k&yacute; xe được cấp sau kh&ocirc;ng qu&aacute; 02 ng&agrave;y
                                l&agrave;m việc, kể từ ng&agrave;y nhận đủ hồ sơ hợp lệ.
                            </p>
                        </div>
                    </Card>
                </Col>
            </Row>
        </PageContainer>
    );
};
