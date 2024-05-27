const { useState, useEffect } = require('react');
const { useNavigate } = require('react-router-dom');
const { useInput } = require('../hooks/useInput.js');
const { server } = require('../server.js');

const LoadAvatar = require('./load_avatar.js').default;
const Input = require('./input.js').default;
const Button = require('./button.js').default;

export default function CreateGroup(props) {
    const { close, id, setError } = props;

    const navigate = useNavigate();

    const [avatar, setAvatar] = useState();
    const name = useInput('');
    const description = useInput('');
    const [categories, setCategories] = useState([]);
    const [selectCategories, setSelectCategories] = useState([]);

    useEffect(() => {
        server('/group/getCategories').then(result => setCategories(result));

        const keydown = e => {
            if(e.key == 'Escape') close();
        }

        window.addEventListener('keydown', keydown);

        return () => window.removeEventListener('keydown', keydown);
    }, [])

    function selectChange(e) {
        const options = [...e.target.selectedOptions];
        const values = options.map(option => option.value);
        setSelectCategories(values);
    }

    function create() {
        server('/group/createGroup', { avatar, name: name.value, categories: selectCategories, description: description.value, creator: id })
        .then(result => {
            if(result.error) setError([true, result.message]);
            else navigate(`/group/${result.group._id}`);
        })
    }

    return(
        <div className='dataform_wrapper'>
            <div className='dataform'>
                <img className='dataform_close' src='/images/cross.png' onClick={close}/>
                <div className='dataform_avatar'>
                    <LoadAvatar src='/images/defaultGroup.png' setAvatarUrl={setAvatar}/>
                </div>
                <div className='dataform_input'><Input { ...name } placeholder='Название'/></div>
                <select className='dataform_select' multiple value={selectCategories} onChange={selectChange}>
                    <option className='dataform_option dataform_option_title' disabled>Категории</option>
                    {categories.map((category, i) =>  <option key={i} className='dataform_option' value={category._id}>{category._id}</option>)}
                </select>
                <textarea className='dataform_textarea' { ...description } maxLength={200} placeholder='Описание'></textarea>
                <div className='dataform_button'><Button title='Создать группу' onclick={create}/></div>
            </div>
        </div>
    )
}
