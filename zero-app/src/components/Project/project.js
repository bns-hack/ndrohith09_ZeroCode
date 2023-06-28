import React, { Component } from 'react';
import {
  Card,
  CardBody,
  Kbd,
  Flex,
  Stack,
  HStack,
  Text,
  SimpleGrid,
  Box,
  VStack,
  Spacer,
  ButtonGroup,
  Button,
  Input,
  FormControl,
  Link,
  FormLabel,
  Center,
  AlertIcon,
  Highlight,
  Alert,
  Container,
  AccordionItem,
  Accordion,
  AccordionIcon,
  AccordionPanel,
  AccordionButton,
  Table,
  Thead,
  Tbody,
  Tfoot,
  DrawerOverlay,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerCloseButton,
  Tr,
  Th,
  Select,
  Td,
  TableCaption,
  DrawerFooter,
  TableContainer,
  Divider,
} from '@chakra-ui/react';
import { useParams } from "react-router-dom";
import instance from '../Api/api';
import swal from 'sweetalert';

/* @description: This is a higher order component that
 *  inject a special prop   to our component.
 */
function withRouter(Component) {
  function ComponentWithRouter(props) {
    let params = useParams();
    return <Component {...props} params={params} />;
  }
  return ComponentWithRouter;
}

class Project extends Component {
  state = {
    isProduction: false,
    isOpen: false,
    columns: [],
    columnNameList: [],
    columnTypeList: [],
    error: '',
    tableName: '',

    tables : [],
    project_name: '',
    is_deployed: '',
    env_id:"",

    deployData : [],
    
  };

  async componentDidMount() {
    const { params } = this.props;
    console.log(params);
    var user_name = localStorage.getItem('_zero_user');
    await instance({
      url: '/table?project_name=' + params.name + '&user_name=' + user_name,
      method: 'GET',
    })
      .then(res => {
        console.log(res.data['RESPONSE']);
        this.setState({ tables: res.data['RESPONSE'].tables , env_id: res.data['RESPONSE'].env_id, project_name: res.data['RESPONSE'].name , is_deployed: res.data['RESPONSE'].is_deployed});
      })
      .catch(err => {
        console.log(err);
      });

    if (this.state.is_deployed) {
      const env_id = this.state.env_id
      await instance({
        url: '/production?env_id=' + env_id,
        method: 'GET',
      })
        .then(res => {
          console.log("project deplyo status", res.data['RESPONSE']); 
          this.setState({ deployData: res.data['RESPONSE'] });
        })
        .catch(err => {
          console.log(err);
        });
    }
  }

  onOpen = () => {
    this.setState({ isOpen: true });
  };

  onClose = () => {
    this.setState({ isOpen: false });
  };

  handleAddColumn = e => {
    e.preventDefault();
    console.log('Add column');
    console.log(this.state.columnName, this.state.columnType);
    const { columnName, columnType } = this.state;

    if (
      columnName === '' ||
      columnType === '' ||
      columnName === undefined ||
      columnType === undefined
    ) {
      this.setState({ error: 'Please enter all fields' });
      return;
    } else {
      // Create column object
      const column = {
        name: columnName,
        type: columnType,
      };

      // Append column object to columns array
      this.setState(prevState => ({
        columns: [...prevState.columns, column],
        columnName: '',
        columnType: '',
      }));

      // set existing input values in input field to empty
      document.getElementById('columnName').value = '';
      document.getElementById('columnType').value = '';

      console.log(this.state.columns);
    }
  };

  handleAddTable = async(e) => {
    e.preventDefault();
    if (this.state.tableName === '' || this.state.tableName === undefined) {
      this.setState({ error: 'Please enter table name' });
      return;
    } else {
      const user_name = localStorage.getItem('_zero_user');
      var json_data = {
        table_name : this.state.tableName,
        columns : this.state.columns,
        project_name : this.state.project_name,
        user_name : user_name
      }
      
      await instance({
        url: 'table/',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        data: json_data,
      }).then(res => {
        console.log(res);
        window.location.reload();
      }).catch(err => {
        console.log(err);
      });
    }
  };

