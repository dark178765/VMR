'use strict';

const allReportsElement = React.createElement;

function AllReports() {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const limit = 20;

    const [currentPage, setCurrentPage] = React.useState(1);

    const [allReports, setAllReports] = React.useState({
        count: 0,
        customReports: [],
        page: 0
    });

    const randomSeen = () => {
        return parseInt(Math.random() * 9);
    }

    const [selectedCategories, setSelectedCategories] = React.useState([]);

    const [isReportsLoading, setisReportsLoading] = React.useState(true);


    const getCategoryWiseReports = () => {
        fetch(`/get-category-wise-reports-json`, {
            method: 'POST',
            body: JSON.stringify({ categories: selectedCategories.map(x => x._id), page: currentPage, limit: limit }),
            headers: {
                "Content-Type": 'application/json; charset=utf-8'
            }
        }).then(res => res.json()).then(res => { setAllReports({ ...allReports, customReports: res }); })
    }

    const getallReports = (page) => {
        if (selectedCategories.length == 0) {
            fetch(`/all-reports-json/${page}/${limit}`).then(res => res.json()).then(res => {
                setAllReports(res);
            });
        } else {
            getCategoryWiseReports();
        }
    }

    React.useMemo(() => {
        if(window.location.href.indexOf('/categories/') > -1){
            getCategoryWiseReports();
        } else {
            getallReports(currentPage);
        }
    }, [currentPage, selectedCategories]);

    React.useEffect(() => {
        //setisReportsLoading(true);
        //getallReports(1);
    }, [])



    const renderPageNumbers = () => {
        let page = allReports.count / limit;

        let pageLength = 5;

        let arr = currentPage <= 3 ? [...Array.from({ length: pageLength }, (_, i) => i + 1)] : currentPage + pageLength - 1 > page ? [...Array.from({ length: page - currentPage }, (_, i) => i + (currentPage - 1))] : [...Array.from({ length: pageLength }, (_, i) => i + (currentPage - 1))];
        return arr.map(i => {
            return <li className={"page-item" + (currentPage == (i) ? " active" : '')} key={'paging_' + i} onClick={() => setCurrentPage(i)}>
                <a className="page-link">{i}</a></li>;
        });
    }

    const getCheckedChildCategories = (tr) => {

    }

    const ignoreWords = ['to', 'for', 'and', 'in'];

    const normailzeString = (str) => {
        let words = str.split(' ').filter(x => x.trim() !== '');
        let changed = [];
        words.forEach(w => {
            if (ignoreWords.indexOf(w.toLowerCase().trim()) == -1)
                changed.push((w[0] ? w[0].toUpperCase() : w[0]) + w.substr(1, w.length - 1));
            else
                changed.push(w.toLowerCase().trim());
        });
        return changed.join(' ').trim();
    }

    return (

        <div className="row">
            <div className="col-lg-9">
                <div className="row">
                    {allReports.customReports.length == 0 ? <img src="/assets/img/loading.gif" style={{ width: '35%', margin: '0 auto' }} /> : null}
                    {allReports ? allReports.customReports.map((ar, index) =>
                        <div className="col-lg-12 col-md-12 d-flex" key={'allRep_' + index}>
                            <div className="course-box course-design list-course d-flex">
                                <div className="product">
                                    <div className="product-img">
                                        <a href={`/industry-report/${ar.slug}`} target="_blank">
                                            <img className="img-fluid" alt={ar.keyword + ' Market'}
                                                onError={(e) => { e.target.src = `https://cdn.vantagemarketresearch.com/category/thumbnail/${ar.parentCategory.title.trim().replace(/\s/gmi, '-').replace(/&/gmi, 'and')}.webp`; }}
                                                src={`https://cdn.vantagemarketresearch.com/report/thumbnail/${normailzeString(ar.keyword.trim()).replace(/[\s\/]/gmi, '-').replace(/&/gmi, 'and').replace(/[^a-zA-Z0-9-]/gmi, '') + '-Market'}.webp`} />
                                        </a>
                                        <div className="price">
                                            <h3>$ {ar.pricingOptions.singleUser} USD</h3>
                                        </div>
                                    </div>

                                    <div className="product-content" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'column' }}>
                                            <div className="head-course-title">
                                                <h3 className="title" style={{ textDecoration: 'underline' }}><a href={`/industry-report/${ar.slug}`} target="_blank">{normailzeString(ar.keyword)} Market</a>
                                                </h3>
                                            </div>
                                            <div className="course-info border-bottom-0 pb-0 d-flex align-items-center">
                                                <div className="rating-img d-flex align-items-center">
                                                    <img src="/assets/img/Eye.svg" title="Prospective clients eyeing the report at the moment" />
                                                    <p>{randomSeen()}</p>
                                                </div>
                                                <div className="course-view d-flex align-items-center">
                                                    <img src="assets/img/icon/icon-02.svg" alt="" />
                                                    <p><i className="fa fa-calendar"></i> {months[new Date(ar.publishedDate).getMonth()]}-{new Date(ar.publishedDate).getFullYear()}</p>
                                                </div>
                                            </div>
                                            <div className="course-group d-flex mb-0">
                                                <div className="course-group-img d-flex flex-center">
                                                    <a href={`/category/${ar.childCategory.slug}`}><img
                                                        src={"https://cdn.vantagemarketresearch.com/category/icon/" + ar.parentCategory.title.trim().replace(/\s/gmi, '-').replace(/&/gmi, 'and') + ".svg"} alt={ar.parentCategory.title} className="img-fluid" /></a>
                                                    <div className="course-name">
                                                        <h4><a target="_blank"
                                                            href={`/category/${ar.childCategory.slug}`}>{ar.childCategory.title}</a>
                                                        </h4>
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: '310px' }}>
                                            <div className="all-btn all-category d-flex align-items-center">
                                                <a rel="noindex" href={`/buy-now/${ar.slug}`}
                                                    className="btn btn-primary">BUY
                                                    NOW</a>
                                                <a rel="noindex" href={`/${ar.slug}/request-sample`}
                                                    className="btn btn-primary">REQUEST SAMPLE</a>
                                            </div>

                                            <div className="course-share d-flex align-items-center justify-content-center">
                                                <a href={`/industry-report/${ar.slug}`} className="btn btn-sm btn-secondary">
                                                    Read More
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>) : null}
                </div>

                <div className="row">
                    <div className="col-md-12">
                        <ul className="pagination lms-page">
                            <li className="page-item prev">
                                <a className="page-link" href="" tabIndex="-1"><i
                                    className="fas fa-angle-left"></i></a>
                            </li>
                            {renderPageNumbers()}
                        </ul>
                    </div>
                </div>
            </div>
            <div className="col-lg-3 theiaStickySidebar">
                <div className="filter-clear">
                    <div className="card search-filter categories-filter-blk">
                        <div className="card-body">
                            <div className="filter-widget mb-0">
                                <div className="categories-head d-flex align-items-center">
                                    <h4>Categories</h4>
                                    <i className="fas fa-angle-down"></i>
                                </div>
                                {<CategoryTree getReports={(tr) => {
                                    let anotherSelectedCategories = [];
                                    tr.forEach(x => {
                                        anotherSelectedCategories = anotherSelectedCategories.concat(x.children.filter(y => y.checked && y.checked == true));
                                    });

                                    if (anotherSelectedCategories.length > 0) {
                                        setSelectedCategories([...anotherSelectedCategories]);
                                        //setAllReports({ ...allReports, customReports: [] });
                                    }
                                }} />}

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >);
}


