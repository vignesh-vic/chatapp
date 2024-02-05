import React, { useEffect, useState } from "react";
import { Box, Text } from "@chakra-ui/layout";
import { SearchIcon, BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { ChatState } from "../../context/chatProvider";
import { useToast } from "@chakra-ui/toast";
import ChatLoading from "../chatLoading";
import {
  Avatar,
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Input,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Tooltip,
  useDisclosure,
} from "@chakra-ui/react";
import ProfileModal from "./profileModel";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import UserListItem from "../userAvatar/userListItem";
import { Spinner } from "@chakra-ui/react";
import { getSender } from "../../config/chatLogic";
import NotificationBadge, { Effect } from 'react-notification-badge';
// import { Effect } from 'react-notification-badge';

const SideDrawer = () => {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState();
  const { user, setSelectedChat, chats, setChats, notification, setNotification } = ChatState();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const Toast = useToast();

  const logoutHandler = () => {
    // localStorage.removeItem("userInfo");
    navigate("/");
  };

  const handleSearch = async () => {
    if (!search.trim()) {
      setSearchResult([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get(`/api/user?search=${search}`, config);
      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      Toast({
        title: "Error occurred",
        description: "Failed to fetch users",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-left",
      });
      setLoading(false);
    }
  };

  const accessChat = async (userId) => {
    try {
      setLoadingChat(true);
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post("/api/chat", { userId }, config);
      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
      setSelectedChat(data);
      setLoadingChat(false);
      onClose();
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

  return (
    <>
      <Box
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "white",
          width: "100%",
          padding: "1px", // Adjust as needed
        }}
      >
        <Tooltip label="Search Users to Chat" hasArrow placement="bottom-end">
          <Button variant="ghost" onClick={onOpen}>
            <SearchIcon
              className="mb-[0.5px]"
              fontSize="medium"
              color="primary"
            />
            <Text d={{ base: "none", md: "flex" }} px={4}>
              Search User
            </Text>
          </Button>
        </Tooltip>
        <Text
          fontSize="2xl"
          style={{ fontFamily: "sans-serif", color: "blue" }}
          fontFamily=" sans"
        >
          Chat App
        </Text>
        <div>
          <Menu>
            <MenuButton p={1}>
              <NotificationBadge count={notification.length} effect={[Effect.SCALE]} />

              <BellIcon fontSize={"2xl"} m={1} />

            </MenuButton>
            <MenuList>
              {!notification.length && "No New Messages"}
              {notification?.map(notifi => (
                <MenuItem key={notifi._id}
                  onClick={() => {
                    setSelectedChat(notifi.chat);
                    setNotification(notification.filter((n) => n !== notifi))
                  }}
                >
                  {notifi.chat.isGroupChat ? `New Message From ${notifi.chat.chatName}` :
                    `
                  New Message From ${getSender(user, notifi.chat.users)}
                  `}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
          <Menu>
            <MenuButton>
              <Avatar
                size="sm"
                cursor="pointer"
                // alt={user.name}
                name={user.name}
              />
            </MenuButton>
            <MenuList>
              <ProfileModal user={user}>
                <MenuItem>My Profile</MenuItem>
              </ProfileModal>
              <MenuDivider />
              <MenuItem onClick={logoutHandler}>Logout</MenuItem>
            </MenuList>
          </Menu>
        </div>
      </Box>
      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">Search Users</DrawerHeader>
          <DrawerBody>
            <Box style={{ display: "flex" }} pb={2}>
              <Input
                placeholder="Search by name or email"
                mr={2}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button onClick={handleSearch}>Go</Button>
            </Box>
            {loading ? (
              <ChatLoading />

            ) : (
              searchResult?.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => accessChat(user._id)}
                />
              ))
            )}
            {loadingChat && <Spinner ml="auto" d="flex" />}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default SideDrawer;
