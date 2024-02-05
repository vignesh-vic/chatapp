import {
  Box,
  Button,
  FormControl,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { ChatState } from "../../context/chatProvider";
import axios from "axios";
import UserListItem from "../userAvatar/userListItem";
import UserBadgeItem from "../userAvatar/userBadgeItem";

const GroupChatModel = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [groupChatName, setGroupChatName] = useState();
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);

  const toast = useToast();
  const { user, chats, setChats } = ChatState();
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
      console.log("da", data);
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
  const handleSubmit = async() => {
    if(!groupChatName || !selectedUsers){
        toast({
            title: "Please Fill All The Feilds ",
            status: "error",
            duration: 3000,
            isClosable: true,
            position: "top",
        });
        return
    }
    try {
        const config = {
            headers: {
                Authorization: `Bearer ${user.token}`,
            },
        };

        const { data } = await axios.post(`/api/chat/group`,{
            name:groupChatName,
            users:JSON.stringify(selectedUsers.map((user)=>user._id))
        }, config);
        setChats([data,...chats])
        // Reset the states
        setGroupChatName('');
        setSelectedUsers([]);
        setSearch('');
        setSearchResult([]);
        onClose()
        toast({
            title: "New Group Chat Created",
            status: "success",
            duration: 3000,
            isClosable: true,
            position: "top",
        });

    } catch (error) {
        toast({
            title: "Failed To Create Group Chat",
            status: "error",
            duration: 3000,
            isClosable: true,
            position: "top",
        });
    }

  };
  const handleDelete = (deleteUser) => {
        setSelectedUsers(selectedUsers.filter(user=> user._id !==deleteUser._id))
  };
  const handleGroup = (userToAdd) => {
    if (selectedUsers.includes(userToAdd)) {
      toast({
        title: "User already added",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    }
    setSelectedUsers([...selectedUsers, userToAdd]);
  };
  return (
    <>
      <span onClick={onOpen}>{children}</span>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontSize="30px"
            fontFamily="Work sans"
            d="flex"
            justifyContent="center"
          >
            Create Group Chat
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody d="flex" flexDir="column" alignItems="center">
            <FormControl>
              <Input
                placeholder="Chat Name"
                mb={3}
                onChange={(e) => setGroupChatName(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <Input
                placeholder="Add Users eg: Demo, vignesh, Arun"
                mb={1}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </FormControl>
            <Box w="50%"  style={{display:"flex",flexWrap:"nowrap"} }>
              {selectedUsers &&
                selectedUsers?.map((user) => (
                  <UserBadgeItem
                    key={user._id}
                    user={user}
                    handleFunction={() => handleDelete(user)}
                  />
                ))}
            </Box>

            {loading ? (
              <div></div>
            ) : (
              searchResult
                ?.slice(0, 4)
                .map((user) => (
                  <UserListItem
                    key={user._id}
                    user={user}
                    handleFunction={() => handleGroup(user)}
                  />
                ))
            )}
          </ModalBody>
          <ModalFooter>
            <Button style={{backgroundColor:"blue",color:"wheat"}} p={3} onClick={handleSubmit}>
              Create Chat
            </Button>
                      <Button style={{ backgroundColor: "red", color: "wheat" }} p={3} m={2} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default GroupChatModel;
