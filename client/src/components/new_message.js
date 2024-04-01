const { useState } = require('react');

require('../styles/new_message.css');

const clipImg = require('../images/clip.png');
const sendImg = require('../images/send.png');
const saveImg = require('../images/checkMark.png');
const imageImg = require('../images/picture.png');
const videoImg = require('../images/video.png');
const fileImg = require('../images/file.png');

export default function NewMessage(props) {
    const { value, setValue, isEdit, sendMessage, sendFile } = props;

    const [showFileMenu, setShowFileMenu] = useState(false);

    return(
        <div className='newMessage_wrapper'>
            <div className='newMessage'>
                <img className='newMessage_addFile' src={clipImg} onClick={() => setShowFileMenu(!showFileMenu)}/>
                <input className='newMessage_text' type='text' value={value} placeholder='Введите сообщение' onChange={e => setValue(e.target.value)}/>
                <img className='newMessage_send' src={isEdit ? saveImg : sendImg} onClick={sendMessage}/>
            </div>

            {showFileMenu &&
            <div className='newMessage_fileMenu'>
                <div className='newMessage_fileMenu_item'>
                    <input type='file' accept='image/*' onChange={e => sendFile(e, setShowFileMenu, '/chat/sendImage')}/>
                    <img src={imageImg}/>
                    Изображение
                </div>
                <div className='newMessage_fileMenu_item'>
                    <input type='file' accept='video/*' onChange={e => sendFile(e, setShowFileMenu, '/chat/sendVideo')}/>
                    <img src={videoImg}/>
                    Видео
                </div>
                <div className='newMessage_fileMenu_item'>
                    <input type='file' accept='application/*' onChange={e => sendFile(e, setShowFileMenu, '/chat/sendFile')}/>
                    <img src={fileImg}/>
                    Файл
                </div>
            </div>}
        </div>
    )
}