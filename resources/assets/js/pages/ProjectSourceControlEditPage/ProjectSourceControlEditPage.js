import React from 'react';
import { connect } from 'react-redux';
import { Link, Redirect } from 'react-router-dom';

import { createToast } from '../../state/alert/alertActions';

import ProjectService from '../../services/Project';
import AccountProviderService from '../../services/AccountProvider';

import AlertErrorValidation from '../../components/AlertErrorValidation';
import Button from '../../components/Button';
import Panel from '../../components/Panel';
import PanelHeading from '../../components/PanelHeading';
import PanelTitle from '../../components/PanelTitle';
import PanelBody from '../../components/PanelBody';
import TextField from '../../components/TextField';
import Layout from "../../components/Layout";

class ProjectSourceControlEditPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isFetching: true,
      isUpdated: false,
      project: {},
      grantedProviders: [],
      errors: {},
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  componentDidMount() {
    const { project } = this.props;
    const accountProviderService = new AccountProviderService;

    this.setState({project: project});

    accountProviderService
      .index('/api/account-providers')
      .then(response => {
        let providers = response.data.filter(provider => {
          return provider.deploy_access_token;
        });

        this.setState({
          grantedProviders: providers
        });
      });
  }

  /**
   * Handle project's source control input change.
   *
   * @param {object} event
   * @return {void}
   */
  handleInputChange(event) {
    const name = event.target.name;
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;

    this.setState(state => {
      const project = Object.assign({}, state.project, {
        [name]: value
      });
      return {project: project}
    });
  }

  /**
   * Handle project's source control update.
   *
   * @param {object} event
   * @return {void}
   */
  handleClick(event) {
    const { dispatch } = this.props;
    const { project } = this.state;
    const projectService = new ProjectService;

    projectService
      .update(project.id, project)
      .then(response => {
        dispatch(createToast('Project\'s source control updated successfully.'));

        this.setState({
            isUpdated: true,
            errors: []
        });
      },
      error => {
        let errorResponse = error.response.data;

        errorResponse = errorResponse.hasOwnProperty('errors') ? errorResponse.errors : errorResponse;

        const errors = Object.keys(errorResponse).reduce(function(previous, key) {
            return previous.concat(errorResponse[key][0]);
        }, []);

        this.setState({errors: errors});
      });
  }

  render() {
    const {
      project,
      errors,
      grantedProviders,
      isUpdated
    } = this.state;

    if (isUpdated) {
      return <Redirect to={'/projects/' + project.id} />
    }

    return (
      <Layout project={project}>
        <div className="content">
          <div className="container-fluid heading">
            <h2>Source Control</h2>
          </div>

          <div className="container-fluid">
            <div className="row">
              <div className="col-xs-12 col-sm-3">
                <Panel>
                  <PanelHeading>
                    <PanelTitle>Project settings</PanelTitle>
                  </PanelHeading>

                  <div className="list-group">
                    <Link to={'/projects/' + project.id + '/edit'} className="list-group-item">General settings</Link>
                    <Link to={'/projects/' + project.id + '/source-control/edit'} className="list-group-item">Source control</Link>
                  </div>
                </Panel>
              </div>

              <div className="col-xs-12 col-sm-9">
                <Panel>
                <PanelHeading>
                  <PanelTitle>Source Control</PanelTitle>
                </PanelHeading>
                  <PanelBody>
                    {errors.length ? <AlertErrorValidation errors={errors} /> : ''}

                    <div className="form-group">
                      <label>Providers</label>

                      {grantedProviders.map(grantedProvider =>
                        <div key={grantedProvider.id}>
                          <label htmlFor={grantedProvider.name}>
                            <input name="provider_id"
                              type="radio"
                              value={grantedProvider.id}
                              id={grantedProvider.name}
                              onChange={this.handleInputChange}
                              checked={project.provider_id === grantedProvider.id}
                            /> {grantedProvider.name}
                          </label>
                        </div>
                      )}
                    </div>

                    <div className="form-group">
                      <TextField
                        id="repository"
                        label="Respository"
                        onChange={this.handleInputChange}
                        name="repository"
                        value={project.repository}
                        placeholder="user/repository"
                      />
                    </div>

                    <div className="form-group">
                      <TextField
                        id="branch"
                        label="Branch"
                        onChange={this.handleInputChange}
                        name="branch"
                        value={project.branch}
                      />
                    </div>

                    <Button
                      color="primary"
                      onClick={this.handleClick}
                    >Save</Button>
                  </PanelBody>
                </Panel>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    )
  }
}

const mapStateToProps = state => {
  return state.project;
};

export default connect(
  mapStateToProps
)(ProjectSourceControlEditPage);
