import React, { useEffect, useRef, useState } from "react";
import { motion } from 'framer-motion'
import { MdEdit } from 'react-icons/md'
import QRCode from 'qrcode.react';
import * as otplib from 'otplib';

// import DialogActions from '@mui/material/DialogActions';
// import Button from '@mui/material/Button';
// import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { useAppServiceContext } from "../../Context/Context";
import { STATUS_SUCCESS } from "../../Const";
import { useNavigate } from "react-router-dom";

interface Relation {
  userId : number
  targetUserId : number
  message : string
  isFriend : boolean
  isBlocked : boolean
  isBlockedByMe : boolean
  isPending : boolean
}

const GoToChat = () => {
  return (
    <>
      <motion.button 
      type='button'
      whileTap={{scale: 0.955}}
      className='flex items-center bg-[#4D194D] py-2 px-6 mx-auto text-xs outline-none'
      > 
          <MdEdit size={15} className='mr-1'/> 
          Chat
      </motion.button>
    </>
  )
}

const BlockRequest = ({relation} : {relation : Relation}) => {
  return (
    <>
      <motion.button 
      type='button'
      whileTap={{scale: 0.955}}
      className='flex items-center bg-[#4D194D] py-2 px-6 mx-auto text-xs outline-none'
      > 
          <MdEdit size={15} className='mr-1'/> 
          Block Friend
      </motion.button>
    </>
  )
}

const FriendsRequest = ({relation} : {relation : Relation}) => {
  const appService = useAppServiceContext()
  const navigate = useNavigate()
  let title = relation.isFriend ? "Unfriend" : "Send Friend Request"
  let twoButtons = false
  if (relation.isPending) {
    if (relation.targetUserId === appService.authService.user?.id) {
      title = "Accept"
      twoButtons = true
    } else {
      title = "Cancel friend request"
    }
  }

  const request = async (rejectRequest : boolean) => {
    if (relation.isFriend || rejectRequest || relation.isPending) {
      return await appService.requestService.deleteUnblockFriend(relation.targetUserId)
    }
    if (twoButtons) {
      return await appService.requestService.putAcceptFriend(relation.targetUserId)
    }
    return await appService.requestService.postRequestFriend(relation.targetUserId)
  }

  const handleSubmit = async (rejectRequest : boolean) => {    
    const res = await request(rejectRequest)
    if (res.status === STATUS_SUCCESS) {
      navigate(`/Profile/${relation.targetUserId}`)
    }
    else {
      console.log("Error")
      //!popup
    }
  }

  return (
    <>
    <motion.button
    onClick={() => handleSubmit(false)}
    type='button'
    whileTap={{scale: 0.955}}
    className='flex items-center bg-[#4D194D] py-2 px-6 mx-auto text-xs outline-none'
    > 
        <MdEdit size={15} className='mr-1'/> 
        {title}
    </motion.button>
    { twoButtons && 
      <motion.button
      onClick={() => handleSubmit(true)}
      type='button'
      whileTap={{scale: 0.955}}
      className='flex items-center bg-[#4D194D] py-2 px-6 mx-auto text-xs outline-none'
      > 
          <MdEdit size={15} className='mr-1'/> 
          Reject
      </motion.button>
    }
    </>
  )
}

const Relation = ({relation} : {relation : Relation}) => {

  console.log("R: ", relation)
  if (relation.isFriend) {
    return (
      <>
        <FriendsRequest relation={relation} />
        <BlockRequest relation={relation} />
        <GoToChat />
      </>
    )
  } else {
    if (relation.isBlocked) {
      return (
        <>
          <BlockRequest relation={relation} />
        </>
      )
    } else {
      return <>
        <FriendsRequest relation={relation} />
        <GoToChat />
      </>
    }
  }
}

export default Relation
