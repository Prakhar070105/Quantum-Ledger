import React from "react";

const CardTitle = ({ children, icon }) => (
  <h3 className="text-md sm:text-lg font-semibold text-gray-200 mb-4 flex items-center">
    {React.cloneElement(icon, { size: 20, className: "mr-3 text-blue-400" })}
    {children}
  </h3>
);

export default CardTitle;
