const { useState, useEffect } = require('react');
const { useNavigate, useParams } = require('react-router-dom');
const { server, serverFile } = require('../server');

require('../styles/chat.css');

const FullscreenImage = require('./fullscreen_image.js').default;
const Messages = require('./messages').default;
const NewMessage = require('./new_message').default;
const ChatHeader = require('./chat_header').default;
const ChatMenu = require('./chat_menu').default;

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
    const [count, setCount] = useState(0);
    const [showFullscreenImage, setShowFullscreenImage] = useState(false);
    const [selectImage, setSelectImage] = useState();

    useEffect(() => {
        if(!userData) return;
        if(!userData._id) return navigate('/login');
        if(localStorage.getItem('closeRightMenu') == '1') document.querySelector('.page').classList.add('closeRightMenu');
        if(localStorage.getItem('closeLeftMenu') == '1') document.querySelector('.page').classList.add('closeLeftMenu');

        setNewMessage('');

        socket.on('update', getChat);
        getMessages();

        return () => {
            socket.off('update');
            socket.off('getMessages');
        }
    }, [userData, id])

    useEffect(() => {
        if(!userData) return;

        socket.on('getMessage', message => {
            setMessages([message, ...messages]);
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
    }, [messages])

    function getChat() {
        server('/chat/getChat', { chatID: id, userID: userData._id })
        .then(result => {
            if(!result.error) setChat(result);
            else setError([true, result.message]);
        })
    }

    function getMessages() {
        socket.emit('getMessages', { chatId: id, userId: userData._id, count });
        socket.on('getMessages', result => {
            if(result.length != 0) {
                setCount(count + 1);
                if(count != 0) setMessages([...messages, ...result]);
                else setMessages(result);
            }
            socket.off('getMessages');
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

    if(messages == undefined) {
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
                        showMenu={showChatMenu}
                        setShowMenu={setShowChatMenu}
                    />
                </div>

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
                    getMessages={getMessages}
                    user={userData._id}
                    chat={id}
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