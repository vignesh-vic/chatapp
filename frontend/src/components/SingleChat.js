import React, { useEffect, useRef, useState } from "react";
import { ChatState } from "../context/chatProvider";

import {
  Box,
  FormControl,
  IconButton,
  Input,
  Spinner,
  Text,
  useToast,
} from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { getSender, getSenderFull } from "../config/chatLogic";
import ProfileModal from "./miscellaneous/profileModel";

import UpdateGroupChatModel from "./miscellaneous/updateGroupChatModel";
import axios from "axios";
import "./style.css";
import animationData from "../animations/typing.json";

import ScrollableChat from "./scrollableChat";

import io from "socket.io-client";

import Lottie from "react-lottie";
import { ReactNotifications } from 'react-notifications-component'
import 'react-notifications-component/dist/theme.css';
import 'animate.css/animate.compat.css';
import { Store } from 'react-notifications-component';

//anti model
import { Button, Popover, ConfigProvider } from 'antd'
import InfiniteScroll from "react-infinite-scroll-component";
import { List, AutoSizer, CellMeasurer, CellMeasurerCache } from 'react-virtualized';

const ENDPOINT = "http://localhost:3000";

var socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {

  const Toast = useToast();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState();
  const { user, selectedChat, setSelectedChat, notification, setNotification } = ChatState();
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, SetIsTyping] = useState(false);
  // const [socket, setSocket] = useState(null);

  //lazy loading 
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const elementRef = useRef(null)

  function onIntersection(entries) {
    const firstEntry = entries[0]
    if (firstEntry.isIntersecting && hasMore) {
      fetchMessages()
    }
  }
  useEffect(() => {
    const observer = new IntersectionObserver(onIntersection)
    if (observer && elementRef.current) {
      observer.observe(elementRef.current)
    }

    return () => {
      if (observer) {
        observer.disconnect()
      }
    }
  })



  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => SetIsTyping(true));
    socket.on("stop typing", () => SetIsTyping(false));
  }, []);

  useEffect(() => {
    fetchMessages();
    selectedChatCompare = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    socket.on("message recieved", (newMessageReceived) => {
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessageReceived.chat._id
      ) {
        if (!notification.includes(newMessageReceived)) {
          setNotification([newMessageReceived, ...notification])
          setFetchAgain(!fetchAgain)
          //   // Trigger notification for messages not in the current chat
          //   const chatType = newMessageReceived.chat.isGroupChat ? "Group Chat" : "Chat";
          //   Store.addNotification({
          //     title: `New Message in ${chatType}`,
          //     message: `${newMessageReceived.sender.name}: ${newMessageReceived.content}`,
          //     type: "info",
          //     insert: "top",
          //     container: "bottom-left",
          //     animationIn: ["animate__animated", "animate__flash"],
          //     animationOut: ["animate__animated", "animate__fadeOut"],
          //     dismiss: {
          //       duration: 4000,
          //       onScreen: true
          //     }
          //   });
        }
      } else {
        setMessages([...messages, newMessageReceived]);

      }
    });
  });


  const fetchMessages = async () => {
    if (!selectedChat) return;
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      setLoading(true);
      const { data } = await axios.get(
        `/api/message/${selectedChat._id}?limit=10skip=${page*10}`,
        config
      );
      setMessages(data);
      setLoading(false);
      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      Toast({
        title: "Error",
        status: "failed to send the Message",
        duration: 3000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };


  // useEffect(() => {
  //   socket.on("message recieved", (newMessageReceived) => {
  //     if (
  //       !selectedChatCompare ||
  //       selectedChatCompare._id !== newMessageReceived.chat._id
  //     ) {
  //       if (!notification.includes(newMessageReceived)) {
  //         setNotification([newMessageReceived, ...notification]);
  //         setFetchAgain(!fetchAgain);

  //         // Trigger notification for messages not in the current chat
  //         const chatType = newMessageReceived.chat.isGroupChat ? "Group Chat" : "Chat";
  //         Store.addNotification({
  //           title: `New Message in ${chatType}`,
  //           message: `${newMessageReceived.sender.name}: ${newMessageReceived.content}`,
  //           type: "info",
  //           insert: "top",
  //           container: "bottom-left",
  //           animationIn: ["animate__animated", "animate__flash"],
  //           animationOut: ["animate__animated", "animate__fadeOut"],
  //           dismiss: {
  //             duration: 4000,
  //             onScreen: true
  //           }
  //         });
  //       }
  //     } else {
  //       setMessages((prevMessages) => [...prevMessages, newMessageReceived]);
  //     }
  //   });
  // }, []);


  // const fetchMessages = async (scrollDirection) => {
  //   if (!selectedChat || !hasMore) return;
  //   try {
  //     const config = {
  //       headers: {
  //         Authorization: `Bearer ${user.token}`,
  //       },
  //     };
  //     setLoading(true);

  //     const { data } = await axios.get(
  //       `/api/message/${selectedChat._id}?skip=${skip}&limit=${limit}`,
  //       config
  //     );

  //     if (data.length) {
  //       // Create a Set from current message IDs for fast lookup
  //       const existingMessageIds = new Set(messages.map(msg => msg._id));

  //       // Filter out duplicates by checking against the Set
  //       const newUniqueMessages = data.filter(msg => !existingMessageIds.has(msg._id));

  //       // Reverse to ensure correct order and prepend new unique messages
  //       setMessages(prevMessages => [...newUniqueMessages.reverse(), ...prevMessages]);
  //       setSkip(prevSkip => prevSkip + newUniqueMessages.length);
  //     }
  //     if (data.length < 0) {
  //       setHasMore(false); // No more messages to load
  //     }
  //     else {
  //       // Optionally increase the limit for the next fetch
  //       setLimit(prevLimit => prevLimit + initialLimit); // Increase the limit by the initial limit each time
  //     }
  //     setLoading(false);
  //     socket.emit("join chat", selectedChat._id);
  //   } catch (error) {
  //     Toast({
  //       title: "Error",
  //       status: "failed to send the Message",
  //       duration: 3000,
  //       isClosable: true,
  //       position: "bottom-left",
  //     });
  //     setLoading(false);

  //   }
  // };



  const sendMessage = async (e) => {
    if (e.key === "Enter" && newMessage) {
      socket.emit("stop typing", selectedChat._id);
      try {
        const config = {
          headers: {
            "Conten-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };
        setNewMessage("");
        const { data } = await axios.post(
          "/api/message",
          {
            content: newMessage,
            chatId: selectedChat._id,
            notifi: {
              [
                selectedChat._id
              ]: false
            }
          },
          config
        );
        socket.emit("new message", data);
        setMessages([...messages, data]);

      } catch (error) {
        Toast({
          title: "Error",
          status: "failed to send the Message",
          duration: 3000,
          isClosable: true,
          position: "bottom-left",
        });
      }
    }
  };

  const typingHandler = (e) => {
    setNewMessage(e.target.value);
    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }
    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  useEffect(() => {
    socket.on('delete', (messageId) => {
      setMessages((currentMessages) => currentMessages.filter(m => m._id !== messageId));
    });

    return () => {
      socket.off('delete');
    };
  }, [socket]);


  const deleteMessage = async (messageId) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      await axios.put(`/api/message/${messageId}`, {}, config);

      const updatedMessages = messages.map((m) =>
        m._id === messageId ? { ...m, isDeleted: true } : m
      );
      socket.emit('delete', messageId, selectedChat._id);
      setMessages(updatedMessages);
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  return (
    <>
      {selectedChat ? (
        <>
          <Text
            fontSize={{ base: "28px", md: "30px" }}
            pb={3}
            px={2}
            w="100%"
            fontFamily="Work sans"
            d="flex"
            justifyContent={{ base: "space-between" }}
            alignItems="center"
          >
            <IconButton
              icon={<ArrowBackIcon />}
              style={{ paddingRight: "3px" }}
              onClick={() => setSelectedChat("")}
            />
            {messages && !selectedChat.isGroupChat ? (
              <>
                {getSender(user, selectedChat.users)}
                <ProfileModal user={getSenderFull(user, selectedChat.users)} />
              </>
            ) : (
              <>
                {selectedChat.chatName.toUpperCase()}
                <UpdateGroupChatModel
                  fetchAgain={fetchAgain}
                  setFetchAgain={setFetchAgain}
                  fetchMessages={fetchMessages}
                />
              </>
            )}
          </Text>

          <Box
            d="flex"
            flexDir="column"
            justifyContent="flex-end"
            p={3}
            bg="#E8E8E8"
            w="100%"
            h="85%"
            borderRadius="lg"
            overflowY="auto"
          >
            {loading ? (
              <Spinner
                size="xl"
                w={20}
                h={20}
                alignSelf="center"
                margin="auto"
              />
            ) : (
              <div className="messages" style={{ height: "80%" }}>
                <ScrollableChat hasMore={hasMore} setHasMore={setHasMore} fetchMessages={fetchMessages} messages={messages}
                  deleteMessage={deleteMessage}
                  setMessages={setMessages} />
              </div>
            )}
            <FormControl
              id="first-name"
              onKeyDown={sendMessage}
              isRequired
              mt={3}
            >
              {isTyping ? (
                <div>
                  <Lottie
                    options={defaultOptions}
                    width={70}
                    style={{ marginBottom: 15, marginLeft: 0 }}
                  />
                </div>
              ) : (
                <></>
              )}
              <Input
                variant="filled"
                bg="#E0E0E0"
                placeholder="Enter a message.."
                value={newMessage}
                onChange={typingHandler}
              />
            </FormControl>
          </Box>
        </>
      ) : (
        <Box d="flex" alignItems="center" justifyContent="center" h="100%">
          <Text fontSize="3xl" pb={3} fontFamily="Work sans">
            Click on a user to start chatting
          </Text>
        </Box>
      )}
    </>
  );
};

export default SingleChat;
