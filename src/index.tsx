import React, { FormEvent, useState } from "react"
import { createRoot } from "react-dom/client"
import { useMediaQuery } from 'react-responsive'
import classnames from "classnames"
import { Dialog, Transition } from '@headlessui/react'
import { motion, AnimatePresence, LayoutGroup } from "framer-motion"

import {
  PlusIcon,
  MinusIcon,
  ReplyIcon,
  DeleteIcon,
  EditIcon,
} from "./Icons"

import "./index.css"

import data from "./data.json"

type Comment = {
  id: number,
  user: {
    username: string,
  },
  createdAt: string,
  content: string,
  score: number,
  currentUserVote: boolean|null,
  replyingTo?: string,
}

type DeleteConfirmationData = {
  commentId: number,
  replyId?: number,
}

type ReplyFormData = {
  commentId: number,
  replyId: number | null,
} | null

const Desktop = ({ children } : { children: React.ReactNode }) => {
  const isDesktop = useMediaQuery({ minWidth: 768 })
  return isDesktop ? <>{children}</> : null
}

const Mobile = ({ children } : { children: React.ReactNode }) => {
  const isMobile = useMediaQuery({ maxWidth: 767 })
  return isMobile ? <>{children}</> : null
}

const DeleteConfirmationDialog = ({ 
  isOpen, 
  close,
  confirmDelete,
} : { 
  isOpen: boolean, 
  close: Function,
  confirmDelete: Function,
}) => {
  return (
    <Transition show={isOpen}>
      <Dialog onClose={() => close()}>
        <div className="fixed top-0 left-0 w-screen h-screen flex justify-center items-center">
          <Transition.Child
            className="absolute top-0 left-0 w-full h-full bg-black"
            enter="transition duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-50"
            leave="transition duration-150"
            leaveFrom="opacity-50"
            leaveTo="opacity-0"
          />
          <Transition.Child
            enter="transition duration-300"
            enterFrom="translate-y-6 opacity-0"
            enterTo="translate-y-0 opacity-100"
            leave="transition duration-150"
            leaveFrom="translate-y-0 opacity-100"
            leaveTo="translate-y-6 opacity-0"
          >
            <Dialog.Panel className="px-4">
              <div className="w-full max-w-sm px-7 py-6 relative z-10 bg-white rounded-lg lg:mx-auto">
                <Dialog.Title className="text-20 font-medium text-dark-blue">Delete comment</Dialog.Title>
                <Dialog.Description className="mt-4 text-grayish-blue">Are you sure you want to remove this comment? This comment will be removed and can't be undone</Dialog.Description>
                <div className="mt-4 space-x-3 flex">
                  <button 
                    type="button" 
                    className="w-1/2 py-3 bg-grayish-blue hover:bg-light-grayish-blue font-medium text-white hover:text-grayish-blue rounded-lg transition-colors duration-200 outline-none"
                    onClick={() => close()}
                  >
                    NO, CANCEL
                  </button>
                  <button 
                    type="button" 
                    className="w-1/2 py-3 bg-soft-red hover:bg-pale-red font-medium text-white hover:text-soft-red rounded-lg transition-colors duration-200 outline-none"
                    onClick={() => confirmDelete()}
                  >
                    YES, DELETE
                  </button>
                </div>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  )
}

const Score = ({ 
  value,
  belongsToCurrentUser,
  currentUserVote,
  upvoteComment,
  downvoteComment,
} : { 
  value: number,
  currentUserVote:boolean|null,
  belongsToCurrentUser: boolean,
  upvoteComment: Function,
  downvoteComment: Function,
}) => {
  const upvoteButtonActive = currentUserVote === true
  const upvoteButtonDisabled = belongsToCurrentUser || upvoteButtonActive

  const downvoteButtonActive = currentUserVote === false
  const downvoteButtonDisabled = belongsToCurrentUser || downvoteButtonActive

  return (
    <div className="flex items-center bg-very-light-gray rounded-xl lg:block">
      <button 
        type="button" 
        className="w-10 h-10 flex justify-center items-center rounded-l-lg lg:w-10 lg:h-9 group"
        disabled={upvoteButtonDisabled}
        onClick={() => upvoteComment()}
      >
        <PlusIcon className={classnames({
          "fill-light-grayish-blue": !upvoteButtonActive,
          "fill-moderate-blue": upvoteButtonActive,
          "group-hover:fill-moderate-blue transition-colors duration-200": !upvoteButtonDisabled,
        })} />
      </button>
      <p className="px-0.5 flex justify-center items-center font-medium text-moderate-blue lg:pt-1">{value}</p>
      <button 
        type="button" 
        className="w-10 h-10 flex justify-center items-center rounded-r-lg lg:w-10 lg:h-9 group"
        disabled={downvoteButtonDisabled}
        onClick={() => downvoteComment()}
      >
        <MinusIcon className={classnames("fill-light-grayish-blue", {
          "fill-light-grayish-blue": !downvoteButtonActive,
          "fill-moderate-blue": downvoteButtonActive,
          "group-hover:fill-moderate-blue transition-colors duration-200": !downvoteButtonDisabled,
        })} />
      </button>
    </div>
  )
}

