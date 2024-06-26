import { useContext, useEffect, useRef } from 'react';

import { Context } from '../components/context';

export default function Error() {
    const { error, setError } = useContext(Context);

    const timer = useRef(null);

    useEffect(() => {
        if(!error[0]) return;
        if(timer.current) clearTimeout(timer.current);

        timer.current = setTimeout(() => {
            setError([false, '']);
        }, 10000)
    }, [error])

    function close() {
        clearTimeout(timer.current);
        setError([false, '']);
    }

    if(error[0]) {
        return(
            <div className='error_wrapper'>
                <img src='/images/cross.png' onClick={close} />
                <div>{error[1]}</div>
            </div>
        )
    }
}