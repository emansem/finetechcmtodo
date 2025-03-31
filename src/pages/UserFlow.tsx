import MainLayout from "../components/layout/MainLayout";
import Card from "../components/ui/Card";

const UserFlow = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">
              User Flow
            </h1>
            <p className="text-[var(--text-secondary)]">
              Visualize and manage user flows
            </p>
          </div>
        </div>

        <Card className="p-6">
          <p className="text-[var(--text-secondary)]">
            User Flow visualization coming soon...
          </p>
        </Card>
      </div>
    </MainLayout>
  );
};

export default UserFlow;
