import React from "react";
import Card from "../common/Card";
import CardTitle from "../common/CardTitle";
import { BrainCircuit, TrendingUp, TrendingDown } from "lucide-react";

const XaiCard = ({ data }) => {
  const drivers = [
    {
      title: "Market Sentiment",
      reason:
        "Recent news headlines show a strong positive trend, boosting investor confidence.",
      direction: "up",
    },
    {
      title: "Technical Indicators",
      reason:
        "The RSI and MACD signals indicate bullish momentum, suggesting a potential price increase.",
      direction: "up",
    },
    {
      title: "Volume Analysis",
      reason:
        "Trading volume has decreased by 15% over the past week, which can sometimes precede a price correction.",
      direction: "down",
    },
    {
      title: "Institutional Activity",
      reason:
        "Filings show that large institutional buyers have recently increased their positions in this stock.",
      direction: "up",
    },
  ];

  return (
    <Card>
      <CardTitle icon={<BrainCircuit />}>
        Explainable AI (XAI) Drivers
      </CardTitle>
      <div className="space-y-4">
        {drivers.map((driver, i) => (
          <div key={i} className="flex items-start">
            {driver.direction === "up" ? (
              <TrendingUp
                size={20}
                className="mr-4 mt-1 text-green-500 flex-shrink-0"
              />
            ) : (
              <TrendingDown
                size={20}
                className="mr-4 mt-1 text-red-500 flex-shrink-0"
              />
            )}
            <div>
              <h4 className="font-semibold text-gray-200">{driver.title}</h4>
              <p className="text-sm text-gray-400">{driver.reason}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default XaiCard;
