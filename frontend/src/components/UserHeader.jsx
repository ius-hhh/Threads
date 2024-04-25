import { Box,Flex,VStack,Text, Spacer,Button,Link,Avatar,useColorModeValue, MenuButton,MenuList,Menu,Portal,MenuItem } from "@chakra-ui/react"
import {BsInstagram } from "react-icons/bs"
import { CgMoreO } from "react-icons/cg"
import {useRecoilValue } from "recoil"
import userAtom from '../atoms/userAtom';
import { Link as RouterLink } from "react-router-dom";
import { useState } from "react"
import useShowToast from "../hooks/useShowToast"

const UserHeader = ({user}) => {
    const showtoast = useShowToast()
    const currentUser = useRecoilValue(userAtom) // this is the user that logged in 
    const [following,setFollowing] = useState(user.followers.includes(currentUser._id))

    const handleFollowUnfollow = async() =>{
        try {
            const res = await fetch(`/api/users/follow/${user._id}`,{
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify()
            })
            const data = await res.json()
            if(data.error){
                showtoast("Error",error,"error")
                return
            }
            console.log(data)
        } catch (error) {
            showtoast("Error",error,"error")
        }
    }

    const copyURL=()=>{
        const currentURL = window.location.href
        navigator.clipboard.writeText(currentURL).then(()=>{
            showtoast("","Profile link copied","success")
        })
    }
    return(
    <VStack gap= {4} alignItems={"start"}>
        <Flex justifyContent={"space-between"} w={"full"}>
            <Box>
                <Text fontSize={"2xl"} fontWeight={"bold"}>{user.name}</Text>
                <Spacer h={3}></Spacer>
                <Flex gap ={2} alignItems={"center"}>
                    <Text fontSize={"sm"}>{user.username}</Text>
                    <Text fontSize={"xs"} bg = {useColorModeValue('gray.300','black')}
                    color={useColorModeValue('black','gray.light')} p={1} borderRadius={"full"}>
                        threads.net
                    </Text>
                </Flex>
            </Box>
            <Box>
                {user.profilePicture && (<Avatar
                name={user.name}
                src={user.profilePicture}
                size={{
                    base:"lg",
                    md:"xl",
                }}/>)}
                {!user.profilePicture && (<Avatar
                name={user.name}
                src="https://cdn.pixabay.com/photo/2017/02/25/22/04/user-icon-2098873_1280.png"
                size={{
                    base:"lg",
                    md:"xl",
                }}/>)}
            </Box>
        </Flex>
        <Text>{user.bio}</Text>
        {currentUser._id === user._id && (
				<Link as={RouterLink} to='/update'>
					<Button size={"sm"}>Update Profile</Button>
				</Link>
	    )}
        {currentUser._id !== user._id && (
				<Button size={"sm"} onClick={handleFollowUnfollow} >
					{following ? "Unfollow" : "Follow"}
				</Button>
		)}
        <Flex w={"full"} justifyContent={"space-between"}>
            <Flex gap = {2} alignItems={"center"}>
                <Text color={"gray.light"}>{user.followers.length} followers</Text>
                <Box w={1} h={1} bg={"gray.light"} borderRadius={"full"}></Box>
                <Link color={"gray.light"}>instagram.com</Link>
            </Flex>
            <Flex>
                <Box className='icon-container'>
                    <BsInstagram size={24} cursor={"Pointer"}/>
                </Box>
                <Box className='icon-container'>
                    <Menu>
                        <MenuButton>
                            <CgMoreO size={24} cursor={"Pointer"}/>
                        </MenuButton>
                        <Portal>
                            <MenuList bg={"gray.dark"}>
                                <MenuItem bg={"gray.dark"} onClick={copyURL}>
                                    Copy Link
                                </MenuItem>
                            </MenuList>
                        </Portal>
                    </Menu>
                </Box>
            </Flex>
        </Flex>
        <Flex w={"full"}>
            <Flex flex={1} borderBottom={"1.5px solid white"} justify={"center"} pb={3} cursor={"pointer"}>
                <Text fontWeight={"Bold"}>Threads</Text>
            </Flex>
            <Flex flex={1} borderBottom={"1px solid gray"} justify={"center"} color={"gray.light"} pb={3} cursor={"pointer"}>
            <Text fontWeight={"Bold"}>Replies</Text>
            </Flex>
        </Flex>
    </VStack>
  )
}

export default UserHeader