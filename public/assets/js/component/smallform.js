'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var smallFormElement = React.createElement;

function SmallForm() {
    var _React$useState = React.useState({
        FullName: '',
        Phone: '',
        Email: '',
        Company: '',
        Captcha: '',
        ReportTitle: '',
        ReportUrl: '',
        ReportID: ''
    }),
        _React$useState2 = _slicedToArray(_React$useState, 2),
        formInfo = _React$useState2[0],
        setFormInfo = _React$useState2[1];

    var moreFreeEmailServiceProviders = ['naver.com', 'liveinternet.ru', 'tegos.club', ''];

    var _React$useState3 = React.useState([]),
        _React$useState4 = _slicedToArray(_React$useState3, 2),
        freeEmailList = _React$useState4[0],
        setFreeEmailList = _React$useState4[1];

    var _React$useState5 = React.useState(true),
        _React$useState6 = _slicedToArray(_React$useState5, 2),
        disableButton = _React$useState6[0],
        setDisableButton = _React$useState6[1];

    var _React$useState7 = React.useState(false),
        _React$useState8 = _slicedToArray(_React$useState7, 2),
        isFreeEmail = _React$useState8[0],
        setIsFreeEmail = _React$useState8[1];

    var emailRegex = new RegExp(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'gmi');

    var _React$useState9 = React.useState(false),
        _React$useState10 = _slicedToArray(_React$useState9, 2),
        invalidEMail = _React$useState10[0],
        setInvalidEmail = _React$useState10[1];

    var _React$useState11 = React.useState(),
        _React$useState12 = _slicedToArray(_React$useState11, 2),
        captcha = _React$useState12[0],
        setCaptcha = _React$useState12[1];

    var _React$useState13 = React.useState(false),
        _React$useState14 = _slicedToArray(_React$useState13, 2),
        formSubmitted = _React$useState14[0],
        setFromSubmitted = _React$useState14[1];

    var checkFreeEmail = function checkFreeEmail() {
        if (formInfo.Email.indexOf('@') > -1) {
            var domain = formInfo.Email.split('@')[1].trim();
            var fd = freeEmailList.filter(function (x) {
                return x.trim() !== '' && x === domain.trim();
            });
            if (fd.length > 0) {
                setIsFreeEmail(true);
            } else {
                setIsFreeEmail(false);
            }
        } else {
            setIsFreeEmail(false);
        }

        if (formInfo.Email.length > 0 && !emailRegex.test(formInfo.Email)) {
            setInvalidEmail(true);
        } else {
            setInvalidEmail(false);
        }
    };

    var validate = function validate() {
        if (formInfo.FullName.trim() === '' || formInfo.Email.trim() === '' || isFreeEmail || formInfo.Captcha.trim() === '') {
            setDisableButton(true);
        } else {
            setDisableButton(false);
        }
    };

    var getCaptcha = function getCaptcha() {
        fetch('/refresh-captcha/11', {
            credentials: 'include'
        }).then(function (res) {
            return res.json();
        }).then(function (res) {
            setCaptcha(res);
        });
    };

    var saveForm = function saveForm() {

        fetch('/vpoint-request', {
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
        }).then(function (res) {
            return res.json();
        }).then(function (res) {
            if (res && res.success) {
                setFromSubmitted(true);
                setTimeout(function () {
                    hideForm();
                }, 5000);
            }
        });
    };

    var getFormValues = function getFormValues() {
        fetch('/form/get-form-values/' + document.URL.split('/').pop() + '?formType=11').then(function (res) {
            return res.json();
        }).then(function (res) {
            setFormInfo(Object.assign({}, formInfo, {
                ReportTitle: res.reportTitle,
                ReportUrl: res.reportUrl,
                ReportID: res.reportId
            }));

            setCaptcha(res.captcha);
        });
    };

    var hideForm = function hideForm() {
        var flipCard = document.getElementsByClassName('flip-card');
        flipCard[0].classList.remove('is-flipped');
    };

    React.useEffect(function () {
        fetch('/free-email.json').then(function (res) {
            return res.json();
        }).then(function (res) {
            setFreeEmailList([].concat(_toConsumableArray(res), moreFreeEmailServiceProviders));
        });
        //getCaptcha();
        getFormValues();
    }, []);

    React.useEffect(function () {
        checkFreeEmail();
        validate();
    }, [formInfo]);

    React.useEffect(function () {
        validate();
    }, [isFreeEmail]);

    var required = {
        fontWeight: 'bold',
        color: 'red'
    };

    var smallInput = {
        minHeight: '25px'
    };

    var smallLabel = {
        fontSize: '12px',
        fontWeight: 'bold'
    };

    return React.createElement(
        'div',
        { className: 'small-form', style: { height: '100%' } },
        !formSubmitted ? React.createElement(
            'div',
            { style: { height: '100%', display: 'flex', flexDirection: 'column', 'justifyContent': 'space-around' } },
            React.createElement(
                'div',
                { className: 'row' },
                React.createElement(
                    'div',
                    { className: 'col-md-12' },
                    React.createElement(
                        'div',
                        { className: 'form-group', style: { marginBottom: '0.6rem' } },
                        React.createElement('input', { placeholder: 'Full Name (Required)', style: smallInput, type: 'text', value: formInfo.FullName, className: "form-control" + (formInfo.FullName.trim() !== '' ? ' is-valid' : ''), onChange: function onChange(e) {
                                setFormInfo(Object.assign({}, formInfo, {
                                    FullName: e.target.value
                                }));
                            } })
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
                        'div',
                        { className: 'form-group', style: { marginBottom: '0.6rem' } },
                        React.createElement('input', { placeholder: 'Company', style: smallInput, type: 'text', onChange: function onChange(e) {
                                setFormInfo(Object.assign({}, formInfo, {
                                    Company: e.target.value
                                }));
                            }, className: "form-control" + (formInfo.Company.trim() !== '' ? ' is-valid' : '') })
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
                        'div',
                        { className: 'form-group', style: { marginBottom: '0.6rem' } },
                        React.createElement('input', { placeholder: 'Email (Business Email Only) (Required)', style: smallInput, type: 'email', className: "form-control" + (isFreeEmail || invalidEMail ? ' is-invalid' : formInfo.Email.trim() !== '' ? ' is-valid' : ''), onChange: function onChange(e) {
                                setFormInfo(Object.assign({}, formInfo, {
                                    Email: e.target.value
                                }));
                            } }),
                        isFreeEmail ? React.createElement(
                            'span',
                            { style: { fontWeight: 'bold' }, className: 'invalid-feedback' },
                            'No Free Email'
                        ) : null,
                        invalidEMail ? React.createElement(
                            'span',
                            { style: { fontWeight: 'bold' }, className: 'invalid-feedback' },
                            'Invalid Email'
                        ) : null
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
                        'div',
                        { className: 'form-group', style: { marginBottom: '0.6rem' } },
                        React.createElement('input', { placeholder: 'Phone', style: smallInput, type: 'tel', onChange: function onChange(e) {
                                setFormInfo(Object.assign({}, formInfo, {
                                    Phone: e.target.value
                                }));
                            }, className: 'form-control' })
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
                        'div',
                        { className: 'form-group', style: { display: 'flex', alignItems: 'center', marginBottom: '0.6rem' } },
                        captcha ? React.createElement('img', { srcSet: captcha, style: { maxWidth: '100px' } }) : null,
                        React.createElement('input', { placeholder: 'Captcha (Required)', style: smallInput, type: 'text', className: 'form-control', onChange: function onChange(e) {
                                setFormInfo(Object.assign({}, formInfo, {
                                    Captcha: e.target.value
                                }));
                            } })
                    )
                ),
                React.createElement('div', { className: 'col-md-12' })
            ),
            React.createElement(
                'div',
                { style: { display: 'flex' } },
                React.createElement(
                    'button',
                    { className: 'btn btn-sm btn-dark', disabled: disableButton, onClick: function onClick() {
                            return saveForm();
                        } },
                    'Request Access'
                ),
                React.createElement(
                    'button',
                    { className: 'btn btn-sm btn-secondary', style: { marginLeft: '5px' }, onClick: function onClick() {
                            hideForm();
                        } },
                    'Cancel'
                )
            )
        ) : React.createElement(
            'div',
            { className: 'alert alert-success' },
            React.createElement(
                'h3',
                null,
                'Your Request to access Vantage Point Interactive Cloud Dashboard has been submitted. We will notify you once we approved your request.'
            )
        )
    );
}

var smallFormContainer = document.querySelector('#smallForm');
var smallFormRoot = ReactDOM.createRoot(smallFormContainer);
smallFormRoot.render(smallFormElement(SmallForm));