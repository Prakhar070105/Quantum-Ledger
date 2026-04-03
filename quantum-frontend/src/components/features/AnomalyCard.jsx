import React from "react";
import Card from "../common/Card";
import CardTitle from "../common/CardTitle";
import { ShieldAlert, ShieldCheck } from "lucide-react";

const AnomalyCard = ({ data }) => {
  const isAnomaly = false; // Placeholder (you can later hook into real anomaly detection)

  return (
    <Card>
      <CardTitle icon={isAnomaly ? <ShieldAlert /> : <ShieldCheck />}>
        Quantum Anomaly Shield
      </CardTitle>
      <div
        className={`flex items-center p-4 rounded-lg ${
          isAnomaly
            ? "bg-yellow-500/10 text-yellow-400"
            : "bg-gray-500/10 text-gray-400"
        }`}
      >
        {isAnomaly ? (
          <ShieldAlert size={24} className="mr-3 flex-shrink-0" />
        ) : (
          <ShieldCheck size={24} className="mr-3 flex-shrink-0" />
        )}
        <div>
          <div className="font-bold">
            {isAnomaly ? "Unusual Activity Detected" : "No Anomalies Detected"}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            QSVM analysis of trading patterns.
          </p>
        </div>
      </div>
    </Card>
  );
};

export default AnomalyCard;
