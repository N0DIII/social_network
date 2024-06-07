import { useState } from 'react';

export default function LoadAvatar(props) {
    const { value, setValue } = props;

    const [preview, setPreview] = useState(value);

    function onChange(e) {
        if(e.target.files[0]) {
            let reader = new FileReader();

            reader.onloadend = e => {
                setPreview(e.target.result);
            }

            reader.readAsDataURL(e.target.files[0]);
            setValue(e.target.files[0]);
        }
    }

    return(
        <div className='loadAvatar_wrapper'>
            <img src={preview} />
            <div className='loadAvatar_input'>
                <input type='file' accept='image/*' onChange={onChange} />
                <img src='/images/pen.png' />
            </div>
        </div>
    )
}