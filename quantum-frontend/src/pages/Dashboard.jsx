import React from "react";
import Card from "../components/common/Card";
import CircularProgress from "../components/common/CircularProgress";
import IndexCard from "../components/features/IndexCard";
import GeopoliticalNewsCard from "../components/features/GeopoliticalNewsCard";

const Dashboard = ({ data, initialTabs, isLoading, setActiveTab }) => (
  <div>
    <h2 className="text-2xl font-bold text-white mb-6">Global Market Overview</h2>
    {isLoading && Object.keys(data).length < 4 ? (
      <div className="flex justify-center items-center h-64">
        <CircularProgress />
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {initialTabs.filter((t) => t.id !== "dashboard").map((tab) => {
          const indexData = data[tab.id];
          return indexData ? (
            <IndexCard
              key={tab.id}
              name={tab.label}
              value={indexData.summary.value}
              change={indexData.summary.change}
              percent={indexData.summary.percent}
              isPositive={indexData.summary.isPositive}
              onClick={() => setActiveTab(tab.id)}
            />
          ) : (
            <Card key={tab.id}>
              <div className="h-24 flex items-center justify-center text-gray-500">{tab.label} data unavailable.</div>
            </Card>
          );
        })}
      </div>
    )}
    <GeopoliticalNewsCard />
  </div>
);

export default Dashboard;
