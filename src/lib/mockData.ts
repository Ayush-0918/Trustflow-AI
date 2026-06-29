export const DASHBOARD_KPIS = {
  totalRevenue: {
    value: "$1,240,500.00",
    change: "+14.5%",
    trend: "up"
  },
  activeContracts: {
    value: "1,432",
    change: "+5.2%",
    trend: "up"
  },
  validationJobs: {
    value: "84,092",
    change: "+22.4%",
    trend: "up"
  },
  processingQueue: {
    value: "1,204",
    change: "-12.5%",
    trend: "down"
  },
  trustScoreAvg: {
    value: "94.2",
    change: "+1.2",
    trend: "up"
  }
};

export const TIME_SERIES_DATA = [
  { name: "Jan", revenue: 4000, nodes: 2400, validation: 2400 },
  { name: "Feb", revenue: 3000, nodes: 1398, validation: 2210 },
  { name: "Mar", revenue: 2000, nodes: 9800, validation: 2290 },
  { name: "Apr", revenue: 2780, nodes: 3908, validation: 2000 },
  { name: "May", revenue: 1890, nodes: 4800, validation: 2181 },
  { name: "Jun", revenue: 2390, nodes: 3800, validation: 2500 },
  { name: "Jul", revenue: 3490, nodes: 4300, validation: 2100 },
];

export const RECENT_TRANSACTIONS = [
  { id: "TX-9901", node: "Alpha Sector 4", amount: "$14,500", status: "Verified", time: "10 min ago" },
  { id: "TX-9902", node: "Beta Sector 1", amount: "$3,200", status: "Pending", time: "45 min ago" },
  { id: "TX-9903", node: "Gamma Sector 9", amount: "$22,100", status: "Failed", time: "2 hours ago" },
  { id: "TX-9904", node: "Delta Sector 2", amount: "$8,900", status: "Verified", time: "5 hours ago" },
];

export const FRAUD_DETECTION_RESULTS = [
  { id: "F-101", riskScore: 89, type: "Identity Mismatch", action: "Blocked" },
  { id: "F-102", riskScore: 72, type: "Velocity Limit", action: "Flagged" },
  { id: "F-103", riskScore: 94, type: "Deepfake Video", action: "Blocked" },
  { id: "F-104", riskScore: 65, type: "IP Anomaly", action: "Flagged" },
];

export const SYSTEM_NOTIFICATIONS = [
  { id: 1, title: "System Update", message: "Node 1.4.2 deployed to grid.", type: "info", time: "Just now" },
  { id: 2, title: "Threat Detected", message: "Multiple failed auth attempts on Sector 4.", type: "warning", time: "1 hr ago" },
  { id: 3, title: "Contract Finalized", message: "TX-9901 smart contract fulfilled.", type: "success", time: "2 hrs ago" },
];