const CommentActions = ({ 
  belongsToCurrentUser,
  askDeleteConfirmation,
  showEditForm,
  toggleReplyForm,
} : {
  belongsToCurrentUser: boolean,
  askDeleteConfirmation: Function,
  showEditForm: Function,
  toggleReplyForm: Function,
}) => {
  return (
    <>
      {belongsToCurrentUser ? (
        <div className="flex items-center">
          <button 
            type="button" 
            className="flex items-center group"
            onClick={() => askDeleteConfirmation()}
          >
            <DeleteIcon className="fill-soft-red group-hover:fill-pale-red transition-colors duration-200" />
            <p className="ml-2 font-medium text-soft-red group-hover:text-pale-red transition-colors duration-200">Delete</p>
          </button>
          <button 
            type="button" 
            className="ml-4 flex items-center lg:ml-6 group"
            onClick={() => showEditForm()}
          >
            <EditIcon className="fill-moderate-blue group-hover:fill-light-grayish-blue transition-colors duration-200" />
            <p className="ml-2 font-medium text-moderate-blue group-hover:text-light-grayish-blue transition-colors duration-200">Edit</p>
          </button>
        </div>
      ) : (
        <button 
          type="button" 
          className="flex items-center group"
          onClick={() => toggleReplyForm()}
        >
          <ReplyIcon className="fill-moderate-blue group-hover:fill-light-grayish-blue transition-colors duration-200" />
          <p className="ml-2 font-weight-500 text-moderate-blue group-hover:text-light-grayish-blue transition-colors duration-200">Reply</p>
        </button>
      )}
    </>
  );
}

