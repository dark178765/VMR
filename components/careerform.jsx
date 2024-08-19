'use strict';

const e1 = React.createElement;

class CareerForm extends React.Component {

    componentDidMount() {
        let urlFrag = window.location.pathname.split('/');

        let formType = document.getElementById('form').getAttribute('data-formtype');

        let url = formType ? `/form/get-form-values?formType=${formType}` : `/form/get-form-values/${urlFrag[1]}?formUrl=${urlFrag[2]}`;

        fetch(url).then(res => res.json()).then(res => {
            this.setState({
                ...this.state,
                form: {
                    ...this.state.form,
                    reportUrl: res.reportUrl,
                    reportId: res.reportId,
                    Referer: res.Referer,
                    title: res.reportTitle,
                    formTitle: res.title,
                    formType: res.formType,
                    reportTitle: res.reportTitle,
                    tocUrl: res.tocUrl
                },
                countries: res.countries,
                captchaImage: res.captcha
            });
        });
    }

    constructor(props) {
        super(props);
        this.state = {
            countries: [{ name: '', code: '' }],
            captchaImage: '',
            form: {
                firstName: '',
                businessEmail: '',
                comment: '',
                company: '',
                country: '',
                formType: '',
                jobTitle: '',
                phNo: '',
                reportId: '',
                title: '',
                reportUrl: '',
                reportTitle: '',
                Referer: '',
                formType: 1,
                captcha: '',
                termsCheckbox: false
            },
            validation: {
            },
            isFormSubmitting: false,
            formSubmitted: false,
            wasValidated: false,
            errorMessage: ''
        };
    }

    handleFormInputChange(e, inputName) {
        let frm = {};

        if (e.target.type.toLowerCase() === 'checkbox') {
            frm[inputName] = e.target.checked;
        } else {
            frm[inputName] = e.target.value;
        }
        this.setState({
            ...this.state,
            form: {
                ...this.state.form,
                ...frm
            }
        }, () => {
            this.validateForm();
        });

    }

    isValidForm = true;

    validateForm() {

        let validation = {};
        if (this.state.form.firstName === '') {
            validation['firstName'] = true;
            this.isValidForm = false;
        } else {
            validation['firstName'] = false;
            this.isValidForm = true;
        }

        let emailRegex = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

        if (this.state.form.businessEmail === '') {
            validation['businessEmail'] = true;
            this.isValidForm = false;
        } else if (!emailRegex.test(this.state.form.businessEmail)) {
            validation['businessEmail'] = true;
            this.isValidForm = false;
        } else {
            validation['businessEmail'] = false;
            this.isValidForm = true;
        }

        if (this.state.form.phNo === '') {
            validation['phNo'] = true;
            this.isValidForm = false;
        } else {
            validation['phNo'] = false;
            this.isValidForm = true;
        }

        if (this.state.form.jobTitle === '') {
            validation['jobTitle'] = true;
            this.isValidForm = false;
        } else {
            validation['jobTitle'] = false;
            this.isValidForm = true;
        }

        if (this.state.form.company === '') {
            validation['company'] = true;
            this.isValidForm = false;
        } else {
            validation['company'] = false;
            this.isValidForm = true;
        }

        if (this.state.form.comment === '') {
            validation['comment'] = true;
            this.isValidForm = false;
        } else {
            validation['comment'] = false;
            this.isValidForm = true;
        }

        if (this.state.form.country === '') {
            validation['country'] = true;
            this.isValidForm = false;
        } else {
            validation['country'] = false;
            this.isValidForm = true;
        }

        if (this.state.form.captcha === '') {
            validation['captcha'] = true;
            this.isValidForm = false;
        } else {
            validation['captcha'] = false;
            this.isValidForm = true;
        }

        if (!this.state.form.termsCheckbox) {
            validation['termsCheckbox'] = true;
            this.isValidForm = false;
        } else {
            validation['termsCheckbox'] = false;
            this.isValidForm = true;
        }

        this.setState({
            ...this.state,
            validation: {
                ...this.state.validation,
                ...validation
            }
        });
    }

