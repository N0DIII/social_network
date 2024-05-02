const { useInput } = require('../hooks/useInput.js');
const { server } = require('../server.js');
const { auth } = require('../auth.js');

const Input = require('./input.js').default;
const Password = require('./password.js').default;
const Button = require('./button.js').default;

export default function Registration(props) {
    const { setUserData, setError } = props;

    const username = useInput('');
    const password = useInput('');
    const repeatPassword = useInput('');

    async function registration() {
        server('/auth/registration', { username: username.value, password: password.value, repeatPassword: repeatPassword.value })
        .then(result => {
            if(result.error) setError([true, result.message])
            else {
                localStorage.setItem('token', result.token);

                auth().then(result => {
                    setUserData(result);
                    window.location.assign('/');
                })
            }
        })
    }

    return(
        <div className='form_wrapper'>
            <div className='form'>
                <div className='form_title'>Регистрация</div>
                <Input { ...username } placeholder='Имя пользователя'/>
                <Password { ...password } placeholder='Пароль'/>
                <Password { ...repeatPassword } placeholder='Повторите пароль'/>
                <Button title='Зарегистрироваться' onclick={registration}/>
                <div className='form_switch'>
                    Уже есть аккаунт?
                    <a className='form_switch_link' href='/login'>Войти</a>
                </div>
            </div>
        </div>
    )
}