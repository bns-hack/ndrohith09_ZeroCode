import React from "react";
import { Button, Flex, Image } from "@chakra-ui/react";
import ZLogo from "../assets/logo.svg";

export const SwitchButtons = ({ collapse }) => {
  const [isPersonal, setIsPersonal] = React.useState(true);
  const [isBusiness, setIsBusiness] = React.useState(false);

  const handleIsPersonal = () => {
    setIsBusiness(false);
    setIsPersonal(true);
  };

  const handleIsBusiness = () => {
    setIsPersonal(false);
    setIsBusiness(true);
  };

  if (!collapse) {
    return (
      <Flex w="full" alignItems="center" textAlign="center" pl={"5"} pt={10}>
        <Image
        boxSize='35px'
        objectFit='contain'
        src={ZLogo}
        alt='Zero Code'
        />
      </Flex>
    );
  }
  return (
    <Flex
      w="full"
      borderWidth={1}
      borderColor="gray.100"
      borderRadius={14}
      my={6}
    >
      <Button
        w="full"
        variant={isPersonal ? "solid" : "ghost"}
        borderRadius={14}
        colorScheme={isPersonal ? "green" : "gray"}
        id="personal"
        onClick={handleIsPersonal}
        textTransform="uppercase"
        color={isPersonal ? "white" : "gray.500"}
        size="sm"
        py={5}
      >
        Activate
      </Button>
      <Button
        w="full"
        variant={isBusiness ? "solid" : "ghost"}
        borderRadius={14}
        colorScheme={isBusiness ? "red" : "gray"}
        id="business"
        onClick={handleIsBusiness}
        textTransform="uppercase"
        color={isBusiness ? "white" : "gray.500"}
        size="sm"
        py={5}
      >
        Inactivate
      </Button>
    </Flex>
  );
};
