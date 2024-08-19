'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var allNewsElement = React.createElement;

function allNews() {
    var limit = 20;
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    var _React$useState = React.useState({
        pr: [], count: 0
    }),
        _React$useState2 = _slicedToArray(_React$useState, 2),
        allNews = _React$useState2[0],
        setallNews = _React$useState2[1];

    var selectedCategories = [];

    var _React$useState3 = React.useState(true),
        _React$useState4 = _slicedToArray(_React$useState3, 2),
        isReportsLoading = _React$useState4[0],
        setisReportsLoading = _React$useState4[1];

    React.useEffect(function () {
        getNews();
    }, []);

    var getNews = function getNews() {
        var page = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

        setallNews({ pr: [], count: 0 });
        fetch('/all-news-json/' + page + '/' + limit).then(function (res) {
            return res.json();
        }).then(function (res) {
            setallNews(res);
        });
    };

    var fetchPage = function fetchPage(page) {
        console.log(page);
    };

    var pageChanged = function pageChanged(cp) {
        getNews(cp);
    };

    var _React$useState5 = React.useState(1),
        _React$useState6 = _slicedToArray(_React$useState5, 2),
        currentPage = _React$useState6[0],
        setCurrentPage = _React$useState6[1];

    var memoizedValue = React.useMemo(function () {
        return pageChanged(currentPage);
    }, [currentPage]);

    var renderPageNumbers = function renderPageNumbers() {
        var page = allNews.count / limit;
        var pageLength = 5;

        var arr = currentPage <= 3 ? [].concat(_toConsumableArray(Array.from({ length: pageLength }, function (_, i) {
            return i + 1;
        }))) : currentPage + pageLength - 1 > page ? [].concat(_toConsumableArray(Array.from({ length: page - currentPage }, function (_, i) {
            return i + (currentPage - 1);
        }))) : [].concat(_toConsumableArray(Array.from({ length: pageLength }, function (_, i) {
            return i + (currentPage - 1);
        })));

        return arr.map(function (i) {
            return React.createElement(
                'li',
                { className: "page-item" + (currentPage == i ? " active" : ''), key: 'paging_' + i, onClick: function onClick() {
                        return setCurrentPage(i);
                    } },
                React.createElement(
                    'a',
                    { className: 'page-link' },
                    i
                )
            );
        });
    };

    return React.createElement(
        'div',
        { className: 'col-lg-12' },
        React.createElement(
            'div',
            { className: 'row' },
            allNews.pr.length == 0 ? React.createElement('img', { src: '/assets/img/loading.gif', style: { width: '35%', margin: '0 auto' } }) : null,
            allNews ? allNews.pr.map(function (ar, index) {
                return React.createElement(
                    'div',
                    { className: 'col-lg-12 col-md-12 d-flex', key: 'allRep_' + index },
                    React.createElement(
                        'div',
                        { className: 'course-box course-design list-course d-flex' },
                        React.createElement(
                            'div',
                            { className: 'product' },
                            React.createElement(
                                'div',
                                { className: 'product-content' },
                                React.createElement(
                                    'div',
                                    { className: 'head-course-title' },
                                    React.createElement(
                                        'h3',
                                        { className: 'title' },
                                        React.createElement(
                                            'a',
                                            { target: '_blank', href: '/press-release/' + ar.slug },
                                            ar.title
                                        )
                                    )
                                ),
                                React.createElement(
                                    'div',
                                    { className: 'course-info border-bottom-0 pb-0 d-flex align-items-center' },
                                    React.createElement(
                                        'div',
                                        { className: 'rating-img d-flex align-items-center' },
                                        React.createElement('img', { src: 'assets/img/icon/icon-01.svg', alt: '' }),
                                        React.createElement(
                                            'p',
                                            null,
                                            'Vantage Market Research'
                                        )
                                    ),
                                    React.createElement(
                                        'div',
                                        { className: 'course-view d-flex align-items-center' },
                                        React.createElement('img', { src: 'assets/img/icon/icon-02.svg', alt: '' }),
                                        React.createElement(
                                            'p',
                                            null,
                                            months[new Date(ar.updatedAt).getMonth()],
                                            '-',
                                            new Date(ar.updatedAt).getFullYear()
                                        )
                                    )
                                ),
                                React.createElement(
                                    'div',
                                    { className: 'rating' },
                                    React.createElement('i', { className: 'fas fa-star filled' }),
                                    React.createElement('i', { className: 'fas fa-star filled' }),
                                    React.createElement('i', { className: 'fas fa-star filled' }),
                                    React.createElement('i', { className: 'fas fa-star filled' }),
                                    React.createElement('i', { className: 'fas fa-star' }),
                                    React.createElement(
                                        'span',
                                        { className: 'd-inline-block average-rating' },
                                        React.createElement(
                                            'span',
                                            null,
                                            '4.0'
                                        ),
                                        ' (15)'
                                    )
                                ),
                                React.createElement(
                                    'div',
                                    { className: 'course-group d-flex mb-0' },
                                    React.createElement(
                                        'div',
                                        { className: 'course-group-img d-flex flex-center' },
                                        React.createElement(
                                            'a',
                                            { href: '/category/' },
                                            React.createElement('img', {
                                                src: "/assets/img/category/icon/", alt: '', className: 'img-fluid' })
                                        ),
                                        React.createElement(
                                            'div',
                                            { className: 'course-name' },
                                            React.createElement(
                                                'h4',
                                                null,
                                                React.createElement('a', {
                                                    href: '/category/' })
                                            )
                                        )
                                    ),
                                    React.createElement(
                                        'div',
                                        { className: 'course-share d-flex align-items-center justify-content-center' },
                                        React.createElement(
                                            'a',
                                            { className: 'btn btn-sm btn-secondary', href: '/press-release/' + ar.slug },
                                            'Read More'
                                        )
                                    )
                                )
                            )
                        )
                    )
                );
            }) : null
        ),
        React.createElement(
            'div',
            { className: 'row' },
            React.createElement(
                'div',
                { className: 'col-md-12' },
                React.createElement(
                    'ul',
                    { className: 'pagination lms-page' },
                    React.createElement(
                        'li',
                        { className: 'page-item prev' },
                        React.createElement(
                            'a',
                            { className: 'page-link', href: '', tabIndex: '-1' },
                            React.createElement('i', {
                                className: 'fas fa-angle-left' })
                        )
                    ),
                    renderPageNumbers()
                )
            )
        )
    );
}

var allNewsContainer = document.querySelector('#allNews');
var allNewsRoot = ReactDOM.createRoot(allNewsContainer);
allNewsRoot.render(allNewsElement(allNews));