import React,{ Component, Fragment } from 'react';
import { Link } from 'react-router-dom';
import $ from 'jquery';
export class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.error = false;
    this.state ={
      file: null,
      user: null,
      message: {}
    };
    this.onChange = this.onChange.bind(this);
    this.onFormSubmit = this.onFormSubmit.bind(this);
  }
  componentWillMount() {
    $.ajax({
            type: "GET",
            url: "user/api/user",
            async:false,
            success: (data) => {
              this.setState({
                user : data.user
              })
            },
            error: () => {
              this.error = true;
            }
        });
  }
  onFormSubmit(e){
        e.preventDefault();
        this.setState({message:{
          success:"Uploading ..."
        }})
        var formData = new FormData();
        formData.append('Image',this.state.file);
        $.ajax({
            type: "POST",
            url: "api/upload",
            processData: false,
            contentType: false,
            cache: false,
            enctype: 'multipart/form-data',
            data: formData,
            success: (response) => {
              this.setState({message: response.messages});
            },
            error: (e) => {
              this.setState({message: e.responseJSON.messages});
            }
        });
    }
  onChange(e) {
      var user = this.state.user;
      user.profilepic = URL.createObjectURL(e.target.files[0]);
      this.setState({
        file:e.target.files[0],
        user: user
      });
    }
  hoverOff = () => {
    $('#profPic').toggleClass('blur-image');
  }
  hoverOn = () => {
    $('#profPic').toggleClass('blur-image');
  }
  render() {
    let info = '';
    if( this.state.message && !(Object.keys(this.state.message).length === 0) ) {
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
    if(!this.error && this.state.user) {
      return (
          <div className="container container-centre">
            <br/>
              <div className="card" style={{width: "18rem"}}>
                <img id="profPic" className="card-img-top" src={this.state.user.profilepic} alt="profile Pic"/>
                  <div className="card-body">
                      <h5 className="card-title">{this.state.user.name}</h5>
                        <div className="btn-toolbar" role="toolbar" aria-label="Toolbar with button groups">
                          <div className="btn-group mr-2" role="group" aria-label="First group">
                            <form method="post" encType="multipart/form-data">
                              <div className="custom-file">
                                <input onChange= {this.onChange} type="file" className="custom-file-input" id="customFile"/>
                                <br/>
                                <label className="custom-file-label">{this.state.file?this.state.file.name.substring(0,20)+"..":'Choose A file'}</label>
                              </div>
                              <br/>
                              <button onClick={this.onFormSubmit} onMouseEnter={this.hoverOn} onMouseLeave={this.hoverOff} type="submit" className="btn btn-info btn-block">Upload Image</button>
                            </form>
                          </div>
                        </div>
                        <br/>
                        {info['messages']}
                      <a href={"mailto::"+this.state.user.email} className="btn btn-block btn-primary">{this.state.user.email}</a>
                      <br/>
                      <a href="/user/api/logout" className="btn btn-danger btn-block">Log Out</a>
                    </div>
              </div>
          </div>
      );
    } else {
      return (
          <div className="container">
            <br/>
              <div className="alert alert-danger">
                <strong>Unauthorized acces</strong>
              </div>
              <div className="btn-toolbar" role="toolbar" aria-label="Toolbar with button groups">
                <div className="btn-group mr-2" role="group" aria-label="First group">
                  <Link to="/signup" className='btn btn-primary btn-lg'>SIGN UP</Link>
                  <Link to="/login" className='btn btn-primary btn-lg'>LOG IN</Link>
                </div>
              </div>
          </div>
      );
    }

  }
};
