import { useEffect } from "react";

import { initializeMockData, processScheduledAssignments } from "@/lib/mockData";

const SchedulerRunner = () => {
  useEffect(() => {
    initializeMockData();
    const run = () => {
      try {
        processScheduledAssignments();
      } catch (error) {
        console.error("SchedulerRunner error", error);
      }
    };

    run();
    const interval = window.setInterval(run, 30000);
    return () => window.clearInterval(interval);
  }, []);

  return null;
};

export default SchedulerRunner;

