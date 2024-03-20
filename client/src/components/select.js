require('../styles/select.css');

export default function Select(props) {
    const { options, title, defaultValue, selected } = props;

    function onchange(e) {
        selected(e.target.options[e.target.selectedIndex].value);
    }

    return(
        <select className='select_wrapper' onChange={onchange}>
            <option disabled>{title}</option>
            {options.map((option, i) => 
                <option key={i} value={option.value} selected={option.value == defaultValue ? true : false}>
                    {option.text}
                </option>
            )}
        </select>
    )
}