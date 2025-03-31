import MainLayout from "../components/layout/MainLayout";
import Card from "../components/ui/Card";

const UserStories = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">
              User Stories
            </h1>
            <p className="text-[var(--text-secondary)]">
              Manage and track user stories
            </p>
          </div>
        </div>

        <Card className="p-6">
          <p className="text-[var(--text-secondary)]">
            User Stories feature coming soon...
          </p>
        </Card>
      </div>
    </MainLayout>
  );
};

export default UserStories;