    submitForm() {
        this.validateForm();
        if (this.isValidForm) {
            this.setState({
                ...this.state,
                isFormSubmitting: true
            });

            fetch('/form/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8'
                },
                body: JSON.stringify({ ...this.state.form })
            }).then(res => res.json())
                .then(res => {
                    if (res && res.success && res.success === true) {
                        this.setState({
                            ...this.state,
                            formSubmitted: true
                        }, () => {
                            setTimeout(() => {
                                window.location.href = `/${window.location.pathname.split('/')[1]}/${this.state.formType}/${res.leadid}/thank-you`
                            }, 1000)
                        })
                    } else {

                        if (res.message.toLowerCase().indexOf('invalid captcha') > -1) {
                            this.setState({
                                ...this.state,
                                validation: {
                                    ...this.state.validation,
                                    captcha: true
                                },
                                isFormSubmitting: false,
                                errorMessage: res.message
                            });
                        } else {
                            this.setState({
                                ...this.state,
                                isFormSubmitting: false,
                                errorMessage: res.message
                            });
                        }
                    }
                });
        }

    }

    refreshCaptch() {
        fetch(`/refresh-captcha/${this.state.form.formType}`).then(res => res.json()).then(res => this.setState({
            ...this.state,
            captchaImage: res.captcha
        }));
    }

    submitFormAndRedirect(url) {
        this.submitForm();
        window.location.href = url;
    }

    render() {
        return (
            <div>
                <img src="https://c.tenor.com/0AVbKGY_MxMAAAAC/check-mark-verified.gif" className={"mx-auto d-block img-fluid" + (!this.state.formSubmitted ? ' d-none' : '')} />
                <form className="php-email-form" name="enquiry" id={`frm_${this.state.form.formType}`} style={{ 'display': (!this.state.formSubmitted ? '' : 'none') }}>
                    <input type="hidden" name="reportId" value={this.state.form.reportId} />
                    <input type="hidden" name="title" value={this.state.form.reportTitle} />
                    <input type="hidden" name="reportUrl" value={this.state.form.reportUrl} />
                    <input type="hidden" name="Referer" value={this.state.form.Referer} />

                    <input type="hidden" name="formType" value={this.state.form.formType} />
                    <div className="row">
                        <div className="col-md-6">
                            <div className="form-group">
                                <label className="form-control-label">Full Name</label>
                                <input type="text" name="firstName" className={"form-control" + (this.state.validation.firstName !== undefined ? (this.state.validation.firstName ? ' is-invalid' : ' is-valid') : '')} id="name"
                                    placeholder="Full Name" message='Full Name is required' required onChange={(e) => this.handleFormInputChange(e, 'firstName')} />
                            </div>
                        </div>

                        <div className="col-md-6">
                            <div className="form-group">
                                <label className="form-control-label">Email</label>
                                <input type="email" className={"form-control" + (this.state.validation.businessEmail !== undefined ? (this.state.validation.businessEmail ? ' is-invalid' : ' is-valid') : '')}
                                    name="businessEmail"
                                    id="businessEmail"
                                    placeholder="Business Email ( Please avoid free email like g-mail/yahoo )"
                                    message="Email is required" required onChange={(e) => this.handleFormInputChange(e, 'businessEmail')} />
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="form-group">
                                <label className="form-control-label">Phone #</label>
                                <input type="text" className={"form-control" + (this.state.validation.phNo !== undefined ? (this.state.validation.phNo ? ' is-invalid' : ' is-valid') : '')}
                                    name="phNo" id="phNo"
                                    mask="(000) 000 00 00" placeholder="(000) 000 00 00"
                                    message="Phone Number is required" required onChange={(e) => this.handleFormInputChange(e, 'phNo')} />
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="form-group">
                                <label className="form-control-label">Your Company</label>
                                <input type="text" className={"form-control" + (this.state.validation.company !== undefined ? (this.state.validation.company ? ' is-invalid' : ' is-valid') : '')}
                                    name="company" id="company"
                                    placeholder="Company name" message="Company Name is required" required onChange={(e) => this.handleFormInputChange(e, 'company')} />
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="form-group">
                                <label className="form-control-label">Designation</label>
                                <input type="text" className={"form-control" + (this.state.validation.jobTitle !== undefined ? (this.state.validation.jobTitle ? ' is-invalid' : ' is-valid') : '')}
                                    name="jobTitle" id="jobTitle"
                                    placeholder="Job Title/Designation" message="Job Title is required" required onChange={(e) => this.handleFormInputChange(e, 'jobTitle')} />
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="form-group">
                                <label className="form-control-label">Country</label>
                                <select className={"form-control" + (this.state.validation.country !== undefined ? (this.state.validation.country ? ' is-invalid' : ' is-valid') : '')}
                                    name="country" id="country"
                                    message="Please select country" required onChange={(e) => this.handleFormInputChange(e, 'country')}>
                                    <option value="">Select country</option>
                                    {this.state.countries.map((x, ind) => <option value={x.name} key={ind}>{x.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="form-group">
                                <label className="form-control-label">Requirement/Comment</label>
                                <textarea className={"form-control" + (this.state.validation.comment !== undefined ? (this.state.validation.comment ? ' is-invalid' : ' is-valid') : '')}
                                    name="comment" rows="5"
                                    placeholder="To receive personalized service, please share your research needs"
                                    message="Comment is required" required onChange={(e) => this.handleFormInputChange(e, 'comment')}></textarea>
                            </div>

                        </div>
                        <div className="col-md-6">
                            <div className="cimg">
                                <img className="captcha-img" srcSet={this.state.captchaImage} />
                                <i className="fa fa-refresh" style={{ cursor: 'pointer' }} onClick={() => this.refreshCaptch()}></i>
                            </div>
                            <div className="form-group">
                                <label className="form-control-label">Captcha</label>
                                <input type="text" className={"form-inline form-control" + (this.state.validation.captcha !== undefined ? (this.state.validation.captcha ? ' is-invalid' : ' is-valid') : '')}
                                    id="varification" name="captcha"
                                    message="Captcha is required" required onChange={(e) => this.handleFormInputChange(e, 'captcha')} />
                            </div>
                        </div>
                        <div className="col-md-12">
                            <div className="alert alert-info">
                                <div className="form-check">
                                    <input className="form-check-input" type="checkbox" value="true" id="flexCheckDefault" onChange={(e) => this.handleFormInputChange(e, 'termsCheckbox')} />
                                    <label className="form-check-label" htmlFor="flexCheckDefault">
                                        I agree to <a href="/terms-of-services" rel="nofollow noindex">Terms & Conditions</a> Check <a href="/privacy-policy" rel="nofollow noindex">Privacy Policy</a>.
                                    </label>
                                    <div className="invalid-feedback" style={this.state.validation.termsCheckbox !== undefined ? (this.state.validation.termsCheckbox ? { display: 'block' } : { display: 'none' }) : {}}>
                                        Please accept Terms & Conditions
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    <div className="row">
                        <div className="col-md-12">
                            <button className="btn btn-primary mr-10" disabled={this.state.isFormSubmitting}
                                type="button" onClick={() => this.submitForm()}>
                                {!this.state.isFormSubmitting ? 'Submit' : 'Processing...'}</button>
                            <button type="button" className="btn btn-outline-danger float-end" style={{ marginLeft: '10px' }} target="_blank" rel="nofollow noindex" onClick={() => this.submitFormAndRedirect(this.state.form.reportUrl)}>Read Report</button>
                            <button type="button" className="btn btn-outline-success float-end" href={this.state.form.tocUrl} target="_blank" rel="nofollow noindex" onClick={() => this.submitFormAndRedirect(this.state.form.reportUrl)}>Table Of Content</button>
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}

const domContainer1 = document.querySelector('#form');
const root1 = ReactDOM.createRoot(domContainer1);
root1.render(e1(ReactForm));