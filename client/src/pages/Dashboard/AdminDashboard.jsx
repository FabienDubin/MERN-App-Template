import { AuthContext } from "@/context/auth.context";
import React, { useContext } from "react";

import ChartTemplate from "@/components/Charts/ChartTemplate";
import PieChartTemplate from "@/components/Charts/PieChartTemplate";
import BarChartTemplate from "@/components/Charts/BarChartTemplate";

//DATA SAMPLES FOR THE CHARTS DATA AND CHART CONFIGURATION
//Should be defined in your actual data fetching function
//CHART
const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
];

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(var(--chart-2))",
  },
};

//PIE
const pieData = [
  { browser: "chrome", visitors: 275, fill: "var(--color-chrome)" },
  { browser: "safari", visitors: 200, fill: "var(--color-safari)" },
  { browser: "firefox", visitors: 287, fill: "var(--color-firefox)" },
  { browser: "edge", visitors: 173, fill: "var(--color-edge)" },
  { browser: "other", visitors: 190, fill: "var(--color-other)" },
];

const pieConfig = {
  visitors: {
    label: "Visitors",
  },
  chrome: {
    label: "Chrome",
    color: "hsl(var(--chart-1))",
  },
  safari: {
    label: "Safari",
    color: "hsl(var(--chart-2))",
  },
  firefox: {
    label: "Firefox",
    color: "hsl(var(--chart-3))",
  },
  edge: {
    label: "Edge",
    color: "hsl(var(--chart-4))",
  },
  other: {
    label: "Other",
    color: "hsl(var(--chart-5))",
  },
};

//BAR
const barData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
];

const barConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(var(--chart-2))",
  },
};

const AdminDashboard = () => {
  //CONTEXT
  const { user } = useContext(AuthContext);

  return (
    <div className="w-full min-h-screen">
      <h1 className="text-2xl font-bold p-4">Hello {user.name}👋</h1>
      <h2
        className="text-xl font-medium px-4"
        data-testid="admin-dashboard-title"
      >
        Welcome to your admin dashboard!
      </h2>
      <p className="px-4 mt-6 text-gray-600 font-light">
        This is an example of dataviz you can display on that page
      </p>

      <div className="p-4 w-full flex items-stretch justify-between gap-4">
        <ChartTemplate
          chartData={chartData}
          chartConfig={chartConfig}
          className="flex-1"
        />
        <PieChartTemplate
          chartData={pieData}
          chartConfig={pieConfig}
          className="flex-1"
        />
        <BarChartTemplate
          chartData={barData}
          chartConfig={barConfig}
          className="flex-1"
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
