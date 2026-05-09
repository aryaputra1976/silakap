import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function HeaderMenu() {
  return (
    <div className="grid">
      <div className="overflow-auto">
        <Tabs
          defaultValue="dashboards"
          className="flex text-sm text-muted-foreground"
        >
          <TabsList size="xs">
            <TabsTrigger value="dashboards">Dashboards</TabsTrigger>
            <TabsTrigger value="public-profiles">Public Profiles</TabsTrigger>
            <TabsTrigger value="account-settings">Account Settings</TabsTrigger>
            <TabsTrigger value="network">Network</TabsTrigger>
            <TabsTrigger value="authentication">Authentication</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}
