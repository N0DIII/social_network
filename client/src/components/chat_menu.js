const { useState, useEffect } = require('react');
const { server } = require('../server');

require('../styles/chat_menu.css');
require('../styles/load.css');

const Button = require('./button.js').default;
const ChatMenuList = require('./chat_menu_list.js').default;

export default function ChatMenu(props) {
    const { chat, userData, showMenu, messages, fullscreenImage, selectImage, setConfirm } = props;

    const [page, setPage] = useState('photo');
    const [photo, setPhoto] = useState(null);
    const [video, setVideo] = useState(null);
    const [file, setFile] = useState(null);
    const [itemsLeft, setItemsLeft] = useState({left: '0'});

    useEffect(() => {
        if(chat == null) return;

        server('/chat/getPhoto', { id: chat._id }).then(result => setPhoto(result));
        server('/chat/getVideo', { id: chat._id }).then(result => setVideo(result));
        server('/chat/getFile', { id: chat._id }).then(result => setFile(result));
    }, [chat, messages])

    function deleteChat(chatID, userID) {
        console.log(chat)
        server('/chat/deleteChat', { chatID, userID }).then(result => window.location.assign('/'));
    }

    return(
        <div className='chatMenu_wrapper' style={showMenu}>
            <div className='chatMenu_header'>
                <div className='chatMenu_header_items'>
                    <div className='chatMenu_header_item' style={page == 'photo' ? {borderBottom: '3px solid #8551FF'} : {}} onClick={() => {setPage('photo'); setItemsLeft({left: '0'})}}>Фотографии</div>
                    <div className='chatMenu_header_item' style={page == 'video' ? {borderBottom: '3px solid #8551FF'} : {}} onClick={() => {setPage('video'); setItemsLeft({left: '-100%'})}}>Видео</div>
                    <div className='chatMenu_header_item' style={page == 'file' ? {borderBottom: '3px solid #8551FF'} : {}} onClick={() => {setPage('file'); setItemsLeft({left: '-200%'})}}>Файлы</div>
                </div>
                <div className='chatMenu_header_button'><Button title='Выйти из чата' onclick={() => setConfirm([true, deleteChat, [chat._id, userData._id]])}/></div>
            </div>

            <div className='chatMenu_items' style={itemsLeft}>
                <ChatMenuList items={photo} fullscreenImage={fullscreenImage} selectImage={selectImage}/>
                <ChatMenuList items={video} fullscreenImage={fullscreenImage} selectImage={selectImage}/>
                <ChatMenuList items={file} type='file'/>
            </div>
        </div>
    )
}