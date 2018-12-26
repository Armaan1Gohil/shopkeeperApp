import React,{ Component, Fragment } from 'react';
import $ from 'jquery';
export class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email : '',
      password: '',
      message: {},
      modelEmail: ''
    }
    let _token;
    $.ajax({
            type: "GET",
            url: "user/api/login",
            async:false,
            success: (data) => {
               _token = data._token;
            },
            error: () => {
               alert('error');
            }
        });
    this.onSubmit = this.onSubmit.bind(this);
    this.resetPassword = this.resetPassword.bind(this);
    this.sendMail = this.sendMail.bind(this);
    this._token = _token;
  }
  resetPassword = (e) => {
    e.preventDefault();
    $('#resetPassword').modal('hide');
    $.ajax({
            type: "POST",
            url: "user/api/resetpasswordmail",
            dataType: "json",
            data: {
                email: this.state.modelEmail,
                _csrf: this._token
            },
            success: (response) => {
                this.setState({message: response.messages});
            },
            error: (e) => {
               this.setState({message: e.responseJSON.messages});
            }
        });
  }
  sendMail = (e) => {
    e.preventDefault();
    $('#confirmation').modal('hide');
    $.ajax({
            type: "POST",
            url: "user/api/sendmail",
            dataType: "json",
            data: {
                email: this.state.modelEmail,
                _csrf: this._token
            },
            success: (response) => {
              this.setState({message: response.messages});
            },
            error: (e) => {
               this.setState({message: e.responseJSON.messages});
            }
        });
  }
  onChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  }
  onSubmit = (e) => {
    e.preventDefault();
    $.ajax({
            type: "POST",
            url: "user/api/login",
            dataType: "json",
            data: {
                email: this.state.email,
                password: this.state.password,
                _csrf: this._token
            },
            success: (data) => {
              this.props.history.replace('/dashboard');
            },
            error: (e) => {
               this.setState({message: e.responseJSON.messages});
            }
        });
  }
  render() {
    let info = '';
    if( !(Object.keys(this.state.message).length === 0) ) {
      var type = Object.keys(this.state.message)[0];
      info = {
        messages: (
          <Fragment>
            <div className={"alert alert-"+type}>
              <strong>{this.state.message[type]}</strong>
            </div>
          </Fragment>
        )
      }
    }
    return (
        <div className="container">
          <div>
            <br/>
            <form method="POST">
              <div className="form-group">
                <input type="email" value={this.state.email} name="email" className="form-control" onChange={this.onChange} placeholder="Enter email"/>
                <input type="password" value={this.state.password} name="password" className="form-control" onChange={this.onChange} placeholder="Enter password"/>
              </div>
              <input hidden type="text" defaultValue={this._token} name="_csrf"/>
              {info['messages']}
              <div className="btn-toolbar" role="toolbar" aria-label="Toolbar with button groups">
                <div className="btn-group mr-2" role="group" aria-label="First group">
                  <button onClick={this.onSubmit} type="submit" className="btn btn-primary">Submit</button>
                </div>
              </div>
            </form>
            <br/>
            <div className="btn-group mr-2" role="group" aria-label="Second group">
              <button data-toggle="modal" data-target="#confirmation" className="btn btn-success">Resend Confirmation Mail</button>
              <button data-toggle="modal" data-target="#resetPassword" className="btn btn-info">Reset Password</button>
            </div>
            <div className="modal fade" id="confirmation" tabIndex="-1" role="dialog" aria-labelledby="confirmation" aria-hidden="true">
              <div className="modal-dialog" role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title" id="confirmationModelLabel">Resend Confirmation Email</h5>
                    <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                      <span aria-hidden="true">&times;</span>
                    </button>
                  </div>
                  <form method="POST">
                    <div className="modal-body">
                      <input type="email" value={this.state.modelEmail} name="modelEmail" className="form-control" onChange={this.onChange} placeholder="Enter email"/>
                      <input hidden type="text" defaultValue={this._token} name="token"/>
                    </div>
                    <div className="modal-footer">
                      <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                      <button onClick={this.sendMail} type="submit" className="btn btn-info">Resend Confirmation</button>
                    </div>
                </form>
                </div>
              </div>
            </div>
            <div className="modal fade" id="resetPassword" tabIndex="-1" role="dialog" aria-labelledby="confirmation" aria-hidden="true">
              <div className="modal-dialog" role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title" id="resetPasswordLabel">Reset Password</h5>
                    <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                      <span aria-hidden="true">&times;</span>
                    </button>
                  </div>
                  <form method="POST">
                    <div className="modal-body">
                      <input type="email" value={this.state.modelEmail} name="modelEmail" className="form-control" onChange={this.onChange} placeholder="Enter email"/>
                      <input hidden type="text" defaultValue={this._token} name="token"/>
                    </div>
                    <div className="modal-footer">
                      <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                      <button onClick={this.resetPassword} type="submit" className="btn btn-info">Reset Password</button>
                    </div>
                </form>
                </div>
              </div>
            </div>
          </div>
        </div>
    );
  }
};