  deployProduction = e => {
    e.preventDefault();
    console.log('Deploy to production');
    const user_name = localStorage.getItem('_zero_user');
    instance({
      url: 'production/',
      method: 'POST', 
      data : {
        project_name : this.state.project_name, 
        user_name : user_name
      }    
    })
    .then(res => {
      console.log(res); 
      this.setState({ deployData: res.data.response });
      swal("Success", "Project deployed to production", "success");
      // time out to reload page
      setTimeout(function(){ window.location.reload(); }, 2000);
    })
    .catch(err => {
      console.log(err);
    });
  };

  redeployProduction = async(e) => {
    e.preventDefault(); 

    await swal({
      title: "Are you sure?",
      text: "Once redeployed, you will not be able to recover previous production!",
      icon: "warning",
      buttons: true,
      dangerMode: false,
    })
    .then((willDelete) => {
      if (willDelete) {
        instance({
      url: 'production/',
      method: 'PUT',
      data : {
        env_id : this.state.env_id,
      }
    })
    .then(res => {
      console.log(res);
      swal("Success", "Project Re-Deployed to production", "success");
      setTimeout(function(){ window.location.reload(); }, 2000);
    })
    .catch(err => {
      console.log(err);
    });
  }
});
  };

  destroyProduction = async(e) => {
    e.preventDefault();
    console.log('Destroy production');
    const user_name = localStorage.getItem('_zero_user');

    await swal({
      title: "Are you sure?",
      text: "Once deleted, you will not be able to recover this production!",
      icon: "warning",
      buttons: true,
      dangerMode: false,
    })
    .then((willDelete) => {
      if (willDelete) {
        instance({
          url: 'production/',
          method: 'DELETE',
          data : {
            env_id : this.state.env_id,
            project_name : this.state.project_name,
            user_name : user_name
          }
        })
        .then(res => {
          swal("Poof! Your production has been deleted!", {
            icon: "success",
          });
          console.log(res);
      setTimeout(function(){ window.location.reload(); }, 2000);
        })
        .catch(err => {
          console.log(err);
        });
      }
    });
   
  };

