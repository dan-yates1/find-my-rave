import React, { Suspense } from "react";
import FindEventsPageContent from "./FindEventsPageContent";

const FindEventsPage = () => {
  return (
    <Suspense fallback={<div>Loading events...</div>}>
      <FindEventsPageContent />
    </Suspense>
  );
};

export default FindEventsPage;
