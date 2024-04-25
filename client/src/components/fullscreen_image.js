const { useEffect, useState } = require('react');
const serverUrl = require('../server_url.js');

require('../styles/fullscreen_image.css');

export default function FullscreenImage(props) {
    const { selectImage, images, setShow, index = -1 } = props;

    const [image, setImage] = useState(selectImage);
    const [i, setI] = useState(index);

    useEffect(() => {
        if(index == -1) setI(images.indexOf(selectImage));
    }, [])

    useEffect(() => {
        window.addEventListener('keydown', keydown);

        return () => window.removeEventListener('keydown', keydown);
    }, [i])

    function keydown(e) {
        if(e.key == 'Escape') setShow(false);
        if(e.key == 'ArrowRight') switching(1);
        if(e.key == 'ArrowLeft') switching(-1);
    }

    function switching(k) {
        if((i == 0 && k == -1) || (i == images.length - 1 && k == 1)) return;

        setImage(images[i + k]);
        setI(i + k);
    }

    return(
        <div className='fullscreenImage_wrapper'>
            <img className='fullscreenImage_close' src='/images/cross2.png' onClick={() => setShow(false)}/>
            <img className='fullscreenImage_previous' src='/images/leftArrow.png' style={i == 0 ? {opacity: '0', cursor: 'default'} : {}} onClick={() => switching(-1)}/>

            {image.type == 'image' &&
            <img className='fullscreenImage_image' src={serverUrl + image.src}/>}

            {image.type == 'video' &&
            <video className='fullscreenImage_image' src={serverUrl + image.src} controls/>}

            <img className='fullscreenImage_next' src='/images/rightArrow.png' style={i == images.length - 1 ? {opacity: '0', cursor: 'default'} : {}} onClick={() => switching(1)}/>
        </div>
    )
}