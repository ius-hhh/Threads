import { Box, Flex,Text,Input,Button,useColorModeValue,SkeletonCircle,Skeleton } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import {SearchIcon} from "@chakra-ui/icons"
import Conversation from '../components/Conversation'
import useShowToast from "../hooks/useShowToast"
import {GiConversation} from 'react-icons/gi'
import MessageContainer from '../components/MessageContainer'
import { useRecoilState,useRecoilValue } from 'recoil'
import { conversationsAtom, selectedConversationAtom } from '../atoms/messagesAtom'
import userAtom from '../atoms/userAtom'
import { useSocket } from '../context/SocketContext'

const ChatPage = () => {
    const showToast = useShowToast()
	const[loadingConversation,setloadingConversation] = useState(true)
	const [conversations,setConversations] = useRecoilState(conversationsAtom)
	const [selectedConversation,setSelectedConversation] = useRecoilState(selectedConversationAtom)
	const [searchText,setSearchText] = useState('')
	const [loadingUser,setLoadingUser] = useState(false)
	const currentUser = useRecoilValue(userAtom)
	const {socket,onlineUsers}= useSocket()

	useEffect(()=>{
		const getConversations = async () => {
			try {
				const res = await fetch("/api/messages/conversations")
                const data = await res.json()
                if(data.error){
                    showToast("Error",data.error,"error")
                    return
                }
                setConversations(data)
			} catch (error) {
				showToast("Error",error,"error")
			} finally{
				setloadingConversation(false)
			}
		}
		getConversations()
	},[showToast,setConversations])

	const handleConvSearch = async (e)=>{
		e.preventDefault()
		setLoadingUser(true)
		try {
			const res = await fetch(`/api/users/profile/${searchText}`)
            const searchedUser = await res.json()
            if(searchedUser.error){
                showToast("Error",searchedUser.error,"error")
                return
            }

			const messagingYourself = searchedUser._id === currentUser._id
			if(messagingYourself){
				showToast("Error","You cannot message yourself.","error")
				return
			}

			const convAlreadyExists = conversations.find(conversation => conversation.participants[0]._id === searchedUser._id)
			if(convAlreadyExists){
				setSelectedConversation({
					_id: convAlreadyExists._id,
					userId:searchedUser._id,
                    username:searchedUser.username,
                    userprofilePicture:searchedUser.profilePicture,
				})
				return
			}
			// if the user doesnt already have a conversation with this searched user
			const mockConversation = {
				mock:true,
				lastMessage:{
					text:'',
					sender:''
				},
				_id:Date.now(),
				participants:[{
					_id:searchedUser._id,
					username:searchedUser.username,
                    profilePicture:searchedUser.profilePicture
				}]
			}
			setConversations((prevConv)=>[...prevConv, mockConversation])

		} catch (error) {
			showToast("Error",error,"error")
		} finally {
			setLoadingUser(false)
		}
	}

  return (
    <Box position={"absolute"} left={"50%"} w={{
      base:"100%",
      md:"80%",
      lg:"750px"
    }}
     p={4} transform={"translateX(-50%)"}>
      <Flex
        gap={4}
				flexDirection={{ base: "column", md: "row" }}
				maxW={{
					sm: "400px",
					md: "full",
				}}
				mx={"auto"}
      >
        <Flex flex={30} gap={2} flexDirection={"column"} maxW={{ sm: "250px", md: "full" }} mx={"auto"}>
					<Text fontWeight={700} color={useColorModeValue("gray.600", "gray.400")}>
						Your Conversations
					</Text>
					<form onSubmit={handleConvSearch}>
						<Flex alignItems={"center"} gap={2}>
							<Input placeholder='Search for a user' onChange={(e)=>setSearchText(e.target.value)}/>
							<Button size={"sm"} onClick={handleConvSearch} isLoading={loadingUser}>
								<SearchIcon />
							</Button>
						</Flex>
					</form>
			{loadingConversation && (
				[0,1,2,3,4].map((_,i) =>(
					<Flex key={i} alignItems={"center"} gap={4} padding={1} borderRadius={"md"}>
						<Box>
							<SkeletonCircle size={"10"}/>
						</Box>
						<Flex flexDirection={"column"} w={"full"} gap={3}>
							<Skeleton h={"10px"} w={"80px"}/>
							<Skeleton h={"8px"} w={"90%"}/>
						</Flex>
					</Flex>
				))
			)}

			{!loadingConversation._id && (
				conversations.map(conversation =>(
                    <Conversation key={conversation._id} 
					isOnline = {onlineUsers.includes(conversation.participants[0]._id)}
					conversation={conversation}/>
                ))
			)}

		</Flex>
		{!selectedConversation._id && (<Flex flex={70} borderRadius={"md"} p={2} flexDirection={"column"} alignItems={"center"} justifyContent={"center"} height={"400px"}>
			<GiConversation size={100}/>
			<Text fontSize={20}>Select a User to start conversation</Text>
		</Flex>)}
			{selectedConversation._id && <MessageContainer/>}
      </Flex>
    </Box>
  )
}

export default ChatPage