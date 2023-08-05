import React, { Component } from 'react'
import logo from '../logo.svg';
import '../App.css';
import axios from "axios";

export default class recherche extends Component {

    constructor(props) {
        super(props);
        this.state = {
            files : [],
            path : '',
            textMessage : ''
        };
    }

    componentDidMount() {

    }
  
  componentDidUpdate() {

  }

  search = () => {
    axios.post(`http://localhost:8080/api/`,{ path : this.state.path}).then((result) => {
        debugger;
        if(result?.data) {
            if(typeof result?.data === 'string' || result?.data instanceof String) {
                this.setState({textMessage : result?.data})
            } else {
                if(result?.data.length > 0) {
                    console.log(result?.data);
                    this.setState({files : result?.data});
                }
            }
        }
      });
  }

  onChangeText = (e) => {
    this.setState({path : e.target.value});
  }

  onClickTextFile = (e) => {
    window.open(`file:///${e.target?.innerHTML}`,"_blank");

  }




  render() {
    return (
      <div className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <div>
          <input style={{width : '500px'}} type='text' placeholder='enter your folder path' onChange={this.onChangeText}/>
          <input type='button' value='Enter' onClick={this.search}/>
        </div>
        <div>
                {   
                    this.state.files.length ? this.state.files.map((file, index) => 
                    <p onClick={this.onClickTextFile} className='fileText' >{file}</p>) : 
                    <p>{this.state.textMessage}</p>
                }
        </div>
      </div>
    )
  }
}
