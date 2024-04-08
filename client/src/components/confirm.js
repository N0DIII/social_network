require('../styles/confirm.css');

const Button = require('./button.js').default;

export default function Confirm(props) {
    const { confirm } = props;

    function onClick() {
        confirm[0][1](...confirm[0][2]);
        confirm[1]([false, () => console.log('Вы подтвердили действие')]);
    }

    if(confirm[0][0]) {
        return(
            <div className='confirm_wrapper'>
                <div className='confirm_form'>
                    Вы уверены, что хотите продолжить?
                    <div className='confirm_buttons'>
                        <Button title='Да' onclick={onClick}/>
                        <Button title='Нет' onclick={() => confirm[1]([false, () => console.log('Вы подтвердили действие')])}/>
                    </div>
                </div>
            </div>
        )
    }
}