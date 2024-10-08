'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var searchElement = React.createElement;

var SearchComponent = function SearchComponent() {
    var _React$useState = React.useState(''),
        _React$useState2 = _slicedToArray(_React$useState, 2),
        inputText = _React$useState2[0],
        setInptText = _React$useState2[1];

    var _React$useState3 = React.useState([]),
        _React$useState4 = _slicedToArray(_React$useState3, 2),
        reports = _React$useState4[0],
        setReports = _React$useState4[1];

    var _React$useState5 = React.useState([]),
        _React$useState6 = _slicedToArray(_React$useState5, 2),
        pressRelease = _React$useState6[0],
        setPressrelease = _React$useState6[1];

    var _React$useState7 = React.useState([]),
        _React$useState8 = _slicedToArray(_React$useState7, 2),
        blogs = _React$useState8[0],
        setBlogs = _React$useState8[1];

    var handleSearch = function handleSearch(e) {
        setInptText(e.target.value);
        if (e.keyCode === 13) {
            //search
        }
    };

    var searchResult = {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        marginBottom: '10px',
        borderBottom: '1px slid #dfdf',
        maxWidth: '90%'
    };

    var mainUl = {
        paddingLeft: '10px'
    };

    var searchButtonClick = function searchButtonClick() {
        window.location.href = '/search?q=' + inputText;
    };

    var fetchReports = function fetchReports() {
        fetch('/search-home/' + inputText).then(function (res) {
            return res.json();
        }).then(function (res) {
            setReports(res);
        });
    };

    var fetchBlogs = function fetchBlogs() {
        fetch('/search-blog/' + inputText).then(function (res) {
            return res.json();
        }).then(function (res) {
            setBlogs(res);
        });
    };

    var fetchPressrelease = function fetchPressrelease() {
        fetch('/search-pressrelease/' + inputText).then(function (res) {
            return res.json();
        }).then(function (res) {
            setPressrelease(res);
        });
    };

    React.useMemo(function () {
        if (inputText) {
            if (inputText.length > 3) {
                fetchReports();
                fetchBlogs();
                fetchPressrelease();
            }
        }
    }, [inputText]);

    return React.createElement(
        'div',
        { className: 'banner-content' },
        React.createElement(
            'div',
            { className: 'form-inner', style: { maxWidth: '100%' } },
            React.createElement(
                'div',
                { className: 'input-group', style: { flexWrap: 'nowrap' } },
                React.createElement('i', { className: 'fa-solid fa-magnifying-glass search-icon' }),
                React.createElement('input', { type: 'email', className: 'form-control', placeholder: 'Search Reports, Press Releases, Blog', onKeyUpCapture: function onKeyUpCapture(e) {
                        return handleSearch(e);
                    } }),
                React.createElement(
                    'button',
                    { className: 'btn btn-primary sub-btn', type: 'button', onClick: function onClick() {
                            return searchButtonClick();
                        } },
                    React.createElement('i', { className: 'fas fa-arrow-right' })
                )
            )
        ),
        React.createElement(
            'ul',
            { style: mainUl },
            reports.length > 0 ? React.createElement(
                'li',
                null,
                'Reports',
                React.createElement(
                    'ul',
                    null,
                    reports.map(function (r) {
                        return React.createElement(
                            'li',
                            { style: searchResult, key: r._id },
                            React.createElement(
                                'a',
                                { target: '_blank', href: '/industry-report/' + r.slug },
                                r.title
                            )
                        );
                    })
                )
            ) : null,
            pressRelease.length > 0 ? React.createElement(
                'li',
                null,
                'Press Release',
                React.createElement(
                    'ul',
                    null,
                    pressRelease.map(function (p) {
                        return React.createElement(
                            'li',
                            { style: searchResult, key: p._id },
                            React.createElement(
                                'a',
                                { href: '/press-release/' + p.slug, target: '_blank' },
                                p.title
                            )
                        );
                    })
                )
            ) : null,
            blogs.length > 0 ? React.createElement(
                'li',
                null,
                'Blogs',
                React.createElement(
                    'ul',
                    null,
                    blogs.map(function (b) {
                        return React.createElement(
                            'li',
                            { style: searchResult, key: b._id },
                            React.createElement(
                                'a',
                                { href: '/blog/' + b.slug, target: '_blank' },
                                b.title
                            )
                        );
                    })
                )
            ) : null
        )
    );
};

var searchContainer = document.querySelector('#search');
var searchRoot = ReactDOM.createRoot(searchContainer);
searchRoot.render(searchElement(SearchComponent));