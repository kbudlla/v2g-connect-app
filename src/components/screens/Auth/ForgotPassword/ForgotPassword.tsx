import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Form, Input, Button } from 'antd';

import { LeftOutlined } from '@ant-design/icons';
import { MailOutlined } from '@ant-design/icons';
import { Auth } from 'aws-amplify';

const ForgotPasswordForm: React.FC<any> = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const onFinish = async (values: any) => {
    // const { username } = values;
    // try {
    //   setLoading(true);
    //   await Auth.forgotPassword(username);
    //   setLoading(false);
    //   history.push({
    //     pathname: '/forgot-password-verification',
    //     state: { username },
    //   });
    // } catch (err) {
    //   //err
    //   setLoading(false);
    // }
  };

  const navigate = useNavigate();

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-title">
        <span className="go-back" onClick={() => navigate('/auth/login')}>
          <LeftOutlined />
        </span>
        <span className="title-text">Forgot Password?</span>
      </div>
      <div className="forgot-passoword-message">
        Please enter the email address associated with your account and we'll email you instructions to reset your
        password.
      </div>
      <Form
        name="forgot-password-form"
        className="forgot-passowrd"
        initialValues={{ username: '' }}
        onFinish={onFinish}
      >
        <Form.Item name="username" rules={[{ required: true, message: 'Please input your username!' }]}>
          <Input prefix={<MailOutlined className="site-form-item-icon" />} placeholder="Email" />
        </Form.Item>
        <Form.Item>
          <div className="submit-email-container">
            <Button loading={loading} type="primary" htmlType="submit" className="reset-password-form-button">
              Submit
            </Button>
          </div>
        </Form.Item>
      </Form>
    </div>
  );
};
export default ForgotPasswordForm;
