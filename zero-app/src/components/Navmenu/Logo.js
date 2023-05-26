import { Box,HStack,Image, Flex, Icon, IconButton, Text } from "@chakra-ui/react";
import { AiFillThunderbolt, AiOutlineSearch } from "react-icons/ai";
import ZLogo from "../assets/logo.svg";

export const Logo = ({ collapse }) => (
  <Flex
    w="full"
    alignItems="center"
    justifyContent="space-between"
    flexDirection={collapse ? "row" : "column"}
    gap={4}
  >
    <Box display="flex" alignItems="center" gap={2}>
      {collapse && (
       <HStack spacing='16px'>
       <Image
        boxSize='42px'
        objectFit='contain'
        src={ZLogo}
        alt='Zero Code'
        />
        <Text fontWeight="bold"
        color="gray.600"
        fontSize={20}>
        ZeroCode
        </Text>
        </HStack>
      )}
    </Box> 
  </Flex>
);
