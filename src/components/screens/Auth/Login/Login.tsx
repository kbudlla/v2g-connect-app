import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { Alert, Button, Form, Input, Space, Typography } from 'antd';
import type { Rule } from 'antd/es/form';

import { V2GLogo } from 'components/common/V2GLogo/V2GLogo';

import './Login.scss';

import FederatedSignButton from './FederatedSignButton';

import { GoogleOutlined } from '@ant-design/icons';

// import { useLogin } from '../../../../hooks/app/cognito/useLogin';

const REQUIRED_RULE: Rule[] = [{ required: true, message: '' }];

export const Login = () => {
  const { t } = useTranslation('login');
  // const { state, login } = useLogin();

  const onSubmit = async (fields: { email: string; password: string }) => {
    const { email, password } = fields;
    // login(email, password);
  };

  return (
    <Form layout="vertical" className="form flex-column" onFinish={onSubmit}>
      <div className=" flex-column">
        <Typography.Title className="no-margin">{t('title')}</Typography.Title>
        {/* {state === 'error' && <Alert type="error" message={t('auth_issue')} showIcon closable />} */}
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
        <Button type="primary" htmlType="submit">
          {t('login')}
        </Button>
        <FederatedSignButton label="Sign in with Google" icon={<GoogleOutlined />} />
      </Form.Item>
    </Form>
  );
};
