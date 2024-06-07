import { useContext } from 'react';

import { Context } from './context';
import Button from './button';

export default function Confirm() {
    const { confirm, setConfirm } = useContext(Context);

    function onClick() {
        confirm[1](...confirm[2]);
        close();
    }

    function close() {
        setConfirm([false]);
    }

    if(confirm[0]) {
        return(
            <div className='confirm_wrapper'>
                <div className='confirm_form'>
                    Вы уверены, что хотите продолжить?
                    <div className='confirm_buttons'>
                        <Button title='Да' onClick={onClick}/>
                        <Button title='Нет' onClick={close}/>
                    </div>
                </div>
            </div>
        )
    }
}