
import React from 'react';
import { Link } from 'react-router-dom';

interface ServerCardProps {
  game: string;
  icon: string | React.ReactNode;
  title: string;
  description: string;
  price: string;
  buttonColor: 'emerald' | 'blue';
}

const ServerCard: React.FC<ServerCardProps> = ({ 
  game, 
  icon, 
  title, 
  description, 
  price, 
  buttonColor 
}) => {
  const buttonStyles = {
    emerald: "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 shadow-emerald-500/25",
    blue: "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 shadow-blue-500/25"
  };

  const getConfigPath = (game: string) => {
    switch (game.toLowerCase()) {
      case 'minecraft':
        return '/configure/minecraft';
      case 'rust':
        return '/configure/rust';
      case 'palworld':
        return '/configure/palworld';
      default:
        return '/deploy';
    }
  };

  // Updated icon logic to use the new Palworld icon
  const getGameIcon = () => {
    if (game.toLowerCase() === 'palworld') {
      return <img src="/lovable-uploads/a7264f37-06a0-45bc-8cd0-62289aa4eff8.png" alt="Palworld" className="w-8 h-8 rounded object-cover" />;
    }
    return typeof icon === 'string' ? icon : icon;
  };

  return (
    <div className="bg-gray-800/40 backdrop-blur-md border border-gray-600/30 rounded-xl p-6 hover:border-emerald-500/50 transition-all duration-300 group hover:shadow-xl hover:shadow-emerald-500/10">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gray-700/50 rounded-lg flex items-center justify-center text-2xl">
            {getGameIcon()}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <p className="text-gray-400 text-sm">{description}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">{price}</div>
          <div className="text-gray-400 text-sm">per month</div>
        </div>
      </div>
      
      <Link 
        to={getConfigPath(game)}
        className={`block w-full ${buttonStyles[buttonColor]} text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-center`}
      >
        Configure
      </Link>
    </div>
  );
};

export default ServerCard;
