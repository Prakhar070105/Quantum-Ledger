import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import Card from "../common/Card";

const IndexCard = ({ name, value, change, percent, isPositive, onClick }) => {
  if (!value || !change || !percent) {
    return (
      <Card>
        <div className="text-gray-500">{name} data unavailable</div>
      </Card>
    );
  }

  return (
    <Card onClick={onClick}>
      <h4 className="text-lg font-bold text-gray-200">{name}</h4>
      <p className="text-3xl font-bold text-white my-2">{value}</p>
      <div
        className={`flex items-center text-md font-semibold ${
          isPositive ? "text-green-400" : "text-red-400"
        }`}
      >
        {isPositive ? (
          <TrendingUp size={18} className="mr-1" />
        ) : (
          <TrendingDown size={18} className="mr-1" />
        )}
        {change} ({percent})
      </div>
    </Card>
  );
};

export default IndexCard;

