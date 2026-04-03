import React from "react";
import Card from "../common/Card";
import CardTitle from "../common/CardTitle";
import { Newspaper } from "lucide-react";

const NewsCard = ({ data }) => {
  if (!data) {
    return (
      <Card>
        <CardTitle icon={<Newspaper />}>AI Sentinel News</CardTitle>
        <div className="text-gray-500">No news available</div>
      </Card>
    );
  }

  return (
    <Card>
      <CardTitle icon={<Newspaper />}>AI Sentinel News</CardTitle>
      <div className="mb-4">
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full ${
            data.sentiment === "Positive"
              ? "bg-green-500/20 text-green-400"
              : data.sentiment === "Negative"
              ? "bg-red-500/20 text-red-400"
              : "bg-gray-500/20 text-gray-400"
          }`}
        >
          Overall Sentiment: {data.sentiment}
        </span>
      </div>
      <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
        {data.headlines.map((headline, i) => (
          <p
            key={i}
            className="text-sm text-gray-400 border-l-2 border-gray-700 pl-3 hover:bg-gray-800/50 transition-colors"
          >
            {headline}
          </p>
        ))}
      </div>
    </Card>
  );
};

export default NewsCard;
