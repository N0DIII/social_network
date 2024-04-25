const { useState, useCallback } = require('react');

require('../styles/image_input.css');

export default function ImageInput(props) {
    const { value, defaultValue = [], deletedValue } = props;

    const [images, setImages] = useState(defaultValue);

    const loadImage = useCallback(e => {
        if(e.target.files && e.target.files[0]) {
            let reader = new FileReader();

            reader.onloadend = el => {
                setImages(prevState => [...prevState, { type: e.target.files[0].type.split('/')[0] == 'video' ? 'video' : 'image', src: el.target.result }]);
                e.target.value = '';
            }

            reader.readAsDataURL(e.target.files[0]);
            value(prevState => [...prevState, e.target.files[0]]);
        }
    }, [images, value])

    function deleteImage(item, index) {
        setImages(images.filter((item, i) => i != index));
        value(prevState => prevState.filter((item, i) => i != index));
        deletedValue(prevState => [...prevState, item]);
    }

    return(
        <div className='imageInput_scroll'>
            <div className='imageInput_wrapper'>
                {images.map((item, i) =>
                    <div key={i} className='imageInput'>
                        <img className='imageInput_delete' src='/images/delete.png' onClick={() => deleteImage(item, i)}/>
                        {item.type == 'image' && <img className='imageInput_preview' src={item.src}/>}
                        {item.type == 'video' && <video className='imageInput_video' src={item.src} controls/>}
                    </div>
                )}

                <div className='imageInput'>
                    <img className='imageInput_text' src='/images/plus.png'/>
                    <input type='file' className='imageInput_input' accept='image/*, video/*' onChange={loadImage}/>
                </div>
            </div>
        </div>
    )
}