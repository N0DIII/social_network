const { useState, useEffect, useRef } = require('react');
const { server } = require('../server.js');

require('../styles/album_title.css');

export default function AlbumTitle(props) {
    const { id, title, isOwner, loadFile, setError } = props;
    
    const [name, setName] = useState(null);
    const titleInput = useRef(null);
    
    useEffect(() => {
        setName(title);
    }, [title])

    function changeTitle(e) {
        const title = titleInput.current;

        if(title.disabled) {
            e.target.src = '/images/checkMark.png';
            title.disabled = false;
            title.focus();
        }
        else {
            e.target.src = '/images/pen.png';
            title.disabled = true;

            server('/album/changeAlbumName', { id, name })
            .then(result => {
                if(result.error) setError([true, result.message]);
                else setName(result.title);
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
                <input ref={titleInput} type='text' value={name} disabled={true} onChange={e => setName(e.target.value)}/>
                {isOwner &&
                <div className='album_title_creator'>
                    <img className='album_title_changeName' src='/images/pen.png' onClick={changeTitle}/>
                    <div className='album_input_wrapper'>
                        <img className='album_input_cover' src='/images/plus.png'/>
                        <input type='file' className='album_input' accept='image/*, video/*' onChange={loadFile}/>
                    </div>
                </div>}
            </div>
        )
    }
}