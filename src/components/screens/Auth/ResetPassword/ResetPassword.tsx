import { useState } from 'react';
import ReactCodeInput from 'react-code-input';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';

import { Button, Form, Input, Row, Space, Typography } from 'antd';

import './ResetPassword.scss';

import { useActivationInputRules } from './useActivationRules';

// import { useActivationInputRules } from './hooks/useActivationInputRules';

// import { useForgotPassword } from '../../../../hooks/app/cognito/useForgotPassword';
// import { useResetPassword } from '../../../../hooks/app/cognito/useResetPassword';

export const ResetPassword = () => {
  const { t, i18n } = useTranslation('resetPassword');
  const [search] = useSearchParams();
  // const { state, resetPassword } = useResetPassword();
  // const { state: forgotPasswordState, forgotPassword } = useForgotPassword();
  const { passwordRule, retypePasswordRule } = useActivationInputRules(t, i18n);
  const [confirmationCode, setConfirmationCode] = useState('');
  const [confirmationCodeError, setConfirmationCodeError] = useState(false);

  const email = search.get('username') || '';

  const onSubmit = async (fields: { password: string }) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password } = fields;

    if (confirmationCode.length !== 6) {
      return setConfirmationCodeError(true);
    }
    // resetPassword(email, confirmationCode, password);
  };

  return (
    <Form layout="vertical" className="form flex-column" onFinish={onSubmit}>
      <div className="title flex-column gap-8">
        <Typography.Title className="no-margin">{t('title')}</Typography.Title>
        <Typography.Paragraph type="secondary" className="no-margin">
          {t('sub_title', { email })}
        </Typography.Paragraph>
      </div>
      {/* {forgotPasswordState === 'success' && (
        <Alert type="success" message={t('forgot_password_success')} showIcon closable />
      )}
      {forgotPasswordState === 'error' && <Alert type="error" message={t('forgot_password_error')} showIcon closable />}
      {state === 'error' && <Alert type="error" message={t('error')} showIcon closable />} */}
      <Form.Item label={t('confirmation_code')} name="confirmationCode" required hasFeedback>
        <ReactCodeInput
          className="confirmation-code"
          inputMode="numeric"
          name="confirmationCode"
          type="number"
          fields={6}
          onChange={(code) => {
            setConfirmationCodeError(false);
            setConfirmationCode(code);
          }}
        />
        {confirmationCodeError && <Typography.Text type="danger">{t('confirmation_code_error')}</Typography.Text>}
        <Row className="resend-code">
          <Typography.Text type="secondary">
            <Space>
              {t('no_code')}
              <Typography.Link onClick={() => undefined}>{t('resend')}</Typography.Link>
            </Space>
          </Typography.Text>
        </Row>
      </Form.Item>
      <Form.Item label={t('new_password')} name="password" rules={passwordRule} required hasFeedback>
        <Input.Password name="password" placeholder={t('new_password_placeholder') || undefined} />
      </Form.Item>
      <Form.Item
        label={t('retype_password')}
        name="retypePassword"
        dependencies={['password']}
        rules={retypePasswordRule}
        required
        hasFeedback
      >
        <Input.Password name="retypePassword" placeholder={t('new_password_placeholder') || undefined} />
      </Form.Item>
      <Form.Item className="submit">
        <Button type="primary" htmlType="submit">
          {t('update_password')}
        </Button>
      </Form.Item>
      <Link className="return" to="/auth/login">
        {t('return')}
      </Link>
    </Form>
  );
};
