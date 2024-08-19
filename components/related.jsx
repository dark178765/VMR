'use strict';

const relatedElement = React.createElement;

const Related = () => {

    const [relatedReports, setRelatedReports] = React.useState([]);

    const getRelatedReports = () => {
        fetch('/related-reports/' + document.getElementById('reportID').value).then(res => res.json()).then(res => {
            setRelatedReports(res);
        });
    }

    React.useEffect(() => {
        getRelatedReports();
    }, []);

    const even = {
        backgroundColor: '#dedfdc',
        paddingLeft: '5px',
        paddingBottom: '10px',
        paddingTop: '10px'
    }

    const odd = {
        backgroundColor: 'white',
        paddingLeft: '5px',
        paddingBottom: '10px',
        paddingTop: '10px'
    }

    return (<div>
    {relatedReports && relatedReports.length > 0 ?
    <div style={{border: '1px solid #dfdfdf', borderRadius: '5px 5px 0 0'}}>
        <h3 style={{padding: '15px 15px 10px 8px', borderRadius: '5px 5px 0 0', background: '#dfdfef', margin: '0px'}}>Proximate Markets</h3>
        {relatedReports && relatedReports.length > 0 ? relatedReports.slice(0, 5).map((x, xi) => <div style={xi % 2 == 0 ? odd : even}>
            <a href={'/industry-report/' + x.slug}>{x.keyword + ' Market'}</a>
        </div>) : null}
        <div style={{display: 'grid'}}>
            <button className="btn btn-primary" onClick={() => window.location.href = `/${window.location.href.split('/').pop()}/request-sample?br=1`}>Request Batch</button>
        </div>
    </div> : null}</div>)
}

const relatedContainer = document.querySelector('#related');
const relatedRoot = ReactDOM.createRoot(relatedContainer);
relatedRoot.render(relatedElement(Related));

