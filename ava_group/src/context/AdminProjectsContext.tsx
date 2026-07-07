"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";
import { ProjectData } from "../app/[locale]/page";

interface AdminProjectsContextType {
  projects: ProjectData[];
  setProjects: React.Dispatch<React.SetStateAction<ProjectData[]>>;
}

const AdminProjectsContext = createContext<
  AdminProjectsContextType | undefined
>(undefined);

export function AdminProjectsProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<ProjectData[]>([]);

  return (
    <AdminProjectsContext.Provider value={{ projects, setProjects }}>
      {children}
    </AdminProjectsContext.Provider>
  );
}

export function useAdminProjects() {
  const context = useContext(AdminProjectsContext);
  if (!context) {
    throw new Error(
      "useAdminProjects must be used within AdminProjectsProvider"
    );
  }
  return context;
}
