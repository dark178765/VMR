'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var relatedElement = React.createElement;

var Related = function Related() {
    var _React$useState = React.useState([]),
        _React$useState2 = _slicedToArray(_React$useState, 2),
        relatedReports = _React$useState2[0],
        setRelatedReports = _React$useState2[1];

    var getRelatedReports = function getRelatedReports() {
        fetch('/related-reports/' + document.getElementById('reportID').value).then(function (res) {
            return res.json();
        }).then(function (res) {
            setRelatedReports(res);
        });
    };

    React.useEffect(function () {
        getRelatedReports();
    }, []);

    var even = {
        backgroundColor: '#dedfdc',
        paddingLeft: '5px',
        paddingBottom: '10px',
        paddingTop: '10px'
    };

    var odd = {
        backgroundColor: 'white',
        paddingLeft: '5px',
        paddingBottom: '10px',
        paddingTop: '10px'
    };

    return React.createElement(
        'div',
        null,
        relatedReports && relatedReports.length > 0 ? React.createElement(
            'div',
            { style: { border: '1px solid #dfdfdf', borderRadius: '5px 5px 0 0' } },
            React.createElement(
                'h3',
                { style: { padding: '15px 15px 10px 8px', borderRadius: '5px 5px 0 0', background: '#dfdfef', margin: '0px' } },
                'Proximate Markets'
            ),
            relatedReports && relatedReports.length > 0 ? relatedReports.slice(0, 5).map(function (x, xi) {
                return React.createElement(
                    'div',
                    { style: xi % 2 == 0 ? odd : even },
                    React.createElement(
                        'a',
                        { href: '/industry-report/' + x.slug },
                        x.keyword + ' Market'
                    )
                );
            }) : null,
            React.createElement(
                'div',
                { style: { display: 'grid' } },
                React.createElement(
                    'button',
                    { className: 'btn btn-primary', onClick: function onClick() {
                            return window.location.href = '/' + window.location.href.split('/').pop() + '/request-sample?br=1';
                        } },
                    'Request Batch'
                )
            )
        ) : null
    );
};

var relatedContainer = document.querySelector('#related');
var relatedRoot = ReactDOM.createRoot(relatedContainer);
relatedRoot.render(relatedElement(Related));