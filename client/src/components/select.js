require('../styles/select.css');

export default function Select(props) {
    const { options, title, defaultValue = '', setValue, params = [] } = props;

    function onChange(e) {
        setValue(e.target.options[e.target.selectedIndex].value, ...params);
    }

    return(
        <select className='select_wrapper' value={defaultValue} onChange={onChange}>
            <option disabled value=''>{title}</option>
            {options.map((option, i) => 
                <option key={i} value={option.value}>
                    {option.text}
                </option>
            )}
        </select>
    )
}