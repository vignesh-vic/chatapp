import React from 'react'
const ChatPage = () => {
    const { user } = ChatState()


    return (
        <div className='App'>
            <div style={{ width: '100%' }}>
                {user && <SideDrawer />}
                <Box
                    display={"flex"}
                    justifyContent={"space-between"}
                    width={'100%'}
                    height={'90vh'}
                    padding={'10px'}
                >
                    {user && <MyChats />}
                    {user && <ChatBox />}

                </Box>
            </div>
        </div>
    )
}

export default ChatPage
