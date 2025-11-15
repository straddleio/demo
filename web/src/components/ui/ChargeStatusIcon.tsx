import React from 'react';
import { FiPlus, FiCalendar, FiClock, FiDollarSign, FiX } from 'react-icons/fi';
import { getChargeStatusIconType } from '@/lib/nerd-icons';

interface ChargeStatusIconProps {
  status: string;
  className?: string;
}

/**
 * Charge Status Icon Component
 * Renders meaningful icons for each charge status:
 * - created: Plus sign (initialization)
 * - scheduled: Calendar (scheduled for future)
 * - pending: Hourglass (in progress)
 * - paid: Dollar sign (payment complete)
 * - failed/cancelled: X (error)
 */
export const ChargeStatusIcon: React.FC<ChargeStatusIconProps> = ({ status, className = '' }) => {
  const iconType = getChargeStatusIconType(status);

  const iconProps = {
    className: `${className}`,
    strokeWidth: 2.5,
  };

  switch (iconType) {
    case 'plus':
      return <FiPlus {...iconProps} />;
    case 'calendar':
      return <FiCalendar {...iconProps} />;
    case 'hourglass':
      return <FiClock {...iconProps} />;
    case 'dollar':
      return <FiDollarSign {...iconProps} />;
    case 'cross':
      return <FiX {...iconProps} />;
  }
};
