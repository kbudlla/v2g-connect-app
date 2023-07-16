import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { Button, Form, Input, Typography } from 'antd';
import type { Rule } from 'antd/es/form';

// import { useForgotPassword } from '../../../../hooks/app/cognito/useForgotPassword';

const REQUIRED_RULE: Rule[] = [{ required: true, message: '' }];

export const ForgotPassword = () => {
  const { t } = useTranslation('forgotPassword');
  // const { state, forgotPassword } = useForgotPassword();

  const onSubmit = async (fields: { email: string }) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { email } = fields;
    // forgotPassword(email);
  };

  return (
    <Form layout="vertical" className="form flex-column" onFinish={onSubmit}>
      <div className="title flex-column gap-8">
        <Typography.Title className="no-margin">{t('title')}</Typography.Title>
        <Typography.Paragraph type="secondary" className="no-margin">
          {t('sub_title')}
        </Typography.Paragraph>
      </div>
      {/* {state === 'error' && <Alert type="error" message={t('error')} showIcon closable />} */}
      <Form.Item label={t('email_address')} rules={REQUIRED_RULE} name="email" required hasFeedback>
        <Input type="email" name="email" />
      </Form.Item>
      <Form.Item className="submit">
        <Button type="primary" htmlType="submit">
          {t('reset_password')}
        </Button>
      </Form.Item>
      <Link className="return" to="/auth/reset-password">
        {t('return')}
      </Link>
    </Form>
  );
};