function CategoryTree(props) {

    const [tree, setTree] = React.useState([])

    React.useEffect(() => {

        if (tree.length > 0 && window.location.pathname.indexOf('/categories') > -1) {
            let sc = window.location.pathname.split('/');
            let gc = tree.filter(x => x.slug == sc[sc.length - 1]);

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
            fetch('/categories').then(res => res.json()).then(res => {
                setTree(res);
            });
        }
        if (props.getReports) {
            props.getReports(tree.filter(x => x.checked));
        }
    }, [tree])


    const getSubCategories = (gc, selectonly = '') => {
        let trrIndex = tree.indexOf(gc[0]);

        if (!tree[trrIndex].children) {

            fetch(`/subcategories/${gc[0].slug}`).then(res => res.json()).then(res => {


                tree[trrIndex].children = res.map(x => {
                    x.parent = gc[0].title;
                    if (selectonly == '') {
                        x.checked = true;
                    } else {
                        if (x.slug == selectonly)
                            x.checked = true;
                        else
                            x.checked = false;
                    }
                    return x;
                });

                tree[trrIndex] = Object.assign({ ...gc[0], checked: true });
                //setTree([...tree]);
                setTree([tree[trrIndex], ...tree.slice(0, trrIndex), ...tree.slice(trrIndex + 1)]);
            });
        }
    }

    const getParentCategory = (url) => {
        fetch(`/parent-category-json/${url}`).then(res => res.json()).then(res => {

            let gc = tree.filter(x => x.slug == res.slug);

            if (gc && gc.length > 0) {
                getSubCategories(gc, url);
            }
        })
    }

    const onCategoryCheck = (e, n) => {
        // n.checked = !n.checked;

        if (e.target.checked) {
            if (n.parent && n.parent !== '') {

                n.checked = true;

                let nodeIndex = tree.indexOf(n);
                tree[nodeIndex] = Object.assign(n);

                let p = tree.filter(x => x.title === n.parent);
                if (p && p.length > 0 && p[0].children) {
                    if (p[0].children.filter(x => x.checked && x.checked == true).length > 0) {
                        tree[tree.indexOf(p[0])] = Object.assign({ ...p[0], checked: true });
                    }
                }

                setTree([...tree]);
            } else {
                if (n.children && n.children.length > 0) {
                    let nodeIndex = tree.indexOf(n);
                    n.checked = true;
                    n.children = n.children.map(x => {
                        x.parent = n.title;
                        x.checked = true;
                        return x;
                    });

                    setTree([n, ...tree.slice(0, nodeIndex), ...tree.slice(nodeIndex + 1)]);

                } else {
                    fetch(`/subcategories/${n.slug}`).then(res => res.json()).then(res => {

                        let uncheckedTree = tree.map(xx => {
                            xx.checked = false;
                            if (xx.children) {
                                xx.children = xx.children.map(yy => {
                                    yy.checked = false;
                                    return yy;
                                });
                            }
                            return xx;
                        })

                        let nodeIndex = uncheckedTree.indexOf(n);
                        n.checked = true;
                        n.children = res.map(x => {
                            x.parent = n.title;
                            x.checked = true;
                            return x;
                        });

                        setTree([n, ...uncheckedTree.slice(0, nodeIndex), ...uncheckedTree.slice(nodeIndex + 1)]);
                    })
                }
            }
        } else {

            let nodeIndex = tree.indexOf(n);
            n.checked = false;
            if (n.children) {
                n.children = n.children.map(x => {
                    x.parent = n.title;
                    x.checked = false;
                    return x;
                });
            }

            let p = tree.filter(x => x.title === n.parent);



            if (p && p.length > 0 && p[0].children) {

                if (p[0].children.filter(x => x.checked && x.checked == true).length == 0) {
                    tree.indexOf(p);
                    tree[tree.indexOf(p[0])] = Object.assign({ ...p[0], checked: false });
                }
            }

            tree[nodeIndex] = Object.assign(n);
            setTree([...tree]);
        }
    }

    const traverseNode = (node) => {
        return (
            <div key={node.title}>
                <label className="custom_check">
                    <input type="checkbox" name="select_specialist" checked={node.checked && node.checked == true} onChange={(e) => onCategoryCheck(e, node)} />
                    <span className="checkmark"></span> {node.title}
                </label>{node.children ? <div className="subChilds"> {node.children.map(childNode => (traverseNode(childNode)))} </div> : null}
            </div>
        );
    };
    return tree.length == 0 ? <img src="/assets/img/loading.gif" style={{ width: '35%', margin: '0 auto' }} /> :
        tree.map((node) => {
            return traverseNode(node);
        });
}


const allReportsContainer = document.querySelector('#allReports');
const allReportsRoot = ReactDOM.createRoot(allReportsContainer);
allReportsRoot.render(allReportsElement(AllReports));