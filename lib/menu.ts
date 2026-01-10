export const menuByRole = {
  hr: [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Users", path: "/users" },
    { label: "Projects", path: "/projects" },
    { label: "Leave Reports", path: "/reports/leaves" },
    { label: "Performance Reports", path: "/reports/performance" },
  ],

  manager: [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Projects", path: "/projects" },
    { label: "Tasks", path: "/tasks" },
    { label: "Team Progress", path: "/progress" },
    { label: "Leave Requests", path: "/leaves" },
    { label: "Performance Review", path: "/performance" },
  ],

  employee: [
    { label: "Dashboard", path: "/dashboard" },
    { label: "My Projects", path: "/my-projects" },
    { label: "My Tasks", path: "/my-tasks" },
    { label: "Daily Progress", path: "/progress" },
    { label: "Leave", path: "/leaves" },
    { label: "Feedback", path: "/feedback" },{ label: "My Performance", path: "/my-performance" },
  ],
};
