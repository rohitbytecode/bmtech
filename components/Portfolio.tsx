"use client";
import React, { useEffect, useState } from "react";
import ProjectCard from "./ProjectCard";
import { getProjects, Project } from "@/lib/data";

export default function Portfolio() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    getProjects().then(setProjects);
  }, []);

  return (
    <section id="portfolio" className="py-24 px-6 sm:px-12 md:px-24 bg-surface/50 border-y border-border">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">Our Masterpieces</h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            A small glimpse into the high-impact projects we've delivered for our partners.
          </p>
        </div>
        
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
      </div>
    </section>
  );
}
