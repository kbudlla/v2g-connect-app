import React, { useState } from 'react';
import { useNavigate } from 'react-router';

import { Form, Input, Button, Checkbox, notification } from 'antd';

import FederatedSignButton from './FederatedSignButton';

import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { GoogleOutlined, FacebookFilled } from '@ant-design/icons';
import { CognitoHostedUIIdentityProvider } from '@aws-amplify/auth';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="login-container">
      <FederatedSignButton danger={true} label="Sign in with Google" icon={<GoogleOutlined />} />

      <Form
        name="normal_login"
        className="login-form"
        initialValues={{ username: '', password: '', remember: true }}
        // onFinish={onFinish}
      >
        <Form.Item name="username" rules={[{ required: true, message: 'Please input your username!' }]}>
          <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Username" />
        </Form.Item>
        <Form.Item name="password" rules={[{ required: true, message: 'Please input your password!' }]}>
          <Input prefix={<LockOutlined className="site-form-item-icon" />} type="password" placeholder="Password" />
        </Form.Item>
        <Form.Item>
          <Form.Item name="remember" valuePropName="checked" noStyle>
            <Checkbox>Remember me</Checkbox>
          </Form.Item>

          <span className="login-form-forgot" onClick={() => navigate('/auth/forgot-password')}>
            Forgot password
          </span>
        </Form.Item>
        <Form.Item>
          <Button loading={loading} type="default" htmlType="submit" className="login-form-button">
            Sign in
          </Button>
          Or{' '}
          <span className="route-link" onClick={() => navigate('/auth/register')}>
            register now!
          </span>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Login;
