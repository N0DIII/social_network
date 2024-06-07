import { useState, useContext, useEffect } from 'react';

import serverUrl from '../server_url';

import { Context } from './context';

export default function Message(props) {
    const { userData, setFFiles, setSFFile, setFParams, setConfirm } = useContext(Context);
    const { message, chatId, deleteMessage, changeMessage, showDate, showName } = props;

    const [files, setFiles] = useState([]);
    const [apps, setApps] = useState([]);
    const [select, setSelect] = useState(0);

    useEffect(() => {
        setFiles([]);
        setApps([]);

        message.files.forEach(file => {
            if(file.mimetype == 'application') setApps(prevState => [...prevState, { src: `${serverUrl}/chats/${chatId}/${file.src}`, mimetype: file.mimetype, name: file.originalname }]);
            else setFiles(prevState => [...prevState, { src: `${serverUrl}/chats/${chatId}/${file.src}`, mimetype: file.mimetype }]);
        })
    }, [message])

    function getTime(str) {
        const date = new Date(str);

        let hours = date.getHours();
        let minutes = date.getMinutes();

        return `${hours < 10 ? `0${hours}` : hours}:${minutes < 10 ? `0${minutes}` : minutes}`;
    }

    function getDate(str) {
        const date = new Date(str);

        const day = date.getDate();
        const month = date.getMonth();
        const year = date.getFullYear();

        return `${day < 10 ? '0' + day : day}.${month < 9 ? '0' + Number(month + 1) : month + 1}.${year}`;
    }

    function selectFile(file) {
        setFFiles(files);
        setFParams({ show: true, link: '' });
        setSFFile(file);
    }

    return(
        <div className='message_wrapper'>
            {showDate && <div className='message_date'>{getDate(message.created)}</div>}
            <div className={'message' + (message.user == userData._id ? ' myMessage' : '')}>
                {showName && <div className='message_username'>{message.username}</div>}

                {files.length != 0 &&
                <div className='message_files'>
                    {files[select].mimetype == 'image' && <img className='message_files_image' src={files[select].src} onClick={() => selectFile(files[select])} />}
                    {files[select].mimetype == 'video' &&
                    <div className='message_files_video' onClick={() => selectFile(files[select])}>
                        <video src={files[select].src} />
                        <img src='/images/play.png' />
                    </div>}

                    {select > 0 && <img className='message_files_prev' src='/images/leftArrow.png' onClick={() => setSelect(prevState => prevState - 1)} />}
                    {select < files.length - 1 && <img className='message_files_next' src='/images/rightArrow.png' onClick={() => setSelect(prevState => prevState + 1)} />}
                </div>}

                {apps.length != 0 &&
                <div className='message_apps'>
                    {apps.map((file, i) =>
                        <div key={i} className='message_app'>
                            <img src='/images/file.png' />
                            <a href={file.src}>{file.name}</a>
                        </div>
                    )}
                </div>}

                {message.text != '' && <div className='message_text'>{message.text}</div>}
                <div className='message_created'>{message?.edit != undefined && message.edit ? 'изм. ' : ''}{getTime(message.created)}</div>

                {userData._id == message.user &&
                <div className='message_buttons'>
                    <img src='/images/pen.png' onClick={() => changeMessage([...files, ...apps], message.text, message._id)} title='Изменить сообщение' />
                    <img src='/images/delete.png' onClick={() => setConfirm([true, deleteMessage, [message]])} title='Удалить сообщение' />
                </div>}
            </div>
        </div>
    )
}