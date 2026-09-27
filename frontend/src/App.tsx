import { useState } from "react";
import { AppShell } from "./components/layout/AppShell";
import { ComingSoonPage } from "./pages/ComingSoonPage";
import { DashboardPage } from "./pages/DashboardPage";

export type AppPage = "dashboard" | "work-orders" | "reports" | "rework-scrap" | "settings" | "nc-defects" | "master-data";

function App() {
  const [activePage, setActivePage] = useState<AppPage>("dashboard");
  const content = activePage === "dashboard" ? <DashboardPage /> : <ComingSoonPage page={activePage} />;

  return <AppShell activePage={activePage} onNavigate={setActivePage}>{content}</AppShell>;
}

export default App;
