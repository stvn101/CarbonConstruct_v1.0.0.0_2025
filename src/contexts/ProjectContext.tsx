import * as React from "react";
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { toast } from '@/hooks/use-toast';
import { z } from 'zod';
import { logger } from '@/lib/logger';

interface Project {
  id: string;
  name: string;
  description?: string | null;
  location?: string | null;
  project_type: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface ProjectContextType {
  currentProject: Project | null;
  projects: Project[];
  loading: boolean;
  createProject: (project: Omit<Project, 'id' | 'created_at' | 'updated_at'>, checkLimits?: () => { allowed: boolean; reason?: string }) => Promise<boolean>;
  selectProject: (projectId: string) => void;
  refreshProjects: () => Promise<void>;
}

// Validation schema for project creation
const projectSchema = z.object({
  name: z.string()
    .trim()
    .min(1, { message: "Project name is required" })
    .max(100, { message: "Project name must be less than 100 characters" }),
  description: z.string()
    .max(500, { message: "Description must be less than 500 characters" })
    .optional(),
  location: z.string()
    .max(200, { message: "Location must be less than 200 characters" })
    .optional(),
  project_type: z.string()
    .min(1, { message: "Project type is required" }),
  status: z.string()
    .min(1, { message: "Status is required" }),
});

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const refreshProjects = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
      
      // If no current project and we have projects, select the first one
      if (!currentProject && data && data.length > 0) {
        setCurrentProject(data[0]);
      }
    } catch (error) {
      logger.error('ProjectContext:refreshProjects', error);
      toast({
        title: "Error loading projects",
        description: "Failed to load your projects. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, currentProject]);

  const createProject = async (
    projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>,
    checkLimits?: () => { allowed: boolean; reason?: string }
  ): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create projects.",
        variant: "destructive",
      });
      return false;
    }

    // Validate input
    try {
      projectSchema.parse(projectData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation error",
          description: error.issues[0].message,
          variant: "destructive",
        });
        return false;
      }
    }

    // Check limits if provided
    if (checkLimits) {
      const limitCheck = checkLimits();
      if (!limitCheck.allowed) {
        toast({
          title: "Limit reached",
          description: limitCheck.reason || "You've reached your project limit.",
          variant: "destructive",
        });
        return false;
      }
    }

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([{
          ...projectData,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;
      
      await refreshProjects();
      setCurrentProject(data);
      
      toast({
        title: "Project created",
        description: `${projectData.name} has been created successfully.`,
      });

      return true;
    } catch (error) {
      logger.error('ProjectContext:createProject', error);
      toast({
        title: "Error creating project",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const selectProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setCurrentProject(project);
    }
  };

  useEffect(() => {
    if (user) {
      refreshProjects();
    } else {
      setProjects([]);
      setCurrentProject(null);
    }
  }, [user, refreshProjects]);

  const value = {
    currentProject,
    projects,
    loading,
    createProject,
    selectProject,
    refreshProjects,
  };

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
};