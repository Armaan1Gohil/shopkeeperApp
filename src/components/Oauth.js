import React,{ Component,Fragment } from 'react';
import $ from 'jquery';
export class Oauth extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      name: '',
      confirmPassword: '',
      message: {}
    }
    let _token;
    $.ajax({
            type: "GET",
            url: "user/api/signup",
            async:false,
            success: (data) => {
               _token = data._token;
            },
            error: () => {
               alert('error');
            }
        });
    this.onSubmit = this.onSubmit.bind(this);
    this._token = _token;
  }
  onChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  }
  onSubmit = (e) => {
    e.preventDefault();
    if( this.state.password && this.state.confirmPassword ) {
      if(this.state.password.length < 8) {
        this.setState({message:{
          danger:'Password Strength Is Low'
        }})
      }
      if( (this.state.password === this.state.confirmPassword) && this.state.password.length >= 8) {
        $.ajax({
                type: "POST",
                url: "user/api/signup",
                dataType: "json",
                data: {
                    email: this.state.email,
                    name: this.state.name,
                    password: this.state.password,
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
    }

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
          <br/>
          <form method="POST">
            <div className="form-group">
              <input type="email" value={this.state.email} name="email" className="form-control" onChange={this.onChange} placeholder="Enter email"  />
              <input type="password" value={this.state.password} name="password" className="form-control" onChange={this.onChange} placeholder="Enter password"  />
              <input type="password" value={this.state.confirmPassword} name="confirmPassword" className="form-control" onChange={this.onChange} placeholder="Confirm password"  />
              { this.state.password === this.state.confirmPassword?null:<small className="form-text text-danger">Password Not Matching.</small>}
              <input type="text" value={this.state.name} name="name" className="form-control" onChange={this.onChange} placeholder="Enter name"  />
            </div>
            <input hidden type="text" defaultValue={this._token} name="token"  />
            {info['messages']}
            <button onClick={this.onSubmit} type="submit" className="btn btn-primary">Submit</button>
          </form>

        </div>
    );
  }
};
