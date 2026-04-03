import React from "react";
import Card from "../common/Card";
import CardTitle from "../common/CardTitle";
import { Newspaper } from "lucide-react";

const GeopoliticalNewsCard = () => {
  const news = [
    {
      headline:
        "Federal Reserve signals potential rate cuts amid economic uncertainty.",
      impact: "High",
    },
    {
      headline:
        "EU-China trade relations show signs of improvement following summit.",
      impact: "Medium",
    },
    {
      headline:
        "Oil prices surge on Middle East tensions and supply chain concerns.",
      impact: "High",
    },
  ];

  return (
    <Card>
      <CardTitle icon={<Newspaper />}>Global Geopolitical News</CardTitle>
      <div className="space-y-4">
        {news.map((item, i) => (
          <div
            key={i}
            className="border-b border-gray-800 pb-2 last:border-b-0"
          >
            <p className="text-gray-300">{item.headline}</p>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full mt-2 inline-block ${
                item.impact === "High"
                  ? "bg-red-500/20 text-red-400"
                  : "bg-yellow-500/20 text-yellow-400"
              }`}
            >
              {item.impact} Impact
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default GeopoliticalNewsCard;
