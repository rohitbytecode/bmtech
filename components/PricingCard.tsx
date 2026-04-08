"use client";
import { Check } from "lucide-react";
import { Button } from "./ui/Button";
import { cn } from "@/lib/utils";

interface PricingCardProps {
  name: string;
  price: string;
  features: string[];
  highlighted?: boolean;
}

export default function PricingCard({ name, price, features, highlighted }: PricingCardProps) {
  return (
    <div
      className={cn(
        "p-8 rounded-2xl border transition-all duration-300 relative overflow-hidden",
        highlighted
          ? "bg-surface border-accent-blue shadow-2xl shadow-accent-blue/15 scale-105"
          : "bg-surface border-border hover:border-accent-blue/30"
      )}
    >
      {highlighted && (
        <div className="absolute top-0 right-0 bg-accent-blue text-white text-[10px] uppercase font-bold px-3 py-1 rounded-bl-lg">
          Most Popular
        </div>
      )}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-text-primary mb-2 line-clamp-1">{name}</h3>
        <p className="text-4xl font-bold text-white mb-2">{price}</p>
        <p className="text-sm text-text-secondary">Comprehensive setup & support</p>
      </div>

      <ul className="space-y-4 mb-8">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start text-sm text-text-secondary">
            <Check size={18} className="text-accent-blue mr-3 shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <a href="#contact" className="block w-full">
        <Button
          variant={highlighted ? "primary" : "outline"}
          className="w-full"
        >
          Choose Plan
        </Button>
      </a>
    </div>
  );
}
