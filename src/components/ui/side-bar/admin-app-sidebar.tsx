"use client";

import * as React from "react";
import { Bot, FileText, LayoutDashboard, NotepadText } from "lucide-react";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Home",
      href: "/dashboard",
      icon: LayoutDashboard,
      isActive: true,
    },
    {
      title: "Department",
      href: "/department",
      icon: Bot,
      items: [
        {
          title: "Students",
          href: "/students",
        },
        {
          title: "Instructors",
          href: "/instructors",
        },
      ],
    },
    {
      title: "Survey",
      href: "/questionnaire",
      icon: NotepadText,
    },
    {
      title: "Instructor Evaluations",
      href: "/instructor-evaluations",
      icon: NotepadText,
    },
    {
      title: "Student Responses",
      href: "/responses",
      icon: FileText,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible='icon' {...props}>
      <SidebarHeader>SAST</SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
