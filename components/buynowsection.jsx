'use strict';

const e = React.createElement;

const whiteText = {
    color: '#fff',
    fontStyle: 'italic',
    fontSize: '14px',
    fontWeight: 'bold',
    paddingTop: '10px'
}

const breakWord = {
    wordBreak: 'break-all'
}

const margin18 = {
    marginTop: '18px'
}

const rdBtn = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const checked = { border: '2px solid #fff' }

const pricingOption = { fontWeight: 'normal', fontSize: '1.2rem', padding: '0px', border: 'none' };

class BuynowSection extends React.Component {
    constructor(props) {


        super(props);

        this.state = {
            price: 0,
            minRegion: false,
            showCustomModal: false,
            singleUser: true,
            multiUser: false,
            dataSheet: false,
            message: [
                'Access to 1 - 3 users',
                'Permission To Print',
                'Report Coverage: Global',
                'Free Post-Sale Service Assistance'],
            reportId: document.getElementById('reportID').value,
            selectedRegion: [
                { name: 'NA', fullName: 'North America', selected: true },
                { name: 'EU', fullName: 'Europe', selected: true },
                { name: 'APAC', fullName: 'Asia Pacific', selected: true },
                { name: 'LA', fullName: 'Latin America', selected: true },
                { name: 'MEA', fullName: 'Middle East & Africa', selected: true },
            ],
            selectedAddOns: [
                { name: 'Excel Data Sheet', fullName: 'Excel Data Sheet', selected: false, value: 1, price: 800 },
                { name: 'Power Point', fullName: 'Power Point', selected: false, value: 2, price: 500 },
            ]
        };

        this.getReportPricing();
    }

    getReportPricing() {
        fetch(`/get-report-pricing/${this.state.reportId}`).then(res => res.json()).then(res => {
            this.setState({
                ...this.state, singleUserPrice: res.pricingOptions.singleUser, multiUserPrice: res.pricingOptions.cooperateUser, slug: res.slug,
                price: res.pricingOptions.singleUser,
                dataSheetPrice: 2000
            })
        })
    }

    handleChange(type) {
        switch (type) {
            case 1:
                this.setState({
                    ...this.state, singleUser: true, multiUser: false, dataSheet: false, message: [
                        'Access to 1 - 3 users',
                        'Permission To Print',
                        'Report Coverage: Global',
                        'Free Post-Sale Service Assistance']
                }, () => {
                    this.selectAllRegion();
                });

                break;
            case 2:
                this.setState({
                    ...this.state, singleUser: false, multiUser: true, dataSheet: false, message: [
                        'All Benefits of Standard License',
                        'Unlimited User Access',
                        'Direct Access to Lead Analyst',
                        '25% Discount on Next Purchase', 'Dedicated Account Manager']
                }, () => {
                    this.selectAllRegion();
                });
                break;
            case 3:
                this.setState({
                    ...this.state, singleUser: false, multiUser: false, dataSheet: true, message: ['Data Sheet (Excel Only)']
                });
        }
    }

    selectAllRegion() {
        this.setState({
            ...this.state, selectedRegion: this.state.selectedRegion.map(sr => { sr.selected = true; return sr; }),
            price: this.state.singleUser ? this.state.singleUserPrice : this.state.multiUserPrice,
            selectedAddOns: this.state.selectedAddOns.map(x => { x.selected = false; return x; })
        });
    }


    handleRegionChange(e) {
        if (!e.target.checked && this.state.selectedRegion.filter(x => x.selected == true).length == 1) {
            this.setState({ ...this.state, minRegion: true });
            return;
        }

        this.setState({
            ...this.state, minRegion: false, selectedRegion: this.state.selectedRegion.map(ss => {
                if (ss.fullName == e.target.value)
                    ss.selected = e.target.checked;
                return ss;
            })
        }, () => {
            this.calculatePrice();
        })

    }

