'use strict';

const relateReportElement = React.createElement;

const RelatedReports = () => {
    const [relatedRepors, setRelatedReports] = React.useState([]);
    const [requested, setRequested] = React.useState(false);

    const getRelatedReports = () => {
        fetch('/related-reports/' + document.getElementById('reportID').value).then(res => res.json()).then(res => {
            setRelatedReports(res);
            setRequested(true);
        });
    }

    React.useEffect(() => {
        getRelatedReports();
    }, []);

    React.useEffect(() => {
        if (requested && (!relatedRepors || relatedRepors.length == 0)) {
            Array.from(document.getElementsByClassName('related-report-list')).forEach(item => item.style.display = 'none')
        }

    }, [relatedRepors])

    return (
        <div className="row" style={{ minHeight: '300px' }}>

            {relatedRepors && relatedRepors.length > 0 ? relatedRepors.map((x, xi) => <div className="col-md-6"><img src="https://cdn.vantagemarketresearch.com/assets/img/table-icons/business-and-finance.png" class="me-2" height="24" width="24" alt="Revenue CAGR" /> <a href={"/industry-report/" + x.slug}>{x.reportDataId && x.reportDataId.table ? `${x.keyword} Market Size ${x.reportDataId.table.filter(x => x.fieldName.indexOf('Revenue_') > -1)[1].fieldValue} by ${x.reportDataId.table.filter(x => x.fieldName.indexOf('Revenue_') > -1)[1].fieldName.replace('Revenue_', '')}` : x.keyword + ' Market'}</a></div>) :
                <img src="/assets/img/loading.gif" style={{ width: '35%', margin: '0 auto' }} />
            }
        </div>
    )
}

const relatedReportsContainer = document.querySelector('#relatedReports');
const relatedReportRoot = ReactDOM.createRoot(relatedReportsContainer);
relatedReportRoot.render(relateReportElement(RelatedReports));