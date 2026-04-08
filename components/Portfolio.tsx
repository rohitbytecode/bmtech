"use client";
import React, { useEffect, useState } from "react";
import ProjectCard from "./ProjectCard";
import { Project } from "@/services/dataService";
import { useData } from "@/hooks/useData";

export default function Portfolio() {
  const { data: projects, loading, error } = useData<Project>('projects');

  return (
    <section id="portfolio" className="py-24 px-6 sm:px-12 md:px-24 bg-surface/50 border-y border-border">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">Our Masterpieces</h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            A small glimpse into the high-impact projects we've delivered for our partners.
          </p>
        </div>
        
        {loading && <p className="text-center text-text-secondary">Loading projects...</p>}
        {error && <p className="text-center text-red-500">Error: {error}</p>}
        
        {!loading && !error && projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                title={project.title}
                category={project.category}
                image={project.image}
                link={project.link}
              />
            ))}
          </div>
        ) : !loading && !error && (
          <p className="text-center text-text-secondary py-12">No projects found. Check back later!</p>
        )}
      </div>
    </section>
  );
}
