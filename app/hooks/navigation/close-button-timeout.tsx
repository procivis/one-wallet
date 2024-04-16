import { useEffect, useState } from 'react';

export const useCloseButtonTimeout = (
  active: boolean,
  closeButtonHandler: () => void,
) => {
  const [closeTimeout, setCloseTimeout] = useState(5);

  useEffect(() => {
    if (!active) {
      return;
    }
    if (closeTimeout === 0) {
      closeButtonHandler();
      return;
    }
    const timeout = setTimeout(() => {
      setCloseTimeout(closeTimeout - 1);
    }, 1000);
    return () => {
      clearTimeout(timeout);
    };
  }, [closeTimeout, active, closeButtonHandler]);

  return { closeTimeout };
};
