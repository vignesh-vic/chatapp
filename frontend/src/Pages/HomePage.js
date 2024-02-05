import {
  Box,
  Container,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from "@chakra-ui/react";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Login from "../components/authentication/login";
import SignUp from "../components/authentication/signUp";
function Homepage() {
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"))
    if (!userInfo) {
      navigate("/")
      // return <Link to="/" />;
    }
  }, [navigate])

  return (
    <Container maxW="xl" centerContent>
      <Box
        d="flex"
        justifyContent="center"
        p={3}
        bg="white"
        w="100%"
        m="40px 0 15px 0"
        borderRadius="xl"
        borderWidth="1px"
      >
        <Text fontSize="4xl" style={{textAlign:"center",color:"blue"}} fontFamily="Work sans">
          Chat App
        </Text>
      </Box>
      <Box bg="white" w="100%" p={4} borderRadius="xl" borderWidth="1px">
        <Tabs isFitted variant="soft-rounded">
          <TabList mb="1em">
            <Tab>Login</Tab>
            <Tab>Sign Up</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Login />
            </TabPanel>
            <TabPanel>
              <SignUp />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Container>
  );
}

export default Homepage;