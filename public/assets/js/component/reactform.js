'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var e1 = React.createElement;

var freeEmailStyle = {
    fontSize: '12px',
    fontWeight: 'bold',
    color: 'blue'
};

var ReactForm = function (_React$Component) {
    _inherits(ReactForm, _React$Component);

    _createClass(ReactForm, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this2 = this;

            var urlFrag = window.location.pathname.split('/');

            var formType = document.getElementById('form').getAttribute('data-formtype');

            var url = formType ? '/form/get-form-values?formType=' + formType : '/form/get-form-values/' + urlFrag[1] + '?formUrl=' + urlFrag[2];

            fetch(url).then(function (res) {
                return res.json();
            }).then(function (res) {
                _this2.setState(Object.assign({}, _this2.state, {
                    form: Object.assign({}, _this2.state.form, {
                        reportUrl: res.reportUrl,
                        reportId: res.reportId,
                        Referer: res.Referer,
                        title: res.reportTitle,
                        formTitle: res.title,
                        formType: res.formType,
                        reportTitle: res.reportTitle,
                        tocUrl: res.tocUrl,
                        token: res.token
                    }),
                    countries: res.countries,
                    captchaImage: res.captcha,
                    isFreeEmail: false
                }));
            });
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate() {}
    }]);

    function ReactForm(props) {
        var _form;

        _classCallCheck(this, ReactForm);

        var _this = _possibleConstructorReturn(this, (ReactForm.__proto__ || Object.getPrototypeOf(ReactForm)).call(this, props));

        _this.isContact = false;
        _this.freeEmail = ['gmail', 'yahoo', 'rediffmail', '163', 'hotmail', 'live'];
        _this.isValidForm = true;


        var path = location.pathname.split('/');

        _this.state = {
            countries: [{ name: '', code: '' }],
            captchaImage: '',
            form: (_form = {
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
                Referer: ''
            }, _defineProperty(_form, 'formType', 1), _defineProperty(_form, 'captcha', ''), _defineProperty(_form, 'termsCheckbox', false), _form),
            validation: {},
            isFormSubmitting: false,
            formSubmitted: false,
            wasValidated: false,
            errorMessage: '',
            isContact: path[path.length - 1] == 'contact-us'
        };
        return _this;
    }

    _createClass(ReactForm, [{
        key: 'freeEmailHandler',
        value: function freeEmailHandler(email) {
            var isFreeEmail = false;
            var emailSeg = email.split('@');

            var domain = [];

            if (emailSeg.length > 1) {
                domain = emailSeg[1].trim().split('.');
            }

            if (domain.length > 0 && this.freeEmail.indexOf(domain[0].trim()) > -1) {
                isFreeEmail = true;
            }

            this.setState(Object.assign({}, this.state, {
                isFreeEmail: isFreeEmail
            }));
        }
    }, {
        key: 'handleFormInputChange',
        value: function handleFormInputChange(e, inputName) {
            var _this3 = this;

            var frm = {};

            if (e.target.type.toLowerCase() === 'checkbox') {
                frm[inputName] = e.target.checked;
            } else {
                frm[inputName] = e.target.value;
            }
            this.setState(Object.assign({}, this.state, {
                form: Object.assign({}, this.state.form, frm)
            }), function () {
                _this3.validateForm();
            });
        }
    }, {
        key: 'validateForm',
        value: function validateForm() {
            var _this4 = this;

            var htmlRegex = /<\/?[a-z][\s\S]*>/gmi;
            var validation = {};
            if (this.state.form.firstName === '' || htmlRegex.test(this.state.form.firstName)) {
                validation['firstName'] = true;
                this.isValidForm = false;
            } else {
                validation['firstName'] = false;
                this.isValidForm = true;
            }

            var emailRegex = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

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

            if (this.state.form.phNo === '' || htmlRegex.test(this.state.form.phNo)) {
                validation['phNo'] = true;
                this.isValidForm = false;
            } else {
                validation['phNo'] = false;
                this.isValidForm = true;
            }

            if (this.state.form.jobTitle === '' || htmlRegex.test(this.state.form.jobTitle)) {
                validation['jobTitle'] = true;
                this.isValidForm = false;
            } else {
                validation['jobTitle'] = false;
                this.isValidForm = true;
            }

            if (this.state.form.company === '' || htmlRegex.test(this.state.form.company)) {
                validation['company'] = true;
                this.isValidForm = false;
            } else {
                validation['company'] = false;
                this.isValidForm = true;
            }

            if (this.state.form.comment === '' || htmlRegex.test(this.state.form.comment)) {
                validation['comment'] = true;
                this.isValidForm = false;
            } else {
                validation['comment'] = false;
                this.isValidForm = true;
            }

            if (this.state.form.country === '' || htmlRegex.test(this.state.form.country)) {
                validation['country'] = true;
                this.isValidForm = false;
            } else {
                validation['country'] = false;
                this.isValidForm = true;
            }

            if (this.state.form.captcha === '' || htmlRegex.test(this.state.form.captcha)) {
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

            var validationKeys = Object.getOwnPropertyNames(validation);

            validationKeys.forEach(function (k) {
                if (validation[k]) {
                    _this4.isValidForm = false;
                }
            });

            this.setState(Object.assign({}, this.state, {
                validation: Object.assign({}, this.state.validation, validation)
            }), function () {
                _this4.freeEmailHandler(_this4.state.form.businessEmail);
            });
        }
    }, {
        key: 'submitForm',
        value: function submitForm() {
            var _this5 = this;

            this.validateForm();
            if (this.isValidForm) {
                this.setState(Object.assign({}, this.state, {
                    isFormSubmitting: true
                }));

                fetch('/form/submit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json; charset=utf-8'
                    },
                    body: JSON.stringify(Object.assign({}, this.state.form))
                }).then(function (res) {
                    return res.json();
                }).then(function (res) {
                    if (res && res.success && res.success === true) {
                        _this5.setState(Object.assign({}, _this5.state, {
                            formSubmitted: true
                        }), function () {
                            //ga('send', 'formfill', `/${window.location.pathname.split('/')[1]}/${this.state.form.formType}/${res.leadid}/thank-you`);
                            window.dataLayer = window.dataLayer || [];
                            dataLayer.push({ 'event': 'formSubmit' });

                            setTimeout(function () {
                                window.location.href = '/' + window.location.pathname.split('/')[1] + '/' + _this5.state.form.formType + '/' + res.leadid + '/thank-you';
                            }, 1000);
                        });
                    } else {

                        if (res.message.toLowerCase().indexOf('invalid captcha') > -1) {
                            _this5.setState(Object.assign({}, _this5.state, {
                                validation: Object.assign({}, _this5.state.validation, {
                                    captcha: true
                                }),
                                isFormSubmitting: false,
                                errorMessage: res.message
                            }));
                        } else {
                            _this5.setState(Object.assign({}, _this5.state, {
                                isFormSubmitting: false,
                                errorMessage: res.message
                            }));
                        }
                    }
                });
            } else {}
        }
    }, {
        key: 'refreshCaptch',
        value: function refreshCaptch() {
            var _this6 = this;

            fetch('/refresh-captcha/' + this.state.form.formType).then(function (res) {
                return res.json();
            }).then(function (res) {
                return _this6.setState(Object.assign({}, _this6.state, {
                    captchaImage: res.captcha
                }));
            });
        }
    }, {
        key: 'submitFormAndRedirect',
        value: function submitFormAndRedirect(url) {
            this.submitForm();
            window.location.href = url;
        }
    }, {
        key: 'render',
        value: function render() {
            var _this7 = this;

            var requiredStyle = {
                fontSize: '12px',
                fontWeight: 'bold',
                color: 'red'
            };
            return React.createElement(
                'div',
                null,
                React.createElement('img', { src: 'https://c.tenor.com/0AVbKGY_MxMAAAAC/check-mark-verified.gif', className: "mx-auto d-block img-fluid" + (!this.state.formSubmitted ? ' d-none' : '') }),
                React.createElement(
                    'form',
                    { className: 'php-email-form', name: 'enquiry', id: 'frm_' + this.state.form.formType, style: { 'display': !this.state.formSubmitted ? '' : 'none' } },
                    React.createElement('input', { type: 'hidden', name: 'reportId', value: this.state.form.reportId }),
                    React.createElement('input', { type: 'hidden', name: 'title', value: this.state.form.reportTitle }),
                    React.createElement('input', { type: 'hidden', name: 'reportUrl', value: this.state.form.reportUrl }),
                    React.createElement('input', { type: 'hidden', name: 'Referer', value: this.state.form.Referer }),
                    React.createElement('input', { type: 'hidden', name: 'formType', value: this.state.form.formType }),
                    React.createElement(
                        'div',
                        { className: 'row' },
                        React.createElement(
                            'div',
                            { className: 'col-md-6' },
                            React.createElement(
                                'div',
                                { className: 'form-group' },
                                React.createElement(
                                    'label',
                                    { className: 'form-control-label' },
                                    'Full Name ',
                                    React.createElement(
                                        'span',
                                        { style: requiredStyle },
                                        '*'
                                    )
                                ),
                                React.createElement('input', { type: 'text', name: 'firstName', className: "form-control" + (this.state.validation.firstName !== undefined ? this.state.validation.firstName ? ' is-invalid' : ' is-valid' : ''), id: 'name',
                                    placeholder: 'Full Name', message: 'Full Name is required', required: true, onChange: function onChange(e) {
                                        return _this7.handleFormInputChange(e, 'firstName');
                                    } }),
                                this.state.validation.firstName !== undefined && this.state.validation.firstName === true ? React.createElement(
                                    'span',
                                    { className: 'invalid-feedback', style: { display: 'block' } },
                                    'Please Enter Full Name'
                                ) : null
                            )
                        ),
                        React.createElement(
                            'div',
                            { className: 'col-md-6' },
                            React.createElement(
                                'div',
                                { className: 'form-group' },
                                React.createElement(
                                    'label',
                                    { className: 'form-control-label' },
                                    'Email ',
                                    React.createElement(
                                        'span',
                                        { style: requiredStyle },
                                        '*'
                                    )
                                ),
                                React.createElement('input', { type: 'email', className: "form-control" + (this.state.validation.businessEmail !== undefined ? this.state.validation.businessEmail ? ' is-invalid' : ' is-valid' : ''),
                                    name: 'businessEmail',
                                    id: 'businessEmail',
                                    placeholder: 'Business Email ( Please avoid free email like g-mail/yahoo )',
                                    message: 'Email is required', required: true, onChange: function onChange(e) {
                                        _this7.handleFormInputChange(e, 'businessEmail');
                                    } }),
                                this.state.validation.businessEmail !== undefined && this.state.validation.businessEmail === true ? React.createElement(
                                    'span',
                                    { className: 'invalid-feedback', style: { display: 'block' } },
                                    'Please enter Work Email'
                                ) : null,
                                this.state.isFreeEmail ? React.createElement(
                                    'span',
                                    { style: freeEmailStyle },
                                    'Enter business email to prioritize your request. ',
                                    React.createElement('i', { className: 'fa fa-info-circle', 'data-toggle': 'tooltip', title: 'We can prioritize your request if you input your business email rather than free email.' })
                                ) : null
                            )
                        ),
                        React.createElement(
                            'div',
                            { className: 'col-md-6' },
                            React.createElement(
                                'div',
                                { className: 'form-group' },
                                React.createElement(
                                    'label',
                                    { className: 'form-control-label' },
                                    'Phone # ',
                                    React.createElement(
                                        'span',
                                        { style: requiredStyle },
                                        '*'
                                    )
                                ),
                                React.createElement('input', { type: 'text', className: "form-control" + (this.state.validation.phNo !== undefined ? this.state.validation.phNo ? ' is-invalid' : ' is-valid' : ''),
                                    name: 'phNo', id: 'phNo',
                                    mask: '(000) 000 00 00', placeholder: '(000) 000 00 00',
                                    message: 'Phone Number is required', required: true, onChange: function onChange(e) {
                                        return _this7.handleFormInputChange(e, 'phNo');
                                    } }),
                                this.state.validation.phNo !== undefined && this.state.validation.phNo === true ? React.createElement(
                                    'span',
                                    { className: 'invalid-feedback', style: { display: 'block' } },
                                    'Please enter phone number'
                                ) : null
                            )
                        ),
                        React.createElement(
                            'div',
                            { className: 'col-md-6' },
                            React.createElement(
                                'div',
                                { className: 'form-group' },
                                React.createElement(
                                    'label',
                                    { className: 'form-control-label' },
                                    'Your Company ',
                                    React.createElement(
                                        'span',
                                        { style: requiredStyle },
                                        '*'
                                    )
                                ),
                                React.createElement('input', { type: 'text', className: "form-control" + (this.state.validation.company !== undefined ? this.state.validation.company ? ' is-invalid' : ' is-valid' : ''),
                                    name: 'company', id: 'company',
                                    placeholder: 'Company name', message: 'Company Name is required', required: true, onChange: function onChange(e) {
                                        return _this7.handleFormInputChange(e, 'company');
                                    } }),
                                this.state.validation.company !== undefined && this.state.validation.company === true ? React.createElement(
                                    'span',
                                    { className: 'invalid-feedback', style: { display: 'block' } },
                                    'Please enter Your Company Name'
                                ) : null
                            )
                        ),
                        React.createElement(
                            'div',
                            { className: 'col-md-6' },
                            React.createElement(
                                'div',
                                { className: 'form-group' },
                                React.createElement(
                                    'label',
                                    { className: 'form-control-label' },
                                    'Designation ',
                                    React.createElement(
                                        'span',
                                        { style: requiredStyle },
                                        '*'
                                    )
                                ),
                                React.createElement('input', { type: 'text', className: "form-control" + (this.state.validation.jobTitle !== undefined ? this.state.validation.jobTitle ? ' is-invalid' : ' is-valid' : ''),
                                    name: 'jobTitle', id: 'jobTitle',
                                    placeholder: 'Job Title/Designation', message: 'Job Title is required', required: true, onChange: function onChange(e) {
                                        return _this7.handleFormInputChange(e, 'jobTitle');
                                    } }),
                                this.state.validation.jobTitle !== undefined && this.state.validation.jobTitle === true ? React.createElement(
                                    'span',
                                    { className: 'invalid-feedback', style: { display: 'block' } },
                                    'Please enter Your Designation in your company'
                                ) : null
                            )
                        ),
                        React.createElement(
                            'div',
                            { className: 'col-md-6' },
                            React.createElement(
                                'div',
                                { className: 'form-group' },
                                React.createElement(
                                    'label',
                                    { className: 'form-control-label' },
                                    'Country ',
                                    React.createElement(
                                        'span',
                                        { style: requiredStyle },
                                        '*'
                                    )
                                ),
                                React.createElement(
                                    'select',
                                    { className: "form-control" + (this.state.validation.country !== undefined ? this.state.validation.country ? ' is-invalid' : ' is-valid' : ''),
                                        name: 'country', id: 'country',
                                        message: 'Please select country', required: true, onChange: function onChange(e) {
                                            return _this7.handleFormInputChange(e, 'country');
                                        } },
                                    React.createElement(
                                        'option',
                                        { value: '' },
                                        'Select country'
                                    ),
                                    this.state.countries.map(function (x, ind) {
                                        return React.createElement(
                                            'option',
                                            { value: x.name, key: ind },
                                            x.name
                                        );
                                    })
                                ),
                                this.state.validation.country !== undefined && this.state.validation.country === true ? React.createElement(
                                    'span',
                                    { className: 'invalid-feedback', style: { display: 'block' } },
                                    'Please select Your Country'
                                ) : null
                            )
                        ),
                        React.createElement(
                            'div',
                            { className: 'col-md-6' },
                            React.createElement(
                                'div',
                                { className: 'form-group' },
                                React.createElement(
                                    'label',
                                    { className: 'form-control-label' },
                                    'Requirement/Comment ',
                                    React.createElement(
                                        'span',
                                        { style: requiredStyle },
                                        '*'
                                    )
                                ),
                                React.createElement('textarea', { className: "form-control" + (this.state.validation.comment !== undefined ? this.state.validation.comment ? ' is-invalid' : ' is-valid' : ''),
                                    name: 'comment', rows: '5',
                                    placeholder: 'To receive personalized service, please share your research needs',
                                    message: 'Comment is required', required: true, onChange: function onChange(e) {
                                        return _this7.handleFormInputChange(e, 'comment');
                                    } }),
                                this.state.validation.comment !== undefined && this.state.validation.comment === true ? React.createElement(
                                    'span',
                                    { className: 'invalid-feedback', style: { display: 'block' } },
                                    'Please enter your research requirements'
                                ) : null
                            )
                        ),
                        React.createElement(
                            'div',
                            { className: 'col-md-6' },
                            React.createElement(
                                'div',
                                { className: 'cimg' },
                                React.createElement('img', { className: 'captcha-img', srcSet: this.state.captchaImage }),
                                React.createElement('i', { className: 'fa fa-refresh', style: { cursor: 'pointer' }, onClick: function onClick() {
                                        return _this7.refreshCaptch();
                                    } })
                            ),
                            React.createElement(
                                'div',
                                { className: 'form-group' },
                                React.createElement(
                                    'label',
                                    { className: 'form-control-label' },
                                    'Captcha ',
                                    React.createElement(
                                        'span',
                                        { style: requiredStyle },
                                        '*'
                                    )
                                ),
                                React.createElement('input', { type: 'text', className: "form-inline form-control" + (this.state.validation.captcha !== undefined ? this.state.validation.captcha ? ' is-invalid' : ' is-valid' : ''),
                                    id: 'varification', name: 'captcha',
                                    message: 'Captcha is required', required: true, onChange: function onChange(e) {
                                        return _this7.handleFormInputChange(e, 'captcha');
                                    } }),
                                this.state.validation.captcha !== undefined && this.state.validation.captcha === true ? React.createElement(
                                    'span',
                                    { className: 'invalid-feedback', style: { display: 'block' } },
                                    'Please enter captcha'
                                ) : null
                            )
                        ),
                        React.createElement(
                            'div',
                            { className: 'col-md-12' },
                            React.createElement(
                                'div',
                                { className: 'alert alert-info' },
                                React.createElement(
                                    'div',
                                    { className: 'form-check' },
                                    React.createElement('input', { className: 'form-check-input', type: 'checkbox', value: 'true', id: 'flexCheckDefault', onChange: function onChange(e) {
                                            return _this7.handleFormInputChange(e, 'termsCheckbox');
                                        } }),
                                    React.createElement(
                                        'label',
                                        { className: 'form-check-label', htmlFor: 'flexCheckDefault' },
                                        'I agree to Terms & Conditions ',
                                        React.createElement(
                                            'a',
                                            { href: '/terms-of-services', rel: 'nofollow noindex', target: '_blank' },
                                            React.createElement('i', { className: 'fa fa-info-circle', title: 'click to check terms & conditions' })
                                        ),
                                        ' Check ',
                                        React.createElement(
                                            'a',
                                            { href: '/privacy-policy', rel: 'nofollow noindex' },
                                            'Privacy Policy'
                                        ),
                                        '.'
                                    ),
                                    React.createElement(
                                        'div',
                                        { className: 'invalid-feedback', style: this.state.validation.termsCheckbox !== undefined ? this.state.validation.termsCheckbox ? { display: 'block' } : { display: 'none' } : {} },
                                        'Please accept Terms & Conditions'
                                    )
                                )
                            )
                        )
                    ),
                    React.createElement(
                        'div',
                        { className: 'row' },
                        React.createElement(
                            'div',
                            { className: 'col-md-12' },
                            React.createElement(
                                'button',
                                { className: 'btn btn-primary mr-10', disabled: this.state.isFormSubmitting,
                                    type: 'button', onClick: function onClick() {
                                        return _this7.submitForm();
                                    } },
                                !this.state.isFormSubmitting ? 'Submit' : 'Processing...'
                            )
                        )
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'alert alert-info' },
                    'For your security, expect official communications only from email addresses ending with @vantagemarketresearch.com. Do not respond to emails from other domains, and report any suspicious messages to secure@vantagemarketresearch.com'
                )
            );
        }
    }]);

    return ReactForm;
}(React.Component);

var domContainer1 = document.querySelector('#form');
var root1 = ReactDOM.createRoot(domContainer1);
root1.render(e1(ReactForm));