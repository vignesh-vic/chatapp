import React, { useState } from 'react'
import SideDrawer from '../components/miscellaneous/sideDrawer';
import MyChats from '../components/myChat';
import ChatBox from '../components/chatBox';
import { ChatState } from '../context/chatProvider';
import { Box } from '@chakra-ui/react';

const ChatPage = () => {
  const { user } = ChatState()
  const [fetchAgain,setFetchAgain]=useState(false)

  return (
      <div style={{ width: '100%' }}>
        {user && <SideDrawer />}
        <Box
          display={"flex"}
          justifyContent={"space-between"}
          width={'100%'}
          height={'91.5vh'}
          padding={'10px'}
        >
        {user && <MyChats fetchAgain={fetchAgain} />}
        {user && <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />}

        </Box>
      </div>
  )
}

export default ChatPage
