require('../styles/search.css');

const searchImg = require('../images/search.png');

export default function Search(props) {
    const { setValue } = props;

    return(
        <div className='search_wrapper'>
            <img src={searchImg}/>
            <input type='text' onChange={e => setValue(e.target.value)}/>
        </div>
    )
}