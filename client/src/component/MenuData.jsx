import {
  LayoutDashboard,
  ScanEye,
  Cloud,
  Server,
  ShieldCheck,
} from "lucide-react";

export const MenuData = [
  {
    id: "1",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  {
    id: "2",
    label: "Scan",
    icon: ScanEye,
    children: [
      {
        id: "2.1",
        label: "GCP",
        icon: Cloud,
        path: "/GCP_Scan",
      },
      {
        id: "2.2",
        label: "AWS",
        icon: Server,
        path: "/AWS_Scan",
      },
    ],
  },
  {
    id: "3",
    label: "Findings",
    icon: ShieldCheck,
    children: [
      {
        id: "3.1",
        label: "GCP",
        icon: Cloud,
        path: "/GCP_Findings",
      },
      {
        id: "3.2",
        label: "AWS",
        icon: Server,
        path: "/AWS_Findings",
      },
    ],
  },
];
