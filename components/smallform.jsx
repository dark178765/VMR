'use strict';

const smallFormElement = React.createElement;

function SmallForm() {
    const [formInfo, setFormInfo] = React.useState({
        FullName: '',
        Phone: '',
        Email: '',
        Company: '',
        Captcha: '',
        ReportTitle: '',
        ReportUrl: '',
        ReportID: ''
    });


    const moreFreeEmailServiceProviders = ['naver.com', 'liveinternet.ru', 'tegos.club', '']

    const [freeEmailList, setFreeEmailList] = React.useState([]);

    const [disableButton, setDisableButton] = React.useState(true);

    const [isFreeEmail, setIsFreeEmail] = React.useState(false);

    const emailRegex = new RegExp(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,'gmi')

    const [invalidEMail, setInvalidEmail] = React.useState(false);
    const [captcha, setCaptcha] = React.useState();
    const [formSubmitted, setFromSubmitted] = React.useState(false);

    const checkFreeEmail = () => {
        if (formInfo.Email.indexOf('@') > -1) {
            let domain = formInfo.Email.split('@')[1].trim();
            let fd = freeEmailList.filter(x => x.trim() !== '' && x === domain.trim());
            if(fd.length > 0) {
                setIsFreeEmail(true);
            } else {
                setIsFreeEmail(false);
            }
        } else {
            setIsFreeEmail(false);
        }

        if(formInfo.Email.length > 0 && !emailRegex.test(formInfo.Email)) {
            setInvalidEmail(true);
        } else {
            setInvalidEmail(false);
        }
    }

    const validate = () => {
        if(formInfo.FullName.trim() === '' || formInfo.Email.trim() === '' || isFreeEmail || formInfo.Captcha.trim() === '') {
            setDisableButton(true)
        } else {
            setDisableButton(false);
        }
    }

    const getCaptcha = () => {
        fetch('/refresh-captcha/11', {
            credentials: 'include'
        }).then(res => res.json()).then(res => {
            setCaptcha(res);
        })
    }

    const saveForm = () => {

        fetch(`/vpoint-request`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            },
            body: JSON.stringify({
                firstName: formInfo.FullName,
                businessEmail: formInfo.Email,
                Captcha: formInfo.Captcha,
                phNo: formInfo.Phone,
                company: formInfo.Company,
                reportTitle: formInfo.ReportTitle,
                reportUrl: formInfo.ReportUrl,
                reportId: formInfo.ReportID,
                formType: 11
            })
        }).then(res => res.json())
            .then(res => {
                if(res && res.success) {
                    setFromSubmitted(true);
                    setTimeout(() => {
                        hideForm();
                    }, 5000)
                }
            })
    }

    const getFormValues = () => {
        fetch(`/form/get-form-values/${document.URL.split('/').pop()}?formType=11`)
        .then(res => res.json())
        .then(res => {
            setFormInfo({
                ...formInfo,
                ReportTitle: res.reportTitle,
                ReportUrl: res.reportUrl,
                ReportID: res.reportId
            });

            setCaptcha(res.captcha);
        })
    }

    const hideForm = () => {
        let flipCard = document.getElementsByClassName('flip-card');
        flipCard[0].classList.remove('is-flipped');
    }

    React.useEffect(() => {
        fetch('/free-email.json').then(res => res.json()).then(res => {
            setFreeEmailList([...res, ...moreFreeEmailServiceProviders]);
        })
        //getCaptcha();
        getFormValues();
    }, [])

    React.useEffect(() => {
        checkFreeEmail();
        validate();
    }, [formInfo]);

    React.useEffect(() => {
        validate();
    }, [isFreeEmail])

    const required = {
        fontWeight: 'bold',
        color: 'red'
    }

    const smallInput = {
        minHeight: '25px'
    }

    const smallLabel = {
        fontSize: '12px',
        fontWeight: 'bold'
    }

    return(
        <div className="small-form" style={{height: '100%'}}>
           {!formSubmitted ? <div style={{ height: '100%', display: 'flex', flexDirection: 'column', 'justifyContent': 'space-around' }}>
                <div className="row">
                    <div className="col-md-12">
                        <div className="form-group" style={{ marginBottom: '0.6rem' }}>
                            <input placeholder="Full Name (Required)" style={smallInput} type="text" value={formInfo.FullName} className={"form-control" + (formInfo.FullName.trim() !== '' ? ' is-valid' : '')} onChange={(e) => {
                                setFormInfo({
                                    ...formInfo,
                                    FullName: e.target.value
                                })
                            }} />
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-12">
                        <div className="form-group" style={{ marginBottom: '0.6rem' }}>
                            <input placeholder="Company" style={smallInput} type="text" onChange={(e) => {
                                setFormInfo({
                                    ...formInfo,
                                    Company: e.target.value
                                })
                            }} className={"form-control" + (formInfo.Company.trim() !== '' ? ' is-valid' : '')} />
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-12">
                        <div className="form-group" style={{ marginBottom: '0.6rem' }}>
                            <input placeholder="Email (Business Email Only) (Required)" style={smallInput} type="email" className={"form-control" + (isFreeEmail || invalidEMail ? ' is-invalid' : formInfo.Email.trim() !== '' ? ' is-valid' : '')} onChange={(e) => {
                                setFormInfo({
                                    ...formInfo,
                                    Email: e.target.value
                                })
                            }} />
                            {isFreeEmail ? <span style={{ fontWeight: 'bold' }} className="invalid-feedback">No Free Email</span> : null}
                            {invalidEMail ? <span style={{ fontWeight: 'bold' }} className="invalid-feedback">Invalid Email</span> : null}
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-12">
                        <div className="form-group" style={{ marginBottom: '0.6rem' }}>
                            <input placeholder="Phone" style={smallInput} type="tel" onChange={(e) => {
                                setFormInfo({
                                    ...formInfo,
                                    Phone: e.target.value
                                })
                            }} className="form-control" />
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-12">
                        <div className="form-group" style={{ display: 'flex', alignItems: 'center', marginBottom: '0.6rem' }}>
                            {captcha ? <img srcSet={captcha} style={{ maxWidth: '100px' }} /> : null}
                            <input placeholder="Captcha (Required)" style={smallInput} type="text" className="form-control" onChange={(e) => {
                                setFormInfo({
                                    ...formInfo,
                                    Captcha: e.target.value
                                })
                            }} />
                        </div>
                    </div>
                    <div className="col-md-12"></div>
                </div>

                <div style={{ display: 'flex' }}>
                    <button className="btn btn-sm btn-dark" disabled={disableButton} onClick={() => saveForm()}>Request Access</button>
                    <button className="btn btn-sm btn-secondary" style={{ marginLeft: '5px' }} onClick={() => {
                        hideForm();
                    }}>Cancel</button>
                </div>
            </div> : <div className="alert alert-success">
                <h3>Your Request to access Vantage Point Interactive Cloud Dashboard has been submitted.
                    We will notify you once we approved your request.</h3>
            </div>}
        </div>
    )
}

const smallFormContainer = document.querySelector('#smallForm');
const smallFormRoot = ReactDOM.createRoot(smallFormContainer);
smallFormRoot.render(smallFormElement(SmallForm));

