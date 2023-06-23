import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Form, Input, Button, notification } from 'antd';

import { LeftOutlined, LockOutlined, CheckCircleOutlined, BarcodeOutlined, MailOutlined } from '@ant-design/icons';
import { Auth } from 'aws-amplify';

const ForgotPasswordVerificationForm: React.FC<any> = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    // const { verificationCode, confirmPassword, username } = values;
    // try {
    //   setLoading(true);
    //   await Auth.forgotPasswordSubmit(username, verificationCode, confirmPassword);
    //   setLoading(false);
    //   history.push('/login');
    //   notification.success({
    //     duration: 4,
    //     message: 'Your password has been successfully updated!',
    //   });
    // } catch (err) {
    //   notification.error({
    //     duration: 4,
    //     message: err.message,
    //   });
    //   setLoading(false);
    // }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-title">
        <span className="go-back" onClick={() => navigate('/auth/login')}>
          <LeftOutlined />
        </span>
        <span className="title-text">Reset Password</span>
      </div>
      <div className="forgot-passoword-message">
        Please enter the verification code sent to your email address below, your email address and your new password.
      </div>
      <Form name="forgot-password-form" className="forgot-passowrd" onFinish={onFinish}>
        <Form.Item
          name="verificationCode"
          rules={[{ required: true, message: 'Please input your verification code!' }]}
        >
          <Input prefix={<BarcodeOutlined className="site-form-item-icon" />} placeholder="Verification code" />
        </Form.Item>
        <Form.Item name="username" rules={[{ required: true, message: 'Please input your email!' }]}>
          <Input prefix={<MailOutlined className="site-form-item-icon" />} placeholder="Email" />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[
            {
              required: true,
              message: 'Wrong format!',
              pattern: new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/g),
            },
          ]}
          hasFeedback
        >
          <Input.Password prefix={<LockOutlined className="site-form-item-icon" />} placeholder="New password" />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          dependencies={['password']}
          hasFeedback
          rules={[
            {
              required: true,
              message: 'Please confirm your password!',
            },
            ({ getFieldValue }) => ({
              validator(rule, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }

                return Promise.reject('The two passwords that you entered do not match!');
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<CheckCircleOutlined className="site-form-item-icon" />}
            placeholder="Confirm password"
          />
        </Form.Item>
        <Form.Item>
          <div className="submit-email-container">
            <Button loading={loading} type="primary" htmlType="submit" className="reset-password-form-button">
              Confirm
            </Button>
          </div>
        </Form.Item>
      </Form>
    </div>
  );
};
export default ForgotPasswordVerificationForm;
