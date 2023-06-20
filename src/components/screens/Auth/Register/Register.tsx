import React, { useState } from 'react';
import { Form, Input, Select, Button, notification } from 'antd';
import { LeftOutlined } from '@ant-design/icons';
import { Auth } from 'aws-amplify';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';

const { Option } = Select;

const tailFormItemLayout = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0,
    },
    sm: {
      span: 16,
      offset: 8,
    },
  },
};

const RegistrationForm = () => {
  const [form] = Form.useForm();

  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(false);
  const [registerdUser, setRegisteredUser] = useState<any>(null);

  // useEffect(() => {
  //   if (!loading && registerdUser) {
  //     props.history.replace('/login');
  //   }
  // }, [loading, registerdUser, props.history]);

  const onFinish = async (values: any) => {
    // setLoading(true);
    // try {
    //   const { email, password, name, family_name, phone, prefix } = values;
    //   const user = await Auth.signUp({
    //     username: email,
    //     password: password,
    //     attributes: {
    //       name,
    //       family_name,
    //       phone_number: `${prefix}${phone}`,
    //     },
    //   });
    //   setRegisteredUser(user);
    //   notification.success({
    //     duration: 15,
    //     message: 'User was successfully registered.',
    //     description:
    //       'We have sent you an email. Please click on the confirmation link to verfy your account before you log in!',
    //   });
    // } catch (err) {
    //   if (err instanceof Error) {
    //     notification.error({
    //       message: err.message,
    //     });
    //   }
    // }
    // setLoading(false);
  };

  const prefixSelector = (
    <Form.Item name="prefix" noStyle>
      <Select
        style={{
          width: 80,
        }}
      >
        <Option value="+355">+355</Option>
        <Option value="+49">+49</Option>
      </Select>
    </Form.Item>
  );

  return (
    <div className="registration-form-container">
      <div className="title">
        <span className="go-back" onClick={() => navigate(-1)}>
          <LeftOutlined />
        </span>
        <span className="title-text">Account Registration</span>
      </div>
      <Form
        layout="vertical"
        form={form}
        className="registration-form"
        name="register"
        onFinish={onFinish}
        initialValues={{
          prefix: '+355',
        }}
        scrollToFirstError
      >
        <Form.Item
          name="email"
          label="E-mail"
          rules={[
            {
              type: 'email',
              message: 'The input is not valid email!',
            },
            {
              required: true,
              message: 'Please input your email!',
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="password"
          label="Password"
          rules={[
            {
              required: true,
              message: 'Wrong format!',
              pattern: new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/g),
            },
          ]}
          hasFeedback
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          name="confirm"
          label="Confirm Password"
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
          <Input.Password />
        </Form.Item>

        <Form.Item
          name="name"
          label={<span>First name&nbsp;</span>}
          rules={[
            {
              required: true,
              message: 'Please input your first name!',
              whitespace: true,
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="family_name"
          label={<span>Last name&nbsp;</span>}
          rules={[
            {
              required: true,
              message: 'Please input your last name!',
              whitespace: true,
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="phone"
          label="Phone Number"
          rules={[
            {
              required: true,
              message: 'Please input your phone number!',
            },
          ]}
        >
          <Input
            addonBefore={prefixSelector}
            style={{
              width: '100%',
            }}
          />
        </Form.Item>

        <Form.Item {...tailFormItemLayout}>
          <Button type="primary" htmlType="submit" loading={loading}>
            Register
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default RegistrationForm;
