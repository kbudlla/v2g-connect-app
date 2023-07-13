import { PropsWithChildren, useCallback } from 'react';

import { Spin } from 'antd';
import { Modal as AntdModal } from 'antd';

import clsx from 'clsx';

type ModalProps = {
  header?: JSX.Element;
  width?: string | number;
  style?: React.CSSProperties;
  className?: string;

  open?: boolean;
  onClose?: () => void;
  loading?: boolean;
};

function Modal(props: PropsWithChildren<ModalProps>): JSX.Element {
  const { header, width, style, className, onClose, open, loading } = props;

  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  return (
    <AntdModal
      open={open}
      onCancel={handleClose}
      footer={null}
      centered
      width={width}
      className={clsx('v2g-modal-root', className)}
      style={style}
    >
      {/* Title */}
      <div className="v2g-modal-title-wrapper">{header}</div>

      {/* Content */}
      <div className="v2g-modal-content">
        {loading && (
          <div className="v2g-modal-loading-overlay">
            <Spin className="m-auto" />
          </div>
        )}
        {props.children}
      </div>
    </AntdModal>
  );
}

export default Modal;
