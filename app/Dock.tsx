import React from "react";
import { FloatingDock } from "@/components/ui/floating-dock";
import {
  IconBrandGithub,
  IconBrandX,
  IconExchange,
  IconHome,
  IconNewSection,
  IconTerminal2,
} from "@tabler/icons-react";
import {User, Puzzle, ArrowBigUpDash, CircleCheckBig, Circle} from 'lucide-react'

const Dock = () => {
  const links = [
    {
      title: "Home",
      icon: (
        <IconHome className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "/",
    },

    {
      title: "Levels",
      icon: (
        <Puzzle className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "/levels",
    },
    {
      title: "Upgrades",
      icon: (
        <ArrowBigUpDash className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "#",
    },
    {
      title: "Daily Tasks",
      icon: (
        <CircleCheckBig className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "#",
    },
    {
      title: "Profile",
      icon: (
        <User className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "/profile",
    },
  ];
  return (
    <div className="flex items-center justify-center h-40 w-full dark absolute bottom-0">
      <FloatingDock
        mobileClassName="translate-y-20"
        items={links}
      />
    </div>
  );
};

export default Dock;