  render() {
    const { error, project_name,is_deployed, columns, isOpen, tables, deployData } = this.state;
    return (
      <Box px={10} alignContent={'left'}>
        <HStack>
          <Text color="gray.600" fontSize={25} as="b">
            {project_name}
          </Text>
        </HStack>
        <br />
        {is_deployed ? (
          <Flex minWidth="max-content" alignItems="center" gap="2">
            <Box width={'100%'}>   
              <Input
                isReadOnly
                variant="filled" 
                placeholder={`https://graphapi-${deployData.namespace}.bunnyenv.com/graphql`}                
                _placeholder={{ opacity: 1, color: 'gray.500' }}
              />
            </Box>
            <Spacer />
            <ButtonGroup gap="4">
              <Button
                onClick={e => {
                  window.open(`https://graphapi-${deployData.namespace}.bunnyenv.com/graphql`, '_blank');
                }}
                color="gray.500"
              >
                Open
              </Button>
            </ButtonGroup>
          </Flex>
        ) : (
          <Alert status="warning" variant="top-accent">
            <AlertIcon />
            <Text fontSize={'md'}>Application not deployed to Production.</Text>
          </Alert>
        )}
        <br />

        <Box p={5} borderRadius={'4'} borderWidth={'1px'}>
          <Flex minWidth="max-content" alignItems="center" gap="2">
            <Box>
              <Text as="b" fontSize={'22px'}>
                Production
              </Text>
            </Box>
            <Spacer />
            <ButtonGroup gap="2">
              {is_deployed ? 
              <>
              <Button
              onClick={this.redeployProduction}
              fontSize={'sm'}
              variant="outline"
              colorScheme="blue"
              >
              Deploy
            </Button>
            <Button
              onClick={this.destroyProduction}
              fontSize={'sm'}
              variant="outline"
              colorScheme="red"
              >
              Destroy
            </Button>
              </>
              : 
              <Button
                onClick={this.deployProduction}
                fontSize={'sm'}
                variant="outline"
                colorScheme="blue"
              >
                Create
              </Button>
              }
              
              
            </ButtonGroup>
          </Flex>

          <br />

          <Card borderRadius={'4'} variant="outline">
            <CardBody>
              <Flex minWidth="max-content" alignItems="center" gap="2">
                <Box>
                  <HStack>
                    <Text color="gray.600" fontSize={18} as="b">
                      Operation Status
                    </Text>
                  </HStack>
                </Box>
                <Spacer />
                <Text color="gray.600" fontSize={18} as="b">
                  {is_deployed ? 
                  <Highlight
                  query={String(deployData.operationStatus)}
                  styles={{
                    p: '2',
                    fontSize: 'sm',
                    bg: 'green.400',
                    color: 'white',
                    borderRadius: 'md',
                  }}
                >
                  {String(deployData.operationStatus)}
                </Highlight>
                : 
                <Highlight
                    query="Not Started"
                    styles={{
                      p: '2',
                      fontSize: 'sm',
                      bg: 'blue.400',
                      color: 'white',
                      borderRadius: 'md',
                    }}
                  >
                    Not Started
                  </Highlight>
                  }
                  
                </Text>
              </Flex>
            </CardBody>
          </Card>
          <br />
          <Card borderRadius={'4'} variant="outline">
            <CardBody>
              <Flex minWidth="max-content" alignItems="center" gap="2">
                <Box>
                  <HStack>
                    <Text color="gray.600" fontSize={18} as="b">
                      Cluster Status
                    </Text>
                  </HStack>
                </Box>
                <Spacer />
                <Text color="gray.600" fontSize={18} as="b">
                  {is_deployed ? 
                  <Highlight
                  query={String(deployData.clusterStatus)}
                  styles={{
                    p: '2',
                    fontSize: 'sm',
                    bg: 'green.400',
                    color: 'white',
                    borderRadius: 'md',
                  }}
                >
                  {String(deployData.clusterStatus)}
                </Highlight>
                : 
                <Highlight
                    query="Not Started"
                    styles={{
                      p: '2',
                      fontSize: 'sm',
                      bg: 'blue.400',
                      color: 'white',
                      borderRadius: 'md',
                    }}
                  >
                    Not Started
                  </Highlight>
                  }
                  
                </Text>
              </Flex>
            </CardBody>
          </Card>
          <br />
          <Card borderRadius={'4'} variant="outline">
            <CardBody>
              <Flex minWidth="max-content" alignItems="center" gap="2">
                <Box>
                  <HStack>
                    <Text color="gray.600" fontSize={18} as="b">
                      Deploy Status
                    </Text>
                  </HStack>
                </Box>
                <Spacer />
                <Text color="gray.600" fontSize={18} as="b">
                  {is_deployed ? 
                  <Highlight
                  query="running"
                  styles={{
                    p: '2',
                    fontSize: 'sm',
                    bg: 'green.400',
                    color: 'white',
                    borderRadius: 'md',
                  }}
                >
                  running
                </Highlight>
                : 
                <Highlight
                    query="Not Started"
                    styles={{
                      p: '2',
                      fontSize: 'sm',
                      bg: 'blue.400',
                      color: 'white',
                      borderRadius: 'md',
                    }}
                  >
                    Not Started
                  </Highlight>
                  }
                  
                </Text>
              </Flex>
            </CardBody>
          </Card> 
          <br />
          <Card borderRadius={'4'} variant="outline">
            <CardBody>
              <Flex minWidth="max-content" alignItems="center" gap="2">
                <Box>
                  <HStack>
                    <Text color="gray.600" fontSize={18} as="b">
                      Environment Name
                    </Text>
                  </HStack>
                </Box>
                <Spacer />
                <Text color="gray.600" fontSize={18} as="b">
                  {is_deployed ? 
                <Kbd color="gray.500">{deployData.name}</Kbd>
                : 
                <Highlight
                    query="Not Started"
                    styles={{
                      p: '2',
                      fontSize: 'sm',
                      bg: 'blue.400',
                      color: 'white',
                      borderRadius: 'md',
                    }}
                  >
                    Not Started
                  </Highlight>
                  }
                  
                </Text>
              </Flex>
            </CardBody>
          </Card>
        </Box>

        <br />
        <Box p={5} borderRadius={'4'} borderWidth={'1px'}>
          <Flex minWidth="max-content" alignItems="center" gap="2">
            <Box>
              <Text as="b" fontSize={'22px'}>
                Database Tables
              </Text>
            </Box>
            <Spacer />
            <ButtonGroup gap="2">
              <Button
                onClick={this.onOpen}
                fontSize={'sm'}
                variant="outline"
                colorScheme="blue"
              >
                Create
              </Button>
            </ButtonGroup>
          </Flex>

          <br />

          <Accordion allowMultiple>
            {tables.length > 0 ? (
              tables.map((table, index) => (
                 <AccordionItem key={index}>
              <h2>
                <AccordionButton>
                  <Box as="span" flex="1" textAlign="left">
                    <Text fontSize={'16px'}>{table.table_name}</Text>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4}>
                <TableContainer>
                  <Table size="sm">
                    <Thead>
                      <Tr>
                        <Th>Name</Th>
                        <Th>Data Type</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {table.columns.map((column, index) => (
                        <Tr key={index}>
                          <Td>{column.name}</Td>
                          <Td>{column.type}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              </AccordionPanel>
            </AccordionItem>
              ))
            ) : (
              <Text fontSize={'16px'}>No tables created yet</Text>
            )}
           
          </Accordion>
        </Box>
        <br />
        <br />

        <Drawer
          closeOnOverlayClick={false}
          onClose={this.onClose}
          isOpen={isOpen}
          size={'lg'}
        >
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader>{`Add a Table`}</DrawerHeader>
            <DrawerBody>
              <FormControl isRequired>
                <FormLabel>Table Name</FormLabel>
                <input
                  className="form-control"
                  placeholder="Table name"
                  onChange={e => {
                    this.setState({ tableName: e.target.value });
                  }}
                />
              </FormControl>
              <Divider />

              <Text fontSize={'lg'} as="b">
                Add Columns
              </Text>
              <br />
              <br />
              <FormControl isRequired>
                <FormLabel>Column Name</FormLabel>
                <input
                  className="form-control"
                  type="text"
                  name="columnName"
                  id="columnName"
                  isRequired
                  onChange={e => {
                    this.setState({ columnName: e.target.value });
                  }}
                  required
                  placeholder="Column name"
                />
                <br />
                <FormLabel>Column Type</FormLabel>
                <Select
                  placeholder="Select Type"
                  name="columnType"
                  id="columnType"
                  onChange={e => {
                    this.setState({ columnType: e.target.value });
                  }}
                  required
                >
                  <option>INT</option>
                  <option>VARCHAR</option>
                  <option>BOOL</option>
                  <option>DATE</option>
                  <option>TIME</option>
                  <option>DECIMAL</option>
                </Select>
                <Text fontSize={'sm'} color="red.300">
                  {error}
                </Text>
                <Button
                  onClick={this.handleAddColumn}
                  colorScheme="blue"
                  variant="outline"
                >
                  Add Column
                </Button>
              </FormControl>
              <br />
              <Text fontSize={'lg'} as="b">
                My Columns
              </Text>
              <br />
              <br />
              <Table size="sm">
                <Thead>
                  <Tr>
                    <Th>Name</Th>
                    <Th>Data Type</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {columns.length > 0 ? (
                    columns.map((column, index) => (
                      <Tr key={index}>
                        <Td>{column.name}</Td>
                        <Td>{column.type}</Td>
                      </Tr>
                    ))
                  ) : (
                    <Tr>
                      <Td>No columns added</Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            </DrawerBody>
            <DrawerFooter>
              <Button
                onClick={this.handleAddTable}
                variant="solid"
                colorScheme="blue"
                mr={3}
              >
                Add Table
              </Button>
            </DrawerFooter>
          </DrawerContent>
          <br />
        </Drawer>
      </Box>
    );
  }
}

const HOCProject = withRouter(Project);
export default HOCProject;
