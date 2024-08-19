'use strict';

const searchElement = React.createElement;

const SearchComponent = () => {

    const [inputText, setInptText] = React.useState('');
    const [reports, setReports] = React.useState([]);
    const [pressRelease, setPressrelease] = React.useState([]);
    const [blogs, setBlogs] = React.useState([]);

    const handleSearch = (e) => {
        setInptText(e.target.value);
        if (e.keyCode === 13) {
            //search
        }


    }

    const searchResult = {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        marginBottom: '10px',
        borderBottom: '1px slid #dfdf',
        maxWidth: '90%'
    }

    const mainUl = {
        paddingLeft: '10px'
    }


    const searchButtonClick = () => {
        window.location.href = '/search?q=' + inputText;
    }

    const fetchReports = () => {
        fetch('/search-home/' + inputText).then(res => res.json()).then(res => {
            setReports(res);
        })
    }

    const fetchBlogs = () => {
        fetch('/search-blog/' + inputText).then(res => res.json()).then(res => {
            setBlogs(res);
        })
    }

    const fetchPressrelease = () => {
        fetch('/search-pressrelease/' + inputText).then(res => res.json()).then(res => {
            setPressrelease(res);
        })
    }

    React.useMemo(() => {
        if (inputText) {
            if (inputText.length > 3) {
                fetchReports();
                fetchBlogs();
                fetchPressrelease();
            }
        }
    }, [inputText])

    return (
        <div className="banner-content">
            <div className="form-inner" style={{ maxWidth: '100%' }}>
                <div className="input-group" style={{ flexWrap: 'nowrap' }}>
                    <i className="fa-solid fa-magnifying-glass search-icon"></i>
                    <input type="email" className="form-control" placeholder="Search Reports, Press Releases, Blog" onKeyUpCapture={(e) => handleSearch(e)} />
                    <button className="btn btn-primary sub-btn" type="button" onClick={() => searchButtonClick()}><i className="fas fa-arrow-right"></i></button>
                </div>
            </div>
            <ul style={mainUl}>
                {reports.length > 0 ? <li>
                    Reports
                    <ul>
                        {reports.map(r => <li style={searchResult} key={r._id}><a target="_blank" href={`/industry-report/${r.slug}`}>{r.title}</a></li>)}
                    </ul>
                </li> : null}
                {pressRelease.length > 0 ? <li>Press Release
                    <ul>
                        {pressRelease.map(p => <li style={searchResult} key={p._id}><a href={`/press-release/${p.slug}`} target="_blank">{p.title}</a></li>)}
                    </ul>
                </li> : null}
                {blogs.length > 0 ? <li>
                    Blogs
                    <ul>
                        {blogs.map(b => <li style={searchResult} key={b._id}><a href={`/blog/${b.slug}`} target="_blank">{b.title}</a></li>)}
                    </ul>
                </li> : null}
            </ul>
        </div>)
}

const searchContainer = document.querySelector('#search');
const searchRoot = ReactDOM.createRoot(searchContainer);
searchRoot.render(searchElement(SearchComponent));