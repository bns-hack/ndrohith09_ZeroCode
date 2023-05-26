import { Avatar, Box, Flex, IconButton, Text } from '@chakra-ui/react';
import { MdOutlineMoreHoriz } from 'react-icons/md';

export const AvatarBox = ({ collapse }) => {
  const user_name = localStorage.getItem('_zero_user');
  return (
    <Flex
      borderWidth={collapse ? 1 : 0}
      borderColor="gray.100"
      borderRadius="full"
      w="full"
      p={2}
      alignItems="center"
      justifyContent="space-between"
      gap={2}
      flexDirection={collapse ? 'row' : 'column-reverse'}
    >
      <Avatar name={user_name} bg="gray.600" />
      {collapse && (
        <Flex
          w="full"
          flexDirection="column"
          gap={4}
          justifyContent="center"
          alignItems="flex-start"
        >
          <Text as="small" color="gray.500" fontSize={13} lineHeight={1}>
            Zero User Name
          </Text>
          <Text fontSize="sm" fontWeight="bold" pb="0" lineHeight={0}>
            {user_name}
          </Text> 
        </Flex>
      )}
    </Flex>
  );
};
