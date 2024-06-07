import { useContext, useEffect, useRef } from 'react';

import { Context } from '../components/context';

export default function Success() {
    const { success, setSuccess } = useContext(Context);

    const timer = useRef(null);

    useEffect(() => {
        if(!success[0]) return;
        if(timer.current) clearTimeout(timer.current);

        timer.current = setTimeout(() => {
            setSuccess([false, '']);
        }, 5000)
    }, [success])

    function close() {
        clearTimeout(timer.current);
        setSuccess([false, '']);
    }

    if(success[0]) {
        return(
            <div className='success_wrapper'>
                <img src='/images/cross.png' onClick={close} />
                <div>{success[1]}</div>
            </div>
        )
    }
}