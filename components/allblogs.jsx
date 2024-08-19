'use strict';

const allBlogsElement = React.createElement;

function allBlogs() {
    const limit = 20;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const [allBlogs, setallBlogs] = React.useState({
        blogs: [], count: 0
    });

    let selectedCategories = [];

    const [isReportsLoading, setisReportsLoading] = React.useState(true);

    React.useEffect(() => {
        getBlogs();
    }, [])

    const getBlogs = (page = 1) => {
        setallBlogs({ blogs: [], count: 0 });
        fetch(`/all-blogs-josn/${page}/${limit}`).then(res => res.json()).then(res => {
            setallBlogs(res);
        });
    }

    const fetchPage = (page) => {
        console.log(page)
    }

    const pageChanged = (cp) => {
        getBlogs(cp);
    }

    const [currentPage, setCurrentPage] = React.useState(1);
    const memoizedValue = React.useMemo(() => {
        //renderPageNumbers();
        pageChanged(currentPage);
    }, [currentPage]);

    const renderPageNumbers = () => {
        let page = allBlogs.count / limit;
        let pageLength = 5;

        let arr = currentPage <= 3 ? [...Array.from({ length: pageLength }, (_, i) => i + 1)] : currentPage + pageLength - 1 > page ? [...Array.from({ length: page - currentPage }, (_, i) => i + (currentPage - 1))] : [...Array.from({ length: pageLength }, (_, i) => i + (currentPage - 1))];

        return arr.map(i => {
            return <li className={"page-item" + (currentPage == (i) ? " active" : '')} key={'paging_' + i} onClick={() => setCurrentPage(i)}>
                <a className="page-link">{i}</a></li>;
        });
    }


    return (
        <div className="col-lg-12">
            <div className="row">
                {allBlogs.blogs.length == 0 ? <img src="/assets/img/loading.gif" style={{ width: '35%', margin: '0 auto' }} /> : null}
                {allBlogs ? allBlogs.blogs.map((ar, index) =>
                    <div className="col-lg-12 col-md-12 d-flex" key={'allRep_' + index}>
                        <div className="course-box course-design list-course d-flex">
                            <div className="product">
                                <div className="product-content">
                                    <div className="head-course-title">
                                        <h3 className="title"><a target="_blank" href={`/blog/${ar.slug}`}>{ar.title}</a>
                                        </h3>
                                    </div>
                                    <div className="course-info border-bottom-0 pb-0 d-flex align-items-center">
                                        <div className="rating-img d-flex align-items-center">
                                            <img src="assets/img/icon/icon-01.svg" alt="" />
                                            <p>Vantage Market Research</p>
                                        </div>
                                        <div className="course-view d-flex align-items-center">
                                            <img src="assets/img/icon/icon-02.svg" alt="" />
                                            <p>{months[new Date(ar.updatedAt).getMonth()]}-{new Date(ar.updatedAt).getFullYear()}</p>
                                        </div>
                                    </div>
                                    <div className="rating">
                                        <i className="fas fa-star filled"></i>
                                        <i className="fas fa-star filled"></i>
                                        <i className="fas fa-star filled"></i>
                                        <i className="fas fa-star filled"></i>
                                        <i className="fas fa-star"></i>
                                        <span className="d-inline-block average-rating"><span>4.0</span> (15)</span>
                                    </div>
                                    <div className="course-group d-flex mb-0">
                                        <div className="course-group-img d-flex flex-center">
                                            <a href={`/category/`}><img
                                                src={"/assets/img/category/icon/"} alt="" className="img-fluid" /></a>
                                            <div className="course-name">
                                                <h4><a
                                                    href={`/category/`}></a>
                                                </h4>
                                            </div>
                                        </div>
                                        <div className="course-share d-flex align-items-center justify-content-center">
                                            <a className="btn btn-sm btn-secondary" href={`/blog/${ar.slug}`}>
                                                Read More
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>) : null}
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
        </div>);
}

const allBlogsContainer = document.querySelector('#allBlogs');
const allBlogsRoot = ReactDOM.createRoot(allBlogsContainer);
allBlogsRoot.render(allBlogsElement(allBlogs));