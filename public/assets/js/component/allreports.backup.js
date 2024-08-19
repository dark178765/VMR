'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var allReportsElement = React.createElement;

function AllReports() {
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var limit = 20;

    var _React$useState = React.useState(1),
        _React$useState2 = _slicedToArray(_React$useState, 2),
        currentPage = _React$useState2[0],
        setCurrentPage = _React$useState2[1];

    var _React$useState3 = React.useState({
        count: 0,
        customReports: [],
        page: 0
    }),
        _React$useState4 = _slicedToArray(_React$useState3, 2),
        allReports = _React$useState4[0],
        setAllReports = _React$useState4[1];

    var randomSeen = function randomSeen() {
        return parseInt(Math.random() * 9);
    };

    var _React$useState5 = React.useState([]),
        _React$useState6 = _slicedToArray(_React$useState5, 2),
        selectedCategories = _React$useState6[0],
        setSelectedCategories = _React$useState6[1];

    var _React$useState7 = React.useState(true),
        _React$useState8 = _slicedToArray(_React$useState7, 2),
        isReportsLoading = _React$useState8[0],
        setisReportsLoading = _React$useState8[1];

    var getCategoryWiseReports = function getCategoryWiseReports() {
        fetch('/get-category-wise-reports-json', {
            method: 'POST',
            body: JSON.stringify({ categories: selectedCategories.map(function (x) {
                    return x._id;
                }), page: currentPage, limit: limit }),
            headers: {
                "Content-Type": 'application/json; charset=utf-8'
            }
        }).then(function (res) {
            return res.json();
        }).then(function (res) {
            setAllReports(Object.assign({}, allReports, { customReports: res }));
        });
    };

    var getallReports = function getallReports(page) {
        if (selectedCategories.length == 0) {
            fetch('/all-reports-json/' + page + '/' + limit).then(function (res) {
                return res.json();
            }).then(function (res) {
                setAllReports(res);
            });
        } else {
            getCategoryWiseReports();
        }
    };

    React.useMemo(function () {
        if (window.location.href.indexOf('/categories/') > -1) {
            getCategoryWiseReports();
        } else {
            getallReports(currentPage);
        }
    }, [currentPage, selectedCategories]);

    React.useEffect(function () {
        //setisReportsLoading(true);
        //getallReports(1);
    }, []);

    var renderPageNumbers = function renderPageNumbers() {
        var page = allReports.count / limit;

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

    var getCheckedChildCategories = function getCheckedChildCategories(tr) {};

    var ignoreWords = ['to', 'for', 'and', 'in'];

    var normailzeString = function normailzeString(str) {
        var words = str.split(' ').filter(function (x) {
            return x.trim() !== '';
        });
        var changed = [];
        words.forEach(function (w) {
            if (ignoreWords.indexOf(w.toLowerCase().trim()) == -1) changed.push((w[0] ? w[0].toUpperCase() : w[0]) + w.substr(1, w.length - 1));else changed.push(w.toLowerCase().trim());
        });
        return changed.join(' ').trim();
    };

    return React.createElement(
        'div',
        { className: 'row' },
        React.createElement(
            'div',
            { className: 'col-lg-9' },
            React.createElement(
                'div',
                { className: 'row' },
                allReports.customReports.length == 0 ? React.createElement('img', { src: '/assets/img/loading.gif', style: { width: '35%', margin: '0 auto' } }) : null,
                allReports ? allReports.customReports.map(function (ar, index) {
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
                                    { className: 'product-img' },
                                    React.createElement(
                                        'a',
                                        { href: '/industry-report/' + ar.slug, target: '_blank' },
                                        React.createElement('img', { className: 'img-fluid', alt: ar.keyword + ' Market',
                                            onError: function onError(e) {
                                                e.target.src = 'https://cdn.vantagemarketresearch.com/category/thumbnail/' + ar.parentCategory.title.trim().replace(/\s/gmi, '-').replace(/&/gmi, 'and') + '.webp';
                                            },
                                            src: 'https://cdn.vantagemarketresearch.com/report/thumbnail/' + (normailzeString(ar.keyword.trim()).replace(/[\s\/]/gmi, '-').replace(/&/gmi, 'and').replace(/[^a-zA-Z0-9-]/gmi, '') + '-Market') + '.webp' })
                                    ),
                                    React.createElement(
                                        'div',
                                        { className: 'price' },
                                        React.createElement(
                                            'h3',
                                            null,
                                            '$ ',
                                            ar.pricingOptions.singleUser,
                                            ' USD'
                                        )
                                    )
                                ),
                                React.createElement(
                                    'div',
                                    { className: 'product-content', style: { display: 'flex', justifyContent: 'space-between' } },
                                    React.createElement(
                                        'div',
                                        { style: { display: 'flex', justifyContent: 'space-between', flexDirection: 'column' } },
                                        React.createElement(
                                            'div',
                                            { className: 'head-course-title' },
                                            React.createElement(
                                                'h3',
                                                { className: 'title', style: { textDecoration: 'underline' } },
                                                React.createElement(
                                                    'a',
                                                    { href: '/industry-report/' + ar.slug, target: '_blank' },
                                                    normailzeString(ar.keyword),
                                                    ' Market'
                                                )
                                            )
                                        ),
                                        React.createElement(
                                            'div',
                                            { className: 'course-info border-bottom-0 pb-0 d-flex align-items-center' },
                                            React.createElement(
                                                'div',
                                                { className: 'rating-img d-flex align-items-center' },
                                                React.createElement('img', { src: '/assets/img/Eye.svg', title: 'Prospective clients eyeing the report at the moment' }),
                                                React.createElement(
                                                    'p',
                                                    null,
                                                    randomSeen()
                                                )
                                            ),
                                            React.createElement(
                                                'div',
                                                { className: 'course-view d-flex align-items-center' },
                                                React.createElement('img', { src: 'assets/img/icon/icon-02.svg', alt: '' }),
                                                React.createElement(
                                                    'p',
                                                    null,
                                                    React.createElement('i', { className: 'fa fa-calendar' }),
                                                    ' ',
                                                    months[new Date(ar.publishedDate).getMonth()],
                                                    '-',
                                                    new Date(ar.publishedDate).getFullYear()
                                                )
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
                                                    { href: '/category/' + ar.childCategory.slug },
                                                    React.createElement('img', {
                                                        src: "https://cdn.vantagemarketresearch.com/category/icon/" + ar.parentCategory.title.trim().replace(/\s/gmi, '-').replace(/&/gmi, 'and') + ".svg", alt: ar.parentCategory.title, className: 'img-fluid' })
                                                ),
                                                React.createElement(
                                                    'div',
                                                    { className: 'course-name' },
                                                    React.createElement(
                                                        'h4',
                                                        null,
                                                        React.createElement(
                                                            'a',
                                                            { target: '_blank',
                                                                href: '/category/' + ar.childCategory.slug },
                                                            ar.childCategory.title
                                                        )
                                                    )
                                                )
                                            )
                                        )
                                    ),
                                    React.createElement(
                                        'div',
                                        { style: { display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: '310px' } },
                                        React.createElement(
                                            'div',
                                            { className: 'all-btn all-category d-flex align-items-center' },
                                            React.createElement(
                                                'a',
                                                { rel: 'noindex', href: '/buy-now/' + ar.slug,
                                                    className: 'btn btn-primary' },
                                                'BUY NOW'
                                            ),
                                            React.createElement(
                                                'a',
                                                { rel: 'noindex', href: '/' + ar.slug + '/request-sample',
                                                    className: 'btn btn-primary' },
                                                'REQUEST SAMPLE'
                                            )
                                        ),
                                        React.createElement(
                                            'div',
                                            { className: 'course-share d-flex align-items-center justify-content-center' },
                                            React.createElement(
                                                'a',
                                                { href: '/industry-report/' + ar.slug, className: 'btn btn-sm btn-secondary' },
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
        ),
        React.createElement(
            'div',
            { className: 'col-lg-3 theiaStickySidebar' },
            React.createElement(
                'div',
                { className: 'filter-clear' },
                React.createElement(
                    'div',
                    { className: 'card search-filter categories-filter-blk' },
                    React.createElement(
                        'div',
                        { className: 'card-body' },
                        React.createElement(
                            'div',
                            { className: 'filter-widget mb-0' },
                            React.createElement(
                                'div',
                                { className: 'categories-head d-flex align-items-center' },
                                React.createElement(
                                    'h4',
                                    null,
                                    'Categories'
                                ),
                                React.createElement('i', { className: 'fas fa-angle-down' })
                            ),
                            React.createElement(CategoryTree, { getReports: function getReports(tr) {
                                    var anotherSelectedCategories = [];
                                    tr.forEach(function (x) {
                                        anotherSelectedCategories = anotherSelectedCategories.concat(x.children.filter(function (y) {
                                            return y.checked && y.checked == true;
                                        }));
                                    });

                                    if (anotherSelectedCategories.length > 0) {
                                        setSelectedCategories([].concat(_toConsumableArray(anotherSelectedCategories)));
                                        //setAllReports({ ...allReports, customReports: [] });
                                    }
                                } })
                        )
                    )
                )
            )
        )
    );
}

function CategoryTree(props) {
    var _React$useState9 = React.useState([]),
        _React$useState10 = _slicedToArray(_React$useState9, 2),
        tree = _React$useState10[0],
        setTree = _React$useState10[1];

    React.useEffect(function () {

        if (tree.length > 0 && window.location.pathname.indexOf('/categories') > -1) {
            var sc = window.location.pathname.split('/');
            var gc = tree.filter(function (x) {
                return x.slug == sc[sc.length - 1];
            });

            if (gc && gc.length > 0) {
                getSubCategories(gc);
            } else {
                getParentCategory(sc[sc.length - 1]);
            }

            // getSubCategories(() => {
            //     setTree(tree);
            // });
        }

        if (tree.length == 0) {
            fetch('/categories').then(function (res) {
                return res.json();
            }).then(function (res) {
                setTree(res);
            });
        }
        if (props.getReports) {
            props.getReports(tree.filter(function (x) {
                return x.checked;
            }));
        }
    }, [tree]);

    var getSubCategories = function getSubCategories(gc) {
        var selectonly = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

        var trrIndex = tree.indexOf(gc[0]);

        if (!tree[trrIndex].children) {

            fetch('/subcategories/' + gc[0].slug).then(function (res) {
                return res.json();
            }).then(function (res) {

                tree[trrIndex].children = res.map(function (x) {
                    x.parent = gc[0].title;
                    if (selectonly == '') {
                        x.checked = true;
                    } else {
                        if (x.slug == selectonly) x.checked = true;else x.checked = false;
                    }
                    return x;
                });

                tree[trrIndex] = Object.assign(Object.assign({}, gc[0], { checked: true }));
                //setTree([...tree]);
                setTree([tree[trrIndex]].concat(_toConsumableArray(tree.slice(0, trrIndex)), _toConsumableArray(tree.slice(trrIndex + 1))));
            });
        }
    };

    var getParentCategory = function getParentCategory(url) {
        fetch('/parent-category-json/' + url).then(function (res) {
            return res.json();
        }).then(function (res) {

            var gc = tree.filter(function (x) {
                return x.slug == res.slug;
            });

            if (gc && gc.length > 0) {
                getSubCategories(gc, url);
            }
        });
    };

    var onCategoryCheck = function onCategoryCheck(e, n) {
        // n.checked = !n.checked;

        if (e.target.checked) {
            if (n.parent && n.parent !== '') {

                n.checked = true;

                var nodeIndex = tree.indexOf(n);
                tree[nodeIndex] = Object.assign(n);

                var p = tree.filter(function (x) {
                    return x.title === n.parent;
                });
                if (p && p.length > 0 && p[0].children) {
                    if (p[0].children.filter(function (x) {
                        return x.checked && x.checked == true;
                    }).length > 0) {
                        tree[tree.indexOf(p[0])] = Object.assign(Object.assign({}, p[0], { checked: true }));
                    }
                }

                setTree([].concat(_toConsumableArray(tree)));
            } else {
                if (n.children && n.children.length > 0) {
                    var _nodeIndex = tree.indexOf(n);
                    n.checked = true;
                    n.children = n.children.map(function (x) {
                        x.parent = n.title;
                        x.checked = true;
                        return x;
                    });

                    setTree([n].concat(_toConsumableArray(tree.slice(0, _nodeIndex)), _toConsumableArray(tree.slice(_nodeIndex + 1))));
                } else {
                    fetch('/subcategories/' + n.slug).then(function (res) {
                        return res.json();
                    }).then(function (res) {

                        var uncheckedTree = tree.map(function (xx) {
                            xx.checked = false;
                            if (xx.children) {
                                xx.children = xx.children.map(function (yy) {
                                    yy.checked = false;
                                    return yy;
                                });
                            }
                            return xx;
                        });

                        var nodeIndex = uncheckedTree.indexOf(n);
                        n.checked = true;
                        n.children = res.map(function (x) {
                            x.parent = n.title;
                            x.checked = true;
                            return x;
                        });

                        setTree([n].concat(_toConsumableArray(uncheckedTree.slice(0, nodeIndex)), _toConsumableArray(uncheckedTree.slice(nodeIndex + 1))));
                    });
                }
            }
        } else {

            var _nodeIndex2 = tree.indexOf(n);
            n.checked = false;
            if (n.children) {
                n.children = n.children.map(function (x) {
                    x.parent = n.title;
                    x.checked = false;
                    return x;
                });
            }

            var _p = tree.filter(function (x) {
                return x.title === n.parent;
            });

            if (_p && _p.length > 0 && _p[0].children) {

                if (_p[0].children.filter(function (x) {
                    return x.checked && x.checked == true;
                }).length == 0) {
                    tree.indexOf(_p);
                    tree[tree.indexOf(_p[0])] = Object.assign(Object.assign({}, _p[0], { checked: false }));
                }
            }

            tree[_nodeIndex2] = Object.assign(n);
            setTree([].concat(_toConsumableArray(tree)));
        }
    };

    var traverseNode = function traverseNode(node) {
        return React.createElement(
            'div',
            { key: node.title },
            React.createElement(
                'label',
                { className: 'custom_check' },
                React.createElement('input', { type: 'checkbox', name: 'select_specialist', checked: node.checked && node.checked == true, onChange: function onChange(e) {
                        return onCategoryCheck(e, node);
                    } }),
                React.createElement('span', { className: 'checkmark' }),
                ' ',
                node.title
            ),
            node.children ? React.createElement(
                'div',
                { className: 'subChilds' },
                ' ',
                node.children.map(function (childNode) {
                    return traverseNode(childNode);
                }),
                ' '
            ) : null
        );
    };
    return tree.length == 0 ? React.createElement('img', { src: '/assets/img/loading.gif', style: { width: '35%', margin: '0 auto' } }) : tree.map(function (node) {
        return traverseNode(node);
    });
}

var allReportsContainer = document.querySelector('#allReports');
var allReportsRoot = ReactDOM.createRoot(allReportsContainer);
allReportsRoot.render(allReportsElement(AllReports));