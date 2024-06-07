export default function Search(props) {
    const { setValue } = props;

    return(
        <div className='search_wrapper' title='Поиск'>
            <img src='/images/search.png'/>
            <input type='text' placeholder='Введите запрос' onChange={e => setValue(e.target.value)}/>
        </div>
    )
}