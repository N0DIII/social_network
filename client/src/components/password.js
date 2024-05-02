const { useState } = require('react');

export default function Password(props) {
    const { value, onChange, placeholder } = props;

    const [type, setType] = useState('password');

    const showPassword = e => {
        if(type == 'password') {
            e.target.src = '/images/crossedEye.png';
            setType('text');
        }
        else {
            e.target.src = '/images/eye.png';
            setType('password');
        }
    }

    return(
        <div className='input_wrapper'>
            <input type={type} placeholder={placeholder} value={value} onChange={onChange}/>
            <img src='/images/eye.png' onClick={showPassword}/>
        </div>
    )
}