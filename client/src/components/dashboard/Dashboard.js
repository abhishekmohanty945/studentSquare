import React, { Fragment, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types'
import { connect } from 'react-redux';
import Spinner from '../layout/Spinner';
import { getCurrentProfile } from '../../actions/profile';


const Dashboard = ({ getCurrentProfile, auth: {user }, profile: {loading, profile} }) => {
    useEffect(() => {
        getCurrentProfile();
     }, [getCurrentProfile]);

    return loading && profile === null ? <Spinner/> : <Fragment>
        <h1 className="large test-primary">Dashboard</h1>
        <p className="lead">
            <i className="fas fa-user"></i> Welcome { user && user.name }
        </p>
        {profile !== null ? <Fragment>Has</Fragment>: (
        <Fragment>
            <p>You have not created a profile yet. Please add some data.</p>
            <Link to="/create-profile" className='btn btn-primary my-1'>
                Create Profile
            </Link>
        </Fragment>
        )}
    </Fragment>;
}

Dashboard.propTypes = {
    auth: PropTypes.object.isRequired,
    profile: PropTypes.object.isRequired,
    getCurrentProfile: PropTypes.func.isRequired,
}

const mapStateToProps = state => ({
    auth: state.auth,
    profile: state.profile
});

export default connect(mapStateToProps, { getCurrentProfile })(Dashboard);
