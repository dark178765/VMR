'use strict';

const testimonialElement = React.createElement;

const TestimonialFormComponent = () => {

    const [comment, setComment] = React.useState('');
    const [researchRating, setResearchRating] = React.useState(0);
    const [supportRating, setSupportRating] = React.useState(0);
    const [required, setRequired] = React.useState({
        comment: true,
        researchRating: true,
        supportRating: true
    });

    const [submitting, setSubmitting] = React.useState(false);
    const [success, setSuccess] = React.useState(false);

    React.useEffect(() => {

    }, [])

    const submitTestimonial = () => {
        
        let urlSegment = window.location.href.split('/');

        if(!required.comment && !required.researchRating && !required.supportRating) {
            setSubmitting(true);
            fetch('/submit-testimonial', {
                method: 'POST',
                body: JSON.stringify({
                    comment,
                    reportQualityRating: researchRating,
                    supportQualityRating: supportRating,
                    id: urlSegment[urlSegment.length - 1]
                }),
                headers: {
                    'Content-Type': 'application/json; charset=utf-8'
                }
            }).then(res => res.json()).then(res => {
                if(res.modifiedCount > 0){
                    setSuccess(true);
                    setSubmitting(false);
                }
            }).catch((err) => {
                console.log(err);
                setSubmitting(false);
            })
        }
    }

    React.useEffect(() => {
        requiredChanges();

    }, [researchRating, supportRating, comment])

    const requiredChanges = () => {
        setRequired({
            ...required,
            comment: comment === '',
            researchRating: researchRating <= 0,
            supportRating: supportRating <= 0 
        });
    }

    return (
        <div className="row">
            <div className="col-md-12">
                <div className="form-group">
                    <label>Testimonial <small><b>(Please include suggestions, how can we improve our service?)</b></small> {required.comment ? <span style={{color: 'red', fontWeight: 'bold'}}>Required</span> : null}</label>
                    <textarea disabled={success} className="form-control" onChange={(e) => setComment(e.target.value)} onBlur={() => requiredChanges()}></textarea>
                </div>
            </div>
            <div className="col-md-12">
                <div className="row">
                    <div className="col-md-6">
                        <div className="form-group">
                            <label>Report Quality {required.researchRating ? <span style={{color: 'red', fontWeight: 'bold'}}>Required</span> : null}</label>
                            <StarRating
                                setRating = {(rating) => setResearchRating(rating)}
                            />
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="form-group">
                            <label>Support Quality {required.supportRating ? <span style={{color: 'red', fontWeight: 'bold'}}>Required</span> : null}</label>
                            <StarRating
                                setRating = {(rating) => setSupportRating(rating)}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className="col-md-12">
                {!success ? <button className="btn btn-primary" disabled={required.comment || required.researchRating || required.supportRating} onClick={() => submitTestimonial()}>Submit Testimonial</button>: <div className="alert alert-success">Your testimonial has been submitted successfuly!!!</div>}
            </div>
        </div>

    )
}

const StarRating = (props) => {
    const [rating, setRating] = React.useState(0);
    const [hover, setHover] = React.useState(0);
    return (
      <div className="star-rating">
        {[...Array(5)].map((star, index) => {
          index += 1;
          return (
            <button
              type="button"
              key={index}
              className={(index <= (hover || rating) ? "on" : "off") + " star"}
              onClick={() => {
                setRating(index);
                props.setRating(index);
            }}
              onMouseEnter={() => setHover(index)}
              onMouseLeave={() => setHover(rating)}
            >
              <span className="star">&#9733;</span>
            </button>
          );
        })}
      </div>
    );
  };

const testimonialContainer = document.querySelector('#testimonial');
const testimonialRoot = ReactDOM.createRoot(testimonialContainer);
testimonialRoot.render(testimonialElement(TestimonialFormComponent));