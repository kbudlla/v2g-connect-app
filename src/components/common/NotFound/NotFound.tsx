import React from 'react';
import { useNavigate } from 'react-router-dom';

import { Button, Result } from 'antd';

import './NotFound.scss';

import { ReactComponent as NotFoundIcon } from 'assets/images/404.svg';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="not-found">
      <Result
        icon={<NotFoundIcon />}
        title="404"
        subTitle="Sorry, the page you visited does not exist."
        extra={
          <Button onClick={() => navigate(-1)} type="primary">
            Back
          </Button>
        }
      />
    </div>
  );
};

export default NotFound;
