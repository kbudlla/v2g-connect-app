import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';

import { Alert, Button, Form, Input, Typography } from 'antd';
import type { Rule } from 'antd/es/form';

import './Login.scss';

import FederatedSignButton from './FederatedSignButton';

import { GoogleOutlined } from '@ant-design/icons';
import { Auth } from 'aws-amplify';

const REQUIRED_RULE: Rule[] = [{ required: true, message: '' }];

export const Login = () => {
  const { t } = useTranslation('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onSubmit = async (fields: { email: string; password: string }) => {
    const { email, password } = fields;
    try {
      setLoading(true);
      await Auth.signIn({
        username: email,
        password,
      });
      navigate('/dashboard');

      setLoading(false);
    } catch (e) {
      setLoading(false);
      if (e instanceof Error) {
        setError(e.message);
      }
    }
  };

  return (
    <Form layout="vertical" className="form flex-column" onFinish={onSubmit}>
      <div className=" flex-column">
        <Typography.Title className="no-margin">{t('title')}</Typography.Title>
        {error && <Alert style={{ marginBottom: 10 }} type="error" message={error} showIcon closable />}
      </div>
      <Form.Item label={t('email_address')} rules={REQUIRED_RULE} name="email" required hasFeedback>
        <Input type="email" name="email" />
      </Form.Item>
      <Form.Item className="password" label={t('password')} name="password" rules={REQUIRED_RULE} required hasFeedback>
        <Input.Password name="password" />
      </Form.Item>
      <Typography.Text className="to-forgot-password">
        <Link to="/auth/forgot-password">{t('forgot_password')}</Link>
      </Typography.Text>
      <Form.Item className="submit">
        <Button type="primary" htmlType="submit" loading={loading}>
          {t('login')}
        </Button>
        <FederatedSignButton label="Sign in with Google" icon={<GoogleOutlined />} />
      </Form.Item>
    </Form>
  );
};