const Comment = ({
  comment, 
  belongsToCurrentUser,
  askDeleteConfirmation,
  updateComment,
  toggleReplyForm,
  upvoteComment,
  downvoteComment,
} : {
  comment: Comment, 
  belongsToCurrentUser: boolean,
  askDeleteConfirmation: Function,
  updateComment: Function,
  toggleReplyForm: Function,
  upvoteComment: Function,
  downvoteComment: Function,
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [content, setContent] = useState(comment.content)

  const showEditForm = () => { setIsEditing(true) }

  const hideEditForm = () => { setIsEditing(false) }

  const getMention = (replyingTo:string = null) => {
    if (replyingTo === null) {
      return ""
    }

    return "@" + replyingTo + " "
  }

  const handleContentChange = (newContent:string) => {
    const mention = getMention(comment.replyingTo)
    setContent(newContent.slice(mention.length))
  }

  const handleEditCommentSubmit = (e:FormEvent) => {
    e.preventDefault()

    if (!content) { return }

    updateComment(content)
    hideEditForm()
  }

  return (
    <div>
      <div className="p-4 lg:p-6 bg-white rounded-lg lg:flex">
        <Desktop>
          <div>
            <Score 
              value={comment.score} 
              belongsToCurrentUser={belongsToCurrentUser}
              currentUserVote={comment.currentUserVote}
              upvoteComment={() => upvoteComment()}
              downvoteComment={() => downvoteComment()}
            />
          </div>
        </Desktop>
        <div className="grow lg:ml-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <img
                src={require(`./images/avatars/image-${comment.user.username}.png`)}
                className="w-8 h-8"
              />
              <p className="ml-4 font-weight-500 text-dark-blue">
                {comment.user.username}
              </p>
              {belongsToCurrentUser && (
                <p className="ml-2 px-1.5 py-0.5 bg-moderate-blue text-12 font-weight-500 text-white rounded-sm">
                  you
                </p>
              )}
              <p className="ml-4 text-grayish-blue">{comment.createdAt}</p>
            </div>
            <Desktop>
              <CommentActions
                belongsToCurrentUser={belongsToCurrentUser}
                askDeleteConfirmation={askDeleteConfirmation}
                showEditForm={() => showEditForm()}
                toggleReplyForm={() => toggleReplyForm()}
              />
            </Desktop>
          </div>
          <div className="mt-4">
            {isEditing ? (
              <form onSubmit={(e) => handleEditCommentSubmit(e)}>
                <div className="flex flex-wrap justify-end">
                  <textarea 
                    rows={4}
                    className="w-full px-3 py-2 outline-none border border-moderate-blue text-dark-blue rounded-lg resize-none lg:px-6 lg:py-3"
                    value={`${getMention(comment.replyingTo)}${content}`}
                    onChange={e => handleContentChange(e.target.value)}
                  >
                  </textarea>
                  <button
                    type="submit"
                    className="mt-4 px-8 py-3 bg-moderate-blue hover:bg-light-grayish-blue font-medium text-white rounded-lg transition-colors duration-200"
                  >
                    UPDATE
                  </button>
                </div>
              </form>
            ) : (
              <p className="text-grayish-blue">
                {comment.replyingTo && (
                  <span className="mr-1 font-medium text-moderate-blue">
                    @{comment.replyingTo}
                  </span>
                )}
                <span>{comment.content}</span>
              </p>
            )}
          </div>
          <Mobile>
            <div className="mt-4 flex items-center justify-between">
              <Score 
                value={comment.score} 
                belongsToCurrentUser={belongsToCurrentUser}
                currentUserVote={comment.currentUserVote}
                upvoteComment={() => upvoteComment()}
                downvoteComment={() => downvoteComment()}
              />
              <CommentActions 
                belongsToCurrentUser={belongsToCurrentUser}
                askDeleteConfirmation={askDeleteConfirmation}
                showEditForm={() => showEditForm()}
                toggleReplyForm={() => toggleReplyForm()}
              />
            </div>
          </Mobile>
        </div>
      </div>
    </div>
  );
}

const ReplyForm = ({
  reply,
  currentUsername,
  setReply,
  createReply,
} : {
  reply: string,
  currentUsername: string,
  setReply: Function,
  createReply: Function,
}) => {
  const newReplyTextAreaClasses = "w-full px-6 py-3 outline-none border border-moderate-blue placeholder:text-grayish-blue text-dark-blue rounded-lg resize-none transition-colors duration-200 lg:ml-4"

  const handleReplyFormSubmit = (e:FormEvent) => {
    e.preventDefault()

    if (!reply) { return }

    createReply()
  }

  return (
    <form 
      className="mt-2 p-4 bg-white rounded-lg lg:mt-2 lg:p-6"
      onSubmit={(e) => handleReplyFormSubmit(e)}
    >
      <Mobile>
        <textarea
          rows={4}
          placeholder="Add a reply..."
          className={newReplyTextAreaClasses}
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          autoFocus
        ></textarea>
      </Mobile>
      <div className="mt-4 flex justify-between items-center lg:mt-0 lg:items-start">
        <img
          src={require(`./images/avatars/image-${currentUsername}.png`)}
          className="w-8 h-8"
        />
        <Desktop>
          <textarea
            rows={4}
            placeholder="Add a reply..."
            className={newReplyTextAreaClasses}
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            autoFocus
          ></textarea>
        </Desktop>
        <button
          type="submit"
          className="px-8 py-3 bg-moderate-blue hover:bg-light-grayish-blue font-medium text-white rounded-lg transition-colors duration-200 lg:ml-4"
        >
          SEND
        </button>
      </div>
    </form>
  )
}

const App = () => {
  const [state, setState] = useState(data)
  console.log({ state });
  const [deleteConfirmationData, setDeleteConfirmationData] = useState<DeleteConfirmationData>(null)
  const [newComment, setNewComment] = useState("")
  const [newReply, setNewReply] = useState("")
  const [replyFormData, setReplyFormData] = useState<ReplyFormData>(null)

  const handleNewCommentFormSubmit = (e:FormEvent) => {
    e.preventDefault()

    if (newComment) {
      createComment(newComment)
      setNewComment("")
    }
  }

  const createComment = (comment:string) => {
    setState({
      ...state,
      comments: [
        ...state.comments,
        {
          id: Math.random(),
          content: comment,
          createdAt: "today",
          score: 0,
          user: state.currentUser,
          replies: [],
          currentUserVote: null,
        },
      ],
    })
  }

  const updateComment = (id:number, content:string) => {
    setState({
      ...state,
      comments: state.comments.map(comment => {
        if (comment.id !== id) { return comment }
        return { ...comment, content }
      })
    })
  }

  const deleteComment = (id:number) => {
    setState({
      ...state,
      comments: state.comments.filter(comment => comment.id !== id),
    })
  }

  const createReplyForComment = (commentId:number, content:string) => {
    setState({
      ...state,
      comments: state.comments.map(comment => {
        if (comment.id !== commentId) { return comment }
        
        return {
          ...comment,
          replies: [
            {
              "id": Math.random(),
              "content": content,
              "createdAt": "today",
              "score": 0,
              "replyingTo": comment.user.username,
              "currentUserVote": null,
              "user": state.currentUser,
            },
            ...comment.replies,
          ]
        }
      })
    })
  }

  const createReplyForReply = (commentId:number, replyId:number, content:string) => {
    setState({
      ...state,
      comments: state.comments.map(comment => {
        if (comment.id !== commentId) { return comment }

        const replyIndex = comment.replies.findIndex(reply => reply.id === replyId)

        return {
          ...comment,
          replies: [
            ...comment.replies.slice(0, replyIndex + 1),
            {
              "id": Math.random(),
              "content": content,
              "createdAt": "today",
              "score": 0,
              "replyingTo": comment.replies[replyIndex].user.username,
              "currentUserVote": null,
              "user": state.currentUser,
            },
            ...comment.replies.slice(replyIndex + 1),
          ],
        }
      })
    })
  }

  const updateReply = (commentId:number, replyId:number, content:string) => {
    setState({
      ...state,
      comments: state.comments.map(comment => {
        if (comment.id !== commentId) { return comment }

        return {
          ...comment,
          replies: comment.replies.map(reply => {
            if (reply.id !== replyId) { return reply }
            return { ...reply, content }
          })
        }
      })
    })
  }

  const deleteReply = (commentId:number, replyId:number) => {
    setState({
      ...state,
      comments: state.comments.map(comment => {
        if (comment.id !== commentId) { return comment }

        return {
          ...comment,
          replies: comment.replies.filter(reply => reply.id !== replyId),
        }
      }),
    })
  }

  const confirmDeleteComment = () => {
    const data = deleteConfirmationData
    if (data.commentId && data.replyId) {
      deleteReply(data.commentId, data.replyId)
    } else {
      deleteComment(data.commentId)
    }
    setDeleteConfirmationData(null)
  }

  const openConfirmationDialog = (commentId:number, replyId:number = null) => {
    const deleteConfirmationData:DeleteConfirmationData = { commentId }
    if (replyId) {
      deleteConfirmationData.replyId = replyId
    }

    setDeleteConfirmationData(deleteConfirmationData)
  }

  const closeConfirmationDialog = () => {
    setDeleteConfirmationData(null)
  }

  const showReplyForm = (commentId:number, replyId:number = null) => {
    setReplyFormData({ commentId, replyId })
    setNewReply("")
  }

  const hideReplyForm = () => {
    setReplyFormData(null)
  }

  const createReply = () => {
    const data = replyFormData

    if (data.replyId === null) {
      createReplyForComment(data.commentId, newReply)
    } else {
      createReplyForReply(data.commentId, data.replyId, newReply)
    }

    hideReplyForm()
  }

  const voteOnComment = (commentId:number, vote:boolean) => {
    setState({
      ...state,
      comments: state.comments.map(comment => {
        if (comment.id !== commentId) { return comment }
        return {
          ...comment,
          score: vote ? comment.score + 1 : comment.score - 1,
          currentUserVote: vote,
        }
      })
    })
  }

  const upvoteComment = (commentId:number) => voteOnComment(commentId, true)

  const downvoteComment = (commentId:number) => voteOnComment(commentId, false)

  const voteOnReply = (commentId:number, replyId:number, vote:boolean) => {
    setState({
      ...state,
      comments: state.comments.map(comment => {
        if (comment.id !== commentId) { return comment }

        return {
          ...comment,
          replies: comment.replies.map(reply => {
            if (reply.id !== replyId) { return reply }
            return {
              ...reply,
              score: vote ? reply.score + 1 : reply.score - 1,
              currentUserVote: vote,
            }
          })
        }
      })
    })
  }

  const upvoteReply = (commentId:number, replyId:number) => voteOnReply(commentId, replyId, true)

  const downvoteReply = (commentId:number, replyId:number) => voteOnReply(commentId, replyId, false)

  const isReplyFormOpen = (commentId:number, replyId:number = null) => {
    const data = replyFormData

    if (data === null) { return false }

    if (replyId === null) {
      return data.commentId === commentId && data.replyId === null
    } else {
      return data.commentId === commentId && data.replyId === replyId
    }
  }

  const toggleReplyForm = (commentId:number, replyId:number = null) => {
    if (isReplyFormOpen(commentId, replyId)) {
      hideReplyForm()
      return
    } 

    showReplyForm(commentId, replyId)
  }

  const addCommentTextAreaClasses = "w-full px-6 py-3 outline-none border border-light-gray focus:border-moderate-blue placeholder:text-grayish-blue text-dark-blue rounded-lg resize-none transition-colors duration-200 lg:ml-4"

  return (
    <motion.div className="max-w-3xl mx-auto">
      <LayoutGroup>
        <AnimatePresence mode="popLayout">
          {state.comments.map((comment) => (
            <motion.div
              key={comment.id}
              className="mt-4 lg:mt-5"
              layout="position"
              exit={{ opacity: 0 }}
            >
              <AnimatePresence mode="popLayout">
                <motion.div layout>
                  <Comment
                    comment={comment}
                    askDeleteConfirmation={() => openConfirmationDialog(comment.id)}
                    updateComment={(content:string) => updateComment(comment.id, content)}
                    belongsToCurrentUser={comment.user.username === state.currentUser.username}
                    toggleReplyForm={() => toggleReplyForm(comment.id)}
                    upvoteComment={() => upvoteComment(comment.id)}
                    downvoteComment={() => downvoteComment(comment.id)}
                  />
                </motion.div>
                {isReplyFormOpen(comment.id) && (
                  <motion.div 
                    layout
                    exit={{ opacity: 0 }}
                    transition={{ 
                      opacity: { duration: 2 }
                    }}
                  >
                    <ReplyForm
                      reply={newReply}
                      currentUsername={state.currentUser.username}
                      setReply={(reply:string) => setNewReply(reply)}
                      createReply={() => createReply()}
                    />
                  </motion.div>
                )}
                {comment.replies.length > 0 && (
                  <div className="mt-4 pl-4 border-l-2 border-light-gray lg:ml-10 lg:mt-5 lg:pl-10">
                    <AnimatePresence>
                      {comment.replies.map((reply) => (
                        <motion.div 
                          key={reply.id}
                          className="mt-4 first:mt-0 lg:mt-6"
                          exit={{ opacity: 0, height: 0, marginTop: 0, }}
                        >
                          <Comment
                            key={reply.id}
                            comment={reply}
                            askDeleteConfirmation={() => openConfirmationDialog(comment.id, reply.id)}
                            updateComment={(content:string) => updateReply(comment.id, reply.id, content)}
                            belongsToCurrentUser={reply.user.username === state.currentUser.username}
                            toggleReplyForm={() => toggleReplyForm(comment.id, reply.id)}
                            upvoteComment={() => upvoteReply(comment.id, reply.id)}
                            downvoteComment={() => downvoteReply(comment.id, reply.id)}
                          />
                          {isReplyFormOpen(comment.id, reply.id) && (
                            <ReplyForm
                              reply={newReply}
                              currentUsername={state.currentUser.username}
                              setReply={(reply:string) => setNewReply(reply)}
                              createReply={() => createReply()}
                            />
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
        <motion.form
          layout
          className="mt-4 p-4 bg-white rounded-lg lg:mt-5 lg:p-6"
          onSubmit={(e) => handleNewCommentFormSubmit(e)}
        >
          <Mobile>
            <textarea
              rows={4}
              placeholder="Add a comment..."
              className={addCommentTextAreaClasses}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            ></textarea>
          </Mobile>
          <div className="mt-4 flex justify-between items-center lg:mt-0 lg:items-start">
            <img
              src={require(`./images/avatars/image-${state.currentUser.username}.png`)}
              className="w-8 h-8"
            />
            <Desktop>
              <textarea
                rows={4}
                placeholder="Add a comment..."
                className={addCommentTextAreaClasses}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              ></textarea>
            </Desktop>
            <button
              type="submit"
              className="px-8 py-3 bg-moderate-blue hover:bg-light-grayish-blue font-medium text-white rounded-lg transition-colors duration-200 lg:ml-4"
            >
              SEND
            </button>
          </div>
        </motion.form>
      </LayoutGroup>
      <DeleteConfirmationDialog 
        isOpen={deleteConfirmationData !== null} 
        close={() => closeConfirmationDialog()}
        confirmDelete={() => confirmDeleteComment()}
      />
    </motion.div>
  );
}

const container = document.getElementById("app")
const root = createRoot(container)
root.render(<App />)