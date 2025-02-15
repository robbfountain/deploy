import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Deploy } from '../../config';

import Button from '../../components/Button';
import Icon from '../../components/Icon';
import Loader from '../../components/Loader';
import Panel from '../../components/Panel';
import PanelHeading from '../../components/PanelHeading';
import PanelTitle from '../../components/PanelTitle'; 

import ProjectActionService from '../../services/ProjectAction';
import Layout from "../../components/Layout";

class ProjectDeploymentHookPage extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      isFetching: true,
      actions: []
    };
  }

  componentDidMount() {
    const { project } = this.props;
    const projectActionService = new ProjectActionService;

    projectActionService
      .index(project.id)
      .then(response => {
        this.setState({
          isFetching: false,
          actions: response.data
        });
      });
  }
  
  renderActionsTable(project, actions) {
    return (
      <Panel>
        <PanelHeading>
          <PanelTitle>Deployment Hooks</PanelTitle>
        </PanelHeading>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th width="40%">Action</th>
                <th width="20%">Before</th>
                <th width="20%">After</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {actions.map(action =>
                <tr key={action.id}>
                  <td width="40%">
                    {action.name}
                  </td>
                  <td width="20%">
                    {action.before_hooks.map(hook => {
                      return hook.name;
                    }).join(', ')}
                  </td>
                  <td width="20%">
                    {action.after_hooks.map(hook => {
                      return hook.name;
                    }).join(', ')}
                  </td>
                  <td className="text-right">
                    <Link
                      className="btn btn-default"
                      to={'/projects/' + project.id + '/actions/' + action.id}
                    >Manage</Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    )
  }

  render() {
    const { project } = this.props;
    const { 
      isFetching, 
      actions 
    } = this.state;

    return (
      <Layout project={project}>
        <div className="content">
          <div className="container-fluid heading">
            <h2>Deployment Hooks</h2>
          </div>
        
          <div className="container-fluid">
            {isFetching ? <Loader /> : this.renderActionsTable(project, actions)}
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
)(ProjectDeploymentHookPage);