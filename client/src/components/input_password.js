import { useState } from 'react';

export default function Password(props) {
    const { value, setValue, placeholder = '', error = '' } = props;

    const [isShow, setIsShow] = useState(false);
    const [icon, setIcon] = useState('images/eye.png');
    const [type, setType] = useState('password');

    function show() {
        if(isShow) {
            setIsShow(false);
            setIcon('images/eye.png');
            setType('password');
        }
        else {
            setIsShow(true);
            setIcon('images/crossedEye.png');
            setType('text');
        }
    }

    return(
        <div className='input_wrapper'>
            <input type={type} value={value} onChange={e => setValue(e.target.value)} placeholder={placeholder} />
            <img src={icon} onClick={show} />
            {error != '' && <div className='input_error'>{error}</div>}
        </div>
    )
}