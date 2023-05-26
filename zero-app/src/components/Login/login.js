import React, { Component } from 'react';
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
  Grid,
  theme,
  Container,
  AbsoluteCenter, Image , Stack , ButtonGroup,
  Center, Heading,
  Button , Divider,
  Card, CardHeader, CardBody, CardFooter 
} from '@chakra-ui/react';
import { MdMenu } from 'react-icons/md';
import { FaGithub } from 'react-icons/fa';
import instance from '../Api/api';
import ZLogo from "../assets/logo.svg";
 
class Login extends Component {
  state = {};

  githubAuth = async e => {
    e.preventDefault();
    // window.location.href = 'http://0.0.0.0:8001/api/gh-authorize';
    await instance({
      url: '/gh-authorize',
      method: 'GET',      
    })
      .then(res => { 
        window.location.href = res.data['RESPONSE'];
      }
      )
      .catch(err => console.log(err));

  };

  render() {
    return (
        <Flex
      height="80vh"
      alignItems="center"
      justifyContent="center"
    >
        <Container>
 
        <Center height="100vh">
        <Card maxW='lg' variant={'elevated'}>
  <CardBody center>
    <Image
      src='https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80'
      alt='Green double couch with wooden legs'
      borderRadius='lg'
    />
    <Stack mt='6' spacing='3' align="center">
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
      {/* github button */}
      <Divider />
      <Button
      colorScheme="gray"
      leftIcon={<FaGithub />}
      onClick={this.githubAuth}
    >
      Login with GitHub
    </Button>
    </Stack>
  </CardBody> 
</Card>
      </Center>
        </Container>
    </Flex>
    );
  }
}

export default Login;
