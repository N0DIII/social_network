const { useState } = require('react');
const serverUrl = require('../server_url.js');

require('../styles/photolist.css');
require('../styles/load.css');

const FullscreenImage = require('./fullscreen_image.js').default;

export default function Photolist(props) {
    const { items, isOwner, deletePhoto, setConfirm } = props;

    const [showFullscreenImage, setShowFullscreenImage] = useState(false);
    const [selectImage, setSelectImage] = useState();

    if(items == null) {
        return(
            <div className='photolist_photo_wrapper'>
                <div className='load_wrapper'>
                    <div className='load_div'></div>
                </div>
            </div>
        )
    }
    if(items.length == 0) {
        return(
            <div className='page_error'>
                Нет фотографий
            </div>
        )
    }
    else {
        return(
            <div className='photolist_photos'>
                {items.map((item, i) => {
                    if(item?.type == 'load') {
                        return(
                            <div className='load_wrapper' key={i} style={{height: '200px'}}>
                                <div className='load_div'></div>
                            </div>
                        )
                    }
                    else {
                        return(
                            <div className='photolist_photo_wrapper' key={i}>
                                {isOwner && <img className='photolist_photo_delete' src='/images/delete.png' onClick={() => setConfirm([true, deletePhoto, [item.src, item._id]])}/>}
                                {item.type == 'image' &&
                                <img className='photolist_photo' src={serverUrl + item.src} onClick={() => {setSelectImage(item); setShowFullscreenImage(!showFullscreenImage)}}/>}
                                {item.type == 'video' &&
                                <div className='photolist_photo' onClick={() => {setSelectImage(item); setShowFullscreenImage(!showFullscreenImage)}}>
                                    <img className='photolist_play' src='/images/play.png'/>
                                    <video src={serverUrl + item.src}/>
                                </div>}
                            </div>
                        )
                    }
                })}

                {showFullscreenImage && <FullscreenImage selectImage={selectImage} images={items} setShow={setShowFullscreenImage}/>}
            </div>
        )
    }
}