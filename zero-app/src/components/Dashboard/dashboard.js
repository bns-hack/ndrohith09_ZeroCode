import React, { Component } from 'react';
import {
  Card,
  CardBody,
  Heading,
  Image,
  Stack,
  HStack,
  Text,
  Divider,
  CardFooter,
  ButtonGroup,
  DrawerFooter,
  Button,
  Box,
  VStack,
  Spacer,
  Link,
  DrawerOverlay,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerCloseButton,
  Highlight,
  Input,
  Select,
} from '@chakra-ui/react';
import swal from 'sweetalert';
import instance from '../Api/api';

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      project_name: '',
      projects: [],
    };
  }

  async componentDidMount() {
    var user_name = localStorage.getItem('_zero_user');
    await instance({
      url: '/project?user_name=' + user_name,
      method: 'GET',
    })
      .then(res => {
        console.log(res.data);
        this.setState({ projects: res.data['RESPONSE'].projects });
      })
      .catch(err => {
        console.log(err);
      });
  }

  handleProject = async e => {
    e.preventDefault();
    const { project_name } = this.state;
    var user_name = localStorage.getItem('_zero_user');

    await instance({
      url:'project/',
      method: 'POST',
      data : {
        project_name : project_name,
        user_name : user_name
      }
    })
      .then(res => {
        swal('Woohah!', 'Project Created!', 'success');
        console.log(res.data);
        window.location.reload();
      })
      .catch(err => {
        console.log(err);
      });
  };

  onOpen = () => {
    this.setState({ isOpen: true });
  };

  onClose = () => {
    this.setState({ isOpen: false });
  };

  render() {
    const { isOpen,projects } = this.state;
    return (
      <Box alignContent={'left'}>
        <HStack ml={10}>
          <Text color="gray.600" fontSize={25} as="b">
            Templates
          </Text>
        </HStack>
        <Spacer />
        <HStack p={6} spacing={8} direction="row">
          <Card maxW="sm" variant="outline">
            <CardBody>
              <Link onClick={this.onOpen}>
                <Image
                  src="https://cdn.dribbble.com/users/1187836/screenshots/5922007/media/ed540ace0edfcb31c9a52b50d3d4f84d.gif"
                  alt="Green double couch with wooden legs"
                  borderRadius="lg"
                />
              </Link>

              <Stack mt="6" spacing="3">
                <Text fontSize={'md'}>Graphql API + Postgres</Text>
              </Stack>
            </CardBody>
          </Card>
        </HStack>
        <Spacer />

        <HStack ml={10}>
          <Text color="gray.600" fontSize={25} as="b">
            My Projects
          </Text>
        </HStack>

        <HStack p={6} spacing={8} direction="row">
          {projects.length > 0 ? 
          projects.map((project, index) => (
          <Card maxW="sm" variant="outline" key={index}>
          <CardBody>
            <Link href={"/projects/"+project.name}>
              <Image
                src="https://cdn.dribbble.com/users/904433/screenshots/9062655/media/29cab8650ad95ef6e2aefdcd7edab786.png?compress=1&resize=1000x750&vertical=top"
                alt="Graphql"
                borderRadius="lg"
              />
            </Link>

            <Stack mt="6" spacing="3">
              <Text fontSize={'md'}>{project.name}</Text>
            </Stack>
          </CardBody>
        </Card>
       )) : (
            <Text>No Projects</Text>
          )}
          

          
        </HStack>

        <Drawer
          closeOnOverlayClick={false}
          onClose={this.onClose}
          isOpen={isOpen}
          size={'md'}
        >
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader>{`Create New Project`}</DrawerHeader>
            <DrawerBody>
              <Heading lineHeight="tall">
                <Text fontSize={'md'} fontWeight={'normal'}>
                  <Highlight
                    query={['Graphql API', 'Postgre SQL', 'new']}
                    styles={{
                      px: '2',
                      py: '1',
                      rounded: 'full',
                      bg: 'teal.100',
                    }}
                  >
                    Graphql API and Postgre SQL stack will be used to created
                    your new project
                  </Highlight>
                </Text>
              </Heading>
              <br />
              <Text size="md">Please enter your project name</Text>
              <br />
              <input
                className="form-control"
                type="text"
                id="project_name"
                name="project_name"
                placeholder="Project Name"
                onChange={e => {
                  this.setState({ project_name: e.target.value });
                }}
              />
              <br />
            </DrawerBody>
            <DrawerFooter borderTopWidth="1px">
              <Button colorScheme="blue" onClick={this.handleProject}>
                Create Project
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </Box>
    );
  }
}

export default Dashboard;
