import React from "react";
import Card from "../components/common/Card";
import StockChart from "../components/charts/StockChart";
import PredictionCard from "../components/features/PredictionCard";
import AnomalyCard from "../components/features/AnomalyCard";
import XaiCard from "../components/features/XaiCard";
import NewsCard from "../components/features/NewsCard";
import CircularProgress from "../components/common/CircularProgress";

const TickerAnalysis = ({ tab, data, isLoading, error, fetchDataForTicker }) => {
  if (isLoading && !data[tab.id]) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <CircularProgress />
          <p className="mt-2 text-lg font-semibold">Querying Quantum Server for {tab.label}...</p>
        </div>
      </div>
    );
  }

  if (error && !data[tab.id]) {
    return <div className="text-red-400 bg-red-500/20 p-4 rounded-md">Error: {error}</div>;
  }

  if (!data[tab.id]) return null;

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">{data[tab.id].ticker} Analysis</h2>
        {data[tab.id].summary && (
          <div className="text-right">
            <p className="text-3xl font-bold text-white">{data[tab.id].summary.value}</p>
            <p className={`text-lg font-semibold ${data[tab.id].summary.isPositive ? "text-green-400" : "text-red-400"}`}>
              {data[tab.id].summary.change} ({data[tab.id].summary.percent})
            </p>
          </div>
        )}
      </div>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-2/3 h-[450px]">
          <Card className="h-full">
            {data[tab.id].chart ? (
              <StockChart chartData={data[tab.id].chart} onPeriodChange={(period) => fetchDataForTicker(tab.id, period)} />
            ) : (
              <p>Chart data not available.</p>
            )}
          </Card>
        </div>
        <div className="lg:w-1/3 flex flex-col gap-6">
          <PredictionCard data={data[tab.id].quantumPrediction} />
          <AnomalyCard data={{}} />
        </div>
      </div>
      <div className="mt-6 grid grid-cols-1 xl:grid-cols-2 gap-6">
        <XaiCard data={{}} />
        {data[tab.id].newsAnalysis && <NewsCard data={data[tab.id].newsAnalysis} />}
      </div>
    </div>
  );
};

export default TickerAnalysis;
