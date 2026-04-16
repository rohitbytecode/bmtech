'use client';
import Image from 'next/image';
import { ExternalLink } from 'lucide-react';
import { Button } from './ui/Button';
import { useState } from 'react';

import { formatUrl, ensureValidImageUrl } from '@/lib/utils';

interface ProjectCardProps {
  title: string;
  category: string;
  image: string;
  link: string;
}

export default function ProjectCard({ title, category, image, link }: ProjectCardProps) {
  const safeImageUrl = ensureValidImageUrl(image);
  const [active, setActive] = useState(false);

  return (
    <div
      className="group rounded-xl overflow-hidden bg-surface border border-border hover:border-accent-blue transition-all duration-300"
      onClick={() => setActive(!active)} // mobile
    >
      <div className="relative h-48 sm:h-64 md:h-72 w-full overflow-hidden p-4">
        <Image
          src={safeImageUrl}
          alt={title}
          fill
          className={`
            object-cover scale-90 transition-all duration-500
            ${active ? 'scale-100 grayscale-0' : 'grayscale'}
            group-hover:scale-100 group-hover:grayscale-0
          `}
        />

        <div
          className={`
            absolute inset-0 flex items-center justify-center
            bg-black/50 transition-opacity duration-300
            ${active ? 'opacity-100' : 'opacity-0'}
            group-hover:opacity-100
          `}
        >
          <a href={formatUrl(link)} target="_blank" rel="noopener noreferrer">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/10 text-white backdrop-blur border-white/20 hover:bg-white/20"
            >
              Live Demo <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </a>
        </div>
      </div>

      <div className="p-5">
        <span className="text-xs font-medium text-accent-blue tracking-wider uppercase mb-1 block">
          {category}
        </span>
        <h4 className="text-lg font-bold text-text-primary">{title}</h4>
      </div>
    </div>
  );
}
