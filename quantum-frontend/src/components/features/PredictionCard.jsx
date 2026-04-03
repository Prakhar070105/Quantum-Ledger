import React from "react";
import { TrendingUp, TrendingDown, Bot } from "lucide-react";
import Card from "../common/Card";
import CardTitle from "../common/CardTitle";

const PredictionCard = ({ data }) => {
  if (!data) return null;
  const isUp = data.direction === "UP";
  const confidence = parseFloat(data.confidence);

  return (
    <Card>
      <CardTitle icon={<Bot />}>Quantum Prediction</CardTitle>
      <div className="flex items-center justify-between">
        <div
          className={`text-3xl font-bold flex items-center ${
            isUp ? "text-green-400" : "text-red-400"
          }`}
        >
          {isUp ? (
            <TrendingUp size={32} className="mr-2" />
          ) : (
            <TrendingDown size={32} className="mr-2" />
          )}
          {data.direction}
        </div>
        <div className="relative h-24 w-24">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
            <path
              d="M18 2.0845a15.9155 15.9155 0 010 31.831a15.9155 15.9155 0 010-31.831"
              fill="none"
              stroke="#21262d"
              strokeWidth="4"
            />
            <path
              d="M18 2.0845a15.9155 15.9155 0 010 31.831a15.9155 15.9155 0 010-31.831"
              fill="none"
              stroke={isUp ? "#238636" : "#da3633"}
              strokeWidth="4"
              strokeDasharray={`${confidence}, 100`}
            />
          </svg>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
            <span className="text-2xl font-bold text-white">
              {confidence.toFixed(1)}%
            </span>
            <p className="text-xs text-gray-400">Confidence</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PredictionCard;
