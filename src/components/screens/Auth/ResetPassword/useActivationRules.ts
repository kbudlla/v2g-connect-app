import { useMemo } from 'react';

import type { Rule } from 'antd/es/form';

import type { i18n, TFunction } from 'i18next';

const REQUIRED_RULE: Rule[] = [{ required: true, message: '' }];

const validatePasswordValue = (value: string) => {
  if (!value) return true;
  if (value.length < 10) return false;

  return value.match(/[a-z]/) && value.match(/[A-Z]/) && value.match(/[0-9]/) && value.match(/[^a-zA-Z0-9]/);
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const useActivationInputRules = (t: TFunction<'activate'>, i18n: i18n) => {
  const passwordRule = useMemo(
    () =>
      REQUIRED_RULE.concat(() => ({
        validator(_, value: string) {
          return validatePasswordValue(value)
            ? Promise.resolve()
            : Promise.reject(new Error(t('password_rule_error') || undefined));
        },
      })),
    [t],
  );
  const retypePasswordRule = useMemo(
    () =>
      REQUIRED_RULE.concat(({ getFieldValue }) => ({
        validator(_, value) {
          if (!value || getFieldValue('password') === value) {
            return Promise.resolve();
          }
          return Promise.reject(new Error(t('password_do_not_match') || undefined));
        },
      })),
    [t],
  );

  return { requiredRule: REQUIRED_RULE, passwordRule, retypePasswordRule };
};
