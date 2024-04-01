const { useState } = require('react');

const serverUrl = require('../server_url.js');

require('../styles/messages.css');

const editImg = require('../images/pen.png');
const deleteImg = require('../images/delete.png');
const playImg = require('../images/play.png');
const fileImg = require('../images/file.png');

const FullscreenImage = require('./fullscreen_image.js').default;

export default function Messages(props) {
    const { items, user, chat, editMessage, deleteMessage } = props;

    const [showFullscreenImage, setShowFullscreenImage] = useState(false);
    const [selectImage, setSelectImage] = useState();

    function getDate(str) {
        const date = new Date(str);

        let hours = date.getHours();
        let minutes = date.getMinutes();

        return `${hours < 10 ? `0${hours}` : hours}:${minutes < 10 ? `0${minutes}` : minutes}`;
    }

    if(items == null || items.length == 0) {
        return(
            <div className='messages_wrapper'>
                <div className='messages_noMessages'>Сообщений пока нет</div>
            </div>
        )
    }

    const getType = (str) => str.split('.')[str.split('.').length - 1];

    return(
        <div className='messages_wrapper'>
            {items.map((item, i) =>
                <div className={`message_wrapper${item.user == user ? ' myMessage' : ''}`} key={i}>
                    <div className='message'>
                        {item.type == 'text' && <div className='message_text'>{item.text}</div>}
                        {item.type == 'image' && <img className='message_image' src={`${serverUrl}/chats/${chat}/${item._id}.${getType(item.filename)}`} onClick={() => {setSelectImage({ src: `/chats/${chat}/${item._id}.${getType(item.filename)}`, type: 'image'}); setShowFullscreenImage(!showFullscreenImage)}}/>}
                        {item.type == 'video' &&
                        <div className='message_video' onClick={() => {setSelectImage({ src: `/chats/${chat}/${item._id}.${getType(item.filename)}`, type: 'video'}); setShowFullscreenImage(!showFullscreenImage)}}>
                            <img src={playImg}/>
                            <video src={`${serverUrl}/chats/${chat}/${item._id}.${getType(item.filename)}`}/>
                        </div>}
                        {item.type == 'file' &&
                        <a className='message_file' href={`${serverUrl}/chats/${chat}/${item._id}.${getType(item.filename)}`}>
                            <img src={fileImg}/>
                            {item.filename}
                        </a>}
                        <div className='message_created'>{item.edit ? 'изм.' : ''} {getDate(item.created)}</div>
                    </div>
                    {item.user == user &&
                    <div className='message_menu'>
                        {item.type == 'text' && <img src={editImg} onClick={() => editMessage(item._id, item.text)}/>}
                        <img src={deleteImg} onClick={() => deleteMessage(item._id, `${item._id}.${getType(item.filename)}`)}/>
                    </div>}
                </div>
            )}
            {showFullscreenImage && <FullscreenImage selectImage={selectImage} images={[selectImage]} setShow={setShowFullscreenImage}/>}
        </div>
    )
}