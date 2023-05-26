import React from 'react';
import {
  ChakraProvider,
  Box,
  Text,
  Flex,
  HStack,
  IconButton,
  Link,
  VStack,
  Code,
  Image,
  theme,
} from '@chakra-ui/react';
import { ColorModeSwitcher } from './ColorModeSwitcher';
import { MdMenu } from 'react-icons/md';
import { Sidebar } from './components/Sidebar';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard/dashboard';
import Project from './components/Project/project';
import Login from "./components/Login/login";
import Callback from './components/Login/callback';

function App() {
  const [collapse, setCollapse] = React.useState(true); 
  return (
    <ChakraProvider theme={theme}>
      <Box textAlign="center" fontSize="xl">
        {localStorage.getItem('_zero_token') === null ? (
          <Router>
          <Routes>
            <Route path="*" element={<Login />} />
            <Route path="/callback" element={<Callback />} />
          </Routes>
        </Router>  
        ) : (
<HStack w="full" h="100vh" bg="gray.100" padding={2}>
          <Flex
           as="aside"
           w="full"
           h="full"
           maxW={collapse ? 275 : 100}
           bg="white"
           alignItems="start"
           padding={6}
           flexDirection="column"
           justifyContent="space-between"
           transition="ease-in-out .2s"
           borderRadius="3xl"
           position="relative"
          >
            <IconButton   
               isRound           
                aria-label="Menu Collapse"
                icon={<MdMenu 
                size={18}
                />} 
                position="absolute"
                color={'gray.600'} 
                colorScheme='gray'
                top={4}
                right={4}
                onClick={() => setCollapse(!collapse)}
              />
            <Sidebar collapse={collapse} />
          </Flex>
      
          <Flex
            as="main"
            w="full"
            h="full"
            bg="white"
            flexDirection="column"
            position="relative"
            borderRadius="3xl"
            overflowX={'auto'}
          >  
          <Box as="header" w="full" p={4}> 
          </Box>
          <Router>
              <Routes>
                <Route exact path="/" element={<Dashboard />} />
                <Route path="/projects/:name" element={<Project />} />
              </Routes>
            </Router>            
          </Flex>
        </HStack> 
        )}
        
      </Box>
    </ChakraProvider>
  );
}

export default App;
