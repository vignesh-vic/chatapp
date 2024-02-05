import { ViewIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  FormControl,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { ChatState } from "../../context/chatProvider";
import UserBadgeItem from "../userAvatar/userBadgeItem";
import axios from "axios";
import UserListItem from "../userAvatar/userListItem";
const UpdateGroupChatModel = ({ fetchAgain, setFetchAgain, fetchMessages }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user, selectedChat, setSelectedChat } = ChatState();
  const [groupChatName, setGroupChatName] = useState();
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [renameLoading, setRenameLoading] = useState(false);
  const toast = useToast();



  const handleRename = async () => {
    if (!groupChatName) {
      return;
    }
    try {
      setRenameLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.put(
        `/api/chat/rename`,
        {
          chatId: selectedChat._id,
          chatName: groupChatName,
        },
        config
      );
      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      setRenameLoading(false);
    } catch (error) {
      toast({
        title: "Error Occured!",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      setRenameLoading(false);
    }
    setGroupChatName("");
  };
  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) {
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
      setSearchResult(data);
      setLoading(false);
    } catch (error) {
      toast({
        title: "Error fetching the chat",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };
    const handleAddUser=async(user1)=>{
        if (selectedChat.users.find((u) => u._id === user1._id)) {
            toast({
                title: "User Already in group!",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            return;
        }
        // if (selectedChat.groupAdmin._id !== user._id) {
        //     toast({
        //         title: "Only admins can add someone!",
        //         status: "error",
        //         duration: 5000,
        //         isClosable: true,
        //         position: "bottom",
        //     });
        //     return;
        // }
        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.put(
                `/api/chat/groupadd`,
                {
                    chatId: selectedChat._id,
                    userId: user1._id,
                },
                config
            );

            setSelectedChat(data);
            setFetchAgain(!fetchAgain);
            
            setLoading(false);
        } catch (error) {
            toast({
                title: "Error Occured!",
                description: error.response.data.message,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            setLoading(false);
        }
        setGroupChatName("");
    }

    const handleRemove = async (u) => {
        if ( user._id && u._id !== user._id) {
            toast({
                title: "Only admins can remove someone!",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            return;
        }

        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.put(
                `/api/chat/groupremove`,
                {
                    chatId: selectedChat._id,
                    userId: u._id,
                },
                config
            );

            u._id === user._id ? setSelectedChat() : setSelectedChat(data);
            setFetchAgain(!fetchAgain);
            fetchMessages();
            setLoading(false);
        } catch (error) {
            toast({
                title: "Error Occured!",
                description: error.response.data.message,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            setLoading(false);
        }
        setGroupChatName("");

    };
  return (
    <>
      <IconButton
        style={{ float: "right" }}
        onClick={onOpen}
        icon={<ViewIcon />}
      >
        Open Modal
      </IconButton>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontSize="35px"
            fontFamily="Work sans"
            d="flex"
            justifyContent="center"
          >
            {selectedChat.chatName}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box w="50%" style={{ display: "flex", flexWrap: "nowrap" }} pb={3}>
              {selectedChat.users.map((u) => (
                <UserBadgeItem
                  key={u._id}
                  user={u}
                  admin={selectedChat.groupAdmin}
                  handleFunction={() => handleRemove(u)}
                />
              ))}
            </Box>
            <FormControl style={{ display: "flex" }}>
              <Input
                placeholder="Chat Name"
                mb={3}
                value={groupChatName}
                onChange={(e) => setGroupChatName(e.target.value)}
              />
              <Button
                variant="solid"
                colorScheme="teal"
                ml={1}
                isLoading={renameLoading}
                onClick={handleRename}
              >
                Update
              </Button>
            </FormControl>
            <FormControl>
              <Input
                placeholder="Add User to group"
                mb={1}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </FormControl>
                      {loading ? (
                          <Spinner size="lg" />
                      ) : (
                          searchResult?.map((user) => (
                              <UserListItem
                                  key={user._id}
                                  user={user}
                                  handleFunction={() => handleAddUser(user)}
                              />
                          ))
                      )}
          </ModalBody>

          <ModalFooter>
            <Button onClick={() => handleRemove(user)} colorScheme="red">
              Leave Group
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default UpdateGroupChatModel;
