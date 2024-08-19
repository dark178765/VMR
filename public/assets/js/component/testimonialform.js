'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var testimonialElement = React.createElement;

var TestimonialFormComponent = function TestimonialFormComponent() {
    var _React$useState = React.useState(''),
        _React$useState2 = _slicedToArray(_React$useState, 2),
        comment = _React$useState2[0],
        setComment = _React$useState2[1];

    var _React$useState3 = React.useState(0),
        _React$useState4 = _slicedToArray(_React$useState3, 2),
        researchRating = _React$useState4[0],
        setResearchRating = _React$useState4[1];

    var _React$useState5 = React.useState(0),
        _React$useState6 = _slicedToArray(_React$useState5, 2),
        supportRating = _React$useState6[0],
        setSupportRating = _React$useState6[1];

    var _React$useState7 = React.useState({
        comment: true,
        researchRating: true,
        supportRating: true
    }),
        _React$useState8 = _slicedToArray(_React$useState7, 2),
        required = _React$useState8[0],
        setRequired = _React$useState8[1];

    var _React$useState9 = React.useState(false),
        _React$useState10 = _slicedToArray(_React$useState9, 2),
        submitting = _React$useState10[0],
        setSubmitting = _React$useState10[1];

    var _React$useState11 = React.useState(false),
        _React$useState12 = _slicedToArray(_React$useState11, 2),
        success = _React$useState12[0],
        setSuccess = _React$useState12[1];

    React.useEffect(function () {}, []);

    var submitTestimonial = function submitTestimonial() {

        var urlSegment = window.location.href.split('/');

        if (!required.comment && !required.researchRating && !required.supportRating) {
            setSubmitting(true);
            fetch('/submit-testimonial', {
                method: 'POST',
                body: JSON.stringify({
                    comment: comment,
                    reportQualityRating: researchRating,
                    supportQualityRating: supportRating,
                    id: urlSegment[urlSegment.length - 1]
                }),
                headers: {
                    'Content-Type': 'application/json; charset=utf-8'
                }
            }).then(function (res) {
                return res.json();
            }).then(function (res) {
                if (res.modifiedCount > 0) {
                    setSuccess(true);
                    setSubmitting(false);
                }
            }).catch(function (err) {
                console.log(err);
                setSubmitting(false);
            });
        }
    };

    React.useEffect(function () {
        requiredChanges();
    }, [researchRating, supportRating, comment]);

    var requiredChanges = function requiredChanges() {
        setRequired(Object.assign({}, required, {
            comment: comment === '',
            researchRating: researchRating <= 0,
            supportRating: supportRating <= 0
        }));
    };

    return React.createElement(
        'div',
        { className: 'row' },
        React.createElement(
            'div',
            { className: 'col-md-12' },
            React.createElement(
                'div',
                { className: 'form-group' },
                React.createElement(
                    'label',
                    null,
                    'Testimonial ',
                    React.createElement(
                        'small',
                        null,
                        React.createElement(
                            'b',
                            null,
                            '(Please include suggestions, how can we improve our service?)'
                        )
                    ),
                    ' ',
                    required.comment ? React.createElement(
                        'span',
                        { style: { color: 'red', fontWeight: 'bold' } },
                        'Required'
                    ) : null
                ),
                React.createElement('textarea', { disabled: success, className: 'form-control', onChange: function onChange(e) {
                        return setComment(e.target.value);
                    }, onBlur: function onBlur() {
                        return requiredChanges();
                    } })
            )
        ),
        React.createElement(
            'div',
            { className: 'col-md-12' },
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
                            null,
                            'Report Quality ',
                            required.researchRating ? React.createElement(
                                'span',
                                { style: { color: 'red', fontWeight: 'bold' } },
                                'Required'
                            ) : null
                        ),
                        React.createElement(StarRating, {
                            setRating: function setRating(rating) {
                                return setResearchRating(rating);
                            }
                        })
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
                            null,
                            'Support Quality ',
                            required.supportRating ? React.createElement(
                                'span',
                                { style: { color: 'red', fontWeight: 'bold' } },
                                'Required'
                            ) : null
                        ),
                        React.createElement(StarRating, {
                            setRating: function setRating(rating) {
                                return setSupportRating(rating);
                            }
                        })
                    )
                )
            )
        ),
        React.createElement(
            'div',
            { className: 'col-md-12' },
            !success ? React.createElement(
                'button',
                { className: 'btn btn-primary', disabled: required.comment || required.researchRating || required.supportRating, onClick: function onClick() {
                        return submitTestimonial();
                    } },
                'Submit Testimonial'
            ) : React.createElement(
                'div',
                { className: 'alert alert-success' },
                'Your testimonial has been submitted successfuly!!!'
            )
        )
    );
};

var StarRating = function StarRating(props) {
    var _React$useState13 = React.useState(0),
        _React$useState14 = _slicedToArray(_React$useState13, 2),
        rating = _React$useState14[0],
        setRating = _React$useState14[1];

    var _React$useState15 = React.useState(0),
        _React$useState16 = _slicedToArray(_React$useState15, 2),
        hover = _React$useState16[0],
        setHover = _React$useState16[1];

    return React.createElement(
        'div',
        { className: 'star-rating' },
        [].concat(_toConsumableArray(Array(5))).map(function (star, index) {
            index += 1;
            return React.createElement(
                'button',
                {
                    type: 'button',
                    key: index,
                    className: (index <= (hover || rating) ? "on" : "off") + " star",
                    onClick: function onClick() {
                        setRating(index);
                        props.setRating(index);
                    },
                    onMouseEnter: function onMouseEnter() {
                        return setHover(index);
                    },
                    onMouseLeave: function onMouseLeave() {
                        return setHover(rating);
                    }
                },
                React.createElement(
                    'span',
                    { className: 'star' },
                    '\u2605'
                )
            );
        })
    );
};

var testimonialContainer = document.querySelector('#testimonial');
var testimonialRoot = ReactDOM.createRoot(testimonialContainer);
testimonialRoot.render(testimonialElement(TestimonialFormComponent));