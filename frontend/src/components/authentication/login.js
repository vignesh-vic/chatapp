import React, { useState } from "react";
import { Button } from "@chakra-ui/button";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { Input, InputGroup, InputRightElement } from "@chakra-ui/input";
import { VStack } from "@chakra-ui/layout";
import axios from "axios";
import { useToast } from "@chakra-ui/react";
import { ChatState } from "../../context/chatProvider";
import { useNavigate } from "react-router-dom";
import { Store } from 'react-notifications-component';

const Login = () => {
  const navigate = useNavigate();

  const [show, setShow] = useState(false);
  const handleClick = () => setShow(!show);
  const toast = useToast();
  const [loginState, setLoginState] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const { setUser } = ChatState();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginState((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  const submitHandler = async () => {
    console.log("Login State:", loginState);

    setLoading(true);
    if (!loginState.email || !loginState.password) {
      toast({
        title: "Please Fill all the Feilds",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      setLoading(false);
      return;
    }

    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };

      const { data } = await axios.post(
        "/api/user/login",
        loginState,
        config
      );
      // toast({
      //   title: "Login Successful",
      //   status: "success",
      //   duration: 5000,
      //   isClosable: true,
      //   position: "top",
      // });
      Store.addNotification({
        title: "Login Successful",
        message: "Welcome to the chat application!",
        type: "info",
        insert: "top",
        container: "bottom-right",
        animationIn: ["animate__animated", "animate__flipInY"], // Use animate__flipInY for the flip in Y animation
        animationOut: ["animate__animated", "animate__fadeOut"],
        dismiss: {
          duration: 4000,
          onScreen: true
        }
      });
      setUser(data);
      localStorage.setItem("userInfo", JSON.stringify(data));
      setLoading(false);
      navigate("/chat");
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: error.response.data.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      setLoading(false);
    }
  };

  return (
    <VStack spacing="10px">
      <FormControl id="email" isRequired>
        <FormLabel>Email Address</FormLabel>
        <Input
          type="email"
          placeholder="Enter Your Email Address"
          name="email"
          value={loginState.email}
          onChange={handleChange} />
      </FormControl>
      <FormControl id="password" isRequired>
        <FormLabel>Password</FormLabel>
        <InputGroup size="md">
          <Input
            type={show ? "text" : "password"}
            placeholder="Enter password"
            name="password"
            onChange={handleChange}
            value={loginState.password}
          />
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size="sm" onClick={handleClick}>
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>
      <Button
        color="blue"
        width="100%"
        style={{ marginTop: 15 }}
        onClick={submitHandler}
        isLoading={loading}
      >
        Login
      </Button>
      <Button
        variant="solid"
        colorScheme="red"
        width="100%"
        onClick={() => {
          setLoginState((prev) => ({
            ...prev,
            email: "guest@gmail.com",
            password: "123"
          }));
        }}
      >
        Get Guest User Credentials
      </Button>
    </VStack>
  );
};

export default Login;