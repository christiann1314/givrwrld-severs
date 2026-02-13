import React from "react";

export function ServerIntegrationStatus() {
  return (
    <div className="rounded-lg border p-4">
      <h3 className="text-lg font-semibold">Integrations</h3>
      <p className="text-sm text-muted-foreground mt-2">
        Supabase integration has been removed. This panel will be updated to reflect MySQL/JWT API status.
      </p>
    </div>
  );
}

export default ServerIntegrationStatus;
