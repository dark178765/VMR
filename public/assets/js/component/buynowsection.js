'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var e = React.createElement;

var whiteText = {
    color: '#fff',
    fontStyle: 'italic',
    fontSize: '14px',
    fontWeight: 'bold',
    paddingTop: '10px'
};

var breakWord = {
    wordBreak: 'break-all'
};

var margin18 = {
    marginTop: '18px'
};

var rdBtn = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
var checked = { border: '2px solid #fff' };

var pricingOption = { fontWeight: 'normal', fontSize: '1.2rem', padding: '0px', border: 'none' };

var BuynowSection = function (_React$Component) {
    _inherits(BuynowSection, _React$Component);

    function BuynowSection(props) {
        _classCallCheck(this, BuynowSection);

        var _this = _possibleConstructorReturn(this, (BuynowSection.__proto__ || Object.getPrototypeOf(BuynowSection)).call(this, props));

        _this.modal = {};


        _this.state = {
            price: 0,
            minRegion: false,
            showCustomModal: false,
            singleUser: true,
            multiUser: false,
            dataSheet: false,
            message: ['Access to 1 - 3 users', 'Permission To Print', 'Report Coverage: Global', 'Free Post-Sale Service Assistance'],
            reportId: document.getElementById('reportID').value,
            selectedRegion: [{ name: 'NA', fullName: 'North America', selected: true }, { name: 'EU', fullName: 'Europe', selected: true }, { name: 'APAC', fullName: 'Asia Pacific', selected: true }, { name: 'LA', fullName: 'Latin America', selected: true }, { name: 'MEA', fullName: 'Middle East & Africa', selected: true }],
            selectedAddOns: [{ name: 'Excel Data Sheet', fullName: 'Excel Data Sheet', selected: false, value: 1, price: 800 }, { name: 'Power Point', fullName: 'Power Point', selected: false, value: 2, price: 500 }]
        };

        _this.getReportPricing();
        return _this;
    }

    _createClass(BuynowSection, [{
        key: 'getReportPricing',
        value: function getReportPricing() {
            var _this2 = this;

            fetch('/get-report-pricing/' + this.state.reportId).then(function (res) {
                return res.json();
            }).then(function (res) {
                _this2.setState(Object.assign({}, _this2.state, { singleUserPrice: res.pricingOptions.singleUser, multiUserPrice: res.pricingOptions.cooperateUser, slug: res.slug,
                    price: res.pricingOptions.singleUser,
                    dataSheetPrice: 2000
                }));
            });
        }
    }, {
        key: 'handleChange',
        value: function handleChange(type) {
            var _this3 = this;

            switch (type) {
                case 1:
                    this.setState(Object.assign({}, this.state, { singleUser: true, multiUser: false, dataSheet: false, message: ['Access to 1 - 3 users', 'Permission To Print', 'Report Coverage: Global', 'Free Post-Sale Service Assistance']
                    }), function () {
                        _this3.selectAllRegion();
                    });

                    break;
                case 2:
                    this.setState(Object.assign({}, this.state, { singleUser: false, multiUser: true, dataSheet: false, message: ['All Benefits of Standard License', 'Unlimited User Access', 'Direct Access to Lead Analyst', '25% Discount on Next Purchase', 'Dedicated Account Manager']
                    }), function () {
                        _this3.selectAllRegion();
                    });
                    break;
                case 3:
                    this.setState(Object.assign({}, this.state, { singleUser: false, multiUser: false, dataSheet: true, message: ['Data Sheet (Excel Only)']
                    }));
            }
        }
    }, {
        key: 'selectAllRegion',
        value: function selectAllRegion() {
            this.setState(Object.assign({}, this.state, { selectedRegion: this.state.selectedRegion.map(function (sr) {
                    sr.selected = true;return sr;
                }),
                price: this.state.singleUser ? this.state.singleUserPrice : this.state.multiUserPrice,
                selectedAddOns: this.state.selectedAddOns.map(function (x) {
                    x.selected = false;return x;
                })
            }));
        }
    }, {
        key: 'handleRegionChange',
        value: function handleRegionChange(e) {
            var _this4 = this;

            if (!e.target.checked && this.state.selectedRegion.filter(function (x) {
                return x.selected == true;
            }).length == 1) {
                this.setState(Object.assign({}, this.state, { minRegion: true }));
                return;
            }

            this.setState(Object.assign({}, this.state, { minRegion: false, selectedRegion: this.state.selectedRegion.map(function (ss) {
                    if (ss.fullName == e.target.value) ss.selected = e.target.checked;
                    return ss;
                })
            }), function () {
                _this4.calculatePrice();
            });
        }
    }, {
        key: 'calculatePrice',
        value: function calculatePrice() {
            var price = 0;

            price = this.state.singleUser ? this.state.singleUserPrice : this.state.multiUserPrice;

            if (this.state.selectedRegion.filter(function (x) {
                return x.selected == true;
            }).length < this.state.selectedRegion.length) {
                //price = price - 1500;
                price = price - 500 * this.state.selectedRegion.filter(function (x) {
                    return x.selected == false;
                }).length;

                if (price < (this.state.singleUser ? this.state.singleUserPrice : this.state.multiUserPrice) - 1500) {
                    price = (this.state.singleUser ? this.state.singleUserPrice : this.state.multiUserPrice) - 1500;
                }
            }

            //let price = this.state.price;

            if (this.state.singleUser) {
                this.state.selectedAddOns.filter(function (x) {
                    return x.selected == true;
                }).forEach(function (item) {
                    switch (item.value) {

                        case 1:
                            if (item.selected) {
                                price += 800;
                            }
                            break;
                        case 2:
                            if (item.selected) {
                                price += 500;
                            }
                            break;
                    }
                });
            }

            this.setState(Object.assign({}, this.state, { price: price }));
        }
    }, {
        key: 'handleAddonChange',
        value: function handleAddonChange(e) {
            var _this5 = this;

            this.setState(Object.assign({}, this.state, { selectedAddOns: this.state.selectedAddOns.map(function (x) {
                    if (e.target.value == x.value) x.selected = e.target.checked;
                    return x;
                })
            }), function () {
                _this5.calculatePrice();
            });
        }
    }, {
        key: 'gotoPurchase',
        value: function gotoPurchase() {
            fetch('/select-payment', {
                method: 'POST',
                body: JSON.stringify({
                    SelectedRegion: this.state.selectedRegion.filter(function (x) {
                        return x.selected == true;
                    }),
                    SingleUser: this.state.singleUser,
                    MultiUser: this.state.multiUser,
                    DataSheet: this.state.dataSheet,
                    SelectedAdOn: this.state.selectedAddOns.filter(function (x) {
                        return x.selected == true;
                    }),
                    ReportID: document.getElementById('reportID').value
                }),
                headers: {
                    'content-type': 'application/json; charset=utf-8'
                }
            }).then(function (res) {
                return res.json();
            }).then(function (res) {
                if (res && res.redirectUrl) {
                    window.location.href = res.redirectUrl;
                } else {
                    alert('Something is wrong. Please contact to Vantage Market Research at sales@vantagemarketresearch.com');
                }
            });
        }
    }, {
        key: 'region',
        value: function region() {
            var _this6 = this;

            return React.createElement(
                'div',
                null,
                React.createElement(
                    'label',
                    null,
                    'Regions: ',
                    this.state.minRegion == true ? React.createElement(
                        'small',
                        { style: { color: 'red' } },
                        'At least one region should be selected'
                    ) : null
                ),
                React.createElement(
                    'ul',
                    { style: { listStyle: 'none' } },
                    this.state.selectedRegion.map(function (sr) {
                        return React.createElement(
                            'li',
                            { key: sr.name },
                            React.createElement(
                                'label',
                                { style: pricingOption, title: sr.fullName },
                                React.createElement('input', { type: 'checkbox', value: sr.fullName, checked: _this6.state.selectedRegion[_this6.state.selectedRegion.indexOf(sr)].selected, onChange: function onChange(e) {
                                        return _this6.handleRegionChange(e);
                                    } }),
                                ' ',
                                sr.fullName
                            )
                        );
                    })
                )
            );
        }
    }, {
        key: 'addOns',
        value: function addOns() {
            var _this7 = this;

            return React.createElement(
                'div',
                { className: 'addOns' },
                React.createElement(
                    'label',
                    null,
                    'Add On'
                ),
                React.createElement(
                    'ul',
                    { style: { listStyle: 'none', listStyleType: 'none' } },
                    this.state.selectedAddOns.map(function (ad, index) {
                        return React.createElement(
                            'li',
                            { key: index },
                            React.createElement(
                                'label',
                                null,
                                React.createElement('input', { type: 'checkbox', value: ad.value, checked: ad.selected, onChange: function onChange(e) {
                                        return _this7.handleAddonChange(e);
                                    } }),
                                ' ',
                                ad.fullName,
                                ' ($ ',
                                ad.price,
                                ')'
                            )
                        );
                    })
                )
            );
        }
    }, {
        key: 'showModal',
        value: function showModal() {
            this.modal = new bootstrap.Modal(document.getElementById('customModal'));
            this.modal.show();
        }
    }, {
        key: 'closeModal',
        value: function closeModal() {
            var msg = this.state.message;
            if (msg.filter(function (x) {
                return x.indexOf("Report Coverage") > -1;
            }).length == 0) {
                if (this.state.selectedRegion.filter(function (x) {
                    return x.selected == true;
                }).length < this.state.selectedRegion.length) {
                    msg = msg.concat(['Report Coverage: ' + this.state.selectedRegion.filter(function (x) {
                        return x.selected == true;
                    }).map(function (x) {
                        return x.name;
                    }).join(', ')]);
                } else {
                    msg = msg.concat(['Report Coverage: Global']);
                }
            } else {
                var item = msg.filter(function (x) {
                    return x.indexOf("Report Coverage") > -1;
                });
                if (this.state.selectedRegion.filter(function (x) {
                    return x.selected == true;
                }).length < this.state.selectedRegion.length) {
                    msg[msg.indexOf(item[0])] = 'Report Coverage: ' + this.state.selectedRegion.filter(function (x) {
                        return x.selected == true;
                    }).map(function (x) {
                        return x.name;
                    }).join(', ');
                } else {
                    msg[msg.indexOf(item[0])] = 'Report Coverage: Global';
                }
            }

            this.setState(Object.assign({}, this.state, { message: msg.map(function (x) {
                    return x;
                }) }));

            this.modal.hide();
        }
    }, {
        key: 'changePrice',
        value: function changePrice(type, e) {
            switch (type) {
                case 1:
                    //Change Regions
                    this.state.f;

                    break;
                case 2:
                    //change Add On
                    break;
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this8 = this;

            return React.createElement(
                'div',
                null,
                React.createElement(
                    'div',
                    { className: 'productcart' },
                    React.createElement(
                        'div',
                        { className: 'row' },
                        React.createElement(
                            'div',
                            { className: 'col-md-12' },
                            React.createElement(
                                'div',
                                { className: 'radiobtn' },
                                React.createElement(
                                    'label',
                                    { style: Object.assign({}, rdBtn, this.state.singleUser === true ? checked : {}), className: 'sigur', onClick: function onClick() {
                                            return _this8.handleChange(1);
                                        } },
                                    React.createElement('input', { id: 'huey', type: 'radio', value: 'single',
                                        name: 'drone', checked: this.state.singleUser, onChange: function onChange(e) {
                                            return _this8.handleChange(1);
                                        } }),
                                    'Standard License ',
                                    React.createElement('img', { src: '/assets/img/icon/pdf.svg', height: 24, width: 24, 'data-toggle': 'tooltip', 'data-placement': 'top', title: 'Portable Desktop Format (PDF)' })
                                )
                            )
                        ),
                        React.createElement(
                            'div',
                            { className: 'col-md-12' },
                            React.createElement(
                                'div',
                                { className: 'radiobtn' },
                                React.createElement(
                                    'label',
                                    { style: Object.assign({}, rdBtn, this.state.multiUser === true ? checked : {}), className: 'sigur', onClick: function onClick() {
                                            return _this8.handleChange(2);
                                        } },
                                    React.createElement('input', { id: 'dewey', type: 'radio', onChange: function onChange(e) {
                                            return _this8.handleChange(2);
                                        },
                                        value: 'enterprise', name: 'drone', checked: this.state.multiUser }),
                                    'Enterprise License',
                                    React.createElement(
                                        'div',
                                        null,
                                        React.createElement('img', { src: '/assets/img/icon/pdf.svg', height: 24, width: 24, title: 'Portable Desktop Format (PDF)', 'data-toggle': 'tooltip', 'data-placement': 'right' }),
                                        ' ',
                                        React.createElement('img', { src: '/assets/img/icon/xls.svg', height: 24, width: 24, 'data-toggle': 'tooltip', 'data-placement': 'top', title: 'Excel Data Sheet' }),
                                        ' ',
                                        React.createElement('img', { src: '/assets/img/icon/ppt.svg', height: 24, width: 24, title: 'Power Point (PPT)', 'data-toggle': 'tooltip', 'data-placement': 'top' })
                                    )
                                )
                            )
                        ),
                        React.createElement(
                            'div',
                            { className: 'col-md-12' },
                            React.createElement(
                                'div',
                                { className: 'radiobtn' },
                                React.createElement(
                                    'label',
                                    { style: Object.assign({}, rdBtn, this.state.dataSheet === true ? checked : {}), className: 'sigur', onClick: function onClick() {
                                            return _this8.handleChange(3);
                                        } },
                                    React.createElement('input', { id: 'de', type: 'radio', onChange: function onChange(e) {
                                            return _this8.handleChange(3);
                                        },
                                        value: 'enterprise', name: 'drone', checked: this.state.dataSheet }),
                                    'Data Sheet (Excel) ',
                                    React.createElement('img', { src: '/assets/img/icon/xls.svg', height: 24, width: 24, title: 'Excel Data Sheet', 'data-toggle': 'tooltip', 'data-placement': 'top' })
                                )
                            )
                        )
                    ),
                    React.createElement(
                        'div',
                        { style: { minHeight: '190px' } },
                        React.createElement(
                            'div',
                            { className: 'Lorem-ipsum-dolor-si', style: whiteText },
                            React.createElement(
                                'ul',
                                { style: { listStyle: 'none' } },
                                this.state.message.map(function (m, i) {
                                    return React.createElement(
                                        'li',
                                        { key: i },
                                        React.createElement('img', { src: '/assets/img/reports/icons/check-mark.svg', width: 24, height: 24, alt: m }),
                                        ' ',
                                        m
                                    );
                                })
                            )
                        ),
                        this.state.singleUser || this.state.multiUser ? React.createElement(
                            'div',
                            { style: { display: 'flex', justifyContent: 'space-evenly' } },
                            React.createElement(
                                'button',
                                { type: 'button', onClick: function onClick() {
                                        return _this8.showModal();
                                    }, className: 'btn btn-sm btn-outline-warning', style: { color: '#fff' } },
                                'Customize Region'
                            ),
                            this.state.singleUser ? React.createElement(
                                'button',
                                { type: 'button', onClick: function onClick() {
                                        return _this8.showModal();
                                    }, className: 'btn btn-sm btn-outline-warning', style: { color: '#fff' } },
                                'Add On'
                            ) : null
                        ) : null
                    ),
                    React.createElement(
                        'div',
                        { style: { display: 'flex', justifyContent: 'space-between' } },
                        React.createElement(
                            'button',
                            { className: 'addtocart',
                                type: 'button', onClick: function onClick() {
                                    return _this8.gotoPurchase();
                                } },
                            React.createElement('i', { className: 'fa fa-shopping-cart',
                                title: 'cart' }),
                            ' Buy Now'
                        ),
                        ' ',
                        React.createElement(
                            'span',
                            { style: Object.assign({}, margin18, whiteText, { fontSize: '2rem', marginTop: '0px', paddingTop: '0px' }) },
                            '$ ',
                            this.state.singleUser || this.state.multiUser ? this.state.price : this.state.dataSheetPrice
                        )
                    )
                ),
                React.createElement(CustomModal, { region: function region() {
                        return _this8.region();
                    },
                    addOns: function addOns() {
                        return _this8.addOns();
                    },
                    singleUser: this.state.singleUser,
                    closeModal: function closeModal() {
                        return _this8.closeModal();
                    },
                    price: this.state.price
                })
            );
        }
    }]);

    return BuynowSection;
}(React.Component);

var domContainer = document.querySelector('#buynowcontrol');
var root = ReactDOM.createRoot(domContainer);
root.render(e(BuynowSection));

var modalRoot = document.getElementById('customModalContainer');

var CustomModal = function (_React$Component2) {
    _inherits(CustomModal, _React$Component2);

    function CustomModal(props) {
        _classCallCheck(this, CustomModal);

        var _this9 = _possibleConstructorReturn(this, (CustomModal.__proto__ || Object.getPrototypeOf(CustomModal)).call(this, props));

        _this9.el = document.createElement('div');

        return _this9;
    }

    _createClass(CustomModal, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            modalRoot.appendChild(this.el);
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            modalRoot.removeChild(this.el);
        }
    }, {
        key: 'render',
        value: function render() {
            var _this10 = this;

            return ReactDOM.createPortal(React.createElement(
                'div',
                { id: 'customModal', className: 'modal fade' },
                React.createElement(
                    'div',
                    { className: 'modal-dialog' },
                    React.createElement(
                        'div',
                        { className: 'modal-content' },
                        React.createElement(
                            'div',
                            { className: 'modal-header' },
                            React.createElement(
                                'h5',
                                { className: 'modal-title' },
                                'Customize Region'
                            ),
                            React.createElement('button', { type: 'button', className: 'btn-close', 'data-bs-dismiss': 'modal', 'aria-label': 'Close', onClick: function onClick() {
                                    return _this10.props.closeModal();
                                } })
                        ),
                        React.createElement(
                            'div',
                            { className: 'modal-body' },
                            this.props.region(),
                            this.props.singleUser ? this.props.addOns() : null
                        ),
                        React.createElement(
                            'div',
                            { className: 'modal-footer' },
                            React.createElement(
                                'span',
                                null,
                                '$ ',
                                this.props.price
                            ),
                            React.createElement(
                                'button',
                                { type: 'button', className: 'btn btn-secondary', 'data-bs-dismiss': 'modal', onClick: function onClick() {
                                        return _this10.props.closeModal();
                                    } },
                                'Okay'
                            )
                        )
                    )
                )
            ), this.el);
        }
    }]);

    return CustomModal;
}(React.Component);

// const customModalContainer = document.querySelector('#customModalContainer');
// const customModalRoot = ReactDOM.createRoot(customModalContainer);
// customModalRoot.render(customElement(CustomModal));