    calculatePrice() {
        let price = 0;

        price = this.state.singleUser ? this.state.singleUserPrice : this.state.multiUserPrice;

        if (this.state.selectedRegion.filter(x => x.selected == true).length < this.state.selectedRegion.length) {
            //price = price - 1500;
            price = price - (500 * this.state.selectedRegion.filter(x => x.selected == false).length);

            if (price < (this.state.singleUser ? this.state.singleUserPrice : this.state.multiUserPrice) - 1500) {
                price = (this.state.singleUser ? this.state.singleUserPrice : this.state.multiUserPrice) - 1500;
            }
        }

        //let price = this.state.price;

        if (this.state.singleUser) {
            this.state.selectedAddOns.filter(x => x.selected == true).forEach(item => {
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

        this.setState({ ...this.state, price: price });
    }

    handleAddonChange(e) {
        this.setState({
            ...this.state, selectedAddOns: this.state.selectedAddOns.map(x => {
                if (e.target.value == x.value)
                    x.selected = e.target.checked;
                return x;
            })
        }, () => { this.calculatePrice(); });
    }

    gotoPurchase() {
        fetch('/select-payment', {
            method: 'POST',
            body: JSON.stringify({
                SelectedRegion: this.state.selectedRegion.filter(x => x.selected == true),
                SingleUser: this.state.singleUser,
                MultiUser: this.state.multiUser,
                DataSheet: this.state.dataSheet,
                SelectedAdOn: this.state.selectedAddOns.filter(x => x.selected == true),
                ReportID: document.getElementById('reportID').value
            }),
            headers: {
                'content-type': 'application/json; charset=utf-8'
            }
        }).then(res => res.json()).then(res => {
            if (res && res.redirectUrl) {
                window.location.href = res.redirectUrl;
            } else {
                alert('Something is wrong. Please contact to Vantage Market Research at sales@vantagemarketresearch.com');
            }
        });
    }

    region() {
        return (
            <div>
                <label>Regions: {this.state.minRegion == true ? <small style={{ color: 'red' }}>At least one region should be selected</small> : null}</label>
                <ul style={{ listStyle: 'none' }}>
                    {this.state.selectedRegion.map(sr => <li key={sr.name}><label style={pricingOption} title={sr.fullName}>
                        <input type="checkbox" value={sr.fullName} checked={this.state.selectedRegion[this.state.selectedRegion.indexOf(sr)].selected} onChange={(e) => this.handleRegionChange(e)} /> {sr.fullName}</label></li>)}
                </ul>
            </div>
        );
    }

    addOns() {
        return (
            <div className="addOns">
                <label>Add On</label>
                <ul style={{ listStyle: 'none', listStyleType: 'none' }}>
                    {this.state.selectedAddOns.map((ad, index) => <li key={index}><label><input type="checkbox" value={ad.value} checked={ad.selected} onChange={(e) => this.handleAddonChange(e)} /> {ad.fullName} ($ {ad.price})</label></li>)}
                </ul>
            </div>
        )
    }

    modal = {};

    showModal() {
        this.modal = new bootstrap.Modal(document.getElementById('customModal'));
        this.modal.show();
    }

    closeModal() {
        let msg = this.state.message;
        if (msg.filter(x => x.indexOf("Report Coverage") > -1).length == 0) {
            if (this.state.selectedRegion.filter(x => x.selected == true).length < this.state.selectedRegion.length) {
                msg = msg.concat([`Report Coverage: ${this.state.selectedRegion.filter(x => x.selected == true).map(x => x.name).join(', ')}`])
            } else {
                msg = msg.concat([`Report Coverage: Global`])
            }
        } else {
            let item = msg.filter(x => x.indexOf("Report Coverage") > -1);
            if (this.state.selectedRegion.filter(x => x.selected == true).length < this.state.selectedRegion.length) {
                msg[msg.indexOf(item[0])] = `Report Coverage: ${this.state.selectedRegion.filter(x => x.selected == true).map(x => x.name).join(', ')}`;
            } else {
                msg[msg.indexOf(item[0])] = `Report Coverage: Global`;
            }
        }

        this.setState({ ...this.state, message: msg.map(x => { return x; }) })

        this.modal.hide();
    }

    changePrice(type, e) {
        switch (type) {
            case 1:
                //Change Regions
                this.state.f

                break;
            case 2:
                //change Add On
                break;
        }
    }

    render() {
        return (
            <div>
                    <div className="productcart">
                        <div className="row">
                            <div className="col-md-12">
                                <div className="radiobtn">
                                <label style={{...rdBtn, ...(this.state.singleUser === true ? checked : {})}} className="sigur" onClick={() => this.handleChange(1)}>
                                    <input id="huey" type="radio" value="single"
                                        name="drone" checked={this.state.singleUser} onChange={(e) => this.handleChange(1)} />
                                        Standard License <img src="/assets/img/icon/pdf.svg" height={24} width={24} data-toggle="tooltip" data-placement="top" title="Portable Desktop Format (PDF)" /></label>

                                </div>
                            </div>
                            <div className="col-md-12">
                                <div className="radiobtn"><label style={{...rdBtn, ...(this.state.multiUser === true ? checked : {})}} className="sigur" onClick={() => this.handleChange(2)}><input id="dewey" type="radio" onChange={(e) => this.handleChange(2)}
                                    value="enterprise" name="drone" checked={this.state.multiUser} />Enterprise License
                                        <div><img src="/assets/img/icon/pdf.svg" height={24} width={24} title="Portable Desktop Format (PDF)" data-toggle="tooltip" data-placement="right" /> <img src="/assets/img/icon/xls.svg" height={24} width={24} data-toggle="tooltip" data-placement="top" title="Excel Data Sheet" /> <img src="/assets/img/icon/ppt.svg" height={24} width={24} title="Power Point (PPT)" data-toggle="tooltip" data-placement="top" /></div></label>
                                </div>
                            </div>
                            <div className="col-md-12">
                                <div className="radiobtn"><label style={{...rdBtn, ...(this.state.dataSheet === true ? checked : {})}} className="sigur" onClick={() => this.handleChange(3)}><input id="de" type="radio" onChange={(e) => this.handleChange(3)}
                                    value="enterprise" name="drone" checked={this.state.dataSheet} />Data Sheet (Excel) <img src="/assets/img/icon/xls.svg" height={24} width={24} title="Excel Data Sheet" data-toggle="tooltip" data-placement="top" /></label></div>
                            </div>
                        </div>
                        <div style={{ minHeight: '190px' }}>
                            <div className="Lorem-ipsum-dolor-si" style={whiteText}>
                                <ul style={{ listStyle: 'none' }}>
                                    {this.state.message.map((m, i) => <li key={i}><img src="/assets/img/reports/icons/check-mark.svg" width={24} height={24} alt={m} /> {m}</li>)}
                                </ul>
                            </div>
                            {this.state.singleUser || this.state.multiUser ?
                                <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
                                    <button type="button" onClick={() => this.showModal()} className="btn btn-sm btn-outline-warning" style={{ color: '#fff' }}>Customize Region</button>
                                    {this.state.singleUser ?
                                        <button type="button" onClick={() => this.showModal()} className="btn btn-sm btn-outline-warning" style={{ color: '#fff' }}>Add On</button> : null}
                                </div> : null}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <button className="addtocart"
                                type="button" onClick={() => this.gotoPurchase()}><i className="fa fa-shopping-cart"
                                    title="cart"></i> Buy Now</button> <span style={{ ...margin18, ...whiteText, fontSize: '2rem', marginTop: '0px', paddingTop: '0px' }}>$ {this.state.singleUser || this.state.multiUser ? this.state.price : this.state.dataSheetPrice}</span>
                        </div>
                    </div>
                <CustomModal region={() => this.region()}
                    addOns={() => this.addOns()}
                    singleUser={this.state.singleUser}
                    closeModal={() => this.closeModal()}
                    price={this.state.price}
                />
            </div>
        );
    }
}

const domContainer = document.querySelector('#buynowcontrol');
const root = ReactDOM.createRoot(domContainer);
root.render(e(BuynowSection));

const modalRoot = document.getElementById('customModalContainer');

class CustomModal extends React.Component {

    constructor(props) {
        super(props);
        this.el = document.createElement('div');

    }

    componentDidMount() {
        modalRoot.appendChild(this.el);
    }

    componentWillUnmount() {
        modalRoot.removeChild(this.el);
    }

    render() {
        return ReactDOM.createPortal(
            <div id="customModal" className="modal fade" >
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Customize Region</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={() => this.props.closeModal()}></button>
                        </div>
                        <div className="modal-body">
                            {this.props.region()}

                            {this.props.singleUser ? this.props.addOns() : null}
                        </div>
                        <div className="modal-footer">
                            <span>$ {this.props.price}</span>
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" onClick={() => this.props.closeModal()}>Okay</button>
                        </div>
                    </div>
                </div>
            </div>,
            this.el
        )
    };
}

// const customModalContainer = document.querySelector('#customModalContainer');
// const customModalRoot = ReactDOM.createRoot(customModalContainer);
// customModalRoot.render(customElement(CustomModal));
