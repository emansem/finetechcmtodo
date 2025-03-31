import { useState, useEffect } from "react";
import MainLayout from "../components/layout/MainLayout";
import { useAuth } from "../hooks/useAuth";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { loadFeaturesFromMd } from "../utils/featureSeeder";
import { featureService } from "../utils/featureService";
import { Feature } from "../types/feature";

const Dashboard = () => {
  const { user } = useAuth();
  const [isSeeding, setIsSeeding] = useState(false);
  const [stats, setStats] = useState({
    frontend: 0,
    backend: 0,
    completed: 0
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [frontendFeatures, backendFeatures] = await Promise.all([
          featureService.getFeatures("frontend"),
          featureService.getFeatures("backend")
        ]);

        const completedFeatures = [...frontendFeatures, ...backendFeatures].filter(
          (f: Feature) => f.status === "completed"
        ).length;

        setStats({
          frontend: frontendFeatures.length,
          backend: backendFeatures.length,
          completed: completedFeatures
        });
      } catch (error) {
        console.error("Failed to load feature stats:", error);
      }
    };

    if (user) {
      loadStats();
    }
  }, [user]);

  const handleSeedFeatures = async () => {
    if (!user) return;
    setIsSeeding(true);
    try {
      await loadFeaturesFromMd(user.uid);
    } catch (error) {
      console.error("Failed to seed features:", error);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Dashboard</h1>
            <p className="text-[var(--text-secondary)]">
              Welcome back, {user?.displayName}
            </p>
          </div>
          {user?.email?.endsWith('@finetechcm.com') && (
            <Button 
              onClick={handleSeedFeatures} 
              isLoading={isSeeding}
              disabled={isSeeding}
            >
              Seed Features to Firebase
            </Button>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <div className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--text-secondary)]">
                  Frontend Features
                </p>
                <p className="text-2xl font-semibold text-[var(--text-primary)]">{stats.frontend}</p>
              </div>
              <div className="p-3 bg-[var(--bg-secondary)] rounded-full">
                <svg
                  className="w-6 h-6 text-[var(--frontend-color)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--text-secondary)]">
                  Backend Features
                </p>
                <p className="text-2xl font-semibold text-[var(--text-primary)]">{stats.backend}</p>
              </div>
              <div className="p-3 bg-[var(--bg-secondary)] rounded-full">
                <svg
                  className="w-6 h-6 text-[var(--backend-color)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
                  />
                </svg>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--text-secondary)]">
                  Completed Features
                </p>
                <p className="text-2xl font-semibold text-[var(--text-primary)]">{stats.completed}</p>
              </div>
              <div className="p-3 bg-[var(--bg-secondary)] rounded-full">
                <svg
                  className="w-6 h-6 text-[var(--success)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
          </Card>
        </div>

        {/* Activity Section */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            Recent Activity
          </h2>
          <p className="text-[var(--text-secondary)]">No recent activity</p>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
