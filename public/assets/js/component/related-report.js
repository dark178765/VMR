'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var relateReportElement = React.createElement;

var RelatedReports = function RelatedReports() {
    var _React$useState = React.useState([]),
        _React$useState2 = _slicedToArray(_React$useState, 2),
        relatedRepors = _React$useState2[0],
        setRelatedReports = _React$useState2[1];

    var _React$useState3 = React.useState(false),
        _React$useState4 = _slicedToArray(_React$useState3, 2),
        requested = _React$useState4[0],
        setRequested = _React$useState4[1];

    var getRelatedReports = function getRelatedReports() {
        fetch('/related-reports/' + document.getElementById('reportID').value).then(function (res) {
            return res.json();
        }).then(function (res) {
            setRelatedReports(res);
            setRequested(true);
        });
    };

    React.useEffect(function () {
        getRelatedReports();
    }, []);

    React.useEffect(function () {
        if (requested && (!relatedRepors || relatedRepors.length == 0)) {
            Array.from(document.getElementsByClassName('related-report-list')).forEach(function (item) {
                return item.style.display = 'none';
            });
        }
    }, [relatedRepors]);

    return React.createElement(
        'div',
        { className: 'row', style: { minHeight: '300px' } },
        relatedRepors && relatedRepors.length > 0 ? relatedRepors.map(function (x, xi) {
            return React.createElement(
                'div',
                { className: 'col-md-6' },
                React.createElement('img', { src: 'https://cdn.vantagemarketresearch.com/assets/img/table-icons/business-and-finance.png', 'class': 'me-2', height: '24', width: '24', alt: 'Revenue CAGR' }),
                ' ',
                React.createElement(
                    'a',
                    { href: "/industry-report/" + x.slug },
                    x.reportDataId && x.reportDataId.table ? x.keyword + ' Market Size ' + x.reportDataId.table.filter(function (x) {
                        return x.fieldName.indexOf('Revenue_') > -1;
                    })[1].fieldValue + ' by ' + x.reportDataId.table.filter(function (x) {
                        return x.fieldName.indexOf('Revenue_') > -1;
                    })[1].fieldName.replace('Revenue_', '') : x.keyword + ' Market'
                )
            );
        }) : React.createElement('img', { src: '/assets/img/loading.gif', style: { width: '35%', margin: '0 auto' } })
    );
};

var relatedReportsContainer = document.querySelector('#relatedReports');
var relatedReportRoot = ReactDOM.createRoot(relatedReportsContainer);
relatedReportRoot.render(relateReportElement(RelatedReports));