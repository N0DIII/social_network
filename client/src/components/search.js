const { useDebounce } = require('../hooks/useDebounce');

require('../styles/search.css');

export default function Search(props) {
    const { setValue } = props;

    const debouncedChange = useDebounce(onChange, 250);

    function onChange(e) {
        setValue(e.target.value);
    }

    return(
        <div className='search_wrapper'>
            <img src='/images/search.png'/>
            <input type='text' placeholder='Введите запрос' onChange={debouncedChange}/>
        </div>
    )
}