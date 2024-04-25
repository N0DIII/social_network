const serverUrl = require('../server_url.js');

require('../styles/messages.css');

export default function Messages(props) {
    const { items, scroll, user, chat, editMessage, deleteMessage, fullscreenImage, selectImage, setConfirm } = props;

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

    const getName = item => `${item._id}.${item.filename.split('.')[item.filename.split('.').length - 1]}`;

    if(items == null) {
        return(
            <div className='messages_wrapper'>
                <div className='load_wrapper'>
                    <div className='load_div'></div>
                </div>
            </div>
        )
    }
    else if(items.length == 0) {
        return(
            <div className='messages_wrapper'>
                <div className='messages_noMessages'>Сообщений пока нет</div>
            </div>
        )
    }
    else {
        return(
            <div className='messages_wrapper' onScroll={scroll} onResize={scroll}>
                {items.map((item, i) => {
                    const showData = i == items.length - 1 || (i != items.length - 1 && items[i].created.split('T')[0] != items[i + 1].created.split('T')[0]) ? true : false;
                    const showName = chat.type != 'public' || item.user == user ? false : i != items.length - 1 && items[i].username != items[i + 1].username ? true : i == items.length - 1 ? true : false;
                    return(
                        <div className={`message_wrapper${item.user == user ? ' myMessage' : ''}${showData ? ' messageDate' : ''}`} key={i}>
                            {showData && <div className='message_date'>{getDate(item.created)}</div>}
                            <div className='message'>
                                {showName && <div className='message_username'>{item.username}</div>}
                                {item.type == 'text' && <div className='message_text'>{item.text}</div>}
                                {item.type == 'image' && <img className='message_image' src={`${serverUrl}/chats/${chat._id}/${getName(item)}`} onClick={() => {selectImage[1]({ src: `/chats/${chat._id}/${getName(item)}`, type: 'image'}); fullscreenImage[1](!fullscreenImage[0])}}/>}
                                {item.type == 'video' &&
                                <div className='message_video' onClick={() => {selectImage[1]({ src: `/chats/${chat._id}/${getName(item)}`, type: 'video'}); fullscreenImage[1](!fullscreenImage[0])}}>
                                    <img src='/images/play.png'/>
                                    <video src={`${serverUrl}/chats/${chat._id}/${getName(item)}`}/>
                                </div>}
                                {item.type == 'file' &&
                                <a className='message_file' href={`${serverUrl}/chats/${chat._id}/${getName(item)}`}>
                                    <img src='/images/file.png'/>
                                    {item.filename}
                                </a>}
                                <div className='message_created'>{item.edit ? 'изм.' : ''} {getTime(item.created)}</div>
                            </div>
                            {item.user == user &&
                            <div className='message_menu'>
                                {item.type == 'text' && <img src='/images/pen.png' onClick={() => editMessage(item._id, item.text)}/>}
                                {item.type != 'text' && <img src='/images/delete.png' onClick={() => setConfirm([true, deleteMessage, [item._id, `${getName(item)}`]])}/>}
                                {item.type == 'text' && <img src='/images/delete.png' onClick={() => setConfirm([true, deleteMessage, [item._id]])}/>}
                            </div>}
                        </div>
                    )
                })}
            </div>
        )
    }
}