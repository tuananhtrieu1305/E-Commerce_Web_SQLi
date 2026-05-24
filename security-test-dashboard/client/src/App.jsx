import { useMemo, useState } from "react";
import { Activity, Database, FileDown, Network, Shield, Syringe } from "lucide-react";
import { AppShell } from "./components/AppShell.jsx";
import { DashboardPage } from "./features/dashboard/DashboardPage.jsx";
import { SqliTestPage } from "./features/sqli/SqliTestPage.jsx";
import { WafTestPage } from "./features/waf/WafTestPage.jsx";
import { DatabaseSecurityPage } from "./features/database/DatabaseSecurityPage.jsx";
import { LoadBalancerPage } from "./features/loadbalancer/LoadBalancerPage.jsx";
import { EvidencePage } from "./features/evidence/EvidencePage.jsx";

const pages = [
  { id: "dashboard", label: "Dashboard", icon: Activity, component: DashboardPage },
  { id: "sqli", label: "SQLi", icon: Syringe, component: SqliTestPage },
  { id: "waf", label: "WAF", icon: Shield, component: WafTestPage },
  { id: "database", label: "Database", icon: Database, component: DatabaseSecurityPage },
  { id: "loadbalancer", label: "Load Balancer", icon: Network, component: LoadBalancerPage },
  { id: "evidence", label: "Evidence", icon: FileDown, component: EvidencePage },
];

export default function App() {
  const [activePageId, setActivePageId] = useState("dashboard");
  const activePage = useMemo(
    () => pages.find((page) => page.id === activePageId) ?? pages[0],
    [activePageId],
  );
  const Page = activePage.component;

  return (
    <AppShell pages={pages} activePageId={activePageId} onNavigate={setActivePageId}>
      <Page />
    </AppShell>
  );
}

