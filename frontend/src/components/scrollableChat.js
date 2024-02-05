import { Avatar, Box, Spinner, Text, Tooltip } from "@chakra-ui/react";
import React, { useEffect, useRef } from "react";
import ScrollableFeed from "react-scrollable-feed";
import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
} from "../config/chatLogic";
import { ChatState } from "../context/chatProvider";
import { Popover } from "antd";
import {
  EditOutlined,
  DeleteFilled,
} from "@ant-design/icons";
import axios from "axios";
import InfiniteScroll from "react-infinite-scroll-component";


const ENDPOINT = "http://localhost:3000";


const ScrollableChat = ({ messages, setMessages, deleteMessage, hasMore, setHasMore, fetchMessages }) => {



  const { user, selectedChat } = ChatState();


  const messageEndRef = useRef(null)
  const scrollRef = useRef(null);

  // const deleteMessage = async (messageId) => {
  //   try {
  //     const config = {
  //       headers: {
  //         Authorization: `Bearer ${user.token}`, // Adjust based on your auth implementation
  //       },
  //     };
  //     await axios.put(`/api/message/${messageId}`, {}, config);

  //     // Update the local state to reflect the deletion
  //     const updatedMessages = messages.map((m) =>
  //       m._id === messageId ? { ...m, isDeleted: true } : m
  //     );
  //     setMessages(updatedMessages);
  //   } catch (error) {
  //     console.error('Error deleting message:', error);
  //   }
  // };

  useEffect(() => {
    messageEndRef.current?.scrollIntoView()
  }, [messages])





  return (

    <ScrollableFeed>

      {messages &&
        messages.map((m, i) => (
          !m.isDeleted && (
            <>

              <div
                style={{
                  display: "flex",
                  overflowY: "auto"
                }
                }
                key={i}>
                {(isSameSender(messages, m, i, user._id) ||
                  isLastMessage(messages, i, user._id)) && (
                    <Tooltip
                      label={m.sender.name}
                      placement="bottom-start"
                      hasArrow
                    >
                      <Avatar
                        mt="7px"
                        mr={1}
                        size="sm"
                        cursor="pointer"
                        name={m.sender.name}
                        src={m.sender.pic}
                      />
                    </Tooltip>
                  )}

                <Popover
                  placement="top"
                  content={
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-evenly",
                        width: "150px",
                      }}
                    >
                      <span style={{ cursor: "pointer", fontSize: "18px" }}>
                        👍
                      </span>
                      <span style={{ cursor: "pointer", fontSize: "18px" }}>
                        ❤️
                      </span>
                      <span style={{ cursor: "pointer", fontSize: "18px" }}>
                        😊
                      </span>
                      <span style={{ cursor: "pointer", fontSize: "20px" }}>
                        ⋯
                      </span>
                      {m.sender._id === user._id && (
                        <>
                          <EditOutlined
                            style={{ cursor: "pointer", fontSize: "20px" }}
                          />
                          <DeleteFilled
                            style={{ cursor: "pointer", fontSize: "20px" }}
                            onClick={() => deleteMessage(m._id)} />
                        </>
                      )}
                    </div>
                  }
                  trigger="hover"
                >
                  <span
                    style={{
                      backgroundColor: `${m.sender._id === user._id ? "#BEE3F8" : "#B9F5D0"
                        }`,
                      marginLeft: isSameSenderMargin(messages, m, i, user._id),
                      marginTop: isSameUser(messages, m, i, user._id) ? 3 : 10,
                      borderRadius: "20px",
                      padding: "5px 15px",
                      maxWidth: "75%",
                      cursor: "pointer",
                    }}
                  >
                    {m.content}
                  </span>
                </Popover>
              </div>

            </>
          )))}

      {/* <div ref={messageEndRef} /> */}
    </ScrollableFeed >

  );
};

export default ScrollableChat;


{/* <span
                style={{
                  backgroundColor: `${m.sender._id === user._id ? "#BEE3F8" : "#B9F5D0"
                    }`,
                  marginLeft: isSameSenderMargin(messages, m, i, user._id),
                  marginTop: isSameUser(messages, m, i, user._id) ? 3 : 10,
                  borderRadius: "20px",
                  padding: "5px 15px",
                  maxWidth: "75%",
                }}
              >
                {m.content}
              </span> */}