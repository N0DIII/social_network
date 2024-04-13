const { useState, useEffect, useCallback } = require('react');
const { useNavigate, useParams } = require('react-router-dom');
const { server, serverFile } = require('../server');

require('../styles/chat.css');

const FullscreenImage = require('./fullscreen_image.js').default;
const Messages = require('./messages').default;
const NewMessage = require('./new_message').default;
const ChatHeader = require('./chat_header').default;
const ChatMenu = require('./chat_menu').default;
const ChatInvite = require('./chat_invite').default;

export default function Chat(props) {
    const { userData, socket, setError, setConfirm } = props;
    const navigate = useNavigate();
    const params = useParams();
    const { id } = params;

    const [chat, setChat] = useState(null);
    const [messages, setMessages] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [isEdit, setIsEdit] = useState(false);
    const [editedMessage, setEditedMessage] = useState();
    const [showChatMenu, setShowChatMenu] = useState({left: '100vw'});
    const [showFullscreenImage, setShowFullscreenImage] = useState(false);
    const [selectImage, setSelectImage] = useState();
    const [showInvite, setShowInvite] = useState(false);

    const [count, setCount] = useState(0);
    const [maxCount, setMaxCount] = useState(1);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        if(!userData) return;
        if(!userData._id) return navigate('/login');
        if(localStorage.getItem('closeRightMenu') == '1') document.querySelector('.page').classList.add('closeRightMenu');
        if(localStorage.getItem('closeLeftMenu') == '1') document.querySelector('.page').classList.add('closeLeftMenu');

        setNewMessage('');
        getChat(id);
        setCount(0);
        setMaxCount(1);
        setFetching(true);
    }, [userData, id])

    useEffect(() => {
        if(!userData) return;

        socket.on('getMessage', message => {
            if(id == message.chat) {
                setMessages([message, ...messages]);
                socket.emit('readChat', { chatID: id, userID: userData._id });
            }
        })

        socket.on('deleteMessage', ({ id }) => {
            setMessages(messages.filter(message => message._id != id));
        })

        socket.on('editMessage', editedMessage => {
            let updMessages = messages;
            for(let i = 0; i < messages.length; i++) {
                if(messages[i]._id == editedMessage._id) {
                    updMessages.splice(i, 1, editedMessage);
                    break;
                }
            }

            setMessages([...updMessages]);
        })

        return () => {
            socket.off('getMessage');
            socket.off('deleteMessage');
            socket.off('editMessage');
        }
    }, [messages, id])

    useEffect(() => {
        if(fetching) {
            server('/chat/getMessages', { chatID: id, count })
            .then(result => {
                if(count != 0) setMessages([...messages, ...result.messages]);
                else setMessages(result.messages);

                setCount(prevState => prevState + 1);
                setMaxCount(result.maxCount);
            })

            setFetching(false);
        }
    }, [fetching])

    const scroll = useCallback(e => {
        if(e.target.scrollHeight - (Math.abs(e.target.scrollTop) + window.innerHeight) < 100 && messages.length < maxCount) {
            setFetching(true);
        }
    }, [maxCount, messages])

    function getChat(id) {
        server('/chat/getChat', { chatID: id, userID: userData._id })
        .then(result => {
            if(!result.error) {
                setChat(result);
                socket.emit('readChat', { chatID: id, userID: userData._id });
            }
            else setError([true, result.message]);
        })
    }

    function sendMessage() {
        if(newMessage.trim() == '') return;

        if(!isEdit) socket.emit('sendMessage', { user: userData._id, chat: id, text: newMessage });
        else {
            socket.emit('editMessage', { text: newMessage, message: editedMessage, chat: id });
            setIsEdit(false);
        }

        setNewMessage('');
    }

    function sendFile(e, close, url) {
        close(false);

        if(e.target.files && e.target.files[0]) {
            serverFile(url, { user: userData._id, chat: id }, e.target.files[0])
            .then(result => {
                if(result.error) setError([true, result.message]);
                else socket.emit('sendFile', result);
            })
        }
    }

    function deleteMessage(message, filename) {
        socket.emit('deleteMessage', { message, chat: id, filename });
    }

    function editMessage(id, text) {
        setIsEdit(true);
        setEditedMessage(id);
        setNewMessage(text);
    }

    if(chat == null) {
        return(
            <div className='page page_noTitle'>
                <div className='load_wrapper'>
                    <div className='load_div'></div>
                </div>
            </div>
        )
    }
    else if(chat == undefined) {
        return(
            <div className='page page_noTitle'>
                <div className='noChat'>Такого чата нет</div>
            </div>
        )
    }
    else {
        return (
            <div className='page'>
                {showFullscreenImage && <FullscreenImage selectImage={selectImage} images={[selectImage]} setShow={setShowFullscreenImage}/>}
                <div className='page_title'>
                    <ChatHeader
                        chat={chat}
                        id={userData._id}
                        showMenu={showChatMenu}
                        setShowMenu={setShowChatMenu}
                        setError={setError}
                        invite={[showInvite, setShowInvite]}
                    />
                </div>

                <ChatInvite
                    id={userData._id}
                    chat={chat}
                    setShow={setShowInvite}
                    socket={socket}
                    style={showInvite}
                />

                <ChatMenu
                    chat={chat}
                    userData={userData}
                    showMenu={showChatMenu}
                    messages={messages}
                    fullscreenImage={[showFullscreenImage, setShowFullscreenImage]}
                    selectImage={[selectImage, setSelectImage]}
                    setConfirm={setConfirm}
                />

                <Messages
                    items={messages}
                    scroll={scroll}
                    user={userData._id}
                    chat={chat}
                    editMessage={editMessage}
                    deleteMessage={deleteMessage}
                    fullscreenImage={[showFullscreenImage, setShowFullscreenImage]}
                    selectImage={[selectImage, setSelectImage]}
                    setConfirm={setConfirm}
                />

                <NewMessage
                    value={newMessage}
                    setValue={setNewMessage}
                    isEdit={isEdit}
                    sendMessage={sendMessage}
                    sendFile={sendFile}
                />
            </div>
        )
    }
}