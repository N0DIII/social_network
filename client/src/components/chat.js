// import TimeAgo from 'react-timeago';
// import ruStrings from 'react-timeago/lib/language-strings/ru';
// import buildFormatter from 'react-timeago/lib/formatters/buildFormatter';

// const formatter = buildFormatter(ruStrings);

const { useState, useEffect } = require('react');
const { useNavigate, useParams } = require('react-router-dom');
const { server, serverFile } = require('../server');

require('../styles/chat.css');

const Error = require('./error').default;
const Messages = require('./messages').default;
const NewMessage = require('./new_message').default;

export default function Chat(props) {
    const { userData, socket } = props;
    const navigate = useNavigate();
    const params = useParams();
    const { id } = params;

    const [messages, setMessages] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [isEdit, setIsEdit] = useState(false);
    const [editedMessage, setEditedMessage] = useState();
    const [error, setError] = useState(false);

    useEffect(() => {
        if(!userData) return;
        if(!userData._id) return navigate('/login');
        if(localStorage.getItem('closeRightMenu') == '1') document.querySelector('.page').classList.add('closeRightMenu');
        if(localStorage.getItem('closeLeftMenu') == '1') document.querySelector('.page').classList.add('closeLeftMenu');

        setNewMessage('');

        socket.emit('getMessages', { id });
        socket.on('getMessages', result => {
            setMessages(result?.messages);
        })
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

    return (
        <div className='page'>
            <Error params={[error, setError]}/>

            <div className='page_title'></div>

            <Messages
                items={messages}
                user={userData._id}
                chat={id}
                editMessage={editMessage}
                deleteMessage={deleteMessage}
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