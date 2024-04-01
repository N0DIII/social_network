const { useState, useEffect, useRef } = require('react');
const { server } = require('../server.js');

require('../styles/album_title.css');

const editImg = require('../images/pen.png');
const saveImg = require('../images/checkMark.png');

const Error = require('./error').default;

export default function AlbumTitle(props) {
    const { id, title, isOwner, loadFile } = props;
    
    const [name, setName] = useState(null);
    const titleInput = useRef(null);
    const [error, setError] = useState(false);
    
    useEffect(() => {
        setName(title);
    }, [title])

    function changeTitle(e) {
        const title = titleInput.current;

        if(title.disabled) {
            e.target.src = saveImg;
            title.disabled = false;
            title.focus();
        }
        else {
            e.target.src = editImg;
            title.disabled = true;

            server('/file/changeAlbumName', { id, name })
            .then(result => {
                if(!result) setError(true);
            })
        }
    }

    if(name == null) {
        return(
            <div className='load_wrapper'>
                <div className='load_div'></div>
            </div>
        )
    }
    else {
        return(
            <div className='album_title'>
                <Error params={[error, setError]}/>
                <input ref={titleInput} type='text' value={name} disabled={true} onChange={e => setName(e.target.value)}/>
                {isOwner && <img className='album_title_changeName' src={editImg} onClick={changeTitle}/>}
                {isOwner &&
                <div className='album_input_wrapper'>
                    <div className='album_input_text'>Загрузить фото или видео</div>
                    <input type='file' className='album_input' accept='image/*, video/*' onChange={loadFile}/>
                    <div className='album_input_back1'></div>
                    <div className='album_input_back2'></div>
                </div>}
            </div>
        )
    }
}