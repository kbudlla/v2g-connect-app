import React from 'react';
import { useTranslation } from 'react-i18next';

import { Image, MenuProps } from 'antd';
import { Dropdown, Space, Button } from 'antd';

import './LanguageSelector.scss';

import DEIcon from '../../../assets/icons/de.png';
import ENIcon from '../../../assets/icons/en.png';

import { DownOutlined } from '@ant-design/icons';

const items: MenuProps['items'] = [
  {
    label: (
      <Space>
        <Image width={24} preview={false} src={ENIcon} />
        English
      </Space>
    ),
    key: 'en',
  },
  {
    label: (
      <Space>
        <Image width={24} preview={false} src={DEIcon} />
        German
      </Space>
    ),
    key: 'de',
  },
];

type LanguageSelectorProps = {
  className?: string;
};

export const LanguageSelector = (props: LanguageSelectorProps) => {
  const { i18n } = useTranslation();
  const handleMenuClick: MenuProps['onClick'] = (e) => {
    i18n.changeLanguage(e.key);
    window.localStorage.setItem('i18nLocale', e.key);
  };
  const menuProps = {
    items,
    onClick: handleMenuClick,
    selectable: true,
    defaultSelectedKeys: [i18n.language],
  };

  return (
    <Dropdown
      menu={menuProps}
      placement="bottom"
      trigger={['click']}
      overlayClassName="overlay"
      className={props.className}
    >
      <Button className="language_selector__button" shape="round">
        <div className="language_selector__wrapper">
          <Image width={24} preview={false} src={i18n.language === 'en' ? ENIcon : DEIcon} />
          <span className="language_selector__text">{i18n.language === 'en' ? 'English' : 'German'}</span>
          <DownOutlined className="language_selector__arrow_down" />
        </div>
      </Button>
    </Dropdown>
  );
};
