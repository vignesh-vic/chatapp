import React, { useEffect, useState, useCallback } from "react";
import { ChatState } from "../context/chatProvider";
import { useToast } from "@chakra-ui/toast";
import axios from "axios";
import { Box, Button, Flex, Stack, Text } from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import ChatLoading from "./chatLoading";
import { getSender } from "../config/chatLogic";
import GroupChatModel from "./miscellaneous/groupChatModel";
import NotificationBadge, { Effect } from "react-notification-badge";
import moment from "moment";
const Mychats = ({ fetchAgain }) => {
    const [loggedUser, setLoggedUser] = useState();
    const {
        user,
        selectedChat,
        notification,
        setSelectedChat,
        chats,
        setNotification,
        setChats,
    } = ChatState();
    const Toast = useToast();

    const getUnreadCount = (chatId) => {
        return notification.filter((msg) => msg.chat._id === chatId).length;
    };
    const handleChatClick = (chat) => {
        setSelectedChat(chat);
        const newNotifications = notification.filter(
            (msg) => msg.chat._id !== chat._id
        );
        setNotification(newNotifications);
    };
    const fetchChats = async () => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.get(`/api/chat`, config);
            setChats(data);
        } catch (error) {
            Toast({
                title: "Error fetching the chat",
                status: "error",
                duration: 3000,
                isClosable: true,
                position: "bottom-left",
            });
        }
    };

    useEffect(() => {
        setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
        fetchChats();
    }, [fetchAgain]);

    useEffect(() => {
        fetchChats(); // Refetch chats when there's a new notification
    }, [notification]);

    return (
        <Box
            d={{ base: selectedChat ? "none" : "flex", md: "flex" }}
            flexDir="column"
            alignItems="center"
            p={3}
            bg="white"
            w={{ base: "100%", md: "31%" }}
            borderRadius="lg"
            borderWidth="1px"
        >
            <Flex
                pb={3}
                px={3}
                fontSize={{ base: "21px", md: "28px" }}
                fontFamily="Work sans"
                w="100%"
                justifyContent="space-between"
                alignItems="center"
            >
                <Box>My Chats</Box>
                <GroupChatModel>
                    <Box>
                        <Button
                            d="flex"
                            fontSize={{ base: "10px", md: "10px", lg: "10px" }}
                            rightIcon={<AddIcon />}
                            style={{ paddingRight: "20px", marginRight: "4px" }}
                        >
                            New Group Chat
                        </Button>
                    </Box>
                </GroupChatModel>
            </Flex>
            <Box
                d="flex"
                flexDir="column"
                p={3}
                bg="#F8F8F8"
                w="100%"
                h="90%"
                borderRadius="lg"
                overflowY="hidden"
            >
                {chats ? (
                    <Stack overflow="scroll" >
                        {chats?.map((chat, i) => (
                            <React.Fragment key={chat._id}>
                                <Box
                                    onClick={() => handleChatClick(chat)}
                                    cursor="pointer"
                                    bg={
                                        selectedChat && selectedChat._id === chat._id
                                            ? "#38B2AC"
                                            : "#E8E8E8"
                                    }
                                    color={
                                        selectedChat && selectedChat._id === chat._id
                                            ? "white"
                                            : "black"
                                    }
                                    px={3}
                                    py={2}
                                    borderRadius="lg"
                                >
                                    <Text>
                                        {!chat.isGroupChat
                                            ? getSender(loggedUser, chat.users)
                                            : chat.chatName}
                                    </Text>
                                    <NotificationBadge
                                        count={getUnreadCount(chat._id)}
                                        effect={Effect.SCALE}
                                    />
                                    {chat.latestMessage && (
                                        <Text fontSize="xs">
                                            {/* <b>{chat.latestMessage.sender.name} : </b> */}
                                            {chat.latestMessage.content.length > 50
                                                ? chat.latestMessage.content.substring(0, 51) + "..."
                                                : chat.latestMessage.content}
                                        </Text>
                                    )}
                                    <span style={{ fontSize: "8px" }}>
                                        {moment(chat.updatedAt).calendar()}
                                    </span>
                                </Box>
                            </React.Fragment>
                        ))}
                    </Stack>
                ) : (
                    <ChatLoading />
                )}
            </Box>
        </Box>
    );
};

export default Mychats;
