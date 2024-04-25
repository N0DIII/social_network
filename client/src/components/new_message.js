const { useState } = require('react');

require('../styles/new_message.css');

export default function NewMessage(props) {
    const { value, setValue, isEdit = false, sendMessage, sendFile, placeholder } = props;

    const [showFileMenu, setShowFileMenu] = useState(false);

    return(
        <div className='newMessage_wrapper'>
            <div className='newMessage'>
                <img className='newMessage_addFile' src='/images/clip.png' onClick={() => setShowFileMenu(!showFileMenu)}/>
                <input className='newMessage_text' type='text' value={value} placeholder={placeholder} onChange={e => setValue(e.target.value)} onKeyDown={e => {if(e.key == 'Enter') sendMessage()}}/>
                <img className='newMessage_send' src={isEdit ? '/images/checkMark.png' : '/images/send.png'} onClick={sendMessage}/>
            </div>

            {showFileMenu &&
            <div className='newMessage_fileMenu'>
                <div className='newMessage_fileMenu_item'>
                    <input type='file' accept='image/*' onChange={e => sendFile(e, setShowFileMenu, 'sendImage')}/>
                    <img src='/images/picture.png'/>
                    Изображение
                </div>
                <div className='newMessage_fileMenu_item'>
                    <input type='file' accept='video/*' onChange={e => sendFile(e, setShowFileMenu, 'sendVideo')}/>
                    <img src='/images/video.png'/>
                    Видео
                </div>
                <div className='newMessage_fileMenu_item'>
                    <input type='file' accept='application/*' onChange={e => sendFile(e, setShowFileMenu, 'sendFile')}/>
                    <img src='/images/file.png'/>
                    Файл
                </div>
            </div>}
        </div>
    )
}