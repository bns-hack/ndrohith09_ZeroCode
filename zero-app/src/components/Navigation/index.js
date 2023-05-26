import { IconProps, List, ListItem, Text } from "@chakra-ui/react";
import { 
  MdOutlineSpaceDashboard,
  MdMailOutline,
  MdCalendarToday,
  MdSupportAgent,
} from "react-icons/md";
import {IoLogoUsd,IoDocument} from "react-icons/io5";
import {MdLogout} from "react-icons/md";
import { NavItem } from "./NavItem";

const items = [
  {
    type: "link",
    label: "Dashboard",
    icon: MdOutlineSpaceDashboard,
    path: "/",
  },
  {
    type: "link",
    label: "Documentation",
    icon: IoDocument,
    path: "https://documentation.bunnyshell.com/docs",
  },

  {
    type: "link",
    label: "Logout",
    icon: MdLogout,
    path: "/logout", 
  },

  {
    type: "header",
    label: "Account",
  },
  {
    type: "link",
    label: "Billing",
    icon: IoLogoUsd,
    path: "/",
  },
  {
    type: "link",
    label: "Support",
    icon: MdSupportAgent,
    path: "/",
  },
];

export const Navigation = ({ collapse }) => (
  <List w="full" my={8}>
    {items.map((item, index) => (
      <ListItem key={index}>
        <NavItem item={item} isActive={index === 0} collapse={collapse} />
      </ListItem>
    ))}
  </List>
);
