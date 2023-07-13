import React from 'react';

import { Button } from 'antd';

import { CognitoHostedUIIdentityProvider } from '@aws-amplify/auth';
import { Auth } from 'aws-amplify';

type Props = {
  label: string;
  icon: React.ReactNode;
};

const FederatedSignButton: React.FC<Props> = ({ label, icon }) => {
  const handleFederatedSignIn = async () => {
    await Auth.federatedSignIn({ provider: CognitoHostedUIIdentityProvider.Google });
  };
  return (
    <Button type="default" onClick={() => handleFederatedSignIn()} icon={icon} style={{ marginTop: 10 }}>
      {label}
    </Button>
  );
};

export default FederatedSignButton;
