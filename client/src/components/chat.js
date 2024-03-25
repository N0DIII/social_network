// import TimeAgo from 'react-timeago';
// import ruStrings from 'react-timeago/lib/language-strings/ru';
// import buildFormatter from 'react-timeago/lib/formatters/buildFormatter';

// const formatter = buildFormatter(ruStrings);

const { useState, useEffect } = require('react');
const { useNavigate, useParams } = require('react-router-dom');
const serverUrl = require('../server_url.js');

require('../styles/chat.css');

const clipImg = require('../images/clip.png');
const sendImg = require('../images/send.png');
const editImg = require('../images/pen.png');
const deleteImg = require('../images/delete.png');
const saveImg = require('../images/checkMark.png');
const imageImg = require('../images/picture.png');
const fileImg = require('../images/file.png');

export default function Chat(props) {
    const { userData, socket } = props;
    const navigate = useNavigate();
    const params = useParams();
    const { id } = params;

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isEdit, setIsEdit] = useState(false);
    const [editedMessage, setEditedMessage] = useState();
    const [showFileMenu, setShowFileMenu] = useState(false);
    const [noChat, setNoChat] = useState(false);

    useEffect(() => {
        if(!userData) return;
        if(!userData._id) return navigate('/login');
        if(localStorage.getItem('closeRightMenu') == '1') document.querySelector('.page').classList.add('closeRightMenu');
        if(localStorage.getItem('closeLeftMenu') == '1') document.querySelector('.page').classList.add('closeLeftMenu');

        socket.emit('getMessages', { id });
        socket.on('getMessages', ({ messages, chat }) => {
            if(chat == null) {
                setNoChat(true);
                return;
            }

            setMessages(messages);
        })
    }, [userData, messages])

    useEffect(() => {
        if(!userData) return;

        socket.on('getMessage', message => {
            console.log([...messages, message])
            setMessages([...messages, message]);
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
    }, [messages])

    function sendMessage() {
        if(newMessage.trim() == '') return;

        if(!isEdit) socket.emit('sendMessage', { user: userData._id, chat: id, text: newMessage });
        else {
            socket.emit('editMessage', { text: newMessage, message: editedMessage, chat: id });
            setIsEdit(false);
        }
        setNewMessage('');
    }

    function deleteMessage(message) {
        socket.emit('deleteMessage', { message, chat: id });
    }

    function editMessage(id, text) {
        setIsEdit(true);
        setEditedMessage(id);
        setNewMessage(text);
    }

    function getDate(str) {
        const date = new Date(str);

        let hours = date.getHours();
        let minutes = date.getMinutes();

        return `${hours < 10 ? `0${hours}` : hours}:${minutes < 10 ? `0${minutes}` : minutes}`;
    }

    function sendImage(e) {
        if(e.target.files && e.target.files[0]) {
            let reader = new FileReader();

            reader.onloadend = el => {
                socket.emit('sendImage', { user: userData._id, chat: id, image: el.target.result});
            }

            reader.readAsDataURL(e.target.files[0]);
        }
    }

    return (
        <div className='page'>
            <div className='page_title'></div>

            <div className='chat_wrapper'>
                {noChat && <div className='noChat'>Такого чата нет</div>}
                
                {!noChat &&
                <div className='chat_messages_wrapper'>
                    {messages.map((message, i) => 
                        <div className={`chat_message_wrapper${message.user == userData._id ? ' myMessage' : ''}`} key={i}>
                            <div className='chat_message'>
                                {message.type == 'text' && <div className='chat_message_text'>{message.text}</div>}
                                {message.type == 'image' && <img className='chat_message_image' src={`${serverUrl}/chats/${id}/${message._id}.jpg`}/>}
                                <div className='chat_message_created'>{message.edit ? 'изм.' : ''} {getDate(message.created)}</div>
                            </div>
                            {message.user == userData._id &&
                            <div className='chat_message_menu'>
                                {message.type == 'text' && <img src={editImg} onClick={() => editMessage(message._id, message.text)}/>}
                                <img src={deleteImg} onClick={() => deleteMessage(message._id)}/>
                            </div>}
                        </div>
                    )}
                    {messages.length == 0 && <div className='chat_noMessage'>Пока нет сообщений</div>}
                </div>}

                {!noChat &&
                <div className='chat_newMessage_wrapper'>
                    <div className='chat_newMessage'>
                        <img className='chat_newMessage_addFile' src={clipImg} onClick={() => setShowFileMenu(!showFileMenu)}/>
                        <input className='chat_newMessage_text' type='text' value={newMessage} placeholder='Введите сообщение' onChange={e => setNewMessage(e.target.value)}/>
                        <img className='chat_newMessage_send' src={isEdit ? saveImg : sendImg} onClick={sendMessage}/>
                    </div>

                    {showFileMenu &&
                    <div className='chat_newMessage_fileMenu'>
                        <div className='chat_newMessage_fileMenu_item'>
                            <input type='file' accept='image/*' onChange={sendImage}/>
                            <img src={imageImg}/>
                            Изображение
                        </div>
                        <div className='chat_newMessage_fileMenu_item'><img src={fileImg}/>Файл</div>
                    </div>}
                </div>}
            </div>
        </div>
    )
}