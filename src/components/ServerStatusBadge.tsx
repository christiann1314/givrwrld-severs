import React from 'react';
import { Badge } from './ui/badge';
import { Loader2, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { useServerStatusMonitoring } from '../hooks/useRealtimeServerStatus';

interface ServerStatusBadgeProps {
  serverId: string;
  status?: string;
  showIcon?: boolean;
  className?: string;
}

const ServerStatusBadge: React.FC<ServerStatusBadgeProps> = ({ 
  serverId, 
  status: initialStatus,
  showIcon = true,
  className = ''
}) => {
  const { status } = useServerStatusMonitoring(serverId);
  const currentStatus = status || initialStatus || 'unknown';

  const getStatusConfig = (status: string) => {
    const configs = {
      'active': {
        color: 'bg-green-500',
        text: 'Active',
        icon: CheckCircle,
        textColor: 'text-green-100'
      },
      'provisioning': {
        color: 'bg-blue-500',
        text: 'Provisioning',
        icon: Loader2,
        textColor: 'text-blue-100',
        animated: true
      },
      'installing': {
        color: 'bg-yellow-500',
        text: 'Installing',
        icon: Loader2,
        textColor: 'text-yellow-100',
        animated: true
      },
      'failed': {
        color: 'bg-red-500',
        text: 'Failed',
        icon: XCircle,
        textColor: 'text-red-100'
      },
      'stopped': {
        color: 'bg-gray-500',
        text: 'Stopped',
        icon: Clock,
        textColor: 'text-gray-100'
      },
      'maintenance': {
        color: 'bg-orange-500',
        text: 'Maintenance',
        icon: AlertTriangle,
        textColor: 'text-orange-100'
      }
    };

    // Handle installing_addon statuses
    if (status.startsWith('installing_')) {
      const addonName = status.replace('installing_', '').replace('_', ' ');
      return {
        color: 'bg-purple-500',
        text: `Installing ${addonName}`,
        icon: Loader2,
        textColor: 'text-purple-100',
        animated: true
      };
    }

    return configs[status as keyof typeof configs] || {
      color: 'bg-gray-400',
      text: status.charAt(0).toUpperCase() + status.slice(1),
      icon: AlertTriangle,
      textColor: 'text-gray-100'
    };
  };

  const config = getStatusConfig(currentStatus);
  const Icon = config.icon;
  const isAnimated = 'animated' in config && config.animated;

  return (
    <Badge 
      className={`${config.color} ${config.textColor} flex items-center gap-1 ${className}`}
      variant="default"
    >
      {showIcon && (
        <Icon 
          className={`w-3 h-3 ${isAnimated ? 'animate-spin' : ''}`} 
        />
      )}
      {config.text}
    </Badge>
  );
};

export default ServerStatusBadge;