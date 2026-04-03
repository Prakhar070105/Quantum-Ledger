import React from "react";

const Card = ({ children, className = '', onClick }) => (
  <div 
    onClick={onClick} 
    className={`bg-[#161b22] border border-gray-800 rounded-xl p-4 sm:p-6 transition-all duration-200 ${className} ${onClick ? 'cursor-pointer hover:border-blue-500 hover:bg-[#1f2937]' : ''}`}
  >
    {children}
  </div>
);

export default Card;
