import React from "react";
import { Box } from "@chakra-ui/react";
import { AvatarBox } from "./Navmenu/AvatarBox";
import { Logo } from "./Navmenu/Logo";
import { Navigation } from "./Navigation";
import { SwitchButtons } from "./Navmenu/SwitchButtons";

export const Sidebar = ({ collapse }) => (
  <React.Fragment>
    <Box w="full">
      <Logo collapse={collapse} />
      <SwitchButtons collapse={collapse} />
      <Navigation collapse={collapse} />
    </Box>
    <AvatarBox collapse={collapse} />
  </React.Fragment>
);
