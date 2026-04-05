export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface Project {
  id: string;
  title: string;
  category: string;
  image: string;
  link: string;
}

export interface Package {
  id: string;
  name: string;
  price: string;
  features: string[];
  highlighted?: boolean;
}

export interface MaintenancePlan {
  id: string;
  name: string;
  price: string;
  features: string[];
}

export const getServices = async (): Promise<Service[]> => {
  return [
    {
      id: "1",
      title: "Graphics Design",
      description: "Visual identities, branding, and high-end marketing materials.",
      icon: "Palette",
    },
    {
      id: "2",
      title: "Video & Content",
      description: "Engaging video production and content strategy for brands.",
      icon: "Video",
    },
    {
      id: "3",
      title: "IT Services",
      description: "Custom software development, cloud solutions, and IT support.",
      icon: "Code2",
    },
    {
      id: "4",
      title: "Social Media",
      description: "Strategy, management, and growth for your social presence.",
      icon: "Share2",
    },
  ];
};

export const getProjects = async (): Promise<Project[]> => {
  return [
    {
      id: "1",
      title: "Modern E-commerce",
      category: "IT Services",
      image: "https://images.unsplash.com/photo-1557821552-17105176677c?w=800&q=80",
      link: "#",
    },
    {
      id: "2",
      title: "Brand Identity",
      category: "Graphics Design",
      image: "https://images.unsplash.com/photo-1541462608141-ad4d157ee92a?w=800&q=80",
      link: "#",
    },
    {
      id: "3",
      title: "Viral Marketing Camapign",
      category: "Social Media",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
      link: "#",
    },
    {
      id: "4",
      title: "Corporate Video",
      category: "Video & Content",
      image: "https://images.unsplash.com/photo-1492724441997-5dc865305da7?w=800&q=80",
      link: "#",
    },
  ];
};

export const getPackages = async (): Promise<Package[]> => {
  return [
    {
      id: "starter",
      name: "Starter",
      price: "$499",
      features: ["Basic Design", "Social Setup", "SEO Basics"],
    },
    {
      id: "growth",
      name: "Growth",
      price: "$999",
      highlighted: true,
      features: ["Full Branding", "Content Creation", "Advanced SEO", "IT Support"],
    },
    {
      id: "full-setup",
      name: "Full Setup",
      price: "$1999",
      features: ["All-in-one", "Monthly Support", "Priority Updates", "Full IT Suite"],
    },
  ];
};

export const getMaintenancePlans = async (): Promise<MaintenancePlan[]> => {
  return [
    {
      id: "basic",
      name: "Basic",
      price: "$99/mo",
      features: ["Security Updates", "Weekly Backups", "Bug Fixes"],
    },
    {
      id: "standard",
      name: "Standard",
      price: "$199/mo",
      features: ["Daily Backups", "Performance Tuning", "Monthly Report"],
    },
    {
      id: "premium",
      name: "Premium",
      price: "$399/mo",
      features: ["24/7 Support", "Zero Downtime", "Priority Dev Access"],
    },
  ];
};

export const submitLead = async (data: { name: string; phone: string; message: string }) => {
  console.log("Submitting lead to Supabase:", data);
  return { success: true };
};
