
import React, { useState, useEffect, useCallback } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { Search, X } from "lucide-react";

import Dashboard from "./pages/Dashboard";
import TickerAnalysis from "./pages/TickerAnalysis";
import CircularProgress from "./components/common/CircularProgress";

// ---------------- INITIAL TABS ----------------
const initialTabs = [
  { id: "dashboard", label: "Dashboard" },
  { id: "^FTSE", label: "FTSE 100" },
  { id: "^NSEI", label: "NIFTY 50" },
  { id: "^IXIC", label: "NASDAQ" },
  { id: "^BSESN", label: "SENSEX" },
];

export default function App() {
  const [tabs, setTabs] = useState(initialTabs);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState({});

  // ---------------- SEARCH ----------------
  useEffect(() => {
    if (search.trim() === "") {
      setSearchResults([]);
      return;
    }
    const delay = setTimeout(() => {
      fetch(`http://127.0.0.1:5000/search?query=${search}`)
        .then((res) => res.json())
        .then((data) => setSearchResults(data))
        .catch((err) => console.error("Search fetch error:", err));
    }, 300);
    return () => clearTimeout(delay);
  }, [search]);

  // ---------------- FETCH DATA ----------------
  const fetchDataForTicker = useCallback(async (ticker, period = "6m") => {
    setIsLoading(true);
    setError(null);
    try {
      const [predictRes, chartRes] = await Promise.all([
        fetch(`http://127.0.0.1:5000/predict?ticker=${ticker}`),
        fetch(`http://127.0.0.1:5000/chart/${ticker}?period=${period}`),
      ]);

      if (!predictRes.ok || !chartRes.ok) throw new Error("Failed to fetch data");

      const predictData = await predictRes.json();
      const chartData = await chartRes.json();

      const lastPrice = chartData.data[chartData.data.length - 1];
      const prevPrice = chartData.data[chartData.data.length - 2];
      const change = lastPrice - prevPrice;
      const percentChange = (change / prevPrice) * 100;

      const summary = {
        value: lastPrice.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
        change: change.toFixed(2),
        percent: `${percentChange.toFixed(2)}%`,
        isPositive: change > 0,
      };

      setData((prev) => ({
        ...prev,
        [ticker]: { ...predictData, chart: chartData, summary },
      }));
    } catch (err) {
      console.error(err);
      setError(err.message);
      if (!initialTabs.find((t) => t.id === ticker)) {
        setTabs((prev) => prev.filter((t) => t.id !== ticker));
      }
      setActiveTab("dashboard");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ---------------- INITIAL LOAD ----------------
  useEffect(() => {
    const loadData = async () => {
      if (Object.keys(data).length > 0) return;
      setIsLoading(true);
      try {
        const promises = initialTabs
          .filter((t) => t.id !== "dashboard")
          .map((tab) => fetchDataForTicker(tab.id, "6m"));
        await Promise.all(promises);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [fetchDataForTicker, data]);

  // ---------------- TAB ACTIONS ----------------
  const handleSearch = async (tickerToSearch) => {
    if (!tickerToSearch.trim()) return;
    const ticker = tickerToSearch.trim().toUpperCase();

    if (!tabs.find((t) => t.id === ticker)) {
      setTabs((prev) => [...prev, { id: ticker, label: ticker }]);
    }
    setActiveTab(ticker);
    setSearchResults([]);

    if (!data[ticker]) {
      await fetchDataForTicker(ticker);
    }
    setSearch("");
  };

  const closeTab = (e, tabId) => {
    e.stopPropagation();
    setTabs((prev) => prev.filter((t) => t.id !== tabId));
    if (activeTab === tabId) setActiveTab("dashboard");
    setData((prev) => {
      const newData = { ...prev };
      delete newData[tabId];
      return newData;
    });
  };

  // ---------------- RENDER ----------------
  return (
    <div className="bg-[#0d1117] text-gray-300 min-h-screen font-sans">
      {/* HEADER */}
      <header className="bg-[#161b22] border-b border-gray-800 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          <svg className="h-8 w-8 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5-10-5-10 5z" />
          </svg>
          <h1 className="text-xl font-bold text-white">Quantum Ledger</h1>
        </div>
        <div className="w-1/3 flex items-center relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search stocks (e.g., Apple Inc...)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch(search)}
            className="bg-[#0d1117] border border-gray-700 rounded-md w-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchResults.length > 0 && (
            <div className="absolute top-full mt-2 w-full bg-[#161b22] border border-gray-700 rounded-md shadow-lg z-20">
              {searchResults.map((result) => (
                <div
                  key={result.ticker}
                  onClick={() => handleSearch(result.ticker)}
                  className="px-4 py-2 hover:bg-blue-600/50 cursor-pointer text-sm"
                >
                  <span className="font-bold">{result.ticker}</span>
                  <span className="text-gray-400 ml-2">{result.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="w-1/3"></div>
      </header>

      {/* MAIN TABS */}
      <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
        <Tabs.List className="border-b border-gray-800 px-4 flex space-x-1 overflow-x-auto">
          {tabs.map((tab) => (
            <Tabs.Trigger
              key={tab.id}
              value={tab.id}
              className="py-3 px-4 text-sm font-medium flex-shrink-0 flex items-center data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-white border-b-2 border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 rounded-t-md"
            >
              {tab.label}
              {!initialTabs.find((it) => it.id === tab.id) && (
                <button
                  onClick={(e) => closeTab(e, tab.id)}
                  className="ml-2 p-0.5 rounded-full hover:bg-gray-700"
                >
                  <X size={14} />
                </button>
              )}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        <Tabs.Content value="dashboard" className="p-6">
          <Dashboard
            data={data}
            initialTabs={initialTabs}
            isLoading={isLoading}
            setActiveTab={setActiveTab}
          />
        </Tabs.Content>

        {tabs
          .filter((t) => t.id !== "dashboard")
          .map((tab) => (
            <Tabs.Content key={tab.id} value={tab.id} className="p-6">
              {isLoading && !data[tab.id] ? (
                <div className="flex justify-center items-center h-96">
                  <div className="text-center">
                    <CircularProgress />
                    <p className="mt-2 text-lg font-semibold">
                      Querying Quantum Server for {tab.label}...
                    </p>
                  </div>
                </div>
              ) : error && !data[tab.id] ? (
                <div className="text-red-400 bg-red-500/20 p-4 rounded-md">
                  Error: {error}
                </div>
              ) : (
                <TickerAnalysis
                  tab={tab}
                  data={data}
                  isLoading={isLoading}
                  error={error}
                  fetchDataForTicker={fetchDataForTicker}
                />
              )}
            </Tabs.Content>
          ))}
      </Tabs.Root>
    </div>
  );
}